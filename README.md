# 🛡️ Financial Trust Shield - SEBI Investor Shield

<div align="center">

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://sebi-investor-shield-backend.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://lovable.dev)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)

**Complete application for detecting and reporting financial scams with India heatmap analytics**

[Live Demo](#-live-demo) · [Report Issue](https://github.com/divyaypr13-dev/financial-trust-shield/issues) · [Backend API](https://sebi-investor-shield-backend.onrender.com)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributors](#-contributors)
- [License](#-license)

---

## ✨ Features

### Backend (FastAPI)
- 📊 **City Breakdown**: India map heatmap support with city-level statistics
- 📁 **Multi-format Support**: Handles text, URLs, images, PDFs, documents, audio, and video
- 🛡️ **Scam Detection**: Rule-based analysis for financial scam patterns
- 📈 **Analytics**: Real-time statistics with city breakdown
- 🔄 **Backward Compatible**: Old API calls without city parameter still work

### Frontend (React/Vite)
- 🎯 **Scan & Detect**: Upload/ paste content for scam analysis
- 📊 **Dashboard**: View statistics, top domains, keywords, and recent cases
- 🗺️ **India Heatmap**: Visualize scams by city
- 📝 **Report Generation**: Create structured complaint reports
- 📱 **Responsive**: Works on desktop and mobile devices

---

## 📁 Project Structure
FinancialTrustShield/
├── backend/ # FastAPI Backend
│ ├── app/
│ │ ├── init.py
│ │ ├── main.py # Main FastAPI application
│ │ ├── database.py # SQLite database operations
│ │ ├── models.py # Pydantic models
│ │ ├── analyzer.py # Scam detection logic
│ │ └── seed_data.py # Demo data seeding
│ ├── requirements.txt # Python dependencies
│ ├── render.yaml # Render deployment config
│ └── runtime.txt # Python version
├── frontend/ # React/Vite Frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── public/
│ ├── package.json
│ └── vite.config.js
├── .gitignore # Git ignore rules
└── README.md # This file

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** for backend
- **Node.js 18+** for frontend
- **pip** and **npm** package managers

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000

The backend will be available at: http://localhost:8000

Frontend Setup
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev

The frontend will be available at: http://localhost:5173

# Test stats endpoint
curl http://localhost:8000/stats

# Test analyze endpoint
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"input_type":"text","content":"Double your money with AI trading bot! SEBI approved!","source_platform":"telegram","city":"Mumbai"}'
  📚 API Documentation
POST /analyze
Analyze content for scam patterns

Request:

{
  "input_type": "text|url|image|pdf|document|audio|video",
  "content": "string",
  "source_platform": "whatsapp|telegram|email|...",
  "city": "optional string"
}
Response:

{
  "verdict": "SAFE|SUSPICIOUS|HIGH_RISK",
  "risk_score": 50,
  "summary": "string",
  "reasons": ["string"],
  "next_steps": ["string"],
  "extracted_entities": {
    "domains": ["string"],
    "stocks": ["string"],
    "apps": ["string"]
  }
}

POST /report
Generate a complaint report

Request:
{
  "incident_type": "string",
  "platform": "string",
  "amount_lost": 0,
  "incident_datetime": "ISO string",
  "description": "string",
  "evidence": {
    "screenshots_saved": true,
    "transaction_id": false,
    "phone_number": true,
    "url": true,
    "bank_details": false,
    "email_headers": false
  }
}
Request:
{
  "incident_type": "string",
  "platform": "string",
  "amount_lost": 0,
  "incident_datetime": "ISO string",
  "description": "string",
  "evidence": {
    "screenshots_saved": true,
    "transaction_id": false,
    "phone_number": true,
    "url": true,
    "bank_details": false,
    "email_headers": false
  }
}
Response:
{
  "complaint_text": "string",
  "evidence_to_attach": ["string"],
  "next_steps": ["string"]
}
GET /stats
Get statistics with city breakdown

Response:
{
  "totals": {
    "cases": 10,
    "high_risk": 3
  },
  "top_domains": [...],
  "top_keywords": [...],
  "recent_cases": [...],
  "city_breakdown": [
    {
      "city": "Mumbai",
      "high_risk": 1,
      "suspicious": 0,
      "safe": 1
    }
  ]
}
🔧 Environment Variables
Backend (.env in backend/)
# No required environment variables for local development
# Render uses render.yaml for deployment settings

Frontend (.env in frontend/)
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# For production deployment
# VITE_API_BASE_URL=https://sebi-investor-shield-backend.onrender.com

🚢 Deployment
Backend (Render)
The backend is configured with render.yaml:

services:
  - type: web
    name: sebi-investor-shield
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0

Deployed URL: https://sebi-investor-shield-backend.onrender.com

Frontend (Lovable)
The frontend is hosted on Lovable's platform. Update the environment variable:

VITE_API_BASE_URL=https://sebi-investor-shield-backend.onrender.com

📸 Screenshots
Dashboard View
[Add screenshot of your dashboard here]

Scan Analysis
[Add screenshot of scan page here]

India Heatmap
[Add screenshot of heatmap here]

Report Generation
[Add screenshot of report page here]

👥 Contributors
Divya K (Divyaypr13)

Backend Development

API Design

Database Architecture

📝 License
This project was created for the SEBI Investor Shield Hackathon.

🙏 Acknowledgments
SEBI (Securities and Exchange Board of India) for the hackathon opportunity

FastAPI for the excellent Python framework

Lovable for the frontend platform

Render for free hosting

📞 Contact
GitHub: divyaypr13-dev

Project: financial-trust-shield

