# SIDDHARTH.OS

An experimental, interactive digital autobiography and "personal operating system" for **Siddharth Singla** (Computer Science student at Thapar Institute, AI/ML intern at Revino).

Features:
- Retro-futuristic OS aesthetic (`#07080A` void dark, `#22C55E` phosphor green, Syne & JetBrains Mono typography)
- Interactive boot sequence with synthesized Web Audio chimes and terminal commands
- Avatar scroll-driven particle disintegration canvas effect
- Bi-directional tech marquee, interactive constellation world map, and voice-guided navigation
- Interactive worlds: Build (8 system modules), Source (Open-Source PRs), Lab (8 prototypes), Play (football match metaphor), Mind (synapse skills), Timeline, and Future

---

## Getting Started

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start development server:
   ```bash
   npm start
   ```
   or
   ```bash
   npm run build
   ```

### Backend (Optional FastAPI status service)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start server:
   ```bash
   uvicorn server:app --reload --port 8000
   ```

