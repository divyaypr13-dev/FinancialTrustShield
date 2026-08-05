from app.database import save_case, get_case_count

def seed_demo_data():
    if get_case_count() > 0:
        return
    
    demo_cases = [
        {
            'verdict': 'HIGH_RISK',
            'platform': 'whatsapp',
            'summary': 'Investment scam promising guaranteed returns with SEBI approval claim',
            'domains': ['fraud-investment.xyz'],
            'keywords': ['guaranteed returns', 'SEBI approved', 'act now'],
            'risk_score': 85,
            'reasons': ['Guaranteed returns claims detected', 'Unauthorized SEBI claim detected', 'Suspicious TLD detected'],
            'extracted_entities': {'domains': ['fraud-investment.xyz'], 'stocks': ['RELIANCE'], 'apps': ['WhatsApp']},
            'city': 'Mumbai'
        },
        {
            'verdict': 'SUSPICIOUS',
            'platform': 'telegram',
            'summary': 'Trading tips group claiming AI-powered profits with urgency',
            'domains': ['trading-tips.biz'],
            'keywords': ['AI trading', 'limited time', 'Telegram tip'],
            'risk_score': 55,
            'reasons': ['Urgency/pressure tactics detected', 'Telegram/WhatsApp tip group mentioned', 'AI trading/auto trading claims detected'],
            'extracted_entities': {'domains': ['trading-tips.biz'], 'stocks': ['TCS', 'INFY'], 'apps': ['Telegram']},
            'city': 'Delhi'
        },
        {
            'verdict': 'SUSPICIOUS',
            'platform': 'email',
            'summary': 'Phishing email requesting OTP for verification',
            'domains': ['secure-verify.net'],
            'keywords': ['OTP', 'verify account'],
            'risk_score': 45,
            'reasons': ['Request for OTP/credentials detected'],
            'extracted_entities': {'domains': ['secure-verify.net'], 'stocks': [], 'apps': []},
            'city': 'Bengaluru'
        },
        {
            'verdict': 'SAFE',
            'platform': 'youtube',
            'summary': 'Educational video about stock market basics',
            'domains': ['youtube.com'],
            'keywords': ['educational', 'stock market'],
            'risk_score': 0,
            'reasons': ['No specific scam patterns detected'],
            'extracted_entities': {'domains': ['youtube.com'], 'stocks': ['HDFC', 'ICICI'], 'apps': ['YouTube']},
            'city': 'Hyderabad'
        },
        {
            'verdict': 'HIGH_RISK',
            'platform': 'sms',
            'summary': 'Urgent message claiming bank account frozen with fake NSE approval',
            'domains': ['nse-fraud.xyz'],
            'keywords': ['act now', 'bank frozen', 'NSE'],
            'risk_score': 80,
            'reasons': ['Urgency/pressure tactics detected', 'Domain impersonating NSE', 'Request for OTP/credentials detected'],
            'extracted_entities': {'domains': ['nse-fraud.xyz'], 'stocks': ['SBIN'], 'apps': []},
            'city': 'Chennai'
        },
        {
            'verdict': 'SUSPICIOUS',
            'platform': 'whatsapp',
            'summary': 'Fake investment scheme with promises of high returns',
            'domains': ['quick-profit.xyz'],
            'keywords': ['guaranteed returns', 'high returns'],
            'risk_score': 60,
            'reasons': ['Guaranteed returns claims detected', 'Suspicious TLD detected'],
            'extracted_entities': {'domains': ['quick-profit.xyz'], 'stocks': [], 'apps': ['WhatsApp']},
            'city': 'Pune'
        },
        {
            'verdict': 'SAFE',
            'platform': 'website',
            'summary': 'Official SEBI website information',
            'domains': ['sebi.gov.in'],
            'keywords': ['SEBI', 'official'],
            'risk_score': 0,
            'reasons': ['No specific scam patterns detected'],
            'extracted_entities': {'domains': ['sebi.gov.in'], 'stocks': [], 'apps': []},
            'city': 'Mumbai'
        },
        {
            'verdict': 'SUSPICIOUS',
            'platform': 'telegram',
            'summary': 'Stock tip group with unrealistic profit claims',
            'domains': ['stock-tips.biz'],
            'keywords': ['AI trading', 'double money'],
            'risk_score': 50,
            'reasons': ['AI trading/auto trading claims detected', 'Telegram/WhatsApp tip group mentioned'],
            'extracted_entities': {'domains': ['stock-tips.biz'], 'stocks': ['RELIANCE', 'TCS'], 'apps': ['Telegram']},
            'city': 'Ahmedabad'
        },
        {
            'verdict': 'SAFE',
            'platform': 'news',
            'summary': 'News article about SEBI regulations',
            'domains': ['economictimes.indiatimes.com'],
            'keywords': ['SEBI', 'regulations'],
            'risk_score': 0,
            'reasons': ['No specific scam patterns detected'],
            'extracted_entities': {'domains': ['economictimes.indiatimes.com'], 'stocks': [], 'apps': []},
            'city': 'Delhi'
        },
        {
            'verdict': 'HIGH_RISK',
            'platform': 'sms',
            'summary': 'Urgent message claiming bank account blocked',
            'domains': ['bank-alert.top'],
            'keywords': ['act now', 'bank frozen', 'urgent'],
            'risk_score': 75,
            'reasons': ['Urgency/pressure tactics detected', 'Suspicious TLD detected', 'Request for OTP/credentials detected'],
            'extracted_entities': {'domains': ['bank-alert.top'], 'stocks': [], 'apps': []},
            'city': 'Jaipur'
        }
    ]
    
    for case in demo_cases:
        save_case(case)