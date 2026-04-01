import React, { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Minus, ArrowRight, ShieldCheck, AlertCircle, FileText, BarChart3, LineChart as LineIcon, Activity, Cpu, Target, Zap, Clock, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import API_URLS from '../config/api';

const CONDITION_COLORS = {
  'No Findings': '#10b981',
  'Mild NPDR': '#3b82f6',
  'Moderate NPDR': '#6366f1',
  'Severe NPDR': '#f59e0b',
  'Proliferative DR': '#ef4444',
  'Glaucoma': '#06b6d4',
  'Macular Edema': '#d946ef',
  'Cataract': '#84cc16'
};

export default function ProgressionWizard({ currentScan, patientName, patientEye, allPatients = [] }) {
  const [history, setHistory] = useState([]);
  const [baselineScan, setBaselineScan] = useState(null);

  useEffect(() => {
    const patient = allPatients.find(p => p.name === patientName);
    if (patient && patient.scans) {
      const eyeHistory = patient.scans
        .filter(s => s.id !== currentScan.scanId && s.eye === patientEye)
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(eyeHistory);
      if (eyeHistory.length > 0) {
        setBaselineScan(eyeHistory[eyeHistory.length - 1]);
      }
    }
  }, [patientName, currentScan, allPatients, patientEye]);

  const calculateStability = () => {
    if (!baselineScan) return { score: 0, status: 'NO_HISTORY', color: 'text-slate-600', icon: Minus };
    const diff = (currentScan.confidence || 0) - (baselineScan.confidence || 0);
    
    if (Math.abs(diff) < 0.05) return { score: 0, status: 'Stable', color: 'text-blue-500', icon: Minus };
    if (diff > 0) return { score: diff * 100, status: 'Requires Review', color: 'text-rose-500', icon: TrendingUp };
    return { score: Math.abs(diff) * 100, status: 'Improving', color: 'text-blue-500', icon: TrendingDown };
  };

  const stability = calculateStability();
  const Icon = stability.icon || Minus;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* Longitudinal History Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <History className="w-10 h-10 text-blue-500/60" />
          </div>
          <div>
            <div className="flex items-center gap-4 text-blue-500/60 font-bold text-xs uppercase tracking-widest mb-3">
               <Activity className="w-5 h-5 animate-pulse" /> Diagnostic Continuity
            </div>
            <h3 className="text-4xl font-bold text-white tracking-tight">Longitudinal <span className="text-blue-500">History</span></h3>
            <div className="flex items-center gap-6 mt-4">
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-5 py-2 rounded-xl border border-slate-800/60">{patientEye} Eye Analysis</span>
               <span className="text-[11px] font-bold text-blue-500/70 uppercase tracking-widest bg-blue-500/5 px-5 py-2 rounded-xl border border-blue-500/10">Clinical Timeline</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="px-10 py-6 bg-slate-900/50 rounded-[2rem] border border-slate-800/60 text-center min-w-[140px] group transition-all shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Base Metric</p>
            <p className="text-3xl font-bold text-white">{(baselineScan ? (baselineScan.confidence * 100).toFixed(1) : '0.0')}%</p>
          </div>
          <div className="flex items-center">
             <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          </div>
          <div className="px-10 py-6 bg-blue-600/5 rounded-[2rem] border border-blue-600/20 text-center min-w-[140px] group shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/70 mb-2">Current Grade</p>
            <p className="text-3xl font-bold text-white">{((currentScan.confidence || 0) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Comparative Image Analysis */}
        <div className="lg:col-span-8 space-y-12">
          <div className="grid md:grid-cols-2 gap-10 min-h-[500px]">
             {/* Baseline Analysis Pane */}
             <div className="bg-slate-950 rounded-[3rem] overflow-hidden relative border border-slate-800/60 shadow-2xl group cursor-default">
                {baselineScan ? (
                   <>
                    <img 
                      src={`${API_URLS.UPLOADS}${baselineScan.originalImagePath}`} 
                      alt="Baseline" 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-[3s]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
                    <div className="absolute top-10 left-10 px-6 py-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl text-[10px] font-bold uppercase tracking-widest text-blue-500/70 border border-slate-800/60 flex items-center gap-3">
                      <Clock className="w-4 h-4" /> {new Date(baselineScan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Initial Assessment</span>
                    </div>
                   </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 gap-8 bg-slate-900/20">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                       <History className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">No Record Found</p>
                  </div>
                )}
             </div>

             {/* Current Analysis Pane */}
             <div className="bg-slate-950 rounded-[3rem] overflow-hidden relative border border-blue-500/20 shadow-2xl group cursor-default">
                <img 
                  src={currentScan.imagePreview} 
                  alt="Current" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s] group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent"></div>
                <div className="absolute top-10 left-10 px-6 py-3 bg-blue-600 text-white backdrop-blur-xl rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                   <Target className="w-4 h-4" /> Active Assessment
                </div>
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                   <span className="text-[11px] font-bold text-blue-500/60 uppercase tracking-widest">Current Analysis</span>
                </div>
             </div>
          </div>

          {/* Progression Timeline Chart */}
          <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
             <div className="flex items-center justify-between mb-12">
                <h4 className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-6 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  Systematic Progress Timeline
                </h4>
                <div className="flex items-center gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                   <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Trend Line</div>
                   <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Alert Threshold</div>
                </div>
             </div>
             <div className="h-80 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[...[...history].reverse(), { createdAt: new Date().toISOString(), confidence: currentScan.confidence, primaryDiagnosis: currentScan.primary_diagnosis }]}>
                      <defs>
                        <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#1e293b" opacity={0.3} />
                      <XAxis 
                        dataKey="createdAt" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        tick={{fontSize: 10, fontWeight: 700, fill: '#475569', tracking: '0.05em'}}
                        axisLine={false}
                        tickLine={false}
                        dy={20}
                      />
                      <YAxis hide domain={[0, 1]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: '#020617', padding: '20px'}}
                        itemStyle={{fontSize: '11px', fontWeight: 700, color: '#3b82f6'}}
                        labelStyle={{display: 'none'}}
                      />
                      <Area type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#progressionGradient)" dot={{ r: 6, fill: '#0f172a', strokeWidth: 3, stroke: '#3b82f6' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }} />
                      <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="8 8" label={{ value: 'Clinical Threshold', position: 'insideRight', fill: '#ef4444', fontSize: 10, fontWeight: 700, dy: -12, letterSpacing: '0.1em' }} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Bio-Diagnostic Summary */}
          <div className="grid md:grid-cols-2 gap-10">
             <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800/60 hover:border-blue-500/30 transition-all group overflow-hidden relative shadow-xl">
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Clinical Stability</span>
               <div className={`flex items-center gap-6 text-3xl font-bold mt-6 tracking-tight ${stability.color}`}>
                  <Icon className="w-10 h-10" />
                  {stability.status} 
               </div>
               {stability.score !== 0 && (
                 <div className="mt-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-5 py-2 rounded-xl border border-slate-800/60">Metric Variance: {stability.score.toFixed(1)}%</span>
                 </div>
               )}
             </div>
             <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800/60 hover:border-blue-500/30 transition-all group overflow-hidden relative shadow-xl">
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pathology Status</span>
               <div className="text-2xl font-bold text-white mt-6 flex items-center gap-6 tracking-tight">
                  <Fingerprint className="w-10 h-10 text-blue-500/40" />
                  {currentScan.primary_diagnosis === (baselineScan?.primaryDiagnosis || currentScan.primary_diagnosis) 
                    ? "Consistent" 
                    : "Developmental"}
               </div>
               <div className="mt-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-5 py-2 rounded-xl border border-slate-800/60 font-bold">Validated Trace</span>
               </div>
             </div>
          </div>
        </div>

        {/* Diagnostic Timeline Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl flex flex-col relative overflow-hidden h-full">
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-12 text-white flex items-center gap-4">
               <History className="w-5 h-5 text-blue-500/60" /> Assessment History
            </h4>
            
            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
              {history.length > 0 ? history.map((scan) => (
                <button 
                  key={scan.id}
                  onClick={() => setBaselineScan(scan)}
                  className={`w-full text-left p-8 rounded-[2.5rem] border-2 transition-all transform active:scale-95 relative overflow-hidden group/item ${
                    baselineScan?.id === scan.id 
                      ? 'bg-blue-600/5 border-blue-600/40 shadow-xl' 
                      : 'bg-slate-900/20 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        {new Date(scan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                     </p>
                     <Zap className={`w-4 h-4 ${baselineScan?.id === scan.id ? 'text-blue-500 animate-pulse' : 'text-slate-800'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white tracking-tight uppercase">{scan.primaryDiagnosis.split(' ')[0]}</span>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight mb-1">Metric</span>
                       <span className={`text-base font-bold ${baselineScan?.id === scan.id ? 'text-blue-500' : 'text-slate-500'}`}>{(scan.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="py-24 text-center space-y-8 opacity-20">
                   <div className="w-20 h-20 rounded-3xl border-2 border-slate-800 flex items-center justify-center mx-auto">
                      <History className="w-10 h-10" />
                   </div>
                   <p className="text-[11px] font-bold uppercase tracking-widest">Initial Clinical Record</p>
                </div>
              )}
            </div>

            <div className="mt-12 p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-[2rem] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                 <AlertCircle className="w-5 h-5 text-indigo-500/60" />
                 <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-500/70">Clinical Reference</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide opacity-80">
                Longitudinal tracking provides context for acute changes across consecutive clinical observations.
              </p>
            </div>

            <button className="w-full mt-12 py-5.5 bg-white text-slate-950 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-4">
              <FileText className="w-5 h-5" /> Download Trend Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
