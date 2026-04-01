# ClariEye AI - Professional Retinal Diagnostic Platform

ClariEye is an advanced clinical diagnostic platform that leverages deep learning to detect and monitor eye diseases from retinal fundus images. Built for medical professionals, it provides a seamless workflow from scanning to longitudinal analysis and clinician-verified reporting.

![ClariEye Hero Mockup](https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=2000)

## 🌟 Key Features

- **AI-Powered Diagnostics**: Detects Cataracts, Glaucoma, and Diabetic Retinopathy with high confidence.
- **Explainable AI (XAI)**: Generates Grad-CAM heatmaps to visualize exactly where the model detects pathology.
- **Longitudinal Monitoring**: Track disease progression over time with the "Progression Wizard" and comparative clinical history.
- **Clinical Annotation**: Interactive canvas for marking specific regions of interest (exudates, hemorrhages, etc.).
- **Professional Reporting**: One-click PDF report generation for institutional documentation.
- **Security & Compliance**: Role-based access control (RBAC), audit logging, and secure credentialing.
- **AI Clinician Assistant**: Real-time chat for diagnostic support and educational insights.

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Prisma (MySQL), JWT Authentication.
- **Deep Learning**: Python, TensorFlow/Keras, EfficientNet-B0, FastAPI.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MySQL Database

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
# Copy .env.example to .env and configure your DATABASE_URL and JWT_SECRET
npx prisma db push
node index.js
```

### 3. ML Server Setup (`/ml`)
```bash
cd ml
pip install -r requirements.txt
# To serve the model:
python serve.py
# To train (if dataset is present):
python train.py
```

### 4. Frontend Setup (`/client`)
```bash
cd client
npm install
# Copy .env.example to .env and configure VITE_API_BASE_URL
npm run dev
```

---

## 🛡️ Security Note
This project is designed for clinical research. Ensure all environment variables (DB URLs, API Keys, JWT Secrets) are kept private and never committed to version control. Use the provided `.env.example` templates for configuration.

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Disclaimer**: ClariEye is a research tool and does NOT replace professional medical diagnosis.
