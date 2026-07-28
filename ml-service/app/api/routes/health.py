from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["system"])
def get_health() -> dict[str, str]:
    """Health check endpoint to verify service operation."""
    return {"status": "healthy"}
