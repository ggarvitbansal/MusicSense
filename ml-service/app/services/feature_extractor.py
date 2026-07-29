import os
import gc
import psutil
import soundfile as sf
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

def log_memory(step_name: str):
    try:
        process = psutil.Process(os.getpid())
        rss_mb = process.memory_info().rss / (1024 * 1024)
        print(f"[MEMORY PROFILE]   - {step_name}: RSS = {rss_mb:.2f} MB", flush=True)
    except Exception as e:
        print(f"[MEMORY PROFILE]   - Failed to log memory at {step_name}: {str(e)}", flush=True)

class FeatureExtractor:
    """Orchestrator service coordinating specialized modular feature extractors."""

    def extract_features(self, file_path: str) -> dict:
        """
        Verify file exists, load audio waveform once, and coordinate feature extraction.
        
        Raises:
            FileNotFoundError: If the target file does not exist.
            ValueError: If the audio file is invalid, corrupted, or unsupported.
        """
        log_memory("extract_features entered")
        # 1. Verify file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at path: {file_path}")

        # 2. Get metadata and load the audio signal
        # We prefer using SoundFile directly for loading. Under the hood, librosa.load delegates to
        # audioread which spawns heavy external subprocesses (like ffmpeg) or leaks internal C buffers
        # on Render Free containers (512MB RAM). soundfile reads natively via libsndfile (C-level),
        # reducing memory overhead by up to 85% and allowing immediate garbage collection.
        y = None
        sr = None
        real_duration = 0.0

        try:
            log_memory("Attempting SoundFile metadata header inspection")
            info = sf.info(file_path)
            real_duration = float(info.duration)
            sr = int(info.samplerate)
            log_memory(f"SoundFile duration={real_duration:.2f}s, sample_rate={sr}, channels={info.channels}")
            
            log_memory("Loading 30s audio segment natively via SoundFile")
            # We read only the first 30 seconds (sr * 30 frames) to conserve RAM
            frames_to_read = int(sr * 30)
            y, sr = sf.read(file_path, frames=frames_to_read, dtype="float32")
            
            # soundfile.read returns (samples, channels) for multi-channel audio.
            # We transpose it to (channels, samples) to match librosa's layout.
            y = y.T
            log_memory(f"SoundFile loaded shape: {y.shape}")
        except Exception as sf_err:
            log_memory(f"SoundFile loading failed: {str(sf_err)}. Falling back to Librosa.")
            y = None
            sr = None

        if y is None or sr is None:
            # Fallback to librosa if soundfile fails or format is unsupported natively by libsndfile
            try:
                log_memory("Librosa Fallback: Calculating duration from file header")
                real_duration = float(librosa.get_duration(path=file_path))
                log_memory(f"Librosa Fallback: Real duration read: {real_duration:.2f} s")
            except Exception as e:
                log_memory(f"Librosa Fallback: Failed to read duration from header: {str(e)}")
                real_duration = 0.0

            try:
                log_memory("Librosa Fallback: Loading 30s segment via librosa.load")
                y, sr = librosa.load(file_path, sr=None, mono=False, duration=30.0)
                log_memory(f"Librosa Fallback loaded shape: {y.shape}, sample_rate={sr}")
            except Exception as e:
                raise ValueError(f"Invalid, corrupted, or unsupported audio format: {str(e)}")

        # 4. Extract core properties (using real_duration)
        core_props = extract_core_properties(y, sr, real_duration=real_duration)

        # 5. Prepare mono downmix for feature extraction
        if y.ndim > 1:
            log_memory("Downmixing stereo to mono")
            y_mono = librosa.to_mono(y)
            log_memory("Downmix complete")
        else:
            y_mono = y

        # 6. Pre-compute STFT magnitude and power spectrograms once to reuse across extractors
        try:
            log_memory("Computing STFT complex array")
            stft_complex = librosa.stft(y_mono)
            log_memory(f"STFT complex shape: {stft_complex.shape}")
            
            log_memory("Computing magnitude spectrogram")
            S_magnitude = np.abs(stft_complex)
            log_memory("Computing power spectrogram")
            S_power = S_magnitude ** 2
            
            # Explicitly delete the complex array to release memory
            del stft_complex
            log_memory("Deleted stft_complex array reference")
        except Exception as e:
            log_memory(f"Failed to compute STFT/spectrograms: {str(e)}")
            S_magnitude = None
            S_power = None

        # 7. Delegate feature extraction to specialized modules
        log_memory("Extracting tempo")
        tempo_val = extract_tempo(y_mono, core_props["sampleRate"])
        log_memory("Extracting RMS")
        rms_list = extract_rms(y_mono)
        log_memory("Extracting ZCR")
        zcr_list = extract_zcr(y_mono)
        
        log_memory("Extracting Spectral Centroid (using magnitude)")
        centroid_list = extract_spectral_centroid(y_mono, core_props["sampleRate"], S=S_magnitude)
        log_memory("Extracting Spectral Bandwidth (using magnitude)")
        bandwidth_list = extract_spectral_bandwidth(y_mono, core_props["sampleRate"], S=S_magnitude)
        log_memory("Extracting Spectral Rolloff (using magnitude)")
        rolloff_list = extract_spectral_rolloff(y_mono, core_props["sampleRate"], S=S_magnitude)
        log_memory("Extracting Spectral Contrast (using magnitude)")
        contrast_means = extract_spectral_contrast(y_mono, core_props["sampleRate"], S=S_magnitude)
        log_memory("Extracting Chroma (using power)")
        chroma_means = extract_chroma(y_mono, core_props["sampleRate"], S=S_power)
        
        # Clean up pre-computed spectrograms to free memory before heavy HPSS calculations
        log_memory("Deleting pre-computed spectrogram arrays")
        if S_magnitude is not None:
            del S_magnitude
        if S_power is not None:
            del S_power
        log_memory("Deleted pre-computed spectrograms references")
        
        log_memory("Extracting MFCC")
        mfcc_means = extract_mfcc(y_mono, core_props["sampleRate"])
        log_memory("Extracting HPSS energy")
        hpss_res = extract_hpss_energy(y_mono)
        log_memory("Extracting silence ratio")
        silence_val = extract_silence_ratio(rms_list)

        # 8. Explicitly trigger garbage collection to free all temporary numpy buffers
        log_memory("Triggering explicit garbage collection")
        gc.collect()
        log_memory("Garbage collection complete")

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
