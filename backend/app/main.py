from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import base64
import json
import os

from app.models import AnalyzeRequest, ReportRequest, AnalyzeResponse, ReportResponse, StatsResponse
from app.database import init_db, save_case, save_report, get_stats, get_city_breakdown, get_case_count
from app.analyzer import analyze_content
from app.seed_data import seed_demo_data

app = FastAPI(title="SEBI Investor Shield API", version="1.0.0")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    seed_demo_data()

@app.get("/")
async def root():
    return {"message": "SEBI Investor Shield API is running"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        # Handle image input type
        if request.input_type == "image":
            try:
                base64.b64decode(request.content)
                # For image, we still want to extract what we can
                analysis_result = analyze_content("image", request.content, request.source_platform)
                # Override with image-specific message
                analysis_result['summary'] = "Image analysis requires OCR. Currently unavailable in MVP."
                analysis_result['reasons'].append("OCR not enabled in current version")
                analysis_result['risk_score'] = 30
            except:
                raise HTTPException(status_code=400, detail="Invalid base64 image data")
        
        # Handle new input types (pdf, document, audio, video)
        elif request.input_type in ["pdf", "document", "audio", "video"]:
            # Use the analyzer with the content type
            analysis_result = analyze_content(request.input_type, request.content, request.source_platform)
        
        # Handle text/url normally
        else:
            analysis_result = analyze_content(
                request.input_type,
                request.content,
                request.source_platform
            )
        
        # Save case to database with city if provided
        save_case({
            'verdict': analysis_result['verdict'],
            'platform': request.source_platform,
            'summary': analysis_result['summary'],
            'domains': analysis_result.get('domains', []),
            'keywords': analysis_result.get('keywords', []),
            'risk_score': analysis_result['risk_score'],
            'reasons': analysis_result['reasons'],
            'extracted_entities': analysis_result['extracted_entities'],
            'city': request.city or "Unknown"
        })
        
        return {
            "verdict": analysis_result['verdict'],
            "risk_score": analysis_result['risk_score'],
            "summary": analysis_result['summary'],
            "reasons": analysis_result['reasons'],
            "next_steps": analysis_result['next_steps'],
            "extracted_entities": analysis_result['extracted_entities']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/report", response_model=ReportResponse)
async def report_incident(request: ReportRequest):
    try:
        # Build complaint text
        complaint_parts = []
        
        complaint_parts.append("INCIDENT COMPLAINT REPORT")
        complaint_parts.append("=" * 40)
        complaint_parts.append(f"Complaint Type: {request.incident_type.upper()}")
        complaint_parts.append(f"Platform: {request.platform.upper()}")
        complaint_parts.append(f"Date of Incident: {request.incident_datetime or 'Not specified'}")
        complaint_parts.append("")
        
        complaint_parts.append("DETAILED DESCRIPTION")
        complaint_parts.append("-" * 30)
        complaint_parts.append(request.description)
        complaint_parts.append("")
        
        if request.amount_lost > 0:
            complaint_parts.append("FINANCIAL LOSS DETAILS")
            complaint_parts.append("-" * 30)
            complaint_parts.append(f"Amount Lost: ₹{request.amount_lost:,.2f}")
            complaint_parts.append("")
        
        if request.incident_datetime:
            complaint_parts.append("TIMELINE")
            complaint_parts.append("-" * 30)
            complaint_parts.append(f"Incident occurred on: {request.incident_datetime}")
            complaint_parts.append("")
        
        scam_type = request.incident_type.replace('_', ' ').upper()
        complaint_parts.append("SUSPECTED SCAM TYPE")
        complaint_parts.append("-" * 30)
        complaint_parts.append(scam_type)
        complaint_parts.append("")
        
        complaint_parts.append("EVIDENCE AVAILABLE")
        complaint_parts.append("-" * 30)
        evidence_items = []
        if request.evidence.get('screenshots_saved'):
            evidence_items.append("✓ Screenshots saved")
        else:
            evidence_items.append("✗ Screenshots not saved")
        
        if request.evidence.get('transaction_id'):
            evidence_items.append("✓ Transaction ID available")
        else:
            evidence_items.append("✗ Transaction ID not available")
        
        if request.evidence.get('phone_number'):
            evidence_items.append("✓ Phone number recorded")
        else:
            evidence_items.append("✗ Phone number not recorded")
        
        if request.evidence.get('url'):
            evidence_items.append("✓ URL recorded")
        else:
            evidence_items.append("✗ URL not recorded")
        
        if request.evidence.get('bank_details'):
            evidence_items.append("✓ Bank details available")
        else:
            evidence_items.append("✗ Bank details not available")
        
        if request.evidence.get('email_headers'):
            evidence_items.append("✓ Email headers preserved")
        else:
            evidence_items.append("✗ Email headers not preserved")
        
        complaint_parts.extend(evidence_items)
        complaint_parts.append("")
        
        complaint_parts.append("REQUESTED ACTION")
        complaint_parts.append("-" * 30)
        complaint_parts.append("1. Register this complaint and provide a tracking number")
        complaint_parts.append("2. Investigate the fraudulent activity")
        complaint_parts.append("3. Block the concerned accounts/numbers")
        complaint_parts.append("4. Assist in recovery of funds")
        complaint_parts.append("5. Update complainant on investigation status")
        
        complaint_text = "\n".join(complaint_parts)
        
        evidence_to_attach = []
        if request.evidence.get('screenshots_saved'):
            evidence_to_attach.append("Screenshots of messages/calls")
        if request.evidence.get('transaction_id'):
            evidence_to_attach.append("Transaction ID details")
        if request.evidence.get('phone_number'):
            evidence_to_attach.append("Phone numbers involved")
        if request.evidence.get('url'):
            evidence_to_attach.append("URLs/websites")
        if request.evidence.get('bank_details'):
            evidence_to_attach.append("Bank account details (with consent)")
        if request.evidence.get('email_headers'):
            evidence_to_attach.append("Email headers")
        
        next_steps = [
            "File a formal complaint with cybercrime.gov.in",
            "Report to your bank immediately to freeze accounts",
            "Save all communication and evidence",
            "Monitor your accounts for suspicious activity",
            "Change passwords for all financial accounts"
        ]
        
        save_report({
            'incident_type': request.incident_type,
            'platform': request.platform,
            'amount_lost': request.amount_lost,
            'complaint_text': complaint_text,
            'description': request.description,
            'evidence': request.evidence
        })
        
        return {
            "complaint_text": complaint_text,
            "evidence_to_attach": evidence_to_attach if evidence_to_attach else ["No specific evidence to attach"],
            "next_steps": next_steps
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_model=StatsResponse)
async def get_statistics():
    try:
        stats = get_stats()
        city_breakdown = get_city_breakdown()
        
        return {
            "totals": stats['totals'],
            "top_domains": stats['top_domains'],
            "top_keywords": stats['top_keywords'],
            "recent_cases": stats['recent_cases'],
            "city_breakdown": city_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)