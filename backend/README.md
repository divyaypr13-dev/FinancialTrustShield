<div align="center">

# ⚙️ SEBI Investor Shield — Backend API

**FastAPI backend for detecting and reporting financial scams, with city-level analytics**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render)](https://sebi-investor-shield-backend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Live API](https://sebi-investor-shield-backend.onrender.com) · [Documentation](#-api-documentation) · [Report Issue](https://github.com/divyaypr13-dev/FinancialTrustShield/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Scam Detection Logic](#-scam-detection-logic)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## ✨ Features

### Core
- 🛡️ **Scam Detection** — rule-based analysis for financial scam patterns
- 📊 **City Breakdown** — India map heatmap support with city-level statistics
- 📁 **Multi-format Support** — handles text, URLs, images, PDFs, documents, audio, and video
- 📈 **Analytics** — real-time statistics with city breakdown
- 🔄 **Backward Compatible** — old API calls without a city parameter still work

### Technical
- 🔒 **CORS Enabled** — cross-origin resource sharing for frontend integration
- 🗄️ **SQLite Database** — lightweight persistence with automatic migration
- 🌱 **Auto-seeding** — demo data included for immediate testing
- 🚀 **Production Ready** — deployed on Render with free-tier support

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.104.1 | Web framework |
| **Python** | 3.11+ | Programming language |
| **SQLite** | 3.0 | Database |
| **Uvicorn** | 0.24.0 | ASGI server |
| **Pydantic** | 2.5.0 | Data validation |
| **Render** | — | Deployment platform |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package marker
│   ├── main.py               # FastAPI application entry point
│   ├── database.py           # SQLite database operations
│   ├── models.py              # Pydantic models for request/response
│   ├── analyzer.py            # Scam detection logic
│   └── seed_data.py           # Demo data seeding
├── requirements.txt          # Python dependencies
├── render.yaml                # Render deployment configuration
├── runtime.txt                 # Python version specification
└── README.md                   # This file
```

---

## 🚀 Installation

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Local Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/divyaypr13-dev/FinancialTrustShield.git
cd FinancialTrustShield/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

### Verify Installation

```bash
# Test the root endpoint
curl http://localhost:8000/

# Test the stats endpoint
curl http://localhost:8000/stats

# Test analyze endpoint
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"input_type":"text","content":"Double your money with AI trading bot! SEBI approved!","source_platform":"telegram","city":"Mumbai"}'
```

---

## 📚 API Documentation

### `GET /`
Health check endpoint.

**Response:**
```json
{
  "message": "SEBI Investor Shield API is running"
}
```

### `POST /analyze`
Analyze content for scam patterns.

**Request:**
```json
{
  "input_type": "text|url|image|pdf|document|audio|video",
  "content": "string",
  "source_platform": "whatsapp|telegram|sms|email|instagram|youtube|facebook|x|news|website|other",
  "city": "optional string"
}
```

**Response:**
```json
{
  "verdict": "SAFE|SUSPICIOUS|HIGH_RISK",
  "risk_score": 50,
  "summary": "Content shows suspicious patterns that require caution.",
  "reasons": [
    "Urgency/pressure tactics detected",
    "Unauthorized SEBI claim detected",
    "AI trading/auto trading claims detected"
  ],
  "next_steps": [
    "Do not click on any links or download attachments",
    "Do not share personal or financial information",
    "Save evidence (screenshots, URLs)",
    "Report to your financial institution if you've engaged"
  ],
  "extracted_entities": {
    "domains": ["example.com"],
    "stocks": ["RELIANCE"],
    "apps": ["WhatsApp"]
  }
}
```

### `POST /report`
Generate a formal complaint report.

**Request:**
```json
{
  "incident_type": "investment_scam|phishing|identity_theft|...",
  "platform": "whatsapp|telegram|email|...",
  "amount_lost": 50000,
  "incident_datetime": "2026-08-01T10:30:00",
  "description": "Received fraudulent investment message",
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
  "complaint_text": "INCIDENT COMPLAINT REPORT\n...",
  "evidence_to_attach": [
    "Screenshots of messages/calls",
    "Phone numbers involved",
    "URLs/websites"
  ],
  "next_steps": [
    "File a formal complaint with cybercrime.gov.in",
    "Report to your bank immediately to freeze accounts",
    "Save all communication and evidence"
  ]
}
```

### `GET /stats`
Get statistics with city breakdown for the heatmap.

**Response:**
```json
{
  "totals": {
    "cases": 10,
    "high_risk": 3
  },
  "top_domains": [
    {"domain": "fraud-investment.xyz", "count": 1}
  ],
  "top_keywords": [
    {"keyword": "act now", "count": 3}
  ],
  "recent_cases": [
    {
      "timestamp": "2026-08-05T16:11:25.028531",
      "verdict": "HIGH_RISK",
      "platform": "sms",
      "summary": "Urgent message claiming bank account blocked"
    }
  ],
  "city_breakdown": [
    {
      "city": "Mumbai",
      "high_risk": 1,
      "suspicious": 0,
      "safe": 1
    },
    {
      "city": "Delhi",
      "high_risk": 0,
      "suspicious": 1,
      "safe": 1
    }
  ]
}
```

---

## 🔧 Environment Variables

No environment variables are required for local development. For production deployment:

```env
# Optional: Custom database path
DB_PATH=sebi_shield.db

