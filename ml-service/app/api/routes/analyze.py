from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Any
from app.services.feature_extractor import FeatureExtractor

router = APIRouter()

class AnalysisRequest(BaseModel):
    """Input payload model for audio analysis request."""
    uploadId: str = Field(..., description="Unique identifier for the file upload")
    filePath: str = Field(..., description="Absolute physical path to the audio file on disk")

class AudioMetadata(BaseModel):
    """Model holding metadata and extracted audio features, designed for future extensibility."""
    duration: float = Field(..., description="Duration of the audio file in seconds")
    sampleRate: int = Field(..., description="Sampling rate of the audio file in Hz")
    channels: int = Field(..., description="Number of audio channels (e.g. 1 for mono, 2 for stereo)")
    
    # Placeholder fields for future sprint features to preserve API contract
    tempo: Optional[float] = Field(None, description="Estimated tempo in BPM")
    bpm: Optional[float] = Field(None, description="BPM estimation")
    mfcc: Optional[list[list[float]]] = Field(None, description="Mel-frequency cepstral coefficients matrix")
    chroma: Optional[list[list[float]]] = Field(None, description="Chroma feature matrix")
    spectral_centroid: Optional[list[float]] = Field(None, description="Spectral centroid array")
    rolloff: Optional[list[float]] = Field(None, description="Spectral rolloff array")
    rms: Optional[list[float]] = Field(None, description="Root-mean-square energy array")
    zero_crossing_rate: Optional[list[float]] = Field(None, description="Zero crossing rate array")

class AnalysisResponse(BaseModel):
    """Output response model for audio analysis request."""
    success: bool
    metadata: AudioMetadata

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK, tags=["analysis"])
def analyze_audio(request: AnalysisRequest) -> AnalysisResponse:
    """
    Validates request body and runs metadata extraction on the target audio file path.
    
    Raises:
        HTTPException (404): If the target file is missing.
        HTTPException (400): If the file has an invalid format or is corrupted.
        HTTPException (500): For general analysis failure.
    """
    extractor = FeatureExtractor()
    try:
        raw_metadata = extractor.extract_metadata(request.filePath)
        
        # Populate AudioMetadata (Pydantic will ignore unset placeholders)
        metadata = AudioMetadata(
            duration=raw_metadata["duration"],
            sampleRate=raw_metadata["sampleRate"],
            channels=raw_metadata["channels"]
        )
        
        return AnalysisResponse(success=True, metadata=metadata)
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal analysis failure: {str(e)}"
        )
