import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Crosshair, BrainCircuit, CheckCircle2, ShieldCheck, Activity, Terminal, Zap, Cpu, Target, Fingerprint } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
  { icon: ImageIcon, title: 'System Initialization', text: 'Preparing clinical diagnostic environment and loading secure modules.' },
  { icon: Crosshair, title: 'Image Pre-processing', text: 'Optimizing scan quality and identifying key anatomical markers.' },
  { icon: BrainCircuit, title: 'Diagnostic Analysis', text: 'Performing multi-stage ocular assessment for clinical markers.' },
  { icon: Sparkles, title: 'Report Generation', text: 'Aggregating diagnostic findings and preparing clinical documentation.' }
];

const ScannerVisual = () => (
  <div className="relative w-64 h-64 mx-auto mb-16 group">
    {/* Clinical Scan Rings */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-[2px] border-dashed border-blue-500/10 rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute inset-6 border border-blue-500/5 rounded-full"
    />
    <div className="absolute inset-2 border border-slate-800/10 rounded-full"></div>
    
    {/* Analysis Core */}
    <div className="absolute inset-10 bg-slate-950 rounded-full flex items-center justify-center overflow-hidden border border-slate-800/60 shadow-2xl relative">
      <div className="w-32 h-32 rounded-full bg-slate-900/50 flex items-center justify-center relative border border-slate-800/40">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full bg-blue-600/10 border border-blue-500/20 shadow-xl flex items-center justify-center"
        >
           <Target className="w-7 h-7 text-blue-500/60" />
        </motion.div>
        <div className="absolute inset-0 border-[6px] border-blue-500/5 rounded-full"></div>
      </div>

      {/* Analysis Bar */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 right-0 h-0.5 bg-blue-500/30 shadow-lg z-50 flex items-center justify-center"
      >
         <div className="w-3 h-3 bg-blue-400/20 rounded-full blur-[2px] animate-pulse"></div>
      </motion.div>
      
      {/* subtle Analysis Grid */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-[0.02] pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-blue-500"></div>
        ))}
      </div>
    </div>
    
    {/* Status Indicator */}
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-slate-900 border border-slate-800 text-blue-500/60 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-xl">
      System Processing
    </div>
  </div>
);

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState(["[SYSTEM] Initializing diagnostic pipeline..."]);

  useEffect(() => {
    const logMessages = [
      "ACQUISITION: Clinical data stream verified.",
      "SECURITY: Secure institutional handshake active.",
      "RESOURCE: Diagnostic modules allocated.",
      "PROCESS: Image normalization complete.",
      "ANALYSIS: Ocular markers identified.",
      "DOCUMENTATION: Preparing clinical summary..."
    ];

    const logInterval = setInterval(() => {
      setLogs(prev => {
        const nextLog = logMessages[Math.floor(Math.random() * logMessages.length)];
        return [...prev.slice(-3), nextLog];
      });
    }, 2000);

    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 4500),
      setTimeout(() => setCurrentStep(3), 7000)
    ];
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[85vh] animate-in fade-in slide-in-from-bottom-10 duration-1000 font-sans selection:bg-blue-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-slate-950 border border-slate-800/60 rounded-[4rem] p-20 shadow-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.02),transparent)] pointer-events-none"></div>

        <ScannerVisual />

        <div className="text-center mb-20 relative z-10">
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-blue-500/5 rounded-full mb-10 border border-blue-500/10 shadow-sm">
             <ShieldCheck className="w-5 h-5 text-blue-500/40" />
             <span className="text-[11px] font-bold text-blue-500/60 uppercase tracking-widest font-bold">Secure Clinical Environment Active</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">Clinical <span className="text-blue-500">Analysis</span></h2>
          <div className="flex items-center justify-center gap-8">
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Authorized Practitioner Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            <span className="text-blue-500/40 text-[10px] font-bold uppercase tracking-widest font-bold">CLINICAL_v4.2.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div key={index} className={`flex items-start gap-8 transition-all duration-1000 ${isPending ? 'opacity-20' : 'opacity-100'}`}>
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${
                  isCompleted ? 'bg-blue-600/5 border-blue-500/20 text-blue-500 shadow-lg' : 
                  isActive ? 'bg-blue-600 border-transparent text-white shadow-xl scale-105' : 
                  'bg-slate-900 border-slate-800 text-slate-700'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Icon className={`w-8 h-8 ${isActive ? 'animate-pulse' : ''}`} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-[13px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-500' : 'text-slate-200'}`}>
                      {step.title}
                    </h4>
                    {isActive && <Activity className="w-4.5 h-4.5 text-blue-500 animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Log Interface */}
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-3xl p-10 text-[11px] text-slate-500 border border-slate-800/40 relative overflow-hidden group shadow-inner">
          <div className="flex items-center gap-5 mb-8 border-b border-slate-800/40 pb-6">
            <Terminal className="w-5 h-5 text-blue-500/40" />
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">Processing Status Logs</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500/20 animate-ping"></div>
          </div>
          <div className="space-y-4 h-24 overflow-hidden relative z-10">
            {logs.map((log, i) => (
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={`${log}-${i}`} 
                className="flex gap-6 items-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
                <span className="text-slate-600 font-bold">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className="font-bold tracking-widest uppercase text-slate-500">{log}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
