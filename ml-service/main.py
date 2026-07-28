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
