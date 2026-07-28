import os
import librosa
from app.services.extractors.metadata import extract_core_properties, extract_silence_ratio
from app.services.extractors.rhythm import extract_tempo
from app.services.extractors.spectral import (
    extract_rms,
    extract_zcr,
    extract_spectral_centroid,
    extract_spectral_bandwidth,
    extract_spectral_rolloff,
    extract_spectral_contrast
)
from app.services.extractors.timbre import extract_mfcc
from app.services.extractors.harmonic import extract_chroma, extract_hpss_energy

class FeatureExtractor:
    """Orchestrator service coordinating specialized modular feature extractors."""

    def extract_features(self, file_path: str) -> dict:
        """
        Verify file exists, load audio waveform once, and coordinate feature extraction.
        
        Raises:
            FileNotFoundError: If the target file does not exist.
            ValueError: If the audio file is invalid, corrupted, or unsupported.
        """
        # 1. Verify file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at path: {file_path}")

        # 2. Load audio signal (mono=False preserves original channel count)
        try:
            y, sr = librosa.load(file_path, sr=None, mono=False)
        except Exception as e:
            raise ValueError(f"Invalid, corrupted, or unsupported audio format: {str(e)}")

        # 3. Extract core properties
        core_props = extract_core_properties(y, sr)

        # 4. Prepare mono downmix for feature extraction
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y

        # 5. Delegate feature extraction to specialized modules
        tempo_val = extract_tempo(y_mono, core_props["sampleRate"])
        rms_list = extract_rms(y_mono)
        zcr_list = extract_zcr(y_mono)
        centroid_list = extract_spectral_centroid(y_mono, core_props["sampleRate"])
        bandwidth_list = extract_spectral_bandwidth(y_mono, core_props["sampleRate"])
        rolloff_list = extract_spectral_rolloff(y_mono, core_props["sampleRate"])
        
        mfcc_means = extract_mfcc(y_mono, core_props["sampleRate"])
        chroma_means = extract_chroma(y_mono, core_props["sampleRate"])
        contrast_means = extract_spectral_contrast(y_mono, core_props["sampleRate"])
        hpss_res = extract_hpss_energy(y_mono)
        silence_val = extract_silence_ratio(rms_list)

        return {
            "duration": core_props["duration"],
            "sampleRate": core_props["sampleRate"],
            "channels": core_props["channels"],
            "tempo": tempo_val,
            "bpm": tempo_val,
            "rms": rms_list,
            "zero_crossing_rate": zcr_list,
            "spectral_centroid": centroid_list,
            "spectral_bandwidth": bandwidth_list,
            "rolloff": rolloff_list,
            "mfcc": mfcc_means,
            "chroma": chroma_means,
            "spectral_contrast": contrast_means,
            "harmonic_energy": hpss_res.get("harmonic_energy"),
            "percussive_energy": hpss_res.get("percussive_energy"),
            "silence_ratio": silence_val
        }
