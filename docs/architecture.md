# MusicSense Architecture

## Vision

MusicSense is an AI-powered music intelligence platform that transforms a user's local music library into meaningful insights using machine learning, audio signal processing, and modern web technologies.

The goal is to build a production-quality full-stack application with clean architecture, modular services, and an excellent user experience.

---

# High-Level Architecture

```
                   React Frontend
                          │
                    Axios API Client
                          │
                   Express REST API
                    /            \
             PostgreSQL        ML Service
                                │
                    Audio Processing
                    Feature Extraction
                    AI Inference
```

---

# Repository Structure

```
MusicSense/

client/
server/
ml-service/

shared/
docs/
docker/
assets/
scripts/
```

---

# Frontend

Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios

Responsibilities

- User Interface
- Authentication
- Dashboard
- File Upload
- Data Visualization

---

# Backend

Technology Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

Responsibilities

- Authentication
- REST APIs
- Business Logic
- Database Access
- Music Processing Pipeline Coordination

---

# ML Service

Technology Stack

- Python
- TensorFlow
- Librosa

Responsibilities

- Audio Feature Extraction
- Genre Prediction
- Mood Prediction
- Similarity Analysis
- Music DNA Generation

---

# Engineering Principles

- Modular architecture
- Separation of concerns
- Reusable components
- API-first development
- Mobile-first responsive UI
- Type safety
- Scalability over shortcuts

---

# Development Workflow

Every feature follows the same lifecycle.

Requirement

↓

Design

↓

Database

↓

API

↓

Backend

↓

Frontend

↓

Testing

↓

Git Commit

---

# Current Development Phase

✅ Foundation

- React
- Express
- TypeScript
- Tailwind
- shadcn/ui
- React Router
- Axios

⬜ Landing Page

⬜ PostgreSQL

⬜ Prisma

⬜ Authentication

⬜ Upload Pipeline

⬜ AI Processing

⬜ Dashboard