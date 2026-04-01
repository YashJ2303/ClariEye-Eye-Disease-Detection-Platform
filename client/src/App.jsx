import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultsScreen from './components/ResultsScreen';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import AppointmentQueue from './components/AppointmentQueue';
import AdminAudit from './components/AdminAudit';
import PatientsList from './components/PatientsList';
import { useTelemetry } from './context/TelemetryContext';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import API_URLS from './config/api';

function MainApp() {
  const [screen, setScreen] = useState('upload'); // upload | loading | results
  const [result, setResult] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const { updateTelemetry } = useTelemetry();

  const handleAnalyze = async (formData) => {
    const startTime = Date.now();
    setPatientInfo(formData);
    setScreen('loading');
    try {
      const response = await axios.post(`${API_URLS.SCANS}/analyze`, formData);
      const data = response.data;
      
      if (data.error) throw new Error(data.error);
      
      const endTime = Date.now();
      updateTelemetry({ 
        latency: endTime - startTime, 
        lastScanId: data.scanId 
      });

      // Fetch fresh patients to get historical scans for this patient
      const pRes = await axios.get(API_URLS.PATIENTS);
      setAllPatients(Array.isArray(pRes.data) ? pRes.data : []);

      setResult(data);
      setScreen('results');
    } catch (err) {
      toast.error('Analysis failed: ' + err.message);
      setScreen('upload');
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setImagePreview(null);
    setScreen('upload');
  };

  return (
    <div className="w-full h-full relative selection:bg-blue-500/30">
      <Toaster position="top-right" 
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-slate-100 bg-white text-slate-800 shadow-2xl border border-slate-800/40 rounded-2xl font-sans font-bold',
        }}
      />
      
      {screen === 'upload' && (
        <UploadScreen
          onAnalyze={handleAnalyze}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
        />
      )}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && (
        <ResultsScreen
          result={result}
          patientInfo={patientInfo}
          imagePreview={imagePreview}
          onReset={handleNewAnalysis}
          allPatients={allPatients}
        />
      )}
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="*" element={<LoginScreen />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/appointments" element={<AppointmentQueue />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/results/:scanId" element={<ResultsScreen />} />
            <Route path="/patient/:patientId/results" element={<ResultsScreen />} />
            <Route path="*" element={<MainApp />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}
