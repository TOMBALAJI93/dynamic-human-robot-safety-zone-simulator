import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Grid, 
  Layers, 
  ShieldAlert, 
  FlaskConical, 
  SlidersHorizontal, 
  AlertTriangle, 
  ClipboardList, 
    Settings, 
  Globe, 
  Wifi, 
  WifiOff, 
  ShieldCheck,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import type { NavPage } from '../../types';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  language,
  onLanguageChange,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'simulator', label: t.nav.simulator, icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'layout', label: t.nav.layout, icon: <Grid className="w-4 h-4" /> },
    { id: 'scenarios', label: t.nav.scenarios, icon: <Layers className="w-4 h-4" /> },
    { id: 'safety_rules', label: t.nav.safetyRules, icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'experiments', label: t.nav.experiments, icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'sensitivity', label: t.nav.sensitivity, icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'failure_cases', label: t.nav.failureCases, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'data_capture', label: t.nav.dataCapture, icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'stakeholder_feedback', label: t.nav.stakeholderFeedback, icon: <UserCheck className="w-4 h-4" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Engineering Disclaimer & Status Banner */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-amber-400 tracking-wide">{t.prototypeNotice}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">{t.common.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-medium">{t.common.offline}</span>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
            <Globe className="w-3 h-3 text-slate-400 ml-1" />
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                language === 'ta'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ் (TA)
            </button>
          </div>
        </div>
      </div>

      {/* Main App Title & Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm md:text-base tracking-tight flex items-center gap-2">
                <span>{t.appName}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  v1.0-PROTOTYPE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-left transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
