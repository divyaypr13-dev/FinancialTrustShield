from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    input_type: str = Field(..., pattern="^(url|text|image|pdf|document|audio|video)$")
    content: str
    source_platform: str = Field(..., pattern="^(whatsapp|telegram|sms|email|instagram|youtube|facebook|x|news|website|other)$")
    city: Optional[str] = None

class AnalyzeResponse(BaseModel):
    verdict: str
    risk_score: int
    summary: str
    reasons: list[str]
    next_steps: list[str]
    extracted_entities: dict

class ReportRequest(BaseModel):
    incident_type: str
    platform: str
    amount_lost: float = 0.0
    incident_datetime: Optional[str] = None
    description: str
    evidence: dict

class ReportResponse(BaseModel):
    complaint_text: str
    evidence_to_attach: list[str]
    next_steps: list[str]

class CityBreakdownItem(BaseModel):
    city: str
    high_risk: int
    suspicious: int
    safe: int

class StatsResponse(BaseModel):
    totals: dict
    top_domains: list[dict]
    top_keywords: list[dict]
    recent_cases: list[dict]
    city_breakdown: list[CityBreakdownItem]