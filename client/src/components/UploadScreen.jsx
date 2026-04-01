import { useState, useCallback } from 'react';
import { Upload, X, Shield, Camera, BrainCircuit, Zap, ChevronRight, Info, Cpu, Fingerprint, Scan, Target, Activity, ShieldCheck, Terminal } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Tilt from 'react-parallax-tilt';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadScreen({ onAnalyze, imagePreview, setImagePreview }) {
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientEye, setPatientEye] = useState('Left');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Error: Unsupported file format.');
      return;
    }
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      toast.success('Success: Eye image uploaded.');
    };
    reader.readAsDataURL(file);
  }, [setImagePreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: !!imagePreview, noKeyboard: !!imagePreview });

  const canAnalyze = !!imageBase64 && patientName.trim() !== '' && patientAge.trim() !== '';

  const handleSubmit = () => {
    if (!canAnalyze) {
       if (!imageBase64) toast.error('Error: Please upload an eye image.');
       else if (!patientName.trim()) toast.error('Error: Please enter the patient name.');
       else toast.error('Error: Please enter the patient age.');
       return;
    }
    onAnalyze({ 
      imageBase64, 
      mediaType,
      patientName,
      patientAge,
      patientEye
    });
  };

  return (
    <div {...getRootProps()} className="min-h-full flex flex-col justify-center max-w-6xl mx-auto w-full group relative focus:outline-none pb-20 font-sans selection:bg-blue-500/30">
      <input {...getInputProps()} />
      
      {/* Clinical Drag Overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center border-4 border-blue-500/40 border-dashed m-12 rounded-[5rem] transition-all"
          >
            <div className="text-center">
              <div className="relative inline-block mb-10">
                <Upload className="w-24 h-24 text-blue-500 animate-bounce" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[60px] animate-pulse"></div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Import Eye Scan</h2>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Drop clinical imaging here to begin analysis</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Intake Header */}
      <div className="mb-16 pt-8 border-l-4 border-blue-600/60 pl-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center gap-4 text-blue-500/60 font-bold text-xs uppercase tracking-widest mb-4 relative z-10">
           <Zap className="w-4 h-4" /> Patient Diagnostic Intake
        </div>
        <h2 className="text-5xl font-bold text-white tracking-tight leading-none mb-6">Patient <span className="text-blue-500">Registration</span></h2>
        <p className="text-slate-500 font-semibold text-sm max-w-3xl leading-relaxed">
          Provide essential patient details and upload high-resolution anterior or posterior segment imaging for diagnostic assessment.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12 items-start">
        {/* Imaging Intake Zone */}
        <div className="lg:col-span-3 h-full">
          <Tilt tiltReverse={true} tiltMaxAngleX={1} tiltMaxAngleY={1} perspective={2000} className="w-full h-full">
            <div className={`h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 border relative group/hub ${
              imagePreview ? 'bg-slate-900 border-slate-800' : 'bg-slate-900/40 border-slate-800/60 border-dashed hover:border-blue-500/40'
            }`}>
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center group/img overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-md">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setImageBase64(null);
                      }}
                      className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-10 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <X className="w-4.5 h-4.5" /> Remove Image
                    </button>
                    <p className="mt-4 text-rose-500/40 text-[10px] font-bold uppercase tracking-widest">Action cannot be undone</p>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex flex-col justify-center items-center text-center p-16 cursor-pointer group/upload relative z-10">
                  <div className="w-24 h-24 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center mb-8 transition-transform group-hover/upload:scale-110">
                    <Camera className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Upload Clinical Imaging</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-loose">
                    Supports JPG, PNG, and WebP <br /> Recommended resolution: 1024px+
                  </p>
                </div>
              )}
            </div>
          </Tilt>
        </div>

        {/* Patient Submission Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="clinical-card p-10 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-800/40">
              <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                <Fingerprint className="w-5 h-5 text-blue-500/70" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Patient Information</h2>
            </div>
            
            <div className="space-y-6 mb-10" onClick={e => e.stopPropagation()}>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Legal Name</label>
                <div className="relative group/input">
                  <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-500" />
                  <input 
                    type="text" 
                    value={patientName} 
                    onChange={(e) => setPatientName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl p-5 pl-14 text-white font-bold text-sm focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-800"
                    placeholder="Enter Patient Name..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Patient Age</label>
                  <input 
                    type="number" 
                    value={patientAge} 
                    onChange={(e) => setPatientAge(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl p-5 text-white font-bold text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center"
                    placeholder="00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Eye Profile</label>
                  <select 
                    value={patientEye} 
                    onChange={(e) => setPatientEye(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800/60 rounded-2xl p-5 text-white font-bold text-sm focus:outline-none focus:border-blue-500/40 transition-all appearance-none cursor-pointer text-center"
                  >
                    <option>Left Eye</option>
                    <option>Right Eye</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
              disabled={!canAnalyze}
              className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 relative overflow-hidden active:scale-[0.98] ${
                canAnalyze
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-900/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/40 opacity-50'
              }`}
            >
              <Activity className="w-5 h-5" /> 
              <span>Initiate Diagnostics</span>
            </button>
          </div>
          
          <div className="p-8 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] flex items-start gap-5 backdrop-blur-md">
             <Info className="w-5 h-5 text-blue-500/40 shrink-0 mt-0.5" />
             <p className="text-[11px] font-semibold text-slate-500 leading-relaxed uppercase tracking-widest">
                VERIFICATION REQUIRED: Please confirm patient identities and imaging orientation before processing. Diagnostic accuracy depends on image clarity.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

