# TrailSense

TrailSense is a semantic video search engine for mountain biking trails. Riders can describe the vibe they’re after (e.g. *“fast desert trail with berms”*), and the system returns relevant clips, difficulty ratings, and location data pulled from crowdsourced trail footage.

---

## Features

- Upload raw GoPro/trail footage and automatically index it  
- Natural language video search with timestamped results  
- Auto-generated difficulty ratings (0–10 scale)  
- Extracted terrain tags and GPS metadata  
- Conversational follow-ups powered by LLMs  
- Built for both discovery and contribution (community footage model)  

---

## Tech Stack

- **Frontend**: Node.js (React/Express)  
- **Backend**: Flask (Python API layer)  
- **AI APIs**: TwelveLabs (Marengo), Pegasus, Gemini  
- **Storage**: Object storage (S3-compatible)  

---

## Architecture Overview

1. **Ingestion** – Footage uploaded → object storage → webhook → `Marengo /videos`  
2. **Indexing** – Frame/scene embeddings generated → TwelveLabs webhook confirms ready state  
3. **Semantic Search** – User query embedded → cosine similarity returns clips + confidence  
4. **Summarization & Scoring** – Pegasus generates abstractive summary + difficulty score  
5. **Conversation** – Gemini stitches context into natural follow-up answers  

---

## Installation

### Prerequisites
- Node.js 18+  
- Python 3.10+  
- Docker (optional, for local services)  

### Setup

```bash
# Clone repo
git clone https://github.com/yourusername/trailsense.git
cd trailsense

# Frontend (Node.js)
cd frontend
npm install
npm run dev

# Backend (Flask)
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run
```

Set your API keys in .env.

---

## Usage:

Start the backend (flask run)
Start the frontend (npm run dev)
Upload a video or run a sample query
