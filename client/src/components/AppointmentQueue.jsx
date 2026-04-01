import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URLS from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, User, Calendar, Plus, ChevronRight, CheckCircle2, 
  AlertTriangle, Filter, Activity, Zap, Terminal, ShieldCheck, 
  Fingerprint, Search, X, UserPlus, Info, Cpu, Scan
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AppointmentQueue() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', notes: '' });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('clarieye_token');
      const res = await axios.get(`${API_URLS.APPOINTMENTS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      toast.error("Error: Could not load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('clarieye_token');
      const res = await axios.get(`${API_URLS.PATIENTS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {}
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('clarieye_token');
      await axios.post(`${API_URLS.APPOINTMENTS}`, newAppt, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Appointment Scheduled Successfully");
      setShowAddModal(false);
      fetchAppointments();
    } catch (err) {
      toast.error("Error: Could not save appointment.");
    }
  };

  const filteredAppointments = appointments.filter(appt => 
    appt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.id?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* Clinic Schedule Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-800/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-xl w-fit">
            <Clock className="w-3.5 h-3.5 text-blue-500/60" />
            <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">Clinic Schedule</span>
          </div>
          <h2 className="text-5xl font-bold text-white tracking-tight leading-none">Diagnostic <span className="text-blue-500">Queue</span></h2>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-3">Facility: ClariEye Clinical Pro • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-4 px-6 py-4 bg-slate-950 border border-slate-800/60 rounded-2xl w-96 group focus-within:border-blue-500/30 transition-all shadow-inner">
              <Search className="w-4 h-4 text-slate-700 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Search patient records..." 
                className="bg-transparent border-none text-[11px] font-bold focus:ring-0 w-full placeholder:text-slate-800 text-white tracking-wide"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-4 bg-slate-950 border border-slate-800/60 rounded-2xl text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all active:scale-90 shadow-lg">
              <Filter className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center gap-4 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
           >
              <UserPlus className="w-4.5 h-4.5" /> Book Appointment
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Daily Summary Side Panel */}
        <div className="lg:col-span-3 space-y-10">
           <div className="clinical-card p-10 shadow-2xl relative overflow-hidden group">
              <h4 className="text-[11px] font-bold tracking-widest uppercase mb-8 text-slate-500 flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-500/60" /> Daily Summary
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Pending', count: appointments.filter(a => a.status === 'Scheduled').length, color: 'text-amber-500' },
                  { label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length, color: 'text-blue-500' },
                  { label: 'Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length, color: 'text-slate-600' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800/40 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.count}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-10 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-600/10 shadow-xl group">
              <Info className="w-8 h-8 mb-6 text-indigo-500/60" />
              <h4 className="text-lg font-bold text-white tracking-tight">Clinical Priority</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-4 leading-relaxed tracking-wide">
                The diagnostic queue automatically prioritizes high-risk patients based on existing screening history.
              </p>
           </div>
        </div>

        {/* Patient Appointment List */}
        <div className="lg:col-span-9 space-y-8">
           <div className="bg-slate-950 rounded-[3rem] border border-slate-800/40 shadow-2xl overflow-hidden">
             <div className="p-10 border-b border-slate-800/40 bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Clock className="w-5 h-5 text-blue-500/40" />
                   <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Today's Appointments</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
             </div>

             <div className="divide-y divide-slate-800/40">
               {loading ? (
                 <div className="p-32 text-center flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 animate-spin rounded-full"></div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Retrieving Patient Data...</p>
                 </div>
               ) : filteredAppointments.length > 0 ? (
                 filteredAppointments.map((appt, i) => (
                   <motion.div 
                     key={appt.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="p-10 group hover:bg-blue-600/[0.03] transition-all flex items-center justify-between cursor-pointer relative"
                   >
                     <div className="flex items-center gap-8">
                       <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-500 group-hover:border-blue-500/30 transition-all shadow-inner">
                          <User className="w-8 h-8 opacity-40" />
                       </div>
                       <div>
                         <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-500 transition-colors uppercase">{appt.patient?.name}</h4>
                         <div className="flex items-center gap-6 mt-2">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                             <Clock className="w-3.5 h-3.5 text-blue-500/40" /> {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ref: {appt.id?.toString().slice(0,8)}</span>
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-10">
                       <div className="text-right hidden sm:block">
                          <span className={`px-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${
                            appt.status === 'Scheduled' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                            appt.status === 'Completed' ? 'bg-blue-500/5 border-blue-500/20 text-blue-500' :
                            'bg-slate-800 border-slate-700/40 text-slate-500'
                          }`}>
                            {appt.status}
                          </span>
                       </div>
                       <div className="p-4 bg-slate-900 border border-slate-800/60 text-slate-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-lg group-hover:scale-105">
                          <ChevronRight className="w-6 h-6" />
                       </div>
                     </div>
                   </motion.div>
                 ))
               ) : (
                 <div className="p-32 text-center opacity-30">
                    <Calendar className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">No active clinical appointments</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-950 rounded-[3rem] p-12 shadow-2xl border border-slate-800/40 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex items-center gap-6 mb-12 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl">
                    <UserPlus className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">New Appointment</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Patient scheduling protocol</p>
                 </div>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-2">Patient Records</label>
                  <select 
                    required
                    value={newAppt.patientId}
                    onChange={(e) => setNewAppt({...newAppt, patientId: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800/60 py-5 px-8 rounded-2xl text-[13px] font-bold text-white outline-none focus:border-blue-500/40 transition-all appearance-none shadow-inner"
                  >
                    <option value="" className="bg-slate-950 text-slate-700">Select Registered Patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id} className="bg-slate-950 text-white">{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-2">Diagnostic Timing</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800/60 py-5 px-8 rounded-2xl text-[13px] font-bold text-blue-500 outline-none focus:border-blue-500/40 transition-all shadow-inner"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-slate-900 border border-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:text-white transition shadow-lg">Cancel</button>
                   <button type="submit" className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[11px] tracking-widest rounded-2xl shadow-2xl hover:scale-[1.02] transition-all transform active:scale-95">Register Appointment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
