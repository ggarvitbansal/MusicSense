import numpy as np
import librosa
from typing import Optional

def extract_tempo(y: np.ndarray, sr: int) -> Optional[float]:
    """
    Extract estimated tempo (BPM) from mono time-series.
    """
    try:
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        if hasattr(tempo, "__len__"):
            return float(tempo[0])
        return float(tempo)
    except Exception:
        return None
