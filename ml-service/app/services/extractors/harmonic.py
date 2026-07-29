import numpy as np
import librosa
from typing import Optional

def extract_chroma(y: np.ndarray, sr: int, S: Optional[np.ndarray] = None) -> Optional[list[float]]:
    """
    Compute chroma_stft and return the mean values for each of the 12 chroma bins.
    """
    try:
        chroma = librosa.feature.chroma_stft(y=y, sr=sr, S=S)
        # Average each chroma bin over the frames (axis 1)
        mean_chroma = np.mean(chroma, axis=1)
        return mean_chroma.tolist()
    except Exception:
        return None

def extract_hpss_energy(y: np.ndarray) -> dict:
    """
    Separate harmonic and percussive sources and return their normalized energies.
    """
    try:
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        energy_h = float(np.sum(y_harmonic ** 2))
        energy_p = float(np.sum(y_percussive ** 2))
        total = energy_h + energy_p
        if total > 0:
            return {
                "harmonic_energy": float(energy_h / total),
                "percussive_energy": float(energy_p / total)
            }
        return {"harmonic_energy": 0.0, "percussive_energy": 0.0}
    except Exception:
        return {"harmonic_energy": None, "percussive_energy": None}
