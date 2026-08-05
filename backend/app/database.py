import sqlite3
import json
from datetime import datetime
from typing import Dict, Any

DB_PATH = "sebi_shield.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def migrate_add_city_column():
    """Safely add city column if it doesn't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if city column exists
    cursor.execute("PRAGMA table_info(cases)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'city' not in columns:
        print("Adding 'city' column to cases table...")
        cursor.execute("ALTER TABLE cases ADD COLUMN city TEXT DEFAULT 'Unknown'")
        conn.commit()
        print("Migration complete: city column added.")
    else:
        print("City column already exists. No migration needed.")
    
    conn.close()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create cases table with city column
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            verdict TEXT NOT NULL,
            platform TEXT NOT NULL,
            summary TEXT NOT NULL,
            domains TEXT,
            keywords TEXT,
            risk_score INTEGER,
            reasons TEXT,
            extracted_entities TEXT,
            city TEXT DEFAULT 'Unknown'
        )
    ''')
    
    # Create reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            incident_type TEXT NOT NULL,
            platform TEXT NOT NULL,
            amount_lost REAL,
            complaint_text TEXT,
            description TEXT,
            evidence TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Run migration for existing databases
    migrate_add_city_column()

def save_case(data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    city = data.get('city', 'Unknown')
    
    cursor.execute('''
        INSERT INTO cases (
            timestamp, verdict, platform, summary, domains, 
            keywords, risk_score, reasons, extracted_entities, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().isoformat(),
        data['verdict'],
        data['platform'],
        data['summary'],
        json.dumps(data.get('domains', [])),
        json.dumps(data.get('keywords', [])),
        data.get('risk_score', 0),
        json.dumps(data.get('reasons', [])),
        json.dumps(data.get('extracted_entities', {})),
        city
    ))
    
    conn.commit()
    conn.close()

def save_report(data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO reports (
            timestamp, incident_type, platform, amount_lost,
            complaint_text, description, evidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().isoformat(),
        data['incident_type'],
        data['platform'],
        data.get('amount_lost', 0),
        data['complaint_text'],
        data.get('description', ''),
        json.dumps(data.get('evidence', {}))
    ))
    
    conn.commit()
    conn.close()

def get_city_breakdown():
    """Get city breakdown for the heatmap."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            city,
            COUNT(CASE WHEN verdict = 'HIGH_RISK' THEN 1 END) as high_risk,
            COUNT(CASE WHEN verdict = 'SUSPICIOUS' THEN 1 END) as suspicious,
            COUNT(CASE WHEN verdict = 'SAFE' THEN 1 END) as safe
        FROM cases
        GROUP BY city
        ORDER BY city
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    return [
        {
            'city': row['city'],
            'high_risk': row['high_risk'],
            'suspicious': row['suspicious'],
            'safe': row['safe']
        }
        for row in results
    ]

def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total cases
    cursor.execute("SELECT COUNT(*) FROM cases")
    total_cases = cursor.fetchone()[0]
    
    # High risk cases
    cursor.execute("SELECT COUNT(*) FROM cases WHERE verdict = 'HIGH_RISK'")
    high_risk = cursor.fetchone()[0]
    
    # Top domains
    cursor.execute("SELECT domains FROM cases WHERE domains IS NOT NULL AND domains != '[]'")
    domains_data = cursor.fetchall()
    
    domain_count = {}
    for row in domains_data:
        try:
            domains = json.loads(row[0])
            for domain in domains:
                domain_count[domain] = domain_count.get(domain, 0) + 1
        except:
            pass
    
    top_domains = [{'domain': k, 'count': v} for k, v in sorted(domain_count.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Top keywords
    cursor.execute("SELECT keywords FROM cases WHERE keywords IS NOT NULL AND keywords != '[]'")
    keywords_data = cursor.fetchall()
    
    keyword_count = {}
    for row in keywords_data:
        try:
            keywords = json.loads(row[0])
            for keyword in keywords:
                keyword_count[keyword] = keyword_count.get(keyword, 0) + 1
        except:
            pass
    
    top_keywords = [{'keyword': k, 'count': v} for k, v in sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Recent cases
    cursor.execute("SELECT timestamp, verdict, platform, summary FROM cases ORDER BY timestamp DESC LIMIT 5")
    recent_cases = [{'timestamp': row[0], 'verdict': row[1], 'platform': row[2], 'summary': row[3]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        'totals': {
            'cases': total_cases,
            'high_risk': high_risk
        },
        'top_domains': top_domains,
        'top_keywords': top_keywords,
        'recent_cases': recent_cases
    }

def get_case_count():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    conn.close()
    return count