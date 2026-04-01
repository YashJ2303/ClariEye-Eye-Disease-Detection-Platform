import React, { createContext, useContext, useState } from 'react';

const TelemetryContext = createContext();

export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState({
    latency: 'N/A',
    gpuStatus: 'Optimal',
    systemHealth: '100%',
    lastScanId: null
  });

  const updateTelemetry = (newData) => {
    setTelemetry(prev => ({ ...prev, ...newData }));
  };

  return (
    <TelemetryContext.Provider value={{ telemetry, updateTelemetry }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export const useTelemetry = () => useContext(TelemetryContext);
