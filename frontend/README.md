<div align="center">

# 🎨 Financial Trust Shield — Frontend

**React-based frontend for detecting and reporting financial scams, with India heatmap analytics**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Lovable](https://img.shields.io/badge/Built%20with-Lovable-FF6B6B?style=for-the-badge)](https://lovable.dev)
[![Live Demo](https://img.shields.io/badge/Live-Demo-00C853?style=for-the-badge)](https://financial-trust-shield.lovable.app)

[Live Demo](https://financial-trust-shield.lovable.app) · [Backend API](https://sebi-investor-shield-backend.onrender.com) · [Report Issue](https://github.com/divyaypr13-dev/FinancialTrustShield/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [API Integration](#-api-integration)
- [UI Components](#-ui-components)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

### Core
- 🛡️ **Scam Detection** — analyze URLs, text messages, and screenshots for scam patterns
- 📊 **Dashboard** — real-time statistics, top domains, keywords, and recent cases
- 📝 **Report Generation** — create structured complaint reports for cybercrime portals
- 🗺️ **India Heatmap** — visualize scam distribution across Indian cities (coming soon)
- 📱 **Mobile-First** — responsive design that works on all devices

### User Experience
- ⚡ **Real-time Analysis** — instant feedback with loading states
- 🎨 **Clean Design** — trustworthy UI with white background and subtle blue accents
- ♿ **Accessible** — WCAG-compliant color choices (red for high risk, amber for suspicious, green for safe)
- 🔄 **Offline Ready** — graceful fallbacks when the API is unavailable

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.0+ | Type safety |
| **Vite** | 4.0+ | Build tool |
| **TanStack Router** | Latest | File-based routing |
| **Tailwind CSS** | 3.0+ | Styling |
| **shadcn/ui** | Latest | UI components |
| **Lucide React** | Latest | Icons |
| **Recharts** | Latest | Charts |
| **Lovable** | — | Development platform |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── IndiaRiskMap.tsx   # India map heatmap
│   │   ├── Page.tsx           # Page layout wrapper
│   │   ├── RiskBadge.tsx      # Risk verdict badge
│   │   └── TrustScore.tsx     # Trust score indicator
│   ├── lib/
│   │   ├── api.ts             # API service layer
│   │   ├── city-coords.ts     # City coordinates for heatmap
│   │   ├── evidence.ts        # Evidence handling utilities
│   │   ├── intel.ts           # Scam intelligence utilities
│   │   └── utils.ts           # General utilities
│   ├── routes/
│   │   ├── __root.tsx         # Root layout
│   │   ├── index.tsx          # /scan page (default)
│   │   ├── dashboard.tsx      # /dashboard page
│   │   └── report.tsx         # /report page
│   ├── styles.css             # Global styles
│   └── router.tsx             # Router configuration
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── package.json               # Dependencies
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or bun package manager

### Local Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/divyaypr13-dev/FinancialTrustShield.git
cd FinancialTrustShield/frontend

# Install dependencies
npm install
# or with bun:
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
# or with bun:
bun run dev
```

The application will be available at: `http://localhost:5173`

### Build for Production

```bash
npm run build
# or with bun:
bun run build
```

The build output will be in the `dist/` folder.

---

## 🔧 Environment Variables

Create a `.env` file in the frontend root directory:

```env
# Required: Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# For production deployment
# VITE_API_BASE_URL=https://sebi-investor-shield-backend.onrender.com

# Optional: Enable debug logging
VITE_DEBUG=true
```

### Setting in Lovable

1. Go to Lovable project → **Settings → Environment Variables**
2. Add:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://sebi-investor-shield-backend.onrender.com`
3. Save and restart the preview

---

## 📄 Pages & Routes

### `/scan` (default home) — *"Check before you click"*
- **URL tab** — analyze suspicious links
- **Text tab** — paste messages, emails, social posts
- **Screenshot tab** — upload images for analysis
- **Results** — risk badge, score, reasons, next steps
- **Action** — Generate Harm Report button

### `/report` — *"After-attack Harm Report"*
- **Form** — incident type, platform, amount lost, date/time
- **Description** — free-text description
- **Evidence checklist** — screenshots, transaction ID, phone number, URL, bank details, email headers
- **Output** — copy-ready complaint text with copy button
- **Next steps** — links to cybercrime portals

### `/dashboard` — *"Scam Intelligence Dashboard"*
- **Stats cards** — total cases, high risk, top domain, top keyword
- **Charts** — bar chart of top scam keywords
- **Table** — recent cases with timestamp, verdict, platform, summary
- **Heatmap** — India map with state-wise scam distribution

---

## 🔌 API Integration

### API Service Layer (`src/lib/api.ts`)

```typescript
const api = {
  // Analyze content
  analyze: (data: AnalyzeRequest) =>
    fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  // Generate report
  report: (data: ReportRequest) =>
    fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  // Get statistics
  stats: () =>
    fetch(`${API_BASE_URL}/stats`).then(res => res.json())
};
```

### Request / Response Types

**`POST /analyze`**
```typescript
interface AnalyzeRequest {
  input_type: 'url' | 'text' | 'image';
  content: string; // URL, text, or base64 image
  source_platform: 'whatsapp' | 'telegram' | 'sms' | 'email' | 'instagram' | 'youtube' | 'other';
  city?: string;
}

interface AnalyzeResponse {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  risk_score: number;
  summary: string;
  reasons: string[];
  next_steps: string[];
  extracted_entities: {
    domains: string[];
    stocks: string[];
    apps: string[];
  };
}
```

**`POST /report`**
```typescript
interface ReportRequest {
  incident_type: string;
  platform: string;
  amount_lost: number;
  incident_datetime: string;
  description: string;
  evidence: {
    screenshots_saved: boolean;
    transaction_id: boolean;
    phone_number: boolean;
    url: boolean;
    bank_details: boolean;
    email_headers: boolean;
  };
}
```

**`GET /stats`**
```typescript
interface StatsResponse {
  totals: {
    cases: number;
    high_risk: number;
  };
  top_domains: Array<{ domain: string; count: number }>;
  top_keywords: Array<{ keyword: string; count: number }>;
  recent_cases: Array<{
    timestamp: string;
    verdict: string;
    platform: string;
    summary: string;
  }>;
  city_breakdown?: Array<{
    city: string;
    high_risk: number;
    suspicious: number;
    safe: number;
  }>;
}
```

---

## 🎨 UI Components

### Custom Components

| Component | Purpose |
|---|---|
| **RiskBadge** | Displays risk verdict with color coding (SAFE/SUSPICIOUS/HIGH_RISK) |
| **TrustScore** | Visual indicator of risk score (0–100) |
| **IndiaRiskMap** | Interactive India map with state-wise scam data |
| **Page** | Consistent page layout wrapper with navbar and footer |

### shadcn/ui components used
Alert, Badge, Button, Card, Checkbox, Dialog, Dropdown Menu, Form, Input, Label, Select, Separator, Sheet, Table, Tabs, Textarea, Toast, Tooltip

### Color scheme (accessible)

| Verdict | Color | Hex |
|---|---|---|
| SAFE | Green | `#22c55e` |
| SUSPICIOUS | Amber | `#f59e0b` |
| HIGH_RISK | Red | `#ef4444` |

---

## 🚢 Deployment

### Deploy to Lovable (current)
1. Push changes to GitHub
2. Lovable auto-deploys from the `main` branch
3. **Live URL:** [financial-trust-shield.lovable.app](https://financial-trust-shield.lovable.app)

### Deploy to Vercel (alternative)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy via GitHub integration:
# 1. Go to vercel.com
# 2. Import your GitHub repository
# 3. Configure environment variables
# 4. Deploy
```

### Deploy to Netlify (alternative)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## 🧪 Testing

### Run tests
```bash
# Unit tests
npm test

# E2E tests (if configured)
npm run test:e2e
```

### Manual testing checklist
- [ ] Scan page: URL analysis works
- [ ] Scan page: text analysis works
- [ ] Scan page: image upload works
- [ ] Scan page: results display correctly
- [ ] Scan page: Generate Harm Report navigation
- [ ] Report page: form submission works
- [ ] Report page: copy button works
- [ ] Dashboard: stats load correctly
- [ ] Dashboard: charts render
- [ ] Dashboard: recent cases table
- [ ] Responsive: mobile view works
- [ ] Accessibility: color contrast is acceptable

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Code style:**
- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use Tailwind CSS for styling
- Keep components small and focused

---

## 📝 Acknowledgments

### Built with Lovable
This project was built with [Lovable](https://lovable.dev) — the AI-powered development platform that lets you build apps by describing them.

- **Ship faster** — describe what you want to build and Lovable handles the code
- **Stay in sync** — every change made in Lovable is committed straight to GitHub
- **Full ownership** — this code is yours; push to `main` on GitHub and your changes sync back into Lovable

### Third-party libraries
- **TanStack Router** — file-based routing
- **shadcn/ui** — beautiful, accessible components
- **Recharts** — charts and visualizations
- **Lucide Icons** — clean, consistent icons
- **Tailwind CSS** — utility-first styling

---

## 📞 Contact

- **GitHub:** [divyaypr13-dev](https://github.com/divyaypr13-dev)
- **Project:** [FinancialTrustShield](https://github.com/divyaypr13-dev/FinancialTrustShield)
- **Live App:** [financial-trust-shield.lovable.app](https://financial-trust-shield.lovable.app)

<div align="center">

Made with ❤️ for the SEBI Investor Shield Hackathon

</div>
