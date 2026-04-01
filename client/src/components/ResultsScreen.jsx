import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, RotateCcw, Shield, Clock, FileText, LayoutPanelLeft, History, PenTool, MessageSquare, BrainCircuit, ShieldCheck, Zap, Cpu, Fingerprint, Scan, Target, Activity } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import AIChat from './AIChat';
import AnnotationCanvas from './AnnotationCanvas';
import ProgressionWizard from './ProgressionWizard';
import Eye3D from './Eye3D';
import axios from 'axios';
import API_URLS from '../config/api';

const SEVERITY_COLORS = {
  none: 'bg-slate-900/50 text-slate-500 border border-slate-800/40',
  low: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  medium: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  high: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  severe: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold shadow-lg shadow-rose-900/10',
};

const TABS = [
  { id: 'summary', label: 'Diagnostic Summary', icon: LayoutPanelLeft },
  { id: 'compare', label: 'Clinical History', icon: History },
  { id: 'markup', label: 'Image Analysis', icon: PenTool },
  { id: 'assistant', label: 'Clinical Assistant', icon: MessageSquare },
];

export default function ResultsScreen({ result: initialResult, patientInfo: initialPatientInfo, imagePreview: initialImagePreview, onReset, allPatients: initialAllPatients = [] }) {
  const { scanId, patientId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(initialResult);
  const [patientInfo, setPatientInfo] = useState(initialPatientInfo);
  const [imagePreview, setImagePreview] = useState(initialImagePreview);
  const [allPatients, setAllPatients] = useState(initialAllPatients);
  const [loading, setLoading] = useState(!initialResult);
  
  const [activeTab, setActiveTab] = useState('summary');
  const [displayedText, setDisplayedText] = useState('');
  const [feedback, setFeedback] = useState(initialResult?.doctorFeedback || null);
  const now = new Date().toLocaleString();

  useEffect(() => {
    if (!result && (scanId || patientId)) {
      fetchScanData();
    }
  }, [scanId, patientId]);

  const fetchScanData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('clarieye_token') || localStorage.getItem('ocuscan_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const sId = scanId || (patientId ? 'latest' : null);
      const sRes = await axios.get(`${API_URLS.SCANS}/${sId}`, { headers });
      const data = sRes.data;
      
      setResult(data);
      setPatientInfo({
        patientName: data.patientName || 'Unknown',
        patientAge: data.patientAge || '??',
        patientEye: data.eye || 'OD'
      });
      setImagePreview(`${API_URLS.UPLOADS}${data.originalImagePath}`);
      setFeedback(data.doctorFeedback);
      
      const pRes = await axios.get(API_URLS.PATIENTS, { headers });
      setAllPatients(pRes.data);
      
    } catch (err) {
      console.error("Rehydration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'summary' && result?.overall_assessment) {
      let i = 0;
      const fullText = result.overall_assessment;
      setDisplayedText('');
      const intervalId = setInterval(() => {
        setDisplayedText(prev => prev + fullText.charAt(i));
        i++;
        if (i >= fullText.length) clearInterval(intervalId);
      }, 10);
      return () => clearInterval(intervalId);
    }
  }, [result?.overall_assessment, activeTab]);

  const handleFeedback = async (val) => {
    try {
      const token = localStorage.getItem('clarieye_token') || localStorage.getItem('ocuscan_token');
      await axios.post(`${API_URLS.SCANS}/${result.scanId}/feedback`, 
        { feedback: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(val);
      toast.success(`Verification Saved: Analysis marked as ${val}`);
    } catch (err) {
      console.error("Feedback failed:", err);
      toast.error("Feedback error: Could not save verification status.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-blue-500 font-bold uppercase tracking-widest gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-blue-500/40" />
        </div>
      </div>
      <p className="text-xs animate-pulse">Compiling Diagnostic Insights...</p>
    </div>
  );

  const confidenceStatus = result.consensusScore > 0.8 ? 'text-blue-500' : 'text-amber-500';

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 font-sans selection:bg-blue-500/30">
      
      {/* CASE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-950 p-12 rounded-[3rem] border border-slate-800/40 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-24 h-24 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
             <Cpu className="w-12 h-12 text-blue-500/60" />
           </div>
           <div>
             <div className="flex items-center gap-4 text-blue-500/60 font-bold text-xs uppercase tracking-widest mb-3">
                <ShieldCheck className="w-4 h-4" /> Verification Grade Analysis
             </div>
             <h2 className="text-4xl font-bold text-white tracking-tight">Accession: {result.scanId?.toString().slice(0,10)}</h2>
             <div className="flex items-center gap-6 mt-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-5 py-2 rounded-xl border border-slate-800/60">{patientInfo?.patientName}</span>
                <span className="text-[11px] font-bold text-blue-500/70 uppercase tracking-wider bg-blue-500/5 px-5 py-2 rounded-xl border border-blue-500/10">{patientInfo?.patientEye} EYE ORIENTATION</span>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-3.5 bg-slate-900/50 rounded-2xl border border-slate-800/60 transition-colors">
           <Clock className="w-4 h-4 text-slate-600" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RECORDED: {now}</span>
        </div>
      </div>

      {/* DASH NAVIGATION */}
      <div className="flex gap-4 p-3 bg-slate-950 border border-slate-800/60 rounded-[2.5rem] shadow-2xl max-w-fit overflow-x-auto no-scrollbar mx-auto">
        {TABS.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-4 px-10 py-4.5 rounded-3xl text-[11px] font-bold uppercase tracking-wider transition-all transform active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                : 'text-slate-500 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-blue-500/60'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* WORKSPACE VIEWPORT */}
      <div className="min-h-[700px]">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              <div className="grid lg:grid-cols-12 gap-12">
                 {/* IMAGING VIEWPORT */}
                 <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="clinical-card p-4 aspect-square group relative">
                        <div className="absolute top-8 left-8 z-10 bg-slate-950/80 backdrop-blur-xl px-5 py-2.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest border border-slate-800/40 flex items-center gap-3">
                           <Scan className="w-4 h-4 text-blue-500/60" /> Standard View
                        </div>
                        <img src={imagePreview} className="w-full h-full object-cover rounded-3xl opacity-90 group-hover:scale-[1.02] transition-transform duration-1000 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                      </div>
                      <div className="clinical-card p-4 aspect-square group relative">
                        <div className="absolute top-8 left-8 z-10 bg-blue-600/90 backdrop-blur-xl px-5 py-2.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest shadow-lg flex items-center gap-3">
                           <Target className="w-4 h-4" /> Diagnostic Overlay
                        </div>
                        <img src={`data:image/jpeg;base64,${result.heatmapBase64}`} className="w-full h-full object-cover rounded-3xl opacity-90 group-hover:scale-[1.02] transition-transform duration-1000 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                      </div>
                    </div>
                    
                    {/* ANALYSIS CONFIDENCE */}
                    <div className={`p-10 rounded-[3rem] border border-slate-800/40 bg-slate-950 shadow-2xl relative overflow-hidden`}>
                       <div className="flex items-center gap-10 relative z-10">
                         <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                           <Fingerprint className="w-10 h-10 text-blue-500/60" />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Diagnostic Consensus</span>
                               <span className={`text-2xl font-bold ${confidenceStatus}`}>{(result.consensusScore * 100).toFixed(1)}% Agreement</span>
                            </div>
                            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800/60 p-0.5">
                               <motion.div className="bg-blue-600 h-full rounded-full shadow-lg shadow-blue-900/20" initial={{ width: 0 }} animate={{ width: `${result.consensusScore * 100}%` }} transition={{ duration: 1.5, ease: "circOut" }} />
                            </div>
                         </div>
                       </div>
                    </div>

                    <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800/40 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
                       <div className="w-full md:w-1/2 rounded-3xl overflow-hidden bg-slate-900/60 p-8 border border-slate-800/40 group-hover:border-blue-500/20 transition-all">
                          <Eye3D diagnosis={result.primary_diagnosis} severity={result.severity_stage} />
                       </div>
                       <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-3 text-blue-500/60 font-bold text-[10px] uppercase tracking-widest">
                             <Activity className="w-4 h-4 animate-pulse" /> Anatomical Context
                          </div>
                          <h4 className="text-3xl font-bold text-white tracking-tight">Retinal Projection</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                            Spatial visualization of identified regions of interest. All findings are derived from segment-level feature extraction.
                          </p>
                          <div className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/5 border border-blue-500/10 px-6 py-3 rounded-full">
                             <Zap className="w-4.5 h-4.5" /> High Precision
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* CLINICAL FINDINGS PANEL */}
                 <div className="lg:col-span-4 space-y-10">
                    <div className="clinical-card p-10 h-full flex flex-col relative overflow-hidden shadow-2xl">
                       <h3 className="text-[12px] font-bold text-white uppercase tracking-widest mb-10 border-b border-slate-800/40 pb-6 flex items-center gap-4">
                          <Target className="w-5 h-5 text-blue-500/60" /> Analytical Findings
                       </h3>
                       <div className="space-y-6 flex-1">
                        {(result.findings || []).map((d, index) => (
                          <div key={index} className="flex flex-col gap-4 p-7 bg-slate-900 border border-slate-800/60 rounded-3xl hover:border-blue-500/30 transition-all group/item cursor-default shadow-lg">
                             <div className="flex justify-between items-center">
                                <span className="text-white font-bold text-sm tracking-tight">{d.disease}</span>
                                <span className={`px-4 py-1.5 text-[9px] font-bold uppercase rounded-xl ${SEVERITY_COLORS[d.severity || 'none']}`}>
                                  {d.severity || 'STABLE'}
                                </span>
                             </div>
                             <div className="flex items-baseline gap-3 mt-2">
                                <span className="text-2xl font-bold text-white">{d.likelihood?.toFixed(1)}%</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">PROBABILITY</span>
                             </div>
                          </div>
                        ))}
                       </div>
                       
                       <div className="mt-12 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/30">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-3 text-blue-100">
                               <ShieldCheck className="w-4 h-4" /> Global Classification
                            </h4>
                            <p className="text-3xl font-bold tracking-tight">{result.severity_stage || 'INCONCLUSIVE'}</p>
                            <p className="text-[9px] font-bold text-blue-200/60 uppercase tracking-widest mt-4">Verified by clinical system</p>
                        </div>

                        <div className="mt-10 space-y-8">
                           <p className="text-[10px] font-bold uppercase text-slate-600 tracking-widest text-center">Validation Workflow</p>
                           <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleFeedback('Correct')}
                                className={`py-4.5 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3 ${
                                  feedback === 'Correct' ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-900/20' : 'border-slate-800 text-slate-600 hover:text-white hover:bg-slate-900'
                                }`}
                              >
                                {feedback === 'Correct' ? <Target className="w-4 h-4" /> : null} {feedback === 'Correct' ? 'Verified' : 'Verify'}
                              </button>
                              <button 
                                onClick={() => handleFeedback('Incorrect')}
                                className={`py-4.5 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3 ${
                                  feedback === 'Incorrect' ? 'bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-900/20' : 'border-slate-800 text-slate-600 hover:text-white hover:bg-slate-900'
                                }`}
                              >
                                {feedback === 'Incorrect' ? <RotateCcw className="w-4 h-4" /> : null} {feedback === 'Incorrect' ? 'Refuted' : 'Refute'}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
              </div>

              {/* REPORT NARRATIVE */}
              <div className="clinical-card p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-950/20 opacity-50"></div>
                <h3 className="text-2xl font-bold text-white mb-12 flex items-center gap-6 tracking-tight">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                       <FileText className="w-7 h-7 text-blue-500/70" />
                    </div>
                    Automated Findings Report
                 </h3>
                <div className="bg-slate-900/60 p-12 rounded-[3.5rem] border border-slate-800/40 min-h-[220px] relative shadow-inner group/text">
                  <div className="absolute top-0 right-0 p-8 text-blue-500/20">
                     <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-slate-300 text-[16px] leading-relaxed font-medium tracking-tight transition-all group-hover/text:text-white">
                    <span className="text-5xl text-blue-500 mr-4 leading-none opacity-40 font-serif">"</span>
                    {displayedText}
                    <span className="inline-block w-2.5 h-6 ml-3 align-middle bg-blue-600 animate-pulse shadow-glow-blue"></span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compare' && (
            <motion.div key="compare" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <ProgressionWizard 
                currentScan={{ ...result, imagePreview }} 
                patientName={patientInfo.patientName} 
                patientEye={patientInfo.patientEye} 
                allPatients={allPatients} 
              />
            </motion.div>
          )}

          {activeTab === 'markup' && (
            <motion.div key="markup" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <AnnotationCanvas scanId={result.scanId} imageSrc={`data:image/jpeg;base64,${result.heatmapBase64}`} existingAnnotations={result.annotations || []} />
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div key="assistant" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <AIChat scanContext={{ ...result, patientName: patientInfo.patientName }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex gap-8 justify-end pt-12 border-t border-slate-800/40">
        <button 
          onClick={() => generatePDF({ result, patientInfo, imagePreview, now })} 
          className="flex items-center gap-4 group bg-white text-slate-950 px-12 py-5.5 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl font-bold uppercase text-[11px] tracking-widest relative overflow-hidden"
        >
          <Download className="w-5 h-5 transition group-hover:scale-110" /> Export Medical Report
        </button>
        <button 
          onClick={onReset} 
          className="flex items-center gap-6 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20 px-16 py-5.5 rounded-3xl font-bold uppercase text-[11px] tracking-widest transition-all hover:scale-[1.02] active:scale-95"
        >
          <RotateCcw className="w-5 h-5" /> Initiate New Assessment
        </button>
      </div>
    </div>
  );
}
