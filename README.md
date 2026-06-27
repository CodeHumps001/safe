# 🛡️ SAFEROUTE GHANA
### Real-Time, Community-Powered Road Safety & AI Pavement Intelligence
---

```
   _____        __      ____             _          _____ _                      
  / ____|      / _|    |  _ \           | |        / ____| |                     
 | (___   __ _| |_ ___ | |_) | ___  _   _| |_ ___ | |  __| |__   __ _ _ __   __ _ 
  \___ \ / _` |  _/ _ \|  _ < / _ \| | | | __/ _ \| | |_ | '_ \ / _` | '_ \ / _` |
  ____) | (_| | ||  __/| |_) | (_) | |_| | ||  __/| |__| | | | | (_| | | | | (_| |
 |_____/ \__,_|_| \___||____/ \___/ \__,_|\__\___| \_____|_| |_|\__,_|_| |_|\__,_|
```

## 🏆 Pitch Summary & Competitive Edge
Ghana loses an estimated **GHS 2.5 billion** annually to road crashes, with over **2,000+ tragic fatalities** recorded yearly. Potholes, sudden seasonal floods, broken traffic lights, and unlit streets represent critical, unmonitored hazards. 

**SafeRoute Ghana** transforms this challenge by creating a high-fidelity, real-time civic intelligence net. By aligning citizen reports with **Google Gemini AI Vision**, we turn raw user uploads into authoritative, categorized, and graded safety advisories. It features a fully interactive dark map, alternate route scoring indices, civic gamification, and District Gazette weekly digests.

---

## 🎨 Visual Identity & Ghana National Brand
Our design language is inspired by the **Ghanaian Flag**:
*   **Ghana Green (#00A651)**: Safe Routes, Civic Contributions, and Active Alerts.
*   **Ghana Gold (#FCD116)**: Community Verification, Levels, and Reputational Trophies.
*   **Ghana Red (#CE1126)**: Danger Alerts, Critical Flood Warning Markers, and Obstructions.

All is framed on an ultra-modern, high-contrast dark space with glassmorphic indicators, leveraging **Plus Jakarta Sans** for display headings and **Inter** for dense legibility.

---

## 🚀 Advanced Google Gemini AI Features (No Mocks!)
SafeRoute Ghana features a full-stack Node + Express + Vite proxy to communicate securely with Google's modern **Gemini 2.5 API**, implementing 4 key intelligence services:

1.  **AI Photo Analysis (Computer Vision)**: When a commuter uploads a photo of a road hazard, the model inspects the pavement stress index, auto-categorizes the hazard type (e.g. pothole vs. flood), determines severity levels, and writes actionable safety precautions.
2.  **AI Route Safety Scorer**: Inputting a start and end destination (e.g., Legon to Osu) triggers the routing inspector to compile all nearby active community reports and output a single route safety grade (**A to F**) with a glowing map polyline.
3.  **AI Smart Description Builder**: Converts brief commuter keywords (e.g., "huge water circle gate") into authoritative warning notifications with a single tap.
4.  **AI Weekly District Safety Digests**: Synthesizes weekly database updates for metropolitan assemblies into readable Gazette newsletters showing regional risk trends.

---

## 🛠️ Stack Configuration
*   **Frontend**: React (v19) + TypeScript + Tailwind CSS (v4)
*   **Interactive Maps**: Vanilla Leaflet inside standard React `useRef` rendering **CartoDB Dark Matter tiles**
*   **Icons**: Lucide React
*   **Backend**: Node.js + Express
*   **AI Integration**: Google GenAI TypeScript SDK (`@google/genai`) and Gemini 2.5 models

---

## ⚙️ Local Developer Setup

### 1. Configure Environment Variables
Create a `.env` file at the root directory and add your Google AI Studio API Key:
```env
# Root /.env
GEMINI_API_KEY="YOUR_ACTUAL_GOOGLE_AI_STUDIO_KEY"
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Full-Stack Dev Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` inside your browser to inspect the live interface.

### 4. Build and Compile for Production
```bash
npm run build
```
This bundles the static assets and compiles the backend server into a single self-contained CommonJS file under `dist/server.cjs` for immediate deployment.

---

## 🎮 Civic Gamification XP Tier Levels
To incentivize continuous citizenship, SafeRoute Ghana implements a points reward matrix:
*   **🥉 Bronze (0–99 XP)** — "Road Watcher"
*   **🥈 Silver (100–499 XP)** — "Safety Scout"
*   **🥇 Gold (500–999 XP)** — "Road Guardian"
*   **💎 Platinum (1000+ XP)** — "SafeRoute Champion"

*Points are awarded dynamically (+10 XP per submission) and synchronized instantly with a district-wide leaderboard.*

---
**SafeRoute Ghana — Safeguarding Journeys, One Community Report at a Time.**
