import os
# Configure system environment variables to limit native OpenBLAS / MKL / OMP thread pools.
# On multi-core cloud host processors (like Render's cluster), numpy/scipy's BLAS backends default
# to spawning one thread per CPU core (e.g. 32-64 threads on the host), consuming over 250MB of stack
# memory alone. Limiting to 1 thread completely prevents this overhead and ensures the process stays below 512MB.
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

from fastapi import FastAPI
from app.api.routes.health import router as health_router
from app.api.routes.analyze import router as analyze_router

app = FastAPI(
    title="MusicSense ML Service",
    version="1.0.0",
    description="AI processing and audio feature extraction service for MusicSense: An AI-powered Music Intelligence Platform"
)

# Register routes cleanly (not putting route logic inside main.py)
app.include_router(health_router)
app.include_router(analyze_router)

@app.get("/", tags=["system"])
def read_root() -> dict[str, str]:
    """Service status information endpoint."""
    return {
        "service": "MusicSense ML Service",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    
    # Run server using configuration variables
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
