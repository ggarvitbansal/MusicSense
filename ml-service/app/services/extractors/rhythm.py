import numpy as np
import librosa
from typing import Optional, Tuple

def extract_tempo(y: np.ndarray, sr: int, onset_envelope: Optional[np.ndarray] = None) -> Tuple[Optional[float], float]:
    """
    Extract estimated tempo (BPM) and beat regularity from mono time-series or onset envelope.

    Beat regularity is derived from the coefficient of variation (CV) of inter-beat intervals:
    a perfectly metronomic track has std(IBI) = 0, yielding regularity = 1.0.
    An erratic, freely-improvised track will have high CV, yielding regularity near 0.0.

    Returns:
        (tempo, beat_regularity): tempo in BPM (float), beat_regularity in [0.0, 1.0].
    """
    try:
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset_envelope)
        if hasattr(tempo, "__len__"):
            tempo_val = float(tempo[0])
        else:
            tempo_val = float(tempo)

        # Compute beat regularity from inter-beat interval consistency
        beat_regularity = 0.0
        if beat_frames is not None and len(beat_frames) > 2:
            ibi = np.diff(beat_frames).astype(np.float32)
            mean_ibi = float(np.mean(ibi))
            if mean_ibi > 0:
                # Coefficient of variation: lower = more regular beat
                cv = float(np.std(ibi)) / mean_ibi
                # Invert and clamp: CV of 0 → regularity 1.0; CV ≥ 1 → regularity 0.0
                beat_regularity = float(max(0.0, min(1.0, 1.0 - cv)))

        return tempo_val, beat_regularity
    except Exception:
        return None, 0.0
