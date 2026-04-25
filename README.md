# TrackGuard - Crime Records & Criminal Tracking System

A full-stack web application for managing crime records, FIRs, court cases, and criminal identification using facial recognition.

## Tech Stack

- **Frontend**: React 18 with custom dark theme
- **Backend**: Django 5 + Django REST Framework
- **Database**: PostgreSQL (Supabase hosted)
- **Storage**: Supabase Storage (criminal face images)
- **Face Recognition**: DeepFace with ArcFace model
- **Auth**: JWT (SimpleJWT)

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- Git

### Setup

```bash
git clone <repo-url>
cd crcts
python auto_setup.py
```

This will:
1. Check Python and Node.js versions
2. Create a Python virtual environment
3. Install all backend dependencies (Django, DRF, DeepFace, Supabase, etc.)
4. Install all frontend dependencies (React, Axios, etc.)
5. Run Django migrations
6. Create template .env files if missing

### Environment Variables

**Backend** (`crcts/.env`):
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_BUCKET=criminal-faces
```

**Frontend** (`crcts-frontend/.env`):
```
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

### Running

```bash
python start_project.py
```

This launches both backend (port 8000) and frontend (port 3000) in separate terminals.

### Default Login

| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Police  | police1  | police123  |
| Court   | court1   | court123   |

## Project Structure

```
crcts/
├── crimeapp/             # Django app (models, views, serializers)
│   ├── models.py         # Criminal, FIR, Court, CaseRecord, etc.
│   ├── views.py          # REST API viewsets + role permissions
│   ├── face_views.py     # Face recognition endpoints
│   ├── serializers.py    # DRF serializers
│   └── supabase_storage.py
├── crcts_proj/           # Django project settings
├── crcts-frontend/       # React frontend
│   └── src/
│       ├── pages/        # Login, Dashboard, Criminal, FIR, etc.
│       ├── services/     # API service layer
│       ├── context/      # Auth context
│       ├── components/   # Layout, ProtectedRoute
│       └── styles/       # Dark theme, global CSS
├── auto_setup.py         # One-command project setup
├── start_project.py      # Launch both servers
└── requirements.txt      # Python dependencies
```

## Role-Based Access

| Feature          | Admin | Police | Court |
|-----------------|-------|--------|-------|
| Manage Criminals | Full  | Full   | View  |
| Manage FIRs      | Full  | Full   | View  |
| Manage Cases     | Full  | View   | Full  |
| Manage Courts    | Full  | View   | View  |
| Face Search      | Yes   | Yes    | No    |
| Police Stations  | Full  | View   | No    |

## Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Connect repo to Render or Railway
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn crcts_proj.wsgi:application`
5. Add environment variables (DATABASE_URL, SUPABASE keys)
6. Add `gunicorn` to requirements.txt for production

### Frontend (Vercel / Netlify)

1. Connect `crcts-frontend` folder to Vercel/Netlify
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Set env variable: `REACT_APP_API_BASE_URL=https://your-backend-url.com/api`
