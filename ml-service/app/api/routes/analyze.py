import os
import shutil
import tempfile
import psutil
from fastapi import APIRouter, HTTPException, status, File, Form, UploadFile
from pydantic import BaseModel, Field
from typing import Optional
from app.services.feature_extractor import FeatureExtractor
from app.services.dna_service import MusicDNAService

router = APIRouter()

def log_memory(step_name: str):
    try:
        process = psutil.Process(os.getpid())
        rss_mb = process.memory_info().rss / (1024 * 1024)
        print(f"[MEMORY PROFILE] {step_name}: RSS = {rss_mb:.2f} MB", flush=True)
    except Exception as e:
        print(f"[MEMORY PROFILE] Failed to log memory at {step_name}: {str(e)}", flush=True)

class AnalysisRequest(BaseModel):
    """Input payload model for audio analysis request."""
    uploadId: str = Field(..., description="Unique identifier for the file upload")
    filePath: str = Field(..., description="Absolute physical path to the audio file on disk")

class AudioMetadata(BaseModel):
    """Model holding metadata and extracted audio features, designed for future extensibility."""
    duration: float = Field(..., description="Duration of the audio file in seconds")
    sampleRate: int = Field(..., description="Sampling rate of the audio file in Hz")
    channels: int = Field(..., description="Number of audio channels (e.g. 1 for mono, 2 for stereo)")
    
    # DSP features mapped in Sprint 1.3
    tempo: Optional[float] = Field(None, description="Estimated tempo in BPM")
    bpm: Optional[float] = Field(None, description="BPM estimation")
    rms: Optional[list[float]] = Field(None, description="Root-mean-square energy envelope array")
    zero_crossing_rate: Optional[list[float]] = Field(None, description="Zero crossing rate array")
    spectral_centroid: Optional[list[float]] = Field(None, description="Spectral centroid array")
    spectral_bandwidth: Optional[list[float]] = Field(None, description="Spectral bandwidth array")
    rolloff: Optional[list[float]] = Field(None, description="Spectral rolloff array")
    
    # Advanced features mapped in Sprint 1.4
    mfcc: Optional[list[float]] = Field(None, description="Mean Mel-frequency cepstral coefficients (13 values)")
    chroma: Optional[list[float]] = Field(None, description="Mean Chroma features (12 values)")
    spectral_contrast: Optional[list[float]] = Field(None, description="Mean spectral contrast vector")
    harmonic_energy: Optional[float] = Field(None, description="Normalized harmonic energy ratio")
    percussive_energy: Optional[float] = Field(None, description="Normalized percussive energy ratio")
    silence_ratio: Optional[float] = Field(None, description="Estimated silence ratio (percentage of low-energy frames)")

class MusicDNA(BaseModel):
    """Semantic interpretation layer model (Music DNA) representing human-readable characteristics."""
    energy: float = Field(..., description="Intensity and activity level (0-100)")
    brightness: float = Field(..., description="Timbral brightness and high frequency presence (0-100)")
    rhythm: float = Field(..., description="Rhythmic energy and tempo strength (0-100)")
    harmonicRichness: float = Field(..., description="Chroma and harmonic density (0-100)")
    danceability: float = Field(..., description="Rhythmic stability and pulse clarity (0-100)")
    acousticness: float = Field(..., description="Probability or level of acoustic instruments vs electronic (0-100)")
    complexity: float = Field(..., description="Spectral variance and bandwidth spread (0-100)")
    silence: float = Field(..., description="Percentage of silence / low-energy frames (0-100)")

class AnalysisResponse(BaseModel):
    """Output response model for audio analysis request."""
    success: bool
    metadata: AudioMetadata
    musicDNA: MusicDNA = Field(..., description="Semantic interpreted Music DNA features")

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK, tags=["analysis"])
def analyze_audio(
    uploadId: str = Form(..., description="Unique identifier for the file upload"),
    file: UploadFile = File(..., description="Audio file to analyze")
) -> AnalysisResponse:
    """
    Validates request body, runs digital signal processing (DSP) features extraction,
    and compiles the deterministic Music DNA semantic metrics.
    
    Raises:
        HTTPException (404): If the target file is missing.
        HTTPException (400): If the file has an invalid format or is corrupted.
        HTTPException (500): For general analysis failure.
    """
    log_memory("API analyze request entered")
    extractor = FeatureExtractor()
    dna_service = MusicDNAService()

    # 1. Create a secure temporary file to write uploaded bytes
    suffix = "." + file.filename.split(".")[-1] if file.filename and "." in file.filename else ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = temp_file.name
        try:
            shutil.copyfileobj(file.file, temp_file)
            log_memory("Temporary file written to disk")
        except Exception as e:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read upload file stream: {str(e)}"
            )

    try:
        log_memory("Calling FeatureExtractor.extract_features")
        raw_metadata = extractor.extract_features(temp_path)
        log_memory("FeatureExtractor.extract_features complete")
        
        # Populate AudioMetadata and map computed properties
        metadata = AudioMetadata(
            duration=raw_metadata["duration"],
            sampleRate=raw_metadata["sampleRate"],
            channels=raw_metadata["channels"],
            tempo=raw_metadata["tempo"],
            bpm=raw_metadata["bpm"],
            rms=raw_metadata["rms"],
            zero_crossing_rate=raw_metadata["zero_crossing_rate"],
            spectral_centroid=raw_metadata["spectral_centroid"],
            spectral_bandwidth=raw_metadata["spectral_bandwidth"],
            rolloff=raw_metadata["rolloff"],
            mfcc=raw_metadata["mfcc"],
            chroma=raw_metadata["chroma"],
            spectral_contrast=raw_metadata["spectral_contrast"],
            harmonic_energy=raw_metadata["harmonic_energy"],
            percussive_energy=raw_metadata["percussive_energy"],
            silence_ratio=raw_metadata["silence_ratio"]
        )
        
        # Compile Music DNA profile
        log_memory("Calling MusicDNAService.compile_dna")
        raw_dna = dna_service.compile_dna(raw_metadata)
        log_memory("MusicDNAService.compile_dna complete")
        music_dna = MusicDNA(
            energy=raw_dna["energy"],
            brightness=raw_dna["brightness"],
            rhythm=raw_dna["rhythm"],
            harmonicRichness=raw_dna["harmonicRichness"],
            danceability=raw_dna["danceability"],
            acousticness=raw_dna["acousticness"],
            complexity=raw_dna["complexity"],
            silence=raw_dna["silence"]
        )
        
        log_memory("Preparing AnalysisResponse serialization")
        response_obj = AnalysisResponse(
            success=True,
            metadata=metadata,
            musicDNA=music_dna
        )
        log_memory("AnalysisResponse serialized successfully")
        return response_obj
        
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
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
