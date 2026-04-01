const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const prisma = require('./src/utils/prisma');
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const scanRoutes = require('./src/routes/scanRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware: Global Audit Logging (Simplified Decorator)
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.send = originalSend;
    
    // Only log meaningful clinical actions
    const clinicalPaths = ['/api/analyze', '/api/scans', '/api/patients', '/api/appointments', '/api/auth/login'];
    const matches = clinicalPaths.some(p => req.path.startsWith(p));
    
    if (matches && req.method !== 'GET') {
      const details = { 
        method: req.method, 
        params: req.params, 
        status: res.statusCode 
      };
      
      prisma.auditLog.create({
        data: {
          userId: req.user ? req.user.id : (body && JSON.parse(body).user ? JSON.parse(body).user.id : null),
          action: `${req.method} ${req.path}`,
          resource: req.path.split('/')[2] || 'system',
          details,
          ipAddress: req.ip
        }
      }).catch(err => console.error("Audit log failed:", err));
    }
    
    return res.send(body);
  };
  next();
});

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  console.log(`ClariEye AI Backend [Modular] running on http://localhost:${PORT}`);
});
