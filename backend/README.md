# SEBI Investor Shield Backend

FastAPI backend for investor protection against financial scams.

## Features

- 📊 **City Breakdown**: India map heatmap support with city-level statistics
- 📁 **Multi-format Support**: Handles text, URLs, images, PDFs, documents, audio, and video
- 🛡️ **Scam Detection**: Rule-based analysis for financial scam patterns
- 📈 **Analytics**: Real-time statistics with city breakdown

## API Endpoints

### POST /analyze
Analyze content for scam patterns
- Supports: text, url, image, pdf, document, audio, video
- Optional: city parameter for location tracking

### POST /report
Generate complaint report

### GET /stats
Get statistics with city breakdown for heatmap

## Deployment

This backend is deployed on Render at:
https://sebi-investor-shield-backend.onrender.com

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/stats