import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, Plus, X, ShieldAlert, Palette, Save, CheckCircle2, Loader2, Target, Crosshair, Zap, Activity, ShieldCheck, Terminal, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URLS from '../config/api';

const MARKER_TYPES = [
  { id: 'exudate', label: 'Lipid Exudate', color: 'bg-yellow-400', border: 'border-white', glow: 'shadow-lg shadow-yellow-900/20' },
  { id: 'hemorrhage', label: 'Hemorrhage', color: 'bg-rose-500', border: 'border-white', glow: 'shadow-lg shadow-rose-900/20' },
  { id: 'aneurysm', label: 'Microaneurysm', color: 'bg-indigo-600', border: 'border-white', glow: 'shadow-lg shadow-indigo-900/20' },
  { id: 'drusen', label: 'Drusen', color: 'bg-amber-600', border: 'border-white', glow: 'shadow-lg shadow-amber-900/20' },
  { id: 'cupping', label: 'Optic Cupping', color: 'bg-blue-500', border: 'border-white', glow: 'shadow-lg shadow-blue-900/20' },
];

export default function AnnotationCanvas({ scanId, imageSrc, existingAnnotations = [] }) {
  const [annotations, setAnnotations] = useState(existingAnnotations);
  const [selectedType, setSelectedType] = useState(MARKER_TYPES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const containerRef = useRef(null);

  const handleImageClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation = {
      id: Date.now(),
      x,
      y,
      type: selectedType.id,
      label: selectedType.label,
      color: selectedType.color,
      glow: selectedType.glow
    };

    setAnnotations([...annotations, newAnnotation]);
  };

  const removeAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const saveAnnotations = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_URLS.SCANS}/${scanId}`, {
        annotations: annotations
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save annotations:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* DIAGNOSTIC ANNOTATION INTERFACE */}
      <div className="lg:col-span-3 space-y-8">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500 shadow-lg">
               <Crosshair className="w-7 h-7" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Diagnostic Annotation</h3>
               <div className="flex items-center gap-3 mt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-glow-blue animate-pulse"></div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Active Review Mode</span>
               </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-4 bg-slate-950 px-8 py-3 rounded-full border border-slate-800/60 backdrop-blur-xl">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500" /> Pending Approval
          </div>
        </div>

        <div 
          ref={containerRef}
          onClick={handleImageClick}
          className="relative w-full aspect-video rounded-[3.5rem] overflow-hidden border border-slate-800/60 shadow-2xl cursor-crosshair group bg-slate-950"
        >
          <img 
            src={imageSrc} 
            alt="Clinical Detail" 
            className="w-full h-full object-contain pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          />
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-10">
            {[...Array(144)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-blue-500/20"></div>
            ))}
          </div>

          {/* Render Markers */}
          <AnimatePresence>
            {annotations.map((a) => (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                key={a.id}
                className={`absolute w-6 h-6 rounded-full border-2 border-white pointer-events-auto cursor-pointer group-hover:scale-125 transition-transform ${a.color} ${a.glow} z-20`}
                style={{ left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => { e.stopPropagation(); removeAnnotation(a.id); }}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-2xl">
                  {a.label} <span className="text-slate-500 ml-4">REMOVE</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* 🎯 Help Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-500/[0.02] group-hover:bg-transparent transition-colors duration-1000">
            <div className="p-16 border-2 border-dashed border-blue-500/10 rounded-[4rem] flex flex-col items-center gap-6 relative">
               <Plus className="w-16 h-16 text-blue-500/20" />
               <p className="text-blue-500/30 text-[11px] font-bold uppercase tracking-widest">
                 Click image to place observation point
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANNOTATION TOOLBOX */}
      <div className="lg:col-span-1 space-y-10">
        <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl h-full flex flex-col relative overflow-hidden group/toolbox">
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-slate-800 to-transparent"></div>
          <div className="flex items-center gap-5 mb-12 border-b border-slate-800/40 pb-10">
             <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                <Palette className="w-6 h-6" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Clinical Toolbox</h4>
             </div>
          </div>

          <div className="space-y-4 flex-1">
            {MARKER_TYPES.map((type) => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all transform active:scale-95 relative overflow-hidden group ${
                  selectedType.id === type.id 
                    ? 'bg-blue-600/10 border-blue-600/40 text-white shadow-xl shadow-blue-900/20' 
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${type.color} border-2 border-white ${type.glow} flex-shrink-0`} />
                <span className="text-[11px] font-bold uppercase tracking-widest">{type.label}</span>
                {selectedType.id === type.id && <Zap className="w-4.5 h-4.5 ml-auto text-blue-500" />}
              </button>
            ))}
          </div>

          <div className="mt-12 space-y-8 relative z-10">
             <div className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-slate-800/60 relative overflow-hidden group/stats shadow-inner">
               <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                  <Activity className="w-12 h-12 text-blue-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Annotation Count</p>
               <p className="text-3xl font-bold text-white">{annotations.length} <span className="text-[11px] text-blue-500/40 font-bold ml-2">TOTAL</span></p>
             </div>
             
             <button 
               onClick={saveAnnotations}
               disabled={isSaving}
               className={`w-full py-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl ${
                 savedSuccess 
                   ? 'bg-emerald-600 text-white shadow-emerald-900/40' 
                   : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
               }`}
             >
               {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                savedSuccess ? <CheckCircle2 className="w-6 h-6" /> : <Save className="w-6 h-6" />}
               {isSaving ? 'Processing...' : savedSuccess ? 'Validated' : 'Finalize Record'}
             </button>
             
             <button 
               onClick={() => setAnnotations([])}
               className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-800 hover:text-rose-500 transition-all"
             >
               Clear All Selections
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
