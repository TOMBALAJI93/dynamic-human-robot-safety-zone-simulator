# Error Handling, Boundary Protection & Fault Recovery

## 1. System Robustness Architecture

The simulator implements multi-tier defensive programming to protect against runtime exceptions, numerical singularities, corrupt browser storage, and invalid sensor inputs.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI RENDERING TIER                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ React Error Boundary (src/components/common/ErrorBoundary.tsx)    │  │
│  │ - Catches rendering exceptions in component tree                  │  │
│  │ - Fallback UI prevents blank-screen whiteouts                     │  │
│  │ - "Reload Application" and "Reset Cache & Reload" recovery actions │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MATHEMATICAL & SENSOR INPUT TIER                   │
│  ┌─────────────────────────────────┬─────────────────────────────────┐  │
│  │ Input Clamping & Sanitization   │ Numerical Singularity Safeguard │  │
│  │ - Friction: 0.15 <= mu <= 1.00  │ - Euclidean Distance: D >= 0.0m │  │
│  │ - Sensor Noise: 0.0 <= eta <=0.7│ - Direction Vector: D=0 handled │  │
│  │ - Temp: -40°C <= T <= 80°C      │ - Division by Zero Protection   │  │
│  │ - Pressure: 0.5 <= P <= 3.0 bar │ - NaN / Infinity Filtering      │  │
│  └─────────────────────────────────┴─────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE & EXPORT TIER                         │
│  ┌─────────────────────────────────┬─────────────────────────────────┐  │
│  │ LocalStorage Fault Recovery     │ RFC 4180 CSV Sanitizer          │  │
│  │ - try/catch JSON parse fallback │ - Quotes escaped (""text"")     │  │
│  │ - Schema migration backwards com│ - Commas / newlines encapsulated│  │
│  │ - Zero data corruption tolerance│ - Formula injection suppression │  │
│  └─────────────────────────────────┴─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Failure Mode Matrix

| Failure Condition | Detection Mechanism | System Handling | User-Visible Result | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Invalid/Zero Floor Friction ($\mu=0.0$)** | `sanitizeEnvironmentalContext()` checks $\mu < 0.15$ or `isNaN` | Clamped strictly to physical lower bound $\mu = 0.15$ | UI shows warning; stopping distance expanded safely | `ENV-04` |
| **Sensor Degradation Overflow ($\eta > 0.70$)** | `sanitizeEnvironmentalContext()` checks $\eta > 0.70$ | Clamped to maximum envelope threshold $\eta = 0.70$ | Safe perception buffer applied; slider capped | `ENV-07` |
| **Coincident Entities ($D_{\text{sep}} = 0.0\text{ m}$)** | `calculateApproachFactor()` checks $D < 0.05\text{ m}$ | Replaces $0/0$ directional vector with head-on $1.5\times$ multiplier | Instant `EMERGENCY` state; pulsing warning line | `MULTI-05`, `MULTI-EC-01` |
| **Out-of-Bounds Coordinates ($x < 0, y > 100$)** | Range checks in `calculateDistance()` | Evaluates Euclidean separation in extended $(x,y)$ plane | Entity displayed on border; safety calculated correctly | `MULTI-07`, `MULTI-EC-06` |
| **Corrupted / Tampered LocalStorage** | `try/catch` blocks in `storageService.ts` with `Array.isArray` checks | Falls back to empty dataset (`[]`) without throwing | Status returns `PENDING ACTUAL TRIALS` | `ERR-01` |
| **CSV Injection / Unescaped Quotes** | `exportStakeholderToCSV()` sanitization | Quotes escaped (`""`), strings encapsulated in quotes | Clean CSV export compatible with pandas/Excel | `ERR-02`, `STAKE-05` |
| **Missing / Null Point2D Coordinates** | `calculateDistance()` sanity checks | Returns safe default clearance ($10.0\text{ m}$) | System continues running; no NaN propagation | `ERR-03` |
| **React Component Rendering Exception** | `ErrorBoundary` lifecycle (`componentDidCatch`) | Intercepts error; renders structured recovery card | Clean error message with "Reload Application" button | Verified in production build |

---

## 3. React Error Boundary Implementation

Located in [`src/components/common/ErrorBoundary.tsx`](file:///c:/Users/Balaji/Downloads/New%20folder/src/components/common/ErrorBoundary.tsx):
* **Class Component Lifecycle**: Implements `static getDerivedStateFromError()` and `componentDidCatch()`.
* **Safe Diagnostics**: Displays high-level diagnostic summary without leaking internal heap details or credentials.
* **Dual Recovery Modes**:
  1. **Reload Application**: Refreshes current page to re-initialize React tree.
  2. **Reset Cache & Reload**: Clears `localStorage` and `sessionStorage` to eliminate corrupted user state.
