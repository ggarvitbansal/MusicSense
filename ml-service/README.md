# MusicSense ML Service

The Python-based machine learning and digital signal processing (DSP) microservice for **MusicSense**: *An AI-powered Music Intelligence Platform*.

This service is independent and decoupled from the Express backend, communicating solely via HTTP REST APIs. It is responsible for audio decoding, feature extraction, genre/mood classification, and Music DNA/Genome vector generation.

---

## Project Structure

```
ml-service/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py        # GET /health health status
│   │       └── analyze.py       # POST /analyze audio analysis trigger
│   │
│   ├── core/
│   │   └── config.py            # Environment configuration settings
│   │
│   ├── services/
│   │   ├── audio_service.py     # Audio loading & Librosa feature extraction
│   │   └── dna_service.py       # Music DNA compiler
│   │
│   ├── models/                  # ML models package (placeholders)
│   ├── utils/                   # Shared utility package (placeholders)
│   └── __init__.py
│
├── main.py                      # FastAPI application entrypoint
├── requirements.txt             # Project dependencies list
├── .env.example                 # Configuration template
├── .gitignore                   # Ignore file for Git tracking
└── README.md                    # Onboarding and startup guide
```

---

## Setup Instructions

### 1. Create the Virtual Environment

Initialize a Python virtual environment to manage dependencies locally and prevent global pollution:

```bash
# From the root directory of the ML service (ml-service/)
python -m venv .venv
```

### 2. Activate the Virtual Environment

Activate the environment based on your operating system:

* **Windows (Command Prompt)**:
  ```cmd
  .venv\Scripts\activate.bat
  ```
* **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
* **Unix / macOS (bash/zsh)**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies

Install the required scientific, machine learning, and server packages listed in `requirements.txt`:

```bash
# Ensure your virtual environment is active before running this command
pip install -r requirements.txt
```

### 4. Run the Service

Start the FastAPI application in development mode with auto-reload enabled:

```bash
# Run from the ml-service/ folder
uvicorn main:app --reload
```

By default, the server will start on `http://127.0.0.1:8000`.

---

## API Documentation

FastAPI auto-generates interactive API documentations. Once the service is running, you can access these routes:

* **Swagger UI Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Alternatives**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
