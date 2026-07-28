import numpy as np
import librosa
from typing import Optional

def extract_mfcc(y: np.ndarray, sr: int) -> Optional[list[float]]:
    """
    Extract the first 13 MFCC coefficients and return their temporal mean vector.
    """
    try:
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        # Average each coefficient over the frames (axis 1)
        mean_mfcc = np.mean(mfcc, axis=1)
        return mean_mfcc.tolist()
    except Exception:
        return None
