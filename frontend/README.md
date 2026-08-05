# Investor Shield Assistant

Paste this into Lovable as your prompt (edit the API base URL if needed):

Build a responsive web app called SEBI Investor Shield (India securities scam/phishing safety assistant). Use a clean, trustworthy design (white background, subtle blue accents), mobile-first.

Pages / Routes

Create 3 pages:

/scan (default home) — “Check before you click”

/report — “After-attack harm report”

/dashboard — “Scam intelligence (demo)”

Add a top navbar with app name on left and links: Scan, Report, Dashboard. Add a footer with disclaimer text.

1) /scan Page (Main)

Header

Title: SEBI Investor Shield
Subtitle: Verify suspicious stock links, messages, and screenshots — get a risk score + next steps.

Inputs (card)

Tabs: URL, Text, Screenshot

URL tab:

Input: “Paste suspicious link”

Button: Analyze

Text tab:

Large textarea: “Paste message/email/social post text”

Button: Analyze

Screenshot tab:

File upload (accept images)

Button: Analyze

API behavior

On Analyze:

Call POST {{API_BASE_URL}}/analyze

Request JSON:

{
  "input_type": "url|text|image",
  "content": "<string or base64 for image>",
  "source_platform": "whatsapp|telegram|sms|email|instagram|youtube|other"
}


While loading show spinner and “Analyzing…”

Results (show only after response)

Render a result card with:

Risk Badge: Safe / Suspicious / High Risk (color-coded)

Risk Score: 0–100

Summary: 1–2 lines

Section: Why flagged (Explainability)

bullet list of reasons[]

Section: Recommended next steps

numbered list of next_steps[]

Button: Generate Harm Report → navigates to /report and pre-fills the incident description using the analyzed content + summary.

Expected response shape:

{
  "verdict": "SAFE|SUSPICIOUS|HIGH_RISK",
  "risk_score": 0,
  "summary": "",
  "reasons": [],
  "next_steps": [],
  "extracted_entities": { "domains": [], "stocks": [], "apps": [] }
}


Add a small disclaimer under results: “This is a hackathon demo. Do not share OTPs or banking credentials.”

2) /report Page (After-attack Harm Report)

Header

Title: After-attack Harm Report
Subtitle: If money/data was shared, generate a clean report you can copy into SEBI/cybercrime portals.

Form fields

Incident type (select): Phishing link, Fake stock tip group, Impersonation, Fake advisory, Deepfake news, Other

Platform used (select): WhatsApp, Telegram, SMS, Email, Instagram, YouTube, Other

Amount lost (number, optional)

Date/time (datetime, optional)

Free text textarea: “What happened? Paste the message / describe steps.”

Evidence checklist (checkboxes): Screenshots saved, Transaction ID, Phone number, URL, Bank account details, Email headers

Button

Generate Report

API behavior

Call POST {{API_BASE_URL}}/report
Request JSON:

{
  "incident_type": "",
  "platform": "",
  "amount_lost": 0,
  "incident_datetime": "",
  "description": "",
  "evidence": {
    "screenshots_saved": true,
    "transaction_id": false,
    "phone_number": false,
    "url": false,
    "bank_details": false,
    "email_headers": false
  }
}


Output

Show:

“Copy-ready Complaint Text” (large code-style block with copy button)

“Evidence to attach” bullet list

“Next steps” section with links:

National Cyber Crime Reporting Portal (link placeholder)

SEBI SCORES (link placeholder)

Expected response:

{
  "complaint_text": "",
  "evidence_to_attach": [],
  "next_steps": []
}


3) /dashboard Page (Demo Intelligence)

Header

Title: Scam Intelligence Dashboard (Demo)
Subtitle: Aggregate view of submitted scans/reports

Cards (top row)

Total cases

High Risk cases

Top risky domain

Top scam keyword

Charts/Tables

Bar chart: Top scam keywords (count)

Table: Recent cases (timestamp, verdict, platform, summary)

Optional: simple “State-wise counts” table (if provided)

API behavior

Call GET {{API_BASE_URL}}/stats
Expected:

{
  "totals": { "cases": 0, "high_risk": 0 },
  "top_domains": [{ "domain": "", "count": 0 }],
  "top_keywords": [{ "keyword": "", "count": 0 }],
  "recent_cases": [{ "timestamp": "", "verdict": "", "platform": "", "summary": "" }]
}


UI Requirements

Use consistent spacing, rounded cards, and clear typography.

Use accessible colors (red for High Risk, amber for Suspicious, green for Safe).

Add sample placeholder data if API fails (so the demo still renders).

Add client-side validation and friendly error messages.

After generating, show me where to set API_BASE_URL as an environment/config variable.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://financial-trust-shield.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f38ccef-d161-47b8-9415-c189c5b4edf0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
