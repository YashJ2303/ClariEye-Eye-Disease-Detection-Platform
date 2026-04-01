import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, ShieldCheck, Activity, Zap } from 'lucide-react';

export default function Eye3D({ diagnosis, severity }) {
  const isHealthy = diagnosis === 'Normal';
  
  return (
    <div className="relative w-full aspect-square flex items-center justify-center perspective-[2000px] group/eye selection:bg-blue-500/30">
      
      {/* Anatomical Reference Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[90%] h-[90%] border-2 border-dashed border-blue-500/10 rounded-full opacity-40"
        />
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[105%] h-[105%] border border-blue-500/5 rounded-full"
        />
        <div className="absolute w-[70%] h-[70%] border border-slate-800/10 rounded-full animate-pulse"></div>
      </div>

      {/* Main Clinical Anatomical Model */}
      <motion.div 
        animate={{ 
          rotateY: [0, 360],
          rotateX: [0, 10, 0, -10, 0]
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="relative w-72 h-72 preserve-3d group-hover/eye:scale-105 transition-transform duration-[2s]"
      >
        <div className="absolute inset-0 rounded-full bg-slate-950 border-2 border-slate-800 shadow-xl opacity-100 overflow-hidden relative">
          
          {/* subtle Grid Overlay */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-[0.03] pointer-events-none">
            {[...Array(144)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-blue-500/20"></div>
            ))}
          </div>

          {/* Focal Depth Layer */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(59,130,246,0.1)_150%)] mix-blend-screen" 
               style={{ opacity: isHealthy ? 0.1 : 0.8 }}></div>
          
          {/* Central Vision Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-slate-950 border border-blue-500/10 flex items-center justify-center shadow-inner">
             <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-blue-500/20 shadow-blue-900/10 flex items-center justify-center relative overflow-hidden group-hover/eye:shadow-blue-900/20">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(59,130,246,0.1)_0%,transparent_100%)] opacity-20 animate-spin"></div>
                <div className="w-8 h-8 rounded-full bg-blue-100/20 shadow-lg blur-[2px]"></div>
             </div>
          </div>
          
          {/* Analysis Module Bar */}
          <motion.div 
            animate={{ left: ['-10%', '110%', '-10%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 opacity-20 z-50"
          />
        </div>

        {/* Diagnostic Observations */}
        {!isHealthy && (
          <div className="absolute inset-0 preserve-3d">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 3 + i, 
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                className="absolute flex items-center justify-center"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  transform: `translateZ(${30 + Math.random() * 50}px)`
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500 rounded-full blur-[6px] opacity-20"></div>
                  <Target className="w-5 h-5 text-rose-500 relative z-10" />
                  <span className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-bold text-rose-500 bg-slate-950/90 px-3 py-1 border border-rose-500/10 rounded-lg shadow-xl tracking-wider">OBSERVATION_ROI</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Clinical Reference Legend */}
      <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800/60 text-[10px] font-bold uppercase tracking-widest shadow-2xl relative overflow-hidden group-hover/eye:border-blue-500/20 transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-5">
           <Zap className="w-12 h-12 text-blue-500" />
        </div>
        <p className="text-blue-500/60 mb-3 flex items-center gap-3">
          <Activity className="w-4 h-4 animate-pulse" /> Diagnostic View
        </p>
        <div className="space-y-2">
          <p className="text-slate-500 flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            STATUS: {diagnosis.toUpperCase()}
          </p>
          <p className="text-slate-600 flex items-center gap-3 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 opacity-40" /> CONFIDENCE: {severity === 'N/A' ? 'HIGH' : severity.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Active Sensors Status */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-30 group-hover/eye:opacity-50 transition-opacity">
         {[...Array(2)].map((_, i) => (
           <div key={i} className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/60 text-[9px] text-blue-500/60 tracking-widest font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              SUBSYSTEM_{i+1} : ACTIVE
           </div>
         ))}
      </div>
    </div>
  );
}
