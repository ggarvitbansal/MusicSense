# ADR-0003: File Upload Foundation Strategy

## Status
Accepted

## Context
MusicSense needs a way to handle incoming audio files uploaded by users. The system must intercept these files securely, store them locally for the MVP, run format/size validations, restrict accesses to the owners only, and sync metadata records to PostgreSQL.

We considered two primary upload interceptors:
1. **Multer (Disk Storage & custom Stream buffers)**
2. **Formidable**
3. **Busboy**

## Options Considered

- **Option A: Multer (Disk Storage)**: Stream files directly to local storage using custom storage engines.
- **Option B: Express-Fileupload**: Simple middleware that loads files in-memory before writing them to disk.
- **Option C: Custom Stream Parsing**: Direct chunk-by-chunk stream parsing.

## Decision
We chose **Option A: Multer (Disk Storage)** for the File Upload Foundation.

## Consequences & Rationale

### Why Multer was Selected (Option A)
- **Automatic Streaming**: Streams incoming chunks directly to the disk directory instead of buffering files in-memory first. This prevents memory leaks and heap exhaustion when multiple users upload large audio files simultaneously (up to 25 MB each).
- **Custom Filters**: Provides standard Hooks (`fileFilter`, `limits.fileSize`) to reject unsupported extensions, illegal mime-types, and oversize uploads *before* the file is fully written to the filesystem.
- **Node-ecosystem Standard**: Industry standard middleware for Express with high compatibility and type-safe integration.

### File Security & Name Obfuscation
- **UUID Renaming**: Storing files with their original names (e.g. `my_song.mp3`) is insecure as it exposes user file naming structures and risks path traversal attacks or duplicate name overwrites. We hash and rename every uploaded file to a cryptographically secure UUID name (e.g. `550e8400-e29b-41d4-a716-446655440000.mp3`).
- **Owner Isolation**: Users are prevented from reading or deleting other users' uploads. Ownership check checks are run at the `UploadService` layer using User IDs extracted from JWT tokens, returning `403 Forbidden` if unauthorized.

### Double-Check Validations
- Mime-types and file extensions are verified during the Multer interceptor phase. 
- Additionally, files are double-checked for zero-byte size at the middleware level before passing requests to route handlers.
