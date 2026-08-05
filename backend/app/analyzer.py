import re
from urllib.parse import urlparse
from typing import Dict, Any

def analyze_content(input_type: str, content: str, platform: str) -> Dict[str, Any]:
    risk_score = 0
    reasons = []
    extracted_entities = {
        'domains': [],
        'stocks': [],
        'apps': []
    }
    
    # ===== Handle non-text input types (MVP) =====
    # Always return early for these types with consistent SUSPICIOUS verdict
    non_text_types = ['pdf', 'document', 'audio', 'video', 'image']
    if input_type in non_text_types:
        reasons.append(f"MVP: {input_type} analysis not enabled yet; using basic metadata/heuristics.")
        
        # For image, try to decode base64 but still return early
        if input_type == 'image':
            try:
                import base64
                base64.b64decode(content)
            except:
                pass  # Still return early even if decode fails
        
        # risk_score=35 maps to SUSPICIOUS (range 30-69)
        return {
            'verdict': 'SUSPICIOUS',
            'risk_score': 35,
            'summary': f"File type '{input_type}' received. Advanced analysis not available in MVP.",
            'reasons': reasons,
            'next_steps': [
                "Save the file as evidence",
                "Do not open if from untrusted source",
                "Scan with antivirus software",
                "Report to cybercrime portal"
            ],
            'extracted_entities': extracted_entities,
            'domains': [],
            'keywords': ['file_upload', input_type]
        }
    
    # ===== Extract domains (for text/url only) =====
    if input_type in ['text', 'url']:
        domain_pattern = r'https?://(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)'
        domains = re.findall(domain_pattern, content)
        extracted_entities['domains'] = list(set(domains))
    
    # ===== Stock symbols =====
    stock_patterns = r'\b(RELIANCE|TCS|INFY|HDFC|ICICI|SBIN|BHARTI|ITC|WIPRO|HCL|SUNPHARMA|AXIS|KOTAK|LT|M&M|BAJFINANCE|NTPC|ONGC|HDFCBANK|MARUTI)\b'
    stocks = re.findall(stock_patterns, content, re.IGNORECASE)
    extracted_entities['stocks'] = list(set([s.upper() for s in stocks]))
    
    # ===== Apps mentioned =====
    app_patterns = r'\b(WhatsApp|Telegram|Instagram|YouTube|Facebook|Twitter|Google Pay|PhonePe|Paytm|GPay)\b'
    apps = re.findall(app_patterns, content, re.IGNORECASE)
    extracted_entities['apps'] = list(set([a for a in apps]))
    
    # ===== Scam pattern detection (for text/url only) =====
    if input_type in ['text', 'url']:
        scam_patterns = {
            'guaranteed_returns': r'(guaranteed|fixed|sure|assured).{0,10}(return|profit|earning)',
            'urgent_pressure': r'(act now|limited time|today only|hurry|immediate|urgent)',
            'sebi_claim': r'SEBI approved|SEBI registered|SEBI certified|SEBI recognized',
            'telegram_tip': r'(Telegram|WhatsApp).{0,10}(tip|group|channel|signal)',
            'otp_credential': r'(OTP|one time password|credential|password|PIN|MPIN|CVV)',
            'ai_trading': r'(AI|artificial intelligence|auto|automated).{0,10}(trading|bot|double money|double your money)'
        }
        
        for pattern_name, pattern in scam_patterns.items():
            if re.search(pattern, content, re.IGNORECASE):
                if pattern_name == 'guaranteed_returns':
                    risk_score += 25
                    reasons.append("Guaranteed returns claims detected")
                elif pattern_name == 'urgent_pressure':
                    risk_score += 15
                    reasons.append("Urgency/pressure tactics detected")
                elif pattern_name == 'sebi_claim':
                    risk_score += 15
                    reasons.append("Unauthorized SEBI claim detected")
                elif pattern_name == 'telegram_tip':
                    risk_score += 15
                    reasons.append("Telegram/WhatsApp tip group mentioned")
                elif pattern_name == 'otp_credential':
                    risk_score += 30
                    reasons.append("Request for OTP/credentials detected")
                elif pattern_name == 'ai_trading':
                    risk_score += 20
                    reasons.append("AI trading/auto trading claims detected")
    
    # ===== URL analysis =====
    if input_type == 'url' or (input_type == 'text' and 'http' in content):
        url_pattern = r'https?://[^\s<>"]+'
        urls = re.findall(url_pattern, content)
        
        for url in urls:
            parsed = urlparse(url)
            domain = parsed.netloc
            
            # Suspicious TLDs
            suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top', '.work', '.date', '.download', '.review']
            if any(domain.endswith(tld) for tld in suspicious_tlds):
                risk_score += 15
                reasons.append(f"Suspicious TLD detected: {domain}")
            
            # URL shorteners
            shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 't.co']
            if any(shortener in domain for shortener in shorteners):
                risk_score += 15
                reasons.append(f"URL shortener detected: {domain}")
            
            # Suspicious domain structure
            if domain.count('-') > 2 or domain.count('.') > 3:
                risk_score += 10
                reasons.append(f"Suspicious domain structure: {domain}")
            
            # Impersonation checks
            if 'sebi' in domain.lower() and 'gov.in' not in domain.lower():
                risk_score += 25
                reasons.append(f"Domain impersonating SEBI: {domain}")
            elif 'nse' in domain.lower() and 'nseindia.com' not in domain.lower():
                risk_score += 25
                reasons.append(f"Domain impersonating NSE: {domain}")
            elif 'bse' in domain.lower() and 'bseindia.com' not in domain.lower():
                risk_score += 25
                reasons.append(f"Domain impersonating BSE: {domain}")
    
    # ===== Cap risk_score at 100 =====
    risk_score = min(risk_score, 100)
    
    # ===== Determine verdict based on risk_score =====
    if risk_score <= 29:
        verdict = "SAFE"
        if not reasons:
            summary = "Content appears safe with no suspicious patterns detected."
            next_steps = ["Continue with caution", "Verify information from official sources"]
        else:
            summary = "Content has some suspicious elements but remains in safe zone."
            next_steps = ["Verify information from official sources", "Be cautious of potential spam"]
    elif risk_score <= 69:
        verdict = "SUSPICIOUS"
        summary = "Content shows suspicious patterns that require caution."
        next_steps = [
            "Do not click on any links or download attachments",
            "Do not share personal or financial information",
            "Save evidence (screenshots, URLs)",
            "Report to your financial institution if you've engaged"
        ]
    else:
        verdict = "HIGH_RISK"
        summary = "High-risk scam pattern detected. Immediate action recommended."
        next_steps = [
            "DO NOT click any links or share any information",
            "DO NOT make any payments or share OTP",
            "Save all evidence (screenshots, messages, URLs)",
            "Block the sender",
            "Report to cybercrime reporting portal (https://cybercrime.gov.in)",
            "Contact your bank if you've shared financial details"
        ]
    
    # ===== Platform-specific recommendations =====
    platform_recommendations = {
        'whatsapp': ["Report the contact within WhatsApp", "Block the number"],
        'telegram': ["Report the contact within Telegram", "Block the user"],
        'email': ["Mark as spam/phishing", "Don't reply"],
        'sms': ["Do not reply", "Report as spam to your carrier"],
        'facebook': ["Report the post/account", "Block the user"],
        'x': ["Report the account", "Block the user"],
        'instagram': ["Report the account", "Block the user"],
        'news': ["Verify from multiple sources", "Check official websites"],
        'website': ["Check domain authenticity", "Look for HTTPS"]
    }
    
    if platform in platform_recommendations:
        next_steps.extend(platform_recommendations[platform])
    
    # ===== Return final response =====
    return {
        'verdict': verdict,
        'risk_score': risk_score,
        'summary': summary,
        'reasons': reasons if reasons else ["No specific scam patterns detected"],
        'next_steps': list(set(next_steps)),
        'extracted_entities': extracted_entities,
        'domains': extracted_entities['domains'],
        'keywords': list(set([r for r in reasons]))
    }