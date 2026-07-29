import numpy as np
import librosa
from typing import Optional

def extract_rms(y: np.ndarray) -> Optional[list[float]]:
    """
    Extract Root-Mean-Square energy envelope list.
    """
    try:
        rms = librosa.feature.rms(y=y)
        return rms[0].tolist()
    except Exception:
        return None

def extract_zcr(y: np.ndarray) -> Optional[list[float]]:
    """
    Extract Zero Crossing Rate list.
    """
    try:
        zcr = librosa.feature.zero_crossing_rate(y=y)
        return zcr[0].tolist()
    except Exception:
        return None

def extract_spectral_centroid(y: np.ndarray, sr: int, S: Optional[np.ndarray] = None) -> Optional[list[float]]:
    """
    Extract Spectral Centroid list.
    """
    try:
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr, S=S)
        return centroid[0].tolist()
    except Exception:
        return None

def extract_spectral_bandwidth(y: np.ndarray, sr: int, S: Optional[np.ndarray] = None) -> Optional[list[float]]:
    """
    Extract Spectral Bandwidth list.
    """
    try:
        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr, S=S)
        return bandwidth[0].tolist()
    except Exception:
        return None

def extract_spectral_rolloff(y: np.ndarray, sr: int, S: Optional[np.ndarray] = None) -> Optional[list[float]]:
    """
    Extract Spectral Roll-off frequencies list.
    """
    try:
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, S=S)
        return rolloff[0].tolist()
    except Exception:
        return None

def extract_spectral_contrast(y: np.ndarray, sr: int, S: Optional[np.ndarray] = None) -> Optional[list[float]]:
    """
    Compute spectral contrast and return the mean spectral contrast vector.
    """
    try:
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr, S=S)
        # Average each subband over the frames (axis 1)
        mean_contrast = np.mean(contrast, axis=1)
        return mean_contrast.tolist()
    except Exception:
        return None
