<div align="center">

# 🛡️ Financial Trust Shield
### 

**Complete application for detecting and reporting financial scams — with India heatmap analytics**

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://sebi-investor-shield-backend.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://lovable.dev)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)

[Live Demo](#-screenshots) · [Report Issue](https://github.com/divyaypr13-dev/financial-trust-shield/issues) · [Backend API](https://sebi-investor-shield-backend.onrender.com)

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
| | |
|---|---|
| 📊 | **City Breakdown** — India map heatmap support with city-level statistics |
| 📁 | **Multi-format Support** — handles text, URLs, images, PDFs, documents, audio, and video |
| 🛡️ | **Scam Detection** — rule-based analysis for financial scam patterns |
| 📈 | **Analytics** — real-time statistics with city breakdown |
| 🔄 | **Backward Compatible** — old API calls without a city parameter still work |

### Frontend (React/Vite)
| | |
|---|---|
| 🎯 | **Scan & Detect** — upload or paste content for scam analysis |
| 📊 | **Dashboard** — view statistics, top domains, keywords, and recent cases |
| 🗺️ | **India Heatmap** — visualize scams by city |
| 📝 | **Report Generation** — create structured complaint reports |
| 📱 | **Responsive** — works on desktop and mobile devices |

---

## 📁 Project Structure

```
FinancialTrustShield/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Main FastAPI application
│   │   ├── database.py       # SQLite database operations
│   │   ├── models.py         # Pydantic models
│   │   ├── analyzer.py       # Scam detection logic
│   │   └── seed_data.py      # Demo data seeding
│   ├── requirements.txt      # Python dependencies
│   ├── render.yaml           # Render deployment config
│   └── runtime.txt           # Python version
├── frontend/                 # React/Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

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
```

The backend will be available at: `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### Quick Test

```bash
# Test stats endpoint
curl http://localhost:8000/stats

# Test analyze endpoint
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"input_type":"text","content":"Double your money with AI trading bot! SEBI approved!","source_platform":"telegram","city":"Mumbai"}'
```

---

## 📚 API Documentation

### `POST /analyze`
Analyze content for scam patterns.

**Request:**
```json
{
  "input_type": "text|url|image|pdf|document|audio|video",
  "content": "string",
  "source_platform": "whatsapp|telegram|email|...",
  "city": "optional string"
}
```

**Response:**
```json
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
```

### `POST /report`
Generate a complaint report.

**Request:**
```json
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
```

**Response:**
```json
{
  "complaint_text": "string",
  "evidence_to_attach": ["string"],
  "next_steps": ["string"]
}
```

### `GET /stats`
Get statistics with city breakdown.

**Response:**
```json
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
```

---

## 🔧 Environment Variables

### Backend (`.env` in `backend/`)
```env
# No required environment variables for local development
# Render uses render.yaml for deployment settings
```

### Frontend (`.env` in `frontend/`)
```env
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# For production deployment
# VITE_API_BASE_URL=https://sebi-investor-shield-backend.onrender.com
```

---

## 🚢 Deployment

### Backend (Render)
The backend is configured with `render.yaml`:

```yaml
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
```

**Deployed URL:** [sebi-investor-shield-backend.onrender.com](https://sebi-investor-shield-backend.onrender.com)

### Frontend (Lovable)
The frontend is hosted on Lovable's platform. Update the environment variable:

```env
VITE_API_BASE_URL=https://sebi-investor-shield-backend.onrender.com
```

---

## 📸 Screenshots

### Dashboard View
National dashboard with aggregate scan/report stats across platforms and cities.

![National Dashboard](<img width="913" height="410" alt="Screenshot 2026-08-05 231335" src="https://github.com/user-attachments/assets/60547066-7f40-4368-8f9d-91534e381327" />


### India Heatmap — City Risk Map
Visualize scam risk by city, filterable by High Risk / Suspicious / Safe.

![City Risk Map](<img width="889" height="404" alt="Screenshot 2026-08-05 231502" src="https://github.com/user-attachments/assets/658f2071-e1c4-42e3-8187-b0a8b8dbb382" />


### Scan Analysis
Multi-modal scan with Trust Score™ verification for links, messages, documents, audio, and video.

![Scan Analysis](<img width="522" height="433" alt="Screenshot 2026-08-05 231837" src="https://github.com/user-attachments/assets/9befa401-ce7a-4fcb-8a5a-cb8bd72acdcb" />


**Trust Score breakdown** — detection signals behind the score, with recommended prevention steps.

![Trust Score Breakdown](<img width="402" height="431" alt="Screenshot 2026-08-05 231942" src="https://github.com/user-attachments/assets/8eb67ca1-161f-4279-a24d-b811b471c1ec" />


### Report Generation — Incident Reporting
Guided incident capture, evidence locker, and attack reconstruction, producing a copy-ready complaint.

![Incident Reporting — Details & Evidence](<img width="423" height="437" alt="Screenshot 2026-08-05 232348" src="https://github.com/user-attachments/assets/88c0368a-0632-4407-bff2-eda76b7d6057" />


![Incident Reporting — Attack Reconstruction](<img width="402" height="437" alt="Screenshot 2026-08-05 232420" src="https://github.com/user-attachments/assets/be3a0edc-ddbe-4af8-bdd2-ce1e0864f58a" />


![Incident Reporting — Copy-Ready Complaint](<img width="390" height="429" alt="Screenshot 2026-08-05 232505" src="https://github.com/user-attachments/assets/886c37d9-bfe5-47e1-b67b-a47b42a4afd3" />


---

## 👥 Contributors

**Divya K** ([@divyaypr13](https://github.com/divyaypr13-dev))
- Backend Development
- API Design
- Database Architecture

---

## 📝 License

This project was created for the **SEBI Investor Shield Hackathon**.

---

## 🙏 Acknowledgments

- **SEBI** (Securities and Exchange Board of India) for the hackathon opportunity
- **FastAPI** for the excellent Python framework
- **Lovable** for the frontend platform
- **Render** for free hosting

---

## 📞 Contact

- **GitHub:** [divyaypr13-dev](https://github.com/divyaypr13-dev)
- **Project:** [financial-trust-shield](https://github.com/divyaypr13-dev/financial-trust-shield)
