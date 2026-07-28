import numpy as np
from typing import Optional

# Named constants for thresholds and scaling references to avoid magic numbers
MAX_RMS_REF = 0.25
MAX_CENTROID_REF = 4000.0
MAX_ROLLOFF_REF = 8000.0
MAX_TEMPO_REF = 200.0
MAX_ZCR_REF = 0.15
MAX_CONTRAST_REF = 25.0
MAX_BANDWIDTH_REF = 3500.0
IDEAL_TEMPO_PULSE = 124.0

class MusicDNAService:
    """
    Deterministic semantic interpretation layer.
    Converts extracted DSP physical features (AudioFeatures) into human-readable musical characteristics.
    """

    def compile_dna(self, features: dict) -> dict:
        """
        Orchestrate deterministic DNA attribute calculations.
        
        Input:
            features: Dictionary containing DSP parameters extracted by FeatureExtractor.
        Output:
            Dictionary matching the MusicDNA schema:
            {
                "energy": float,
                "brightness": float,
                "rhythm": float,
                "harmonicRichness": float,
                "danceability": float,
                "acousticness": float,
                "complexity": float,
                "silence": float
            }
        """
        # Protect against missing values using default fallbacks
        rms = features.get("rms") or [0.0]
        spectral_centroid = features.get("spectral_centroid") or [0.0]
        rolloff = features.get("rolloff") or [0.0]
        tempo = features.get("tempo") or 120.0
        zcr = features.get("zero_crossing_rate") or [0.0]
        harmonic_energy = features.get("harmonic_energy")
        percussive_energy = features.get("percussive_energy")
        spectral_contrast = features.get("spectral_contrast") or [0.0]
        spectral_bandwidth = features.get("spectral_bandwidth") or [0.0]
        silence_ratio = features.get("silence_ratio")
        mfcc = features.get("mfcc") or [0.0]

        # HPSS and silence ratio defaults if unpopulated
        if harmonic_energy is None:
            harmonic_energy = 0.5
        if percussive_energy is None:
            percussive_energy = 0.5
        if silence_ratio is None:
            silence_ratio = 0.0

        # Calculate semantic scores
        energy = self._compute_energy(rms, percussive_energy)
        brightness = self._compute_brightness(spectral_centroid, rolloff)
        rhythm = self._compute_rhythm(tempo, zcr)
        harmonic_richness = self._compute_harmonic_richness(harmonic_energy, spectral_contrast)
        danceability = self._compute_danceability(tempo, rms, percussive_energy)
        acousticness = self._compute_acousticness(harmonic_energy, mfcc)
        complexity = self._compute_complexity(spectral_contrast, spectral_bandwidth)
        silence = self._compute_silence(silence_ratio)

        return {
            "energy": energy,
            "brightness": brightness,
            "rhythm": rhythm,
            "harmonicRichness": harmonic_richness,
            "danceability": danceability,
            "acousticness": acousticness,
            "complexity": complexity,
            "silence": silence
        }

    def _clamp(self, val: float) -> float:
        """Clamp final calculated value strictly between 0.0 and 100.0."""
        return max(0.0, min(100.0, float(val)))

    def _compute_energy(self, rms: list[float], percussive_energy: float) -> float:
        """
        Energy (0-100) <- RMS (overall intensity) and Percussive Ratio (rhythmic power).
        Averages standard RMS scale against percussive transients.
        """
        avg_rms = float(np.mean(rms)) if rms else 0.0
        rms_score = (avg_rms / MAX_RMS_REF) * 100.0
        percussive_score = percussive_energy * 100.0
        return self._clamp(0.5 * rms_score + 0.5 * percussive_score)

    def _compute_brightness(self, centroid: list[float], rolloff: list[float]) -> float:
        """
        Brightness (0-100) <- Spectral Centroid (mean frequency) and Spectral Roll-off.
        High centroid and roll-off indicate high frequency content (warmer/darker vs bright).
        """
        avg_centroid = float(np.mean(centroid)) if centroid else 0.0
        avg_rolloff = float(np.mean(rolloff)) if rolloff else 0.0
        centroid_score = (avg_centroid / MAX_CENTROID_REF) * 100.0
        rolloff_score = (avg_rolloff / MAX_ROLLOFF_REF) * 100.0
        return self._clamp(0.5 * centroid_score + 0.5 * rolloff_score)

    def _compute_rhythm(self, tempo: float, zcr: list[float]) -> float:
        """
        Rhythm (0-100) <- Tempo and Zero Crossing Rate.
        Aggregates track speed and transient rates representing rhythmic drive.
        """
        tempo_score = (tempo / MAX_TEMPO_REF) * 100.0
        avg_zcr = float(np.mean(zcr)) if zcr else 0.0
        zcr_score = (avg_zcr / MAX_ZCR_REF) * 100.0
        return self._clamp(0.6 * tempo_score + 0.4 * zcr_score)

    def _compute_harmonic_richness(self, harmonic_energy: float, contrast: list[float]) -> float:
        """
        Harmonic Richness (0-100) <- Harmonic Energy and Spectral Contrast.
        High harmonic presence and sharp spectral contrast peaks define rich instrumentation.
        """
        harmonic_score = harmonic_energy * 100.0
        avg_contrast = float(np.mean(contrast)) if contrast else 0.0
        contrast_score = (avg_contrast / MAX_CONTRAST_REF) * 100.0
        return self._clamp(0.5 * harmonic_score + 0.5 * contrast_score)

    def _compute_danceability(self, tempo: float, rms: list[float], percussive_energy: float) -> float:
        """
        Danceability (0-100) <- Tempo (proximity to 124 BPM), RMS, and Percussive Ratio.
        Strong percussive components and a solid tempo close to house music pulses maximize danceability.
        """
        tempo_dist = abs(tempo - IDEAL_TEMPO_PULSE)
        # Linear decay mapping as BPM drifts away from 124 BPM
        tempo_score = max(0.0, 100.0 - (tempo_dist * 0.8))
        
        avg_rms = float(np.mean(rms)) if rms else 0.0
        rms_score = (avg_rms / MAX_RMS_REF) * 100.0
        percussive_score = percussive_energy * 100.0
        
        return self._clamp(0.5 * percussive_score + 0.3 * tempo_score + 0.2 * rms_score)

    def _compute_acousticness(self, harmonic_energy: float, mfcc: list[float]) -> float:
        """
        Acousticness (0-100) <- Harmonic Energy and MFCC Timbral envelope shape.
        Acoustic tracks exhibit higher harmonic components and positive lower formant slopes.
        We model timbral tilt using the first MFCC coefficient (MFCC 1).
        """
        harmonic_score = harmonic_energy * 100.0
        mfcc_1 = mfcc[1] if len(mfcc) > 1 else 100.0
        mfcc_score = max(0.0, min(100.0, ((mfcc_1 - 50.0) / 100.0) * 100.0))
        return self._clamp(0.5 * harmonic_score + 0.5 * mfcc_score)

    def _compute_complexity(self, contrast: list[float], bandwidth: list[float]) -> float:
        """
        Complexity (0-100) <- Spectral Contrast and Spectral Bandwidth.
        Wider bandwidth (orchestral layers or noise) combined with spectral peaks denotes acoustic complexity.
        """
        avg_bandwidth = float(np.mean(bandwidth)) if bandwidth else 0.0
        bandwidth_score = (avg_bandwidth / MAX_BANDWIDTH_REF) * 100.0
        
        avg_contrast = float(np.mean(contrast)) if contrast else 0.0
        contrast_score = (avg_contrast / MAX_CONTRAST_REF) * 100.0
        
        return self._clamp(0.5 * bandwidth_score + 0.5 * contrast_score)

    def _compute_silence(self, silence_ratio: float) -> float:
        """
        Silence (0-100) <- Silence Ratio (percentage of low-energy frames).
        """
        return self._clamp(silence_ratio * 100.0)
