import os
import gc
import numpy as np
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

        # 2. Get the true duration of the entire audio file from metadata first
        try:
            real_duration = float(librosa.get_duration(path=file_path))
        except Exception:
            real_duration = 0.0

        # 3. Load only the first 30 seconds of the audio signal to limit memory usage
        try:
            y, sr = librosa.load(file_path, sr=None, mono=False, duration=30.0)
        except Exception as e:
            raise ValueError(f"Invalid, corrupted, or unsupported audio format: {str(e)}")

        # 4. Extract core properties (using real_duration)
        core_props = extract_core_properties(y, sr, real_duration=real_duration)

        # 5. Prepare mono downmix for feature extraction
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y

        # 6. Pre-compute STFT magnitude and power spectrograms once to reuse across extractors
        try:
            stft_complex = librosa.stft(y_mono)
            S_magnitude = np.abs(stft_complex)
            S_power = S_magnitude ** 2
            
            # Explicitly delete the complex array to release memory
            del stft_complex
        except Exception:
            S_magnitude = None
            S_power = None

        # 7. Delegate feature extraction to specialized modules
        tempo_val = extract_tempo(y_mono, core_props["sampleRate"])
        rms_list = extract_rms(y_mono)
        zcr_list = extract_zcr(y_mono)
        
        centroid_list = extract_spectral_centroid(y_mono, core_props["sampleRate"], S=S_magnitude)
        bandwidth_list = extract_spectral_bandwidth(y_mono, core_props["sampleRate"], S=S_magnitude)
        rolloff_list = extract_spectral_rolloff(y_mono, core_props["sampleRate"], S=S_magnitude)
        contrast_means = extract_spectral_contrast(y_mono, core_props["sampleRate"], S=S_magnitude)
        chroma_means = extract_chroma(y_mono, core_props["sampleRate"], S=S_power)
        
        # Clean up pre-computed spectrograms to free memory before heavy HPSS calculations
        if S_magnitude is not None:
            del S_magnitude
        if S_power is not None:
            del S_power
        
        mfcc_means = extract_mfcc(y_mono, core_props["sampleRate"])
        hpss_res = extract_hpss_energy(y_mono)
        silence_val = extract_silence_ratio(rms_list)

        # 8. Explicitly trigger garbage collection to free all temporary numpy buffers
        gc.collect()

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
