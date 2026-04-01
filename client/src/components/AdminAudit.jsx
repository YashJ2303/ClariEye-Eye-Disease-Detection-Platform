import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URLS from '../config/api';
import { Shield, Clock, User, Activity, Search, Download, Filter, Eye, Zap, Terminal, ShieldCheck, Fingerprint, Lock, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('clarieye_token');
      const res = await axios.get(`${API_URLS.ADMIN}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.action?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'All' || log.resource === filterType;
      return matchesSearch && matchesFilter;
  });

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,User,Action,Resource,IP Address\n" + 
      filteredLogs.map(l => `${l.createdAt},${l.user?.name || 'System'},${l.action},${l.resource},${l.ipAddress}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clarieye_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* AUDIT HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-slate-950 p-12 rounded-[3rem] border border-slate-800/40 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-10 h-10 text-blue-500/60" />
          </div>
          <div>
            <div className="flex items-center gap-4 text-blue-500/60 font-bold text-xs uppercase tracking-widest mb-3">
               <Activity className="w-5 h-5 animate-pulse" /> Compliance Monitoring
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Audit <span className="text-blue-500">Records</span></h2>
            <div className="flex items-center gap-6 mt-4">
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 px-5 py-2 rounded-xl border border-slate-800/60">System Security</span>
               <span className="text-[11px] font-bold text-blue-500/70 uppercase tracking-wider bg-blue-500/5 px-5 py-2 rounded-xl border border-blue-500/10">Real-time Logging</span>
            </div>
          </div>
        </div>

        <button 
          onClick={exportLogs}
          className="bg-white text-slate-950 px-12 py-5.5 rounded-3xl font-bold uppercase text-[11px] tracking-widest hover:scale-[1.02] transition-all transform active:scale-95 shadow-2xl relative z-10"
        >
          <Download className="w-5 h-5 inline-block mr-3" /> Export Audit Log
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid md:grid-cols-12 gap-8 clinical-card p-10 shadow-2xl relative overflow-hidden group/controls">
        <div className="md:col-span-8 relative">
           <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/controls:text-blue-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Search by practitioner or activity..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl pl-20 pr-10 py-6 text-[13px] font-bold text-white focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-800 shadow-inner"
           />
        </div>
        <div className="md:col-span-4 relative">
           <Filter className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/60" />
           <select 
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl pl-20 pr-10 py-6 text-[13px] font-bold text-blue-500/70 outline-none focus:border-blue-500/40 transition-all appearance-none cursor-pointer shadow-inner"
           >
              <option value="All" className="bg-slate-950 text-slate-500">All Modules</option>
              <option value="auth" className="bg-slate-950 text-white">Authentication</option>
              <option value="scans" className="bg-slate-950 text-white">Diagnostics</option>
              <option value="patients" className="bg-slate-950 text-white">Records</option>
              <option value="appointments" className="bg-slate-950 text-white">Scheduling</option>
           </select>
        </div>
      </div>

      {/* ACTIVITY TABLE */}
      <div className="bg-slate-950 border border-slate-800/40 rounded-[3rem] shadow-3xl overflow-hidden mx-4 group/terminal">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/40">
                <th className="px-12 py-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-12 py-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">User Profile</th>
                <th className="px-12 py-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">Action Protocol</th>
                <th className="px-12 py-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">Resource</th>
                <th className="px-12 py-10 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Access IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-12 py-40 text-center">
                      <div className="flex flex-col items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500 animate-spin">
                           <Cpu className="w-10 h-10" />
                        </div>
                        <span className="text-[11px] font-bold uppercase text-slate-600 tracking-widest">Retrieving Security Logs...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredLogs.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-blue-600/[0.03] transition-all cursor-default group/row relative"
                >
                  <td className="px-12 py-8 transition-all">
                    <div className="flex items-center gap-4">
                       <Clock className="w-4 h-4 text-slate-700 group-hover:text-blue-500/60 transition-colors" />
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                       <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-500 shadow-inner group-hover/row:border-blue-500/30 transition-all">
                          <Fingerprint className="w-6 h-6 opacity-40" />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-white uppercase tracking-wider">{log.user?.name || 'SYSTEM CORE'}</p>
                         <p className="text-[10px] text-slate-700 uppercase font-semibold tracking-wide">{log.user?.email || 'automated.access'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                     <span className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                       log.action.includes('POST') ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/30' : 
                       log.action.includes('PATCH') ? 'bg-amber-600/10 text-amber-400 border-amber-600/30' : 
                       'bg-slate-900/40 text-slate-600 border-slate-800/40'
                     }`}>
                       {log.action}
                     </span>
                  </td>
                  <td className="px-12 py-8">
                     <span className="text-[10px] font-bold uppercase text-blue-500/70 tracking-widest bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-xl">{log.resource}</span>
                  </td>
                  <td className="px-12 py-8 text-right">
                     <code className="text-[11px] text-slate-700 bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-800/40 group-hover/row:text-blue-500/60 transition-colors">{log.ipAddress || 'Internal'}</code>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && !loading && (
          <div className="py-40 text-center space-y-8 opacity-40 transition-opacity">
             <ShieldAlert className="w-20 h-20 text-slate-800 mx-auto" />
             <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500">No matching security entries found</p>
          </div>
        )}
      </div>

      {/* SECURITY PROTOCOL FOOTER */}
      <div className="bg-slate-950 p-14 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-12 mx-4 relative overflow-hidden shadow-3xl border border-slate-800/40">
         <div className="absolute inset-y-0 right-0 w-1.5 bg-blue-600 opacity-20"></div>
         <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xl transition-transform">
            <Lock className="w-12 h-12 opacity-80" />
         </div>
         <div className="relative z-10 text-center md:text-left">
            <h4 className="text-2xl font-bold text-white tracking-tight mb-4">Security Administration Protocol</h4>
            <p className="text-[12px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wide">
              Access to system activity logs is restricted to authenticated clinic administrators. Continuous monitoring is enforced to maintain data integrity and regulatory compliance.
            </p>
         </div>
      </div>
    </div>
  );
}
