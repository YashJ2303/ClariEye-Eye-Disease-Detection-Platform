import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URLS from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, ChevronRight, 
  Activity, Calendar, Clock, ArrowUpRight, 
  User, Mail, Phone, MoreVertical,
  CheckCircle2, AlertTriangle, Info, Scan,
  ArrowUpDown, Download, Plus
} from 'lucide-react';

const STATUS_COLORS = {
  'Normal': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  'Urgent': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  'Review': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  'Pending': 'text-slate-400 bg-slate-400/10 border-slate-400/20'
};

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('clarieye_token') || '';
      const res = await axios.get(API_URLS.PATIENTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Patient list fetch error:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getLatestDiagnosis = (patient) => {
    if (!patient.scans || patient.scans.length === 0) return 'Pending';
    const latest = [...patient.scans].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return latest.primaryDiagnosis || 'Normal';
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id?.toString().includes(searchQuery);
    const latestStatus = getLatestDiagnosis(p);
    const matchesFilter = filterStatus === 'All' || latestStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans selection:bg-blue-500/30">
      
      {/* 🚀 Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
             <Users className="w-3.5 h-4 text-blue-400" />
             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Clinical Records Management</span>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-none">Patient <span className="text-blue-500">Registry</span></h2>
          <p className="text-slate-500 font-medium text-xs mt-2">Comprehensive view of institutional diagnostic history.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" /> New Diagnostics
          </button>
        </div>
      </div>

      {/* 🔍 Search & Filter Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search clinical identification or registry UUID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800/60 py-4.5 px-14 rounded-2xl text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>
        <div className="md:col-span-4 flex gap-4">
          <div className="flex-1 relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800/60 py-4.5 px-14 rounded-2xl text-xs font-bold text-slate-400 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer shadow-inner"
            >
              <option value="All">ALL RECORDS</option>
              <option value="Normal">NORMAL</option>
              <option value="Urgent">URGENT</option>
              <option value="Review">IN REVIEW</option>
              <option value="Pending">PENDING SCAN</option>
            </select>
          </div>
          <button className="p-4.5 bg-slate-900/60 border border-slate-800/60 rounded-2xl text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-inner">
             <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 📊 Clinical Record Grid */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800/40">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Patient Identification</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Latest Findings</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Anatomic Profile</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Diagnostic Volume</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Last Activity</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              <AnimatePresence>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-8 py-6 h-20 bg-slate-900/20"></td>
                    </tr>
                  ))
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, i) => {
                    const status = getLatestDiagnosis(patient);
                    const lastScan = patient.scans && patient.scans.length > 0 
                      ? [...patient.scans].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] 
                      : null;

                    return (
                      <motion.tr 
                        key={patient.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-blue-500/[0.02] transition-colors group cursor-pointer"
                        onClick={() => navigate(`/patient/${patient.id}/results`)}
                      >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-center text-slate-400 font-bold text-sm">
                                {patient.name?.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{patient.name}</p>
                                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">REG_{patient.id?.toString().slice(0,8)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[status] || STATUS_COLORS['Pending']}`}>
                             {status}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">{patient.age}Y</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{patient.eye} Segment</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500" style={{ width: `${Math.min(patient.scans?.length * 20, 100)}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{patient.scans?.length || 0} Scans</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-bold text-slate-400">{lastScan ? new Date(lastScan.createdAt).toLocaleDateString() : '---'}</p>
                           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{lastScan ? new Date(lastScan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No History'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-slate-600 hover:text-blue-400 hover:border-blue-500/40 transition-all">
                              <ArrowUpRight className="w-4.5 h-4.5" />
                           </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-24 text-center">
                       <div className="flex flex-col items-center justify-center space-y-4">
                          <Users className="w-12 h-12 text-slate-800" />
                          <div>
                             <p className="text-sm font-bold text-slate-400">Registry Query: 0 Records Found</p>
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Verify search parameters or initiate a New Scan.</p>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛠️ Registry Footer Stats */}
      {!loading && filteredPatients.length > 0 && (
         <div className="flex items-center justify-between px-8 py-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl">
            <div className="flex gap-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Total Registry</span>
                  <span className="text-xl font-bold text-white">{patients.length}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Matching Criteria</span>
                  <span className="text-xl font-bold text-blue-500">{filteredPatients.length}</span>
               </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               <Info className="w-3.5 h-3.5 text-slate-700" /> Authorized Clinical Access Active
            </div>
         </div>
      )}
    </div>
  );
}
