# MusicSense

MusicSense is a full-stack music intelligence platform for uploading audio tracks,
extracting digital-signal-processing (DSP) features, generating a human-readable
Music DNA profile, and exploring related tracks.

The repository is organized as three independently runnable services:

```text
Browser
  |
  v
React/Vite client  --->  Express/TypeScript API  --->  PostgreSQL
                              |
                              v
                       FastAPI ML/DSP service
                              |
                              v
                    Local temporary audio processing
```

The API owns authentication, authorization, file persistence, database access,
analysis orchestration, statistics, and recommendations. The ML service owns
audio decoding, feature extraction, and Music DNA compilation. The client is a
single-page React application that consumes the API and presents the results.

## Contents

- [Capabilities](#capabilities)
- [Technology stack](#technology-stack)
- [Repository layout](#repository-layout)
- [System architecture](#system-architecture)
- [End-to-end flows](#end-to-end-flows)
- [Data model](#data-model)
- [API reference](#api-reference)
- [ML and DSP pipeline](#ml-and-dsp-pipeline)
- [Frontend application](#frontend-application)
- [Configuration](#configuration)
- [Local development](#local-development)
- [Build and deployment](#build-and-deployment)
- [Operational behavior and limitations](#operational-behavior-and-limitations)
- [Troubleshooting](#troubleshooting)

## Capabilities

- Register and authenticate users with JWTs.
- Upload one audio track at a time.
- Validate extension, MIME type, emptiness, and a 25 MB size limit.
- Persist uploaded files in the API server's `uploads/` directory.
- Analyze MP3, WAV, FLAC, OGG, and M4A audio.
- Extract tempo, spectral, timbral, harmonic, rhythm, and energy features.
- Convert extracted features into eight normalized Music DNA dimensions.
- Browse uploads and completed analyses.
- Play uploaded tracks through authenticated dashboard views.
- View aggregate dashboard statistics and tempo buckets.
- Find up to five tracks with similar Music DNA values.
- Manage theme, notifications, and the currently supported model setting.

## Technology stack

### Client

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS v4
- Lucide React icons
- shadcn/base UI packages

### API server

- Node.js with TypeScript and native ES modules
- Express 5
- Prisma 7 with PostgreSQL
- `pg` and `@prisma/adapter-pg`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcrypt`
- Multipart uploads with Multer
- Request validation with Zod
- CORS and dotenv

### ML service

- Python
- FastAPI and Uvicorn
- librosa and SoundFile for audio/DSP processing
- NumPy
- python-multipart for file uploads
- psutil for memory instrumentation
- python-dotenv

### Infrastructure

- PostgreSQL 16 Alpine through Docker Compose
- Local filesystem storage for audio files
- Prisma migrations in `server/prisma/migrations`

## Repository layout

```text
.
├── client/                 React/Vite single-page application
│   └── src/
│       ├── components/     Layout, dashboard, landing, and UI components
│       ├── context/        Global playback context
│       ├── pages/          Home, auth, dashboard, upload, analysis, settings
│       └── services/       Axios API client
├── server/                 Express API and persistence layer
│   ├── prisma/             Prisma schema, migrations, and seed configuration
│   └── src/
│       ├── controllers/    HTTP request/response orchestration
│       ├── middlewares/    JWT, Multer, and validation middleware
│       ├── repositories/   Prisma data-access helpers
│       ├── routes/         Route declarations
│       ├── services/       Business logic and ML orchestration
│       ├── utils/          JWT, password, and file helpers
│       └── validators/     Zod request schemas
├── ml-service/             FastAPI audio-analysis service
│   ├── app/api/routes/     Health and analysis endpoints
│   ├── app/core/           Environment configuration
│   └── app/services/       Feature extractors and Music DNA compiler
├── docker-compose.yml      Local PostgreSQL service
├── docs/                   Project documentation assets
├── assets/                 Shared/static project assets
├── shared/                 Shared project resources
└── scripts/                Utility scripts
```

Important entry points:

| Component | Entry point | Purpose |
| --- | --- | --- |
| Client | `client/src/main.tsx` | Mounts the React application |
| Client router | `client/src/App.tsx` | Declares public and dashboard routes |
| API runtime | `server/src/server.ts` | Loads Express app and listens on `PORT` |
| API composition | `server/src/app.ts` | Middleware, routes, static files, errors |
| Database | `server/src/db.ts` | Creates the Prisma PostgreSQL client |
| ML runtime | `ml-service/main.py` | Creates the FastAPI app and registers routes |
| ML analysis | `ml-service/app/api/routes/analyze.py` | Validates uploads and returns analysis |

## System architecture

```mermaid
flowchart LR
    U[User browser] --> C[React/Vite client]
    C -->|JWT JSON or multipart HTTP| A[Express API]
    A -->|Prisma| D[(PostgreSQL)]
    A -->|local path| F[(server/uploads)]
    A -->|multipart /analyze| M[FastAPI ML service]
    M --> T[(Temporary audio file)]
    M --> X[librosa + SoundFile DSP]
    X --> DNA[Music DNA compiler]
    DNA -->|JSON response| A
    A -->|metadata + DNA| D
    A -->|static audio URL| C
```

### Service responsibilities

#### React client

The client has public routes for the landing page, registration, and login. The
dashboard shell protects nested dashboard pages by checking the local JWT and
calling `/auth/me`. Axios reads `VITE_API_URL` and attaches the JWT from
`localStorage` to requests.

#### Express API

The API:

1. Accepts and validates requests.
2. Authenticates users with a bearer JWT.
3. Enforces ownership of uploads, analyses, and settings.
4. Saves uploaded audio to disk and records its path in PostgreSQL.
5. Calls the ML service using multipart form data.
6. Stores the ML response in the `Analysis` JSON fields.
7. Serves audio through `/uploads/files/:storedName`.
8. Computes user-specific statistics and recommendations.

#### FastAPI ML service

The ML service receives an upload, copies it to a secure temporary file, runs
the feature extractors, compiles Music DNA metrics, serializes a Pydantic
response, and removes the temporary file in a `finally` block. It does not
persist audio or analysis results.

#### PostgreSQL

PostgreSQL stores users, uploaded-file records, analysis JSON, and user settings.
Audio bytes are not stored in PostgreSQL; the database stores the local file
metadata and path.

## End-to-end flows

### Authentication flow

1. The client submits registration data to `POST /auth/register`.
2. The API validates name, email, and an eight-character minimum password.
3. The password is bcrypt-hashed before the `User` record is created.
4. The client submits credentials to `POST /auth/login`.
5. The API verifies the bcrypt hash and returns a JWT plus a password-free user.
6. The client stores the JWT in `localStorage`.
7. Protected requests send `Authorization: Bearer <token>`.
8. The API middleware verifies the token and places the user identity on
   `req.user`.

### Upload and asynchronous analysis flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as Express API
    participant P as PostgreSQL
    participant M as FastAPI ML

    B->>A: POST /uploads (multipart field: audio)
    A->>A: JWT, extension/MIME/size validation
    A->>A: Save file in server/uploads
    A->>P: Insert AudioFile(status=UPLOADED)
    A-->>B: 201 upload record and playback URL
    A->>P: Set status=PROCESSING
    A->>M: POST /analyze (uploadId + file)
    M->>M: Temporary file, DSP extraction, DNA compilation
    M-->>A: AnalysisResponse JSON
    A->>P: Insert Analysis JSON
    A->>P: Set status=COMPLETED
    B->>A: Poll /uploads and /analysis
    A-->>B: Completed analysis and Music DNA
```

The upload controller intentionally starts `analyzeUpload` without awaiting it,
so the upload response is returned quickly. The analysis page refreshes its
upload/analysis data while processing is in progress. A direct
`POST /uploads/:id/analyze` is also available for manual or retry-style
invocation.

### Failure behavior

- Invalid upload input returns HTTP 400.
- Missing or foreign resources return HTTP 404 or 403.
- If the ML request fails, the current API service logs the failure and creates
  a randomized mock analysis fallback so the UI can still display an analysis.
  This fallback is intended for resilience/demo behavior and must not be treated
  as production-quality inference.
- The ML service maps missing-file, invalid-value, and unexpected failures to
  HTTP 404, 400, and 500 respectively.
- Upload status includes `FAILED`, but the current orchestration path does not
  explicitly persist that status when analysis fails.

## Data model

The active upload flow uses `AudioFile` and `Analysis`. All primary keys and
foreign keys are UUIDs.

```mermaid
erDiagram
    USER ||--o{ AUDIO_FILE : owns
    USER ||--o{ ANALYSIS : owns
    USER ||--o| USER_SETTINGS : configures
    AUDIO_FILE ||--o| ANALYSIS : produces

    USER {
        uuid id PK
        string name
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }
    AUDIO_FILE {
        uuid id PK
        uuid userId FK
        string originalName
        string storedName
        string mimeType
        string extension
        int size
        string path
        enum status
        datetime createdAt
        datetime updatedAt
    }
    ANALYSIS {
        uuid id PK
        uuid audioFileId FK_UK
        uuid userId FK
        string filename
        json metadata
        json audioFeatures
        json musicDNA
        datetime createdAt
        datetime updatedAt
    }
    USER_SETTINGS {
        uuid id PK
        uuid userId FK_UK
        string theme
        boolean notifications
        enum preferredModel
        datetime createdAt
        datetime updatedAt
    }
```

### Active Prisma models

#### `User`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key, generated |
| `name` | String | Required |
| `email` | String | Required and unique |
| `passwordHash` | String | Bcrypt hash; never returned by auth responses |
| `createdAt`, `updatedAt` | DateTime | Managed timestamps |

Relations: one-to-many `audioFiles`, one-to-many `analyses`, optional
one-to-one `settings`. Deleting a user cascades to these dependent records.

#### `AudioFile`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `userId` | UUID | Owning user |
| `originalName` | String | Client-provided filename |
| `storedName` | String | Generated unique disk filename |
| `mimeType` | String | Validated upload MIME type |
| `extension` | String | Normalized extension |
| `size` | Int | File size in bytes |
| `path` | String | Local filesystem path |
| `status` | `UploadStatus` | Processing lifecycle |
| timestamps | DateTime | Managed timestamps |

`audioFileId` is unique in `Analysis`, giving each audio file at most one
analysis record.

#### `Analysis`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `audioFileId` | UUID | Unique link to `AudioFile` |
| `userId` | UUID | Owning user, used for authorization and queries |
| `filename` | String | Filename displayed in the UI |
| `metadata` | JSON | File and DSP metadata |
| `audioFeatures` | JSON | Additional extracted feature payload |
| `musicDNA` | JSON | Eight semantic scores |
| timestamps | DateTime | Managed timestamps |

#### `UserSettings`

`theme` defaults to `dark`, `notifications` defaults to `true`, and
`preferredModel` defaults to `TENSORFLOW`. The current enum contains only the
`TENSORFLOW` value.

### Enums

| Enum | Values |
| --- | --- |
| `UploadStatus` | `UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `ModelType` | `TENSORFLOW` |
| `MusicalMode` | `MAJOR`, `MINOR` |

### Legacy/alternate schema pair

The Prisma schema also contains `MusicFile` and `AudioAnalysis`, an older
one-to-one design with scalar fields such as `genre`, `tempo`, `energy`,
`danceability`, `valence`, `musicalKey`, `mode`, and `analysisVersion`.
The current routes and services use `AudioFile` + `Analysis`; the alternate
models remain in the Prisma schema for compatibility with existing migrations
or earlier work.

## API reference

The API has no global `/api` prefix. Unless stated otherwise, successful
responses use `{ "success": true, "data": ... }`. Errors use
`{ "success": false, "message": "..." }`.

### System and static files

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | API status message |
| `GET` | `/uploads/files/:storedName` | No | Serves a stored audio file |

### Authentication

| Method | Path | Body | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ name, email, password }` | No |
| `POST` | `/auth/login` | `{ email, password }` | No |
| `GET` | `/auth/me` | None | JWT |

Registration requires a non-empty name, a valid email, and a password of at
least eight characters. Login requires a valid email and non-empty password.

Example:

```bash
curl -X POST http://localhost:5000/auth/login `
  -H "Content-Type: application/json" `
  -d '{ "email": "user@example.com", "password": "password123" }'
```

### Uploads

Every upload route requires a JWT. `POST /uploads` expects a multipart field
named `audio`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/uploads` | Validate and store one audio file; starts background analysis |
| `GET` | `/uploads` | List the current user's uploads |
| `GET` | `/uploads/:id` | Get one owned upload |
| `DELETE` | `/uploads/:id` | Delete the database row and physical file |
| `POST` | `/uploads/:id/analyze` | Analyze an owned upload synchronously |

Accepted extensions are `.mp3`, `.wav`, `.flac`, `.ogg`, and `.m4a`. The server
also checks the MIME type and rejects files larger than 25 MB or with zero
bytes.

### Analyses

Every analysis route requires a JWT and only returns records owned by the
current user.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/analysis` | List completed analyses |
| `GET` | `/analysis/stats` | Aggregate DNA, tempo buckets, and latest tracks |
| `GET` | `/analysis/:id` | Get one analysis |
| `GET` | `/analysis/:id/recommendations` | Return up to five similar analyses |
| `DELETE` | `/analysis/:id` | Delete one analysis |

Recommendations use a Manhattan-style distance over four Music DNA dimensions:
`energy`, `danceability`, `brightness`, and `rhythm`. They are limited to the
same user and exclude the target file.

### Settings

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/settings` | None | Read or lazily create defaults |
| `PUT` | `/settings` | `theme`, `notifications`, `preferredModel` | Update settings |

### ML service

The ML service is normally called internally by the API.

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/` | None | Service/version/status |
| `GET` | `/health` | None | Health response |
| `POST` | `/analyze` | Multipart `uploadId`, `file` | Return DSP metadata and Music DNA |

The analysis response shape is:

```json
{
  "success": true,
  "metadata": {
    "duration": 180.2,
    "sampleRate": 44100,
    "channels": 2,
    "tempo": 124.0,
    "bpm": 124.0,
    "rms": [],
    "zero_crossing_rate": [],
    "spectral_centroid": [],
    "spectral_bandwidth": [],
    "rolloff": [],
    "mfcc": [],
    "chroma": [],
    "spectral_contrast": [],
    "harmonic_energy": 0.7,
    "percussive_energy": 0.2,
    "silence_ratio": 0.03
  },
  "musicDNA": {
    "energy": 72,
    "brightness": 65,
    "rhythm": 78,
    "harmonicRichness": 59,
    "danceability": 74,
    "acousticness": 31,
    "complexity": 68,
    "silence": 3
  }
}
```

## ML and DSP pipeline

The FastAPI route constructs a `FeatureExtractor` and `MusicDNAService` per
request. Feature extraction is split into specialized extractors for metadata,
rhythm, spectral properties, timbre, and harmonic information.

The `AudioMetadata` contract includes:

- Duration, sample rate, and channel count.
- Tempo/BPM.
- RMS energy envelope.
- Zero-crossing-rate envelope.
- Spectral centroid, bandwidth, and rolloff.
- Mean MFCC vector.
- Mean chroma vector.
- Mean spectral contrast.
- Harmonic and percussive energy ratios.
- Silence ratio.

The `MusicDNA` contract maps the extracted values to eight human-readable
0-100 scores:

| Dimension | Meaning |
| --- | --- |
| `energy` | Intensity and activity |
| `brightness` | Timbral brightness/high-frequency presence |
| `rhythm` | Rhythmic energy and tempo strength |
| `harmonicRichness` | Chroma and harmonic density |
| `danceability` | Pulse clarity and rhythmic stability |
| `acousticness` | Acoustic versus electronic character |
| `complexity` | Spectral variance and bandwidth spread |
| `silence` | Low-energy/silent frame percentage |

The API combines the returned metadata and feature payload when presenting an
analysis to the client. It stores `metadata`, `audioFeatures`, and `musicDNA`
as separate JSON columns so the persistence model can evolve without a schema
migration for every new DSP feature.

## Frontend application

Client routes:

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Home` | Landing page |
| `/login` | `Login` | Sign in |
| `/register` | `Register` | Create an account |
| `/dashboard` | `Dashboard` | Aggregate overview |
| `/dashboard/upload` | `Upload` | Select and upload one track |
| `/dashboard/analysis` | `Analysis` | Library, results, playback, recommendations |
| `/dashboard/settings` | `Settings` | User preferences |

`DashboardLayout` supplies the authenticated shell, navigation, and audio
player. `PlaybackProvider` keeps playback state available across pages.

The upload page displays progress using Axios upload events. Once the API
returns a successful upload, it redirects to the analysis page. The analysis
page refreshes the upload and analysis lists and polls while files remain in
the `PROCESSING` state.

## Configuration

Create local environment files from the examples. Do not commit secrets.

### Server: `server/.env`

```dotenv
DATABASE_URL=postgresql://postgres:password@localhost:5432/musicsense
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=5000
ML_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

| Variable | Default/requirement | Used for |
| --- | --- | --- |
| `DATABASE_URL` | Required by Prisma | PostgreSQL connection |
| `JWT_SECRET` | Required in production | JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `PORT` | `5000` | API listener |
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | ML service base URL |
| `NODE_ENV` | Optional | Runtime behavior |

### Client: `client/.env`

```dotenv
VITE_API_URL=http://localhost:5000
```

### ML service: `ml-service/.env`

```dotenv
HOST=127.0.0.1
PORT=8000
LOG_LEVEL=info
LIGHTWEIGHT_MODE=True
```

`LIGHTWEIGHT_MODE` controls the lower-resource extraction path. The ML entry
point also limits native BLAS/OMP thread pools to one thread to reduce memory
pressure on constrained hosts.

### Docker database defaults

`docker-compose.yml` starts PostgreSQL 16 Alpine with:

```text
host:     localhost
port:     5432
database: musicsense
user:     postgres
password: password
volume:   postgres_data
```

Use a different password and connection string outside local development.

## Local development

### Prerequisites

- Node.js and npm
- Python 3 with `venv`
- Docker Desktop (recommended for PostgreSQL)
- A PostgreSQL-compatible database if Docker is not used

### 1. Start PostgreSQL

From the repository root:

```powershell
docker compose up -d postgres
```

### 2. Configure the API

```powershell
Copy-Item server\.env.example server\.env
# Edit server\.env and set DATABASE_URL and JWT_SECRET.
```

Install dependencies, generate Prisma Client, apply migrations, and start the
development server:

```powershell
Set-Location server
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The API listens at `http://localhost:5000`.

### 3. Configure and start the ML service

```powershell
Set-Location ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

The ML service listens at `http://127.0.0.1:8000`. Verify it with:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

### 4. Configure and start the client

```powershell
Set-Location client
npm install
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.
If `client/.env.example` is not present in a checkout, create `client/.env`
with `VITE_API_URL=http://localhost:5000`.

### Run all three services

Use three terminals:

```text
Terminal 1: docker compose up -d postgres
Terminal 2: cd server; npm run dev
Terminal 3: cd ml-service; uvicorn main:app --reload
Terminal 4: cd client; npm run dev
```

## Build and deployment

### Client

```powershell
Set-Location client
npm run build
npm run preview
```

The production build is emitted to `client/dist`.

### Server

```powershell
Set-Location server
npm run build
npm start
```

The TypeScript build is emitted to `server/dist`.

### Database migrations

For a deployed database, set `DATABASE_URL` and run:

```powershell
Set-Location server
npx prisma migrate deploy
npx prisma generate
```

Do not use destructive reset commands against a shared or production database.

### Deployment considerations

The current repository is designed around a separately deployed API and ML
service, plus a PostgreSQL database. If the API and ML service are deployed on
different hosts:

1. Set `ML_SERVICE_URL` to the reachable ML base URL.
2. Ensure the ML service accepts the API host's network traffic.
3. Ensure persistent storage is mounted for `server/uploads`.
4. Configure a stable public API URL as `VITE_API_URL`.
5. Configure a strong `JWT_SECRET`.
6. Put TLS, authentication policy, rate limiting, and upload scanning in front
   of public deployments.

The included Compose file provisions PostgreSQL only; it does not build or
orchestrate the client, API, or ML service containers.

## Operational behavior and limitations

- Audio is stored on the API server's local filesystem, not object storage.
- Static audio URLs are generated from the incoming request host and forwarded
  protocol, so reverse-proxy headers must be configured correctly.
- Upload analysis is fire-and-forget from the upload HTTP request. A process
  restart can interrupt in-flight work.
- The API currently falls back to randomized mock data when the ML service is
  unavailable. This can produce a successful-looking result without real DSP
  analysis.
- The `FAILED` upload status exists in the schema but is not currently written
  by the analysis failure path.
- The ML service is synchronous per request and uses temporary disk space.
- No background job queue is present; concurrent analysis is handled by the
  application processes.
- No root-level package manifest or unified test runner is defined.
- The current package scripts provide lint/build/dev commands, but no automated
  test suite is declared in the client or server manifests.
- The Prisma schema contains the inactive `MusicFile`/`AudioAnalysis` model
  pair described above.
- The API enables CORS broadly through `cors()`; restrict origins before
  production deployment.
- Local storage cleanup and database retention are application responsibilities.

## Troubleshooting

### API cannot connect to PostgreSQL

1. Confirm Docker is running:

   ```powershell
   docker compose ps
   ```

2. Confirm `DATABASE_URL` matches the Compose credentials.
3. Re-run `npx prisma generate` and `npx prisma migrate deploy` from `server`.

### Upload succeeds but analysis never completes

1. Check that the ML service is running on the URL in `ML_SERVICE_URL`.
2. Open `http://127.0.0.1:8000/health`.
3. Inspect API logs for ML request and response errors.
4. Confirm the uploaded file is readable and under 25 MB.
5. Check that `server/uploads` exists and is writable.

### Client redirects to login

1. Remove stale browser storage and sign in again.
2. Confirm `VITE_API_URL` points to the running API.
3. Confirm the API's JWT secret is stable while the client session is active.

### Browser cannot play an uploaded file

1. Confirm the API is serving `/uploads/files/:storedName`.
2. Confirm the generated URL uses the correct public host and protocol.
3. Check reverse-proxy forwarding of `Host` and `X-Forwarded-Proto`.
4. Confirm the local upload file still exists.

## Source references

For implementation details, start with:

- `client/src/App.tsx`
- `client/src/services/api.ts`
- `client/src/pages/Upload.tsx`
- `client/src/pages/Analysis.tsx`
- `server/src/app.ts`
- `server/src/routes/`
- `server/src/services/upload.service.ts`
- `server/src/services/analysis.service.ts`
- `server/src/middlewares/multer.middleware.ts`
- `server/prisma/schema.prisma`
- `ml-service/main.py`
- `ml-service/app/api/routes/analyze.py`
- `ml-service/app/services/feature_extractor.py`
- `ml-service/app/services/dna_service.py`
