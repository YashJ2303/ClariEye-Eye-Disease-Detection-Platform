import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URLS from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, Shield, Users, AlertTriangle, ChevronRight, CheckCircle2, TrendingUp, Clock, FileText, Globe, Zap, BarChart3, Lock, Cpu, Fingerprint, Scan, ShieldCheck, ArrowUpRight, Terminal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';

const CONDITION_COLORS = {
  'Normal': '#10b981', // Emerald
  'Glaucoma': '#3b82f6', // Clinical Blue
  'Cataracts': '#6366f1', // Indigo
  'Diabetic Retinopathy': '#f59e0b', // Amber
  'Urgent': '#ef4444' // Red
};

export default function Dashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('clarieye_token') || '';
      const res = await axios.get(API_URLS.PATIENTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgentCases = () => {
    if (!patients || patients.length === 0) return [];
    const urgent = [];
    patients.forEach(p => {
      p.scans?.forEach(s => {
        if (s.primaryDiagnosis !== 'Normal' && s.confidence > 0.8) {
          urgent.push({ ...s, patientName: p.name, patientAge: p.age });
        }
      });
    });
    return urgent.sort((a,b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : 0;
      const dateB = b.createdAt ? new Date(b.createdAt) : 0;
      return dateB - dateA;
    }).slice(0, 5);
  };

  const getConditionData = () => {
    if (!patients || patients.length === 0) return [];
    const counts = { Normal: 0, Glaucoma: 0, Cataracts: 0, 'Diabetic Retinopathy': 0 };
    patients.forEach(p => {
       const latest = p.scans && p.scans.length > 0 ? [...p.scans].sort((a,b) => {
         const d1 = a.createdAt ? new Date(a.createdAt) : 0;
         const d2 = b.createdAt ? new Date(b.createdAt) : 0;
         return d2 - d1;
       })[0] : null;
       if (latest && counts[latest.primaryDiagnosis] !== undefined) {
         counts[latest.primaryDiagnosis]++;
       }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name, 
      value, 
      color: CONDITION_COLORS[name]
    })).filter(d => d.value > 0);
  };

  const getTimelineData = () => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: 0, rawDate: d.toDateString() };
    }).reverse();

    patients.forEach(p => {
      p.scans?.forEach(s => {
        const sDate = new Date(s.createdAt).toDateString();
        const dayMatch = days.find(d => d.rawDate === sDate);
        if (dayMatch) dayMatch.count++;
      });
    });
    return days;
  };

  const getRecentActivity = () => {
    if (!patients || patients.length === 0) return [];
    const allScans = [];
    patients.forEach(p => {
      p.scans?.forEach(s => {
        allScans.push({ ...s, patientName: p.name });
      });
    });
    return allScans.sort((a,b) => {
      const d1 = a.createdAt ? new Date(a.createdAt) : 0;
      const d2 = b.createdAt ? new Date(b.createdAt) : 0;
      return d2 - d1;
    }).slice(0, 10);
  };

  const urgentCases = getUrgentCases();
  const conditionData = getConditionData();
  const timelineData = getTimelineData();
  const recentActivity = getRecentActivity();

  const totalScans = patients.reduce((acc, p) => acc + (p.scans?.length || 0), 0);
  const highRiskCount = patients.filter(p => {
    const latest = p.scans && p.scans.length > 0 ? [...p.scans].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
    return latest && latest.primaryDiagnosis !== 'Normal' && latest.confidence > 0.85;
  }).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans selection:bg-blue-500/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
             <Activity className="w-3.5 h-4 text-blue-400" />
             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Health Systems Status</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-none">Clinical <span className="text-blue-500">Dashboard</span></h2>
          <p className="text-slate-500 font-medium text-xs mt-2">Active Summary • {user?.facility || 'Main Institute'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800/60 text-slate-400 text-[11px] font-semibold flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
             System Status: <span className="text-emerald-500">Verified</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Patients', value: patients.length, icon: Users, color: 'text-slate-400', trend: '+12%' },
          { label: 'Completed Scans', value: totalScans, icon: Activity, color: 'text-blue-400', trend: '+24%' },
          { label: 'Priority Reviews', value: highRiskCount, icon: AlertTriangle, color: 'text-rose-500', trend: '-8%' },
          { label: 'Model Reliability', value: '98.4%', icon: ShieldCheck, color: 'text-emerald-500', trend: 'STABLE' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="clinical-card p-8 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-[11px] font-bold ${stat.trend === 'STABLE' ? 'text-slate-500' : stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Urgent Review Horizontal Feed */}
      {urgentCases.length > 0 && (
        <section className="bg-rose-500/5 rounded-[2.5rem] p-10 border border-rose-500/10 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
            <h3 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider">Priority Patient Review</h3>
            <div className="h-[1px] flex-1 bg-rose-500/10 ml-4"></div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar relative z-10">
            {urgentCases.map((scan, i) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  const p = patients.find(pat => pat.name === scan.patientName);
                  if (p) setSelectedPatient(p);
                }}
                className="flex-shrink-0 w-80 clinical-card p-8 hover:border-rose-500/30 transition-all cursor-pointer group relative overflow-hidden border-rose-500/5"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-center font-bold text-slate-400 text-lg">
                    {scan.patientName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-none mb-1.5 tracking-tight">{scan.patientName}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">SCAN_ID: {scan.id?.toString().slice(0,8)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clinical Status</span>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">{scan.primaryDiagnosis}</span>
                  </div>
                  <div className="w-full bg-slate-800/40 h-1.5 rounded-full overflow-hidden border border-slate-700/20">
                    <motion.div 
                      className="bg-rose-500 h-full" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(scan.confidence || 0) * 100}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
                    <span className="text-sm font-bold text-white">{((scan.confidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/results/${scan.id}`);
                  }}
                  className="w-full mt-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-rose-900/20"
                >
                  Examine Scan
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Hub */}
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Timeline Analytical View */}
          <div className="clinical-card p-10 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-wider">Patient Throughput</h3>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mt-2">Historical Scan Volume • Last 7 Days</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-blue-400 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div> Primary Node Operational
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.6} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)', background: '#1e293b', padding: '12px'}}
                    itemStyle={{fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#3b82f6'}}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
             {/* Condition Metrics */}
             <div className="clinical-card p-10 overflow-hidden group relative">
                <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-wider mb-1">Diagnostic Distribution</h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-10">Cumulative Scan Analysis</p>
                <div className="h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={conditionData} 
                        innerRadius={65} 
                        outerRadius={90} 
                        paddingAngle={5} 
                        dataKey="value"
                        stroke="none"
                        cornerRadius={8}
                      >
                        {conditionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-white leading-none">{totalScans}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Total</span>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {conditionData.map((d, i) => (
                    <div key={i} className="flex flex-col p-4 bg-slate-950/40 rounded-2xl border border-slate-800/20 group/item">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{d.name}</span>
                      </div>
                      <span className="text-xl font-bold text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Activity & Security Logs */}
             <div className="bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                 <div className="relative z-10">
                    <ShieldCheck className="w-12 h-12 mb-6 text-white" />
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none uppercase tracking-wide">Infrastructure Logs</h3>
                    <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest mt-4 leading-relaxed">
                       SECURE SYSTEM LOGS AND CLINICAL AUDIT TRAIL. AUTHORIZED PERSONNEL ONLY.
                    </p>
                 </div>
                
            <div className="relative z-10 mt-10">
                <button 
                  onClick={() => navigate(user?.role === 'Admin' ? '/admin/audit' : '/dashboard')}
                  className="w-full py-4.5 bg-slate-950 text-blue-400 font-bold text-xs uppercase tracking-widest rounded-xl shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-4"
                >
                  {user?.role === 'Admin' ? <><Lock className="w-4 h-4" /> System Audit</> : <><Shield className="w-4 h-4" /> Access Restricted</>}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Terminal Feed */}
        <div className="lg:col-span-4">
          <div className="clinical-card p-10 shadow-2xl sticky top-28 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/40">
               <h3 className="text-lg font-bold text-white tracking-tight uppercase tracking-wider flex items-center gap-3">
                 <Clock className="w-5 h-5 text-blue-500/60" /> Recent Arrivals
               </h3>
               <Globe className="w-4 h-4 text-slate-700" />
             </div>
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4 relative group cursor-pointer" onClick={() => {
                   const p = patients.find(pat => pat.name === activity.patientName);
                   if (p) setSelectedPatient(p);
                }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 border border-slate-800/60 ${
                    activity.primaryDiagnosis === 'Normal' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`}>
                    <Scan className={`w-4.5 h-4.5 ${activity.primaryDiagnosis === 'Normal' ? 'text-emerald-500/70' : 'text-rose-500/70'}`} />
                  </div>
                  <div className="flex-1 pb-2 group-hover:translate-x-1 transition-transform">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] font-bold text-white tracking-tight">{activity.patientName}</p>
                      <span className="text-[10px] font-semibold text-slate-600">{new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                      <span className={activity.primaryDiagnosis === 'Normal' ? 'text-emerald-500/60' : 'text-rose-500/60'}>{activity.primaryDiagnosis}</span> • {((activity.confidence || 0) * 100).toFixed(0)}% Conf.
                    </p>
                  </div>
                </div>
              ))}
            </div>
             <Link to="/" className="mt-8 py-4 border border-dashed border-slate-800/60 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all rounded-xl group flex items-center justify-center gap-3">
               <Zap className="w-3.5 h-3.5" /> Start New Scan
             </Link>
          </div>
        </div>
      </div>

      {/* Patient Biometric Drawer */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 300 }}
            className="fixed top-0 right-0 w-full max-w-xl h-full bg-slate-950 z-[100] shadow-2xl border-l border-slate-800/60 flex flex-col"
          >
            <div className="p-10 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                 <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                     <Fingerprint className="w-4 h-4 text-blue-500/60" />
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Patient Case File</span>
                  </div>
                 <h2 className="text-3xl font-bold text-white tracking-tight">{selectedPatient.name}</h2>
                 <p className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase mt-3">Ref ID: {selectedPatient.id?.toString().slice(0,12)}</p>
               </div>
               <button onClick={() => setSelectedPatient(null)} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-full hover:bg-slate-700/50 transition-all">
                 <X className="w-5 h-5 text-slate-400" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
               <div className="grid grid-cols-3 gap-5">
                 {[
                   { label: 'Patient Age', value: selectedPatient.age },
                   { label: 'Eye Profile', value: selectedPatient.eye },
                   { label: 'Total Scans', value: selectedPatient.scans?.length || 0 },
                 ].map((vit, i) => (
                   <div key={i} className="p-6 bg-slate-900 border border-slate-800/60 rounded-2xl text-center shadow-lg">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{vit.label}</p>
                     <p className="text-2xl font-bold text-white tracking-tight">{vit.value}</p>
                   </div>
                 ))}
               </div>

               <div>
                 <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-8 pb-4 border-b border-slate-800/40">Clinical History</h4>
                {selectedPatient.scans?.length > 0 ? (
                  <div className="space-y-6">
                    {[...selectedPatient.scans].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((scan, i) => (
                      <div 
                        key={scan.id} 
                        onClick={() => navigate(`/results/${scan.id}`)}
                        className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-2xl shadow-xl hover:border-blue-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(scan.createdAt).toDateString()}</span>
                          <span className={`text-xs font-bold ${scan.primaryDiagnosis === 'Normal' ? 'text-emerald-500' : 'text-rose-500'}`}>{((scan.confidence || 0) * 100).toFixed(1)}% Conf.</span>
                        </div>
                        <h5 className="text-xl font-bold text-white tracking-tight">{scan.primaryDiagnosis}</h5>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="py-20 text-center border border-dashed border-slate-800/60 rounded-3xl bg-slate-900/20">
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No matching records found</p>
                   </div>
                )}
              </div>
            </div>
            
            <div className="p-10 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-xl">
                <button 
                  onClick={() => navigate(`/patient/${selectedPatient.id}/results`)}
                  className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-2xl shadow-blue-900/20 active:scale-[0.98]"
                >
                  Access Full Reports
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background Dimmer */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setSelectedPatient(null)}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