# Optional: Custom port
PORT=8000
```

---

## 🗄️ Database Schema

### `cases` table
```sql
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    verdict TEXT NOT NULL,
    platform TEXT NOT NULL,
    summary TEXT NOT NULL,
    domains TEXT,             -- JSON array
    keywords TEXT,            -- JSON array
    risk_score INTEGER,
    reasons TEXT,              -- JSON array
    extracted_entities TEXT,   -- JSON object
    city TEXT DEFAULT 'Unknown'
);
```

### `reports` table
```sql
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    amount_lost REAL,
    complaint_text TEXT,
    description TEXT,
    evidence TEXT              -- JSON object
);
```

---

## 📊 Scam Detection Logic

### Risk scoring rules

| Pattern | Points | Description |
|---|---|---|
| Guaranteed returns | +25 | "guaranteed", "fixed", "sure" + "returns" |
| Urgent pressure | +15 | "act now", "limited time", "today only" |
| SEBI claim | +15 | "SEBI approved", "SEBI registered" |
| Telegram/WhatsApp group | +15 | "Telegram group", "WhatsApp tip" |
| OTP/credentials | +30 | "OTP", "password", "PIN" |
| AI trading bot | +20 | "AI trading", "auto trading", "double money" |
| Suspicious TLD | +15 | .tk, .ml, .ga, .cf, .xyz, .top |
| URL shortener | +15 | bit.ly, tinyurl, goo.gl |
| Domain impersonation | +25 | sebi, nse, bse in domain |

### Verdict mapping

| Risk score range | Verdict |
|---|---|
| 0–29 | SAFE |
| 30–69 | SUSPICIOUS |
| 70–100 | HIGH_RISK |

---

## 🚢 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create a Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `PYTHON_VERSION`: `3.11.0`

**Deployed URL:** [sebi-investor-shield-backend.onrender.com](https://sebi-investor-shield-backend.onrender.com)

**Auto-deployment:** the backend automatically deploys on Render when you push to the `main` branch.

---

## 🧪 Testing

### Test endpoints with curl

```bash
# Test health
curl https://sebi-investor-shield-backend.onrender.com/

# Test stats
curl https://sebi-investor-shield-backend.onrender.com/stats

# Test analyze
curl -X POST https://sebi-investor-shield-backend.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"input_type":"text","content":"Double your money with AI trading bot!","source_platform":"telegram","city":"Mumbai"}'

# Test report
curl -X POST https://sebi-investor-shield-backend.onrender.com/report \
  -H "Content-Type: application/json" \
  -d '{"incident_type":"investment_scam","platform":"whatsapp","amount_lost":50000,"incident_datetime":"2026-08-01T10:30:00","description":"Fraudulent investment message","evidence":{"screenshots_saved":true,"transaction_id":false,"phone_number":true,"url":true,"bank_details":false,"email_headers":false}}'
```

### Test locally

```bash
# Run tests
pytest tests/  # If you have tests

# Manual testing
python -c "import requests; print(requests.get('http://localhost:8000/stats').json())"
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Code style:**
- Follow PEP 8 guidelines
- Use type hints
- Write docstrings for functions
- Keep functions focused and small

---

## 📝 License

This project was created for the **SEBI Investor Shield Hackathon**.

---

## 🙏 Acknowledgments

- **SEBI** (Securities and Exchange Board of India) for the hackathon opportunity
- **FastAPI** for the excellent Python framework
- **Render** for free hosting

---

## 📞 Contact

- **GitHub:** [divyaypr13-dev](https://github.com/divyaypr13-dev)
- **Project:** [FinancialTrustShield](https://github.com/divyaypr13-dev/FinancialTrustShield)

<div align="center">

Made with ❤️ for the SEBI Investor Shield Hackathon

</div>
