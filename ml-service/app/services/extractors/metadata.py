import numpy as np
import librosa
from typing import Optional

def extract_core_properties(y: np.ndarray, sr: float, real_duration: Optional[float] = None) -> dict:
    """
    Extract duration, sample rate, and number of channels from loaded audio data.
    """
    duration = real_duration if real_duration is not None else float(librosa.get_duration(y=y, sr=sr))
    sample_rate = int(sr)
    channels = 1 if y.ndim == 1 else int(y.shape[0])
    return {
        "duration": duration,
        "sampleRate": sample_rate,
        "channels": channels
    }

def extract_silence_ratio(rms_list: Optional[list[float]]) -> Optional[float]:
    """
    Estimate the percentage of low-energy frames relative to the track's mean RMS.
    """
    if not rms_list:
        return None
    try:
        rms_array = np.array(rms_list)
        mean_rms = np.mean(rms_array)
        if mean_rms > 0:
            # Count frames whose energy is below 10% of the average RMS
            silent_frames = np.sum(rms_array < (0.1 * mean_rms))
            return float(silent_frames / len(rms_array))
        return 1.0
    except Exception:
        return None
