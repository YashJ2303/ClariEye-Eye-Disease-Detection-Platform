import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Eye, Activity, Sun, Moon, Settings, Zap, Bell, Search, ChevronRight, User, Cpu, Server, Gauge, Clock, ShieldCheck, Terminal, Fingerprint, LogOut, BarChart3, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetry } from '../context/TelemetryContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const baseNavItems = [
  { to: '/', icon: Zap, label: 'New Scan', roles: ['Doctor', 'Admin', 'Technician'] },
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard', roles: ['Doctor', 'Admin'] },
  { to: '/patients', icon: Users, label: 'Patients List', roles: ['Technician', 'Admin', 'Doctor'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { telemetry } = useTelemetry();
  const location = useLocation();

  const navItems = baseNavItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(x => x);
    return ['ClariEye', ...pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 transition-colors duration-500">
      
      {/* 🖥️ Command Sidebar */}
      <aside className="w-80 flex flex-col border-r border-slate-800/40 bg-slate-900/50 backdrop-blur-xl relative z-30 shadow-2xl overflow-hidden">
        
        {/* Branding */}
        <div className="p-10 mb-2 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
               <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">ClariEye <span className="text-blue-500">AI</span></h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> System Active
              </p>
            </div>
          </div>
        </div>

        {/* Global Navigation Hub */}
        <nav className="flex-1 px-6 space-y-1.5 mt-8">
          <div className="px-4 flex items-center gap-2 mb-4">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-opacity-70">Main Menu</span>
          </div>
          {navItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              className={({ isActive }) => 
                `group relative flex items-center gap-4 px-6 py-3.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:border-slate-700/50 border border-transparent'
                }`
              }
            >
              <item.icon className={`w-4.5 h-4.5 ${location.pathname === item.to ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="relative z-10">{item.label}</span>
              {location.pathname === item.to && (
                <motion.div layoutId="nav-indicator" className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Integrity HUD */}
        <div className="p-8 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/40 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Processing Latency</span>
              <span className="text-blue-400">{telemetry.latency}ms</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
               <motion.div 
                 className="bg-blue-500 h-full" 
                 initial={{ width: 0 }} 
                 animate={{ width: '65%' }} 
               />
            </div>
          </div>

          <div className="space-y-3">
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-500/60" /> Secure Protocol
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            </div>
            <div className="pt-4 px-4">
              <button 
                onClick={logout}
                className="w-full py-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500/70 hover:text-rose-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-3 group/btn"
              >
                 <LogOut className="w-4 h-4 transition-transform" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 🚀 Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative bg-slate-950/20 bg-fixed">
        {/* System Header */}
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl h-20 px-10 flex items-center justify-between border-b border-slate-800/40">
          <div className="flex items-center gap-3 text-xs font-semibold">
            {getBreadcrumbs().map((bc, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
                <span className={i === getBreadcrumbs().length - 1 ? 'text-blue-400' : 'text-slate-500'}>
                  {bc}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-950/40 border border-slate-800/60 rounded-xl w-80 group focus-within:border-blue-500/40 transition-all shadow-inner">
              <Search className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Search case file..." 
                className="bg-transparent border-none text-xs font-medium focus:ring-0 w-full placeholder:text-slate-700 text-slate-200"
              />
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 rounded-lg hover:bg-slate-800/60 transition-colors group">
                <Bell className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              </button>
              
              <div className="flex items-center gap-4 pl-6 border-l border-slate-800/60">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{user?.name || 'Practitioner'}</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{user?.role || 'Guest'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg">
                   <User className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Status Hub Bar */}
        <div className="bg-slate-900/30 border-b border-slate-800/40 px-10 py-2.5 flex items-center justify-center gap-6 font-medium text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
            <span>Encrypted Connection</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
             <span>Analysis Engine Active</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="flex items-center gap-2 text-blue-400/80">
             <Clock className="w-3.5 h-3.5" />
             <span>Uptime: 99.98%</span>
          </div>
        </div>
        
        {/* Main Diagnostic Viewport */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-12 lg:p-16">
           {children}
        </div>
      </main>
    </div>
  );
}

