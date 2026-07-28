import os
from dotenv import load_dotenv

# Load environment variables from local .env
load_dotenv()

def _parse_port() -> int:
    try:
        return int(os.getenv("PORT", "8000"))
    except ValueError:
        return 8000

class Settings:
    """System settings management module parsing environment parameters."""
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = _parse_port()
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

settings = Settings()
