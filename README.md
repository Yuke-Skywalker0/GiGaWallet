# Finora

Finora è un'app full-stack per la gestione delle finanze personali.

## Stack
- Frontend: HTML, CSS, JavaScript vanilla
- Backend: Python + FastAPI
- Database: MongoDB Atlas
- Login: Google Identity Services
- Sessione API: JWT HttpOnly cookie
- Cifratura dati finanziari: Fernet/AES (chiave server)
- PWA: manifest + service worker
- Frontend deploy: GitHub Pages
- Backend deploy: qualsiasi host Python ASGI (Render/Koyeb/Railway/VPS)

> Nota Cloudflare: GitHub Pages può stare dietro Cloudflare/DNS. Il backend FastAPI richiede un runtime Python ASGI; non è un Cloudflare Worker standard.

## Avvio backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
# oppure: cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Compila `.env` con MongoDB, Google Client ID e chiavi.

Genera le chiavi:

```bash
python generate_keys.py
```

## Avvio frontend

Apri `frontend/js/config.js` e imposta:
- `API_BASE_URL`
- `GOOGLE_CLIENT_ID`

Poi servi la cartella con un server statico:

```bash
cd frontend
python -m http.server 5500
```

Apri `http://localhost:5500`.

## GitHub Pages

Pubblica **il contenuto della cartella `frontend/`** come root del sito GitHub Pages.

## Sicurezza

- Il browser non contiene segreti.
- Il Google ID token viene verificato dal backend.
- Il backend emette un cookie JWT HttpOnly.
- Ogni query finanziaria è legata all'utente autenticato.
- Importo, categoria, descrizione, data e tipo sono cifrati prima di MongoDB.
- Le chiavi non devono mai essere committate.
- `.env` è escluso da Git.
- CORS è limitato agli origin configurati.

Per produzione usa esclusivamente HTTPS.
