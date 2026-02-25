# KuralAI - Voice-Enabled Grievance Redressal System

## Overview
KuralAI is a voice-first, AI-powered citizen grievance redressal system. Built as a student project, it empowers citizens in rural and urban areas to file complaints (like water shortages, broken roads, or electricity issues) using their native language via voice or text. The system automatically categorizes the complaint, assigns a priority level, and routes it to the appropriate administrative dashboard for resolution.

## Problem Statement
Filing official complaints often requires navigating complex forms, understanding administrative hierarchies, and typing in English or formal local languages. For many citizens, especially in rural areas, this is a barrier. Administrators also face challenges in manually sorting, prioritizing, and assigning hundreds of complaints daily.

KuralAI solves this by providing a simple, voice-first interface that understands multiple languages and an intelligent AI backend that automates categorization and prioritization.

## Solution Architecture
The system is divided into two main components:
1. **Frontend (Citizen & Admin Portals):** A progressive web app built with React, Vite, and Tailwind CSS. It handles voice capture, multilingual UI, user authentication, and presents analytical dashboards for administrators.
2. **Backend (API & AI Layer):** A Node.js/Express server backed by MongoDB. It manages REST APIs, JWT authentication, background cron jobs for escalation, and runs an embedded, local AI model to process text semantically.

## How the AI Model Works
KuralAI uses cutting-edge, local embedding-based classification right inside the Node.js backend, rather than relying on expensive external LLM APIs for categorizing every complaint.

1. **Precomputed Seed Embeddings:** On server startup, the system generates high-dimensional vector embeddings for predefined categories (e.g., "Water Supply", "Electricity", "Roads") using the `@xenova/transformers` library running locally.
2. **Real-time Semantic Matching:** When a complaint is filed, the transcribed text is converted into an embedding. The system calculates the **Cosine Similarity** between the complaint embedding and the category seed embeddings.
3. **Explainable AI Similarity Breakdown:** The system doesn't just pick the top category; it generates a `similarityBreakdown` map showing confidence scores across all categories.
4. **Automated Priority Routing:** Based on the highest similarity score, the system dynamically assigns a severity/priority level (`High`, `Medium`, or `Low`).

## Multilingual Support
KuralAI is built from the ground up to support linguistic diversity without relying on translation chokepoints.
- **Languages Supported:** English, Tamil, and Hindi.
- **Multilingual Voice Input:** Utilizing the browser's native `SpeechRecognition` API, the system dynamically switches the recording language (e.g., `ta-IN` for Tamil) based on the user's UI preference, transcribing their speech verbatim.
- **Cross-Lingual AI:** The backend utilizes the `Xenova/paraphrase-multilingual-MiniLM-L12-v2` model. This model intrinsically understands semantic meaning across languages. A complaint spoken in Tamil is embedded natively and accurately matched against the system categories without needing translation to English first.
- **Dynamic UI:** Complete frontend internationalization using `react-i18next`.

## Feature List
- **Voice-to-Text Complaints:** Speak natively into the microphone to write complaints.
- **Multilingual AI Categorization:** Automatically categorize issues in English, Tamil, and Hindi.
- **Explainable AI (XAI):** Transparent confidence scores for category matching.
- **Automated Priority Assignment:** Critical issues get flagged as High Priority automatically.
- **Admin Dashboard:** Real-time analytics, filtering, and status management (Accept, Reject, Resolve).
- **Auto-Escalation Cron Job:** A background `node-cron` job automatically flags complaints that remain unresolved for over 48 hours as `Escalated`.
- **Location Capture:** Stores GPS coordinates and addressed attached to the complaints.
- **Timeline Tracking:** Citizens can track the lifecycle of their complaints from Submission to Resolution.

## Tech Stack
**Frontend:**
* React (TypeScript) + Vite
* Tailwind CSS
* Lucide React (Icons)
* `react-i18next` (Internationalization)
* Axios (API Client)

**Backend:**
* Node.js + Express.js
* MongoDB + Mongoose
* JSON Web Tokens (JWT) & bcryptjs (Authentication)
* `@xenova/transformers` (Local AI Embeddings via ONNX Runtime)
* `node-cron` (Task Scheduling)

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the project root (frontend directory):
   ```bash
   npm install
   ```
2. Set up environment variables (see below).
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment
The system is structured to be easily deployed on platforms like Render or Heroku.
- The **Backend** should run as a Node/Express Web Service. Make sure to allocate sufficient RAM as running the Transformer model locally requires memory.
- The **Frontend** can be built using `npm run build` and served as static files (or hosted on Netlify/Vercel).

## Future Improvements
- Direct integration with WhatsApp APIs for filing complaints via chat.
- Twilio integration for IVR (Interactive Voice Response) phone calls.
- Deeper escalation matrices integrating multiple administrative tiers.

## Author
Yuvedাস்ரி 
*(Student Project)*
