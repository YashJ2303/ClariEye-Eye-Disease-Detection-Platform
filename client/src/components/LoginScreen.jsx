import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Activity, Shield, User, KeyRound, 
  ChevronRight, Building2, ShieldCheck, 
  Lock, Globe, Cpu, Zap, Mail, 
  Info, CheckCircle2, AlertCircle, Scan, Fingerprint,
  Server, Boxes, Network, Microscope, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URLS from '../config/api';

const PARTNERS = [
  { name: "NeuroVision Tech", icon: Network },
  { name: "BioGen Optics", icon: Boxes },
  { name: "RetinaCore Labs", icon: Microscope },
  { name: "SafeBridge Health", icon: ShieldCheck }
];

const EyeCenter = ({ children }) => (
  <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
    {/* 🧬 Rotating Orbital Rings */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border border-[#00FFFF]/5 rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute inset-8 border border-dashed border-[#00FFFF]/10 rounded-full"
    />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-16 border-2 border-dotted border-[#00FFFF]/5 rounded-full"
    />
    
    {/* 🚀 AI Core */}
    <div className="absolute inset-4 rounded-full border border-[#00FFFF]/10 bg-[#0d1117]/70 backdrop-blur-3xl shadow-[0_0_150px_rgba(0,255,255,0.1)] flex items-center justify-center p-20">
       {/* ⚙️ Internal Scanning Protocol (Clipped to Core) */}
       <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="scanning-beam opacity-30"></div>
       </div>
       <div className="relative z-10 w-full flex flex-col items-center">
          {children}
       </div>
    </div>

    {/* 🧬 HUD Telemetry */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-20">
       <div className="flex gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-[#00FFFF] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
          ))}
       </div>
    </div>
  </div>
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
         await axios.post(`${API_URLS.AUTH}/register`, { email, password, name });
         setIsRegister(false);
         setError('Registration request submitted. Institutional credentialing is currently pending.');
      } else {
         await login(email, password);
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex flex-col items-center relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* 🏥 Clinical Grid Background */}
      <div className="fixed inset-0 z-0 bg-dot opacity-40"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#0a0f1a]/50 to-[#0a0f1a]"></div>

      {/* 🛡️ Secure Header */}
      <header className="w-full max-w-7xl px-12 py-10 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/5 border border-blue-500/20 flex items-center justify-center shadow-lg">
            <Eye className="w-7 h-7 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold text-white tracking-tight">Clari<span className="text-blue-500">Eye</span></h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Advanced Clinical Diagnostics</span>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Systems Access</span>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <ShieldAlert className="w-4 h-4 text-slate-600" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl px-12 flex flex-col lg:grid lg:grid-cols-2 gap-20 items-center py-10 relative z-10">
        
        {/* 📋 Clinical Intelligence Section */}
        <div className="space-y-12 order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Empowering Precision Healthcare
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Clinical <br /> 
              <span className="text-blue-500">Intelligence</span> <br />
              for Professionals.
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Unified diagnostic management for retinal scanning, analysis, and clinical documentation.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap gap-12 pt-10 border-t border-slate-800/60">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-blue-500/60">
                   <Activity className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Diagnostic Precision</span>
                </div>
                <p className="text-4xl font-bold text-white">98.4%</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500">
                   <Server className="w-4 h-4 text-blue-500/40" />
                   <span className="text-[11px] font-bold uppercase tracking-widest">Global Deployments</span>
                </div>
                <p className="text-4xl font-bold text-white">450+</p>
              </div>
            </div>

            <div className="pt-20 space-y-6">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Authorized Research Partners</p>
              <div className="flex flex-wrap gap-8 items-center opacity-60">
                {PARTNERS.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 group translate-y-0 hover:-translate-y-1 transition-all">
                    <p.icon className="w-5 h-5 text-blue-500/40" />
                    <span className="text-xs font-bold text-slate-400">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🏥 Professional Portal Interface */}
        <div className="w-full order-1 lg:order-2 relative flex justify-center lg:justify-end items-center min-h-[800px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[650px] relative"
          >
            <EyeCenter>
              <div className="space-y-6 w-full py-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full mb-4">
                     <Fingerprint className="w-4 h-4 text-indigo-400" />
                     <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Medical Staff ID</span>
                  </div>
                  <h2 className="text-4xl font-bold text-white tracking-tight">Clinical Portal</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {isRegister && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative">
                         <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                         <input 
                           type="text" required value={name} onChange={(e) => setName(e.target.value)}
                           className="w-full bg-slate-900/60 border border-slate-800/60 py-5 px-14 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                           placeholder="FULL CLINICAL IDENTIFICATION"
                         />
                      </motion.div>
                    )}

                    <div className="relative">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                       <input 
                         type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-slate-900/60 border border-slate-800/60 py-5 px-14 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                         placeholder="PROFESSIONAL EMAIL"
                       />
                    </div>

                    <div className="relative">
                       <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                       <input 
                         type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-slate-900/60 border border-slate-800/60 py-5 px-14 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                         placeholder="SECURE CREDENTIAL"
                       />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" disabled={loading}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-blue-900/20"
                    >
                      {loading ? <Activity className="w-5 h-5 animate-spin mx-auto text-white" /> : (
                         <>{isRegister ? 'Request Access' : 'Authenticate Access'}</>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <button 
                     onClick={() => setIsRegister(!isRegister)}
                     className="text-slate-600 hover:text-blue-500 text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                     {isRegister ? '← RETURN TO LOGIN' : 'REQUEST INSTITUTIONAL ACCESS →'}
                  </button>
                </div>
              </div>
            </EyeCenter>
          </motion.div>

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center gap-10 text-[10px] font-bold text-slate-700 uppercase tracking-widest z-30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-500/40" /> FIPS-140 ENCRYPTED
            </div>
            <div className="flex items-center gap-3">
               <Boxes className="w-4 h-4 text-blue-500/40" /> HIPAA COMPLIANT
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl px-12 py-12 border-t border-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 opacity-60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
          © 2026 ClariEye Global Systems • Clinical Protocol Suite v4.2.1
        </p>
        <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-widest text-blue-500/40">
           <div className="flex items-center gap-3">
              <Cpu className="w-3.5 h-3.5" /> CLARIEYE_CORE_V12
           </div>
           <div className="flex items-center gap-3">
              <Globe className="w-3.5 h-3.5" /> REGION_GLOBAL
           </div>
        </div>
      </footer>
    </div>
  );
}

