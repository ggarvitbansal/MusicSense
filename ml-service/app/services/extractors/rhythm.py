import numpy as np
import librosa
from typing import Optional

def extract_tempo(y: np.ndarray, sr: int, onset_envelope: Optional[np.ndarray] = None) -> Optional[float]:
    """
    Extract estimated tempo (BPM) from mono time-series or onset envelope.
    """
    try:
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset_envelope)
        if hasattr(tempo, "__len__"):
            return float(tempo[0])
        return float(tempo)
    except Exception:
        return None
