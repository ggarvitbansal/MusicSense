# ADR-0001: Local File Storage Strategy for Audio Files

## Status
Accepted

## Context
MusicSense requires a storage strategy for uploaded audio files (`.mp3`, `.wav`, `.flac`) that will be processed by the machine learning/audio feature extraction pipelines. The platform needs to maintain references to these files, track file metadata, and link them to users and analysis records.

We considered two primary architectures for storing files:
1. **Cloud Object Storage (e.g. AWS S3, Google Cloud Storage)**
2. **Local File Storage (in `server/uploads/`)**

## Options Considered

- **Option A: Cloud Object Storage**: Upload files directly to S3/GCS from the client or stream them via the server.
- **Option B: Local File Storage**: Save files directly to the server's local file system in a designated `uploads/` folder.

## Decision
We chose **Option B: Local File Storage** for the initial MVP development phase.

## Consequences & Rationale

### Why Local Storage Was Chosen (Option B)
- **Zero Configuration & Infrastructure Overhead**: No cloud keys, IAM policies, bucket setups, or billing concerns are required to spin up the local development environment.
- **Speed & Latency**: Large audio files up to 50MB copy almost instantly to the local disk, speeding up iterative development and processing loops.

### Why Metadata is Stored in PostgreSQL
- **Query Performance & Relations**: Storing file paths, file sizes, mime types, and original names in PostgreSQL allows for fast queries, simple relational mapping (e.g. associating music files to users and analysis records), and enforcing database-level integrity (such as cascading deletes).
- **Separation of Concerns**: The file system handles byte storage, while the database manages structured data relationships.

### Future Migration Strategy to Cloud Storage
Because the database schema cleanly isolates the physical file location into two attributes:
- `storedName`: Unique identifier for the file (UUID-prefix).
- `storagePath`: Logical file locator (e.g. `uploads/filename.mp3`).

When transitioning to a cloud object store (e.g. AWS S3), the backend code can switch the file storage service provider without altering the database schema:
1. Update `storagePath` to reference the S3 bucket key or URI (e.g. `s3://musicsense-bucket/filename.mp3`).
2. Replace the local disk write helper with a cloud bucket upload adapter (using standard SDKs).
3. Database relationships (User $\rightarrow$ MusicFile $\rightarrow$ AudioAnalysis) remain entirely unchanged.
