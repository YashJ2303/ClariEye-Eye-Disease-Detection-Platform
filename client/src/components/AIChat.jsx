import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles, BrainCircuit, GraduationCap, Microscope, Layers, Activity, Zap, Terminal, Cpu, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URLS from '../config/api';

export default function AIChat({ scanContext }) {
  const [mode, setMode] = useState('clinician'); // clinician | student
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello. I've processed the eye photo for ${scanContext.patientName || 'this patient'}. The results suggest ${scanContext.primary_diagnosis.toUpperCase()}. How can I help you understand these findings today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URLS.AI}/chat`, {
        message: userMsg,
        scanContext: { ...scanContext, mode }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-950 border border-slate-800/40 rounded-[3rem] overflow-hidden shadow-2xl group relative font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.03),transparent)] pointer-events-none"></div>
      
      {/* AI Assistant Header */}
      <div className="p-10 border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-2xl flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shadow-lg group-hover:border-blue-500/20 transition-all">
            {mode === 'clinician' ? <BrainCircuit className="w-8 h-8 text-blue-500/60 transition-transform group-hover:scale-110" /> : <GraduationCap className="w-8 h-8 text-blue-500/60 transition-transform group-hover:scale-110" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{mode === 'clinician' ? 'Clinical Assistant' : 'Educational Insight'}</h3>
            <div className="flex items-center gap-3 mt-2">
               <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-glow-blue animate-pulse"></div>
               <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Assistant Online</span>
            </div>
          </div>
        </div>
         <div className="flex gap-3 p-2 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/40 relative z-10 shadow-xl">
           <button 
             onClick={() => setMode('clinician')}
             className={`p-3 rounded-xl transition-all transform active:scale-90 ${mode === 'clinician' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             title="Diagnostic Support"
           >
             <Microscope className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setMode('student')}
             className={`p-3 rounded-xl transition-all transform active:scale-90 ${mode === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             title="Learning Resources"
           >
             <GraduationCap className="w-5 h-5" />
           </button>
         </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide no-scrollbar relative">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl border transition-all hover:scale-105 ${
                msg.role === 'assistant' 
                  ? 'bg-slate-900 border-blue-500/20 text-blue-500/60' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className={`max-w-[80%] p-8 rounded-[2rem] text-[13px] leading-relaxed font-semibold tracking-tight shadow-lg relative group/msg transition-all ${
                msg.role === 'assistant' 
                  ? 'bg-slate-900/60 text-slate-300 rounded-tl-lg border border-slate-800/60 backdrop-blur-sm' 
                  : 'bg-blue-600 text-white rounded-tr-lg shadow-blue-900/20'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6 items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-blue-500/20 text-blue-500 flex items-center justify-center animate-pulse">
              <Cpu className="w-6 h-6 opacity-40" />
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl rounded-tl-lg border border-slate-800/60 backdrop-blur-sm flex items-center gap-4">
              <Loader2 className="w-4.5 h-4.5 text-blue-500 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Processing Inquiry...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Module */}
      <div className="p-10 border-t border-slate-800/40 bg-slate-900/40 backdrop-blur-3xl relative">
        <form onSubmit={handleSend} className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a clinical question about this case..."
            className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl py-6 px-8 text-[13px] font-bold text-white focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-800 shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl disabled:opacity-10 disabled:scale-100 disabled:shadow-none cursor-pointer"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        <div className="mt-8 flex items-center justify-center gap-5 opacity-40">
           <Layers className="w-4 h-4 text-blue-500/40" />
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 uppercase">ClariEye Intelligence Engine</p>
        </div>
      </div>
    </div>
  );
}
