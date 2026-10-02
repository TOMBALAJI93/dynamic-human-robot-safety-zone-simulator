import type { Point2D, PathWaypoint, RobotEntity, HumanEntity } from '../../types';

/**
 * Updates an entity position along a piecewise linear waypoint path.
 * 
 * Kinematic Rationale:
 * AMRs and workers in process plant aisles follow defined transit pathways.
 * This function calculates linear interpolation between discrete waypoint coordinates (x, y),
 * advancing the entity by stepDistance = currentSpeed * dt.
 * 
 * Safety & Boundary Protections:
 * - If path is empty, retains current coordinates without crashing.
 * - Handles distanceToTarget < 0.1m by safely indexing to next waypoint.
 * - Prevents overshoot by clamping moveFraction to distanceToTarget.
 * - Coordinates rounded to 3 decimal places (millimeter precision) to eliminate floating-point creep.
 * 
 * @param currentPos Current (x, y) coordinates in plant meters
 * @param currentSpeed Instantaneous velocity in meters per second (m/s >= 0)
 * @param path Array of PathWaypoints defining traversal route
 * @param currentWaypointIndex Target waypoint index in path
 * @param dt Simulation timestep in seconds (nominal: 0.1s at 10Hz)
 * @returns Updated coordinates, new waypoint index, heading direction (radians), and completion flag
 */
export function updateEntityPathPosition(
  currentPos: Point2D,
  currentSpeed: number,
  path: PathWaypoint[],
  currentWaypointIndex: number,
  dt: number
): { newPos: Point2D; newWaypointIndex: number; direction: number; reachedEnd: boolean } {
  if (!path || path.length === 0) {
    return { newPos: { ...currentPos }, newWaypointIndex: 0, direction: 0, reachedEnd: true };
  }

  // Sanitize index out of bounds
  if (currentWaypointIndex >= path.length) {
    const lastPoint = path[path.length - 1];
    return { newPos: { ...lastPoint }, newWaypointIndex: path.length - 1, direction: 0, reachedEnd: true };
  }

  const safeSpeed = Math.max(0, isNaN(currentSpeed) ? 0 : currentSpeed);
  const safeDt = Math.max(0, isNaN(dt) ? 0.1 : dt);

  const target = path[currentWaypointIndex];
  const dx = target.x - currentPos.x;
  const dy = target.y - currentPos.y;
  const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
  const direction = Math.atan2(dy, dx);

  const stepDistance = safeSpeed * safeDt;

  // Waypoint reached threshold (0.1m or full step completion)
  if (distanceToTarget <= stepDistance || distanceToTarget < 0.1) {
    const nextIndex = (currentWaypointIndex + 1) % path.length;
    return {
      newPos: { x: target.x, y: target.y },
      newWaypointIndex: nextIndex,
      direction,
      reachedEnd: nextIndex === 0,
    };
  }

  const moveFraction = stepDistance / distanceToTarget;
  const newX = currentPos.x + dx * moveFraction;
  const newY = currentPos.y + dy * moveFraction;

  return {
    newPos: { x: Math.round(newX * 1000) / 1000, y: Math.round(newY * 1000) / 1000 },
    newWaypointIndex: currentWaypointIndex,
    direction,
    reachedEnd: false,
  };
}

/**
 * Advances a single AMR's position, heading, and status for one simulation step.
 * 
 * State Gating:
 * - IDLE, EMERGENCY_STOP, or PAUSED robots do not advance position.
 * - Under EMERGENCY_STOP, velocity is forced to 0.0 m/s.
 * 
 * @param robot AMR state object
 * @param dt Time step in seconds
 * @returns Updated RobotEntity
 */
export function updateRobotMotion(robot: RobotEntity, dt: number): RobotEntity {
  if (robot.status === 'IDLE' || robot.status === 'EMERGENCY_STOP' || robot.status === 'PAUSED') {
    return { ...robot, currentSpeed: robot.status === 'EMERGENCY_STOP' ? 0 : robot.currentSpeed };
  }

  const { newPos, newWaypointIndex, direction } = updateEntityPathPosition(
    robot.position,
    robot.currentSpeed,
    robot.path,
    robot.currentWaypointIndex,
    dt
  );

  return {
    ...robot,
    position: newPos,
    currentWaypointIndex: newWaypointIndex,
    direction,
    status: 'MOVING',
  };
}

/**
 * Advances a human worker's position, heading, and status for one simulation step.
 * 
 * State Gating:
 * - Stationary tasks (IDLE, WORKING at valve station) maintain fixed positions.
 * 
 * @param human Human worker state object
 * @param dt Time step in seconds
 * @returns Updated HumanEntity
 */
export function updateHumanMotion(human: HumanEntity, dt: number): HumanEntity {
  if (human.status === 'IDLE' || human.status === 'WORKING') {
    return human;
  }

  const { newPos, newWaypointIndex, direction } = updateEntityPathPosition(
    human.position,
    human.currentSpeed,
    human.path,
    human.currentWaypointIndex,
    dt
  );

  return {
    ...human,
    position: newPos,
    currentWaypointIndex: newWaypointIndex,
    direction,
    status: 'WALKING',
  };
}

/**
 * Synchronous multi-agent swarm motion updater.
 * Iterates through all active AMRs and human workers, updating kinematics synchronously.
 * 
 * @param robots Array of AMRs in the simulation
 * @param humans Array of human workers in the simulation
 * @param dt Timestep in seconds
 * @returns Tuple of updated [robots, humans]
 */
export function updateMultiAgentMotion(
  robots: RobotEntity[],
  humans: HumanEntity[],
  dt: number
): { 
  robots: RobotEntity[]; 
  humans: HumanEntity[]; 
  updatedRobots: RobotEntity[]; 
  updatedHumans: HumanEntity[]; 
} {
  const updatedRobots = (robots || []).map(r => r.isActive !== false ? updateRobotMotion(r, dt) : r);
  const updatedHumans = (humans || []).map(h => h.isActive !== false ? updateHumanMotion(h, dt) : h);
  return { 
    robots: updatedRobots, 
    humans: updatedHumans, 
    updatedRobots, 
    updatedHumans 
  };
}
