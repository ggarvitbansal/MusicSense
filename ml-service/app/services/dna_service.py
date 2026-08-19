import math
import numpy as np
from typing import Optional

# Named constants for thresholds and scaling references to avoid magic numbers.
# All reference ceilings are calibrated to mastered commercial music, not raw/clipping audio.
MAX_RMS_REF = 0.10             # Calibrated: mastered pop/EDM at -14 LUFS sits at 0.05–0.12 RMS
MAX_CENTROID_REF = 4000.0      # Hz ceiling for spectral centroid
MAX_ROLLOFF_REF = 12000.0      # Hz ceiling for rolloff (mastered pop can reach 10–15 kHz)
MAX_TEMPO_REF = 200.0          # BPM ceiling for rhythm tempo score
MAX_ONSET_STRENGTH_REF = 5.0   # Typical mean onset strength for commercial music
MAX_CONTRAST_REF = 18.0        # Calibrated: dense pop/EDM averages 8–18 dB contrast per band
MAX_BANDWIDTH_REF = 3500.0     # Hz ceiling for spectral bandwidth

# Danceability bell-curve parameters
DANCE_TEMPO_CENTER = 120.0     # BPM where tempo danceability peaks (center of house/pop range)
DANCE_TEMPO_SIGMA = 35.0       # BPM sigma — keeps 80–160 BPM in a reasonable score range


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
        harmonic_energy = features.get("harmonic_energy")
        percussive_energy = features.get("percussive_energy")
        spectral_contrast = features.get("spectral_contrast") or [0.0]
        spectral_bandwidth = features.get("spectral_bandwidth") or [0.0]
        silence_ratio = features.get("silence_ratio")
        mfcc = features.get("mfcc") or [0.0]
        beat_regularity = features.get("beat_regularity") or 0.0
        onset_mean = features.get("onset_mean") or 0.0

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
        rhythm = self._compute_rhythm(tempo, onset_mean)
        harmonic_richness = self._compute_harmonic_richness(harmonic_energy, spectral_contrast)
        danceability = self._compute_danceability(tempo, rms, percussive_energy, beat_regularity)
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
        Energy (0-100) <- mean RMS loudness and Percussive Ratio.

        Mean RMS represents the track's sustained loudness level and reliably separates
        soft ballads (0.03–0.06) from energetic dance tracks (0.08–0.12) against the
        calibrated 0.10 ceiling. The 95th-percentile approach was reverted because
        commercial mastering compression keeps even soft songs' peak frames very high,
        causing saturation regardless of perceived energy.
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

    def _compute_rhythm(self, tempo: float, onset_mean: float) -> float:
        """
        Rhythm (0-100) <- Tempo and mean Onset Strength.

        Onset strength (mean energy of onset envelope) measures how much rhythmic
        activity / transient energy the track has per frame. It is a far more
        accurate proxy for rhythmic drive than Zero Crossing Rate, which measures
        spectral noisiness rather than beat activity.
        """
        tempo_score = (tempo / MAX_TEMPO_REF) * 100.0
        onset_score = (onset_mean / MAX_ONSET_STRENGTH_REF) * 100.0
        return self._clamp(0.6 * tempo_score + 0.4 * onset_score)

    def _compute_harmonic_richness(self, harmonic_energy: float, contrast: list[float]) -> float:
        """
        Harmonic Richness (0-100) <- Harmonic Energy and Spectral Contrast.
        High harmonic presence and sharp spectral contrast peaks define rich instrumentation.
        """
        harmonic_score = harmonic_energy * 100.0
        avg_contrast = float(np.mean(contrast)) if contrast else 0.0
        contrast_score = (avg_contrast / MAX_CONTRAST_REF) * 100.0
        return self._clamp(0.5 * harmonic_score + 0.5 * contrast_score)

    def _compute_danceability(
        self,
        tempo: float,
        rms: list[float],
        percussive_energy: float,
        beat_regularity: float
    ) -> float:
        """
        Danceability (0-100) <- Tempo fitness (Gaussian bell curve), Beat Regularity,
        Percussive Energy, and RMS loudness.

        A Gaussian bell curve replaces the old single-anchor linear decay at 124 BPM,
        which unfairly penalized valid dance tempos like 90–110 BPM and 140–160 BPM.
        The curve peaks at DANCE_TEMPO_CENTER (120 BPM) with sigma=35 BPM, giving:
            100 BPM → ~85,  90 BPM → ~69,  80 BPM → ~49,  160 BPM → ~49

        Beat regularity (consistency of inter-beat intervals) directly captures
        metronomic stability — the primary driver of physical danceability —
        replacing raw percussive energy which HPSS underestimates for polished pop/EDM.
        """
        # Gaussian tempo score: peaks at DANCE_TEMPO_CENTER BPM
        tempo_score = 100.0 * math.exp(
            -0.5 * ((tempo - DANCE_TEMPO_CENTER) / DANCE_TEMPO_SIGMA) ** 2
        )

        # Beat regularity: 0.0 = erratic, 1.0 = perfectly metronomic → scaled 0–100
        regularity_score = beat_regularity * 100.0

        rms_array = np.array(rms) if rms else np.array([0.0])
        avg_rms = float(np.mean(rms_array))
        rms_score = (avg_rms / MAX_RMS_REF) * 100.0

        percussive_score = percussive_energy * 100.0

        return self._clamp(
            0.30 * percussive_score +
            0.25 * tempo_score +
            0.30 * regularity_score +
            0.15 * rms_score
        )

    def _compute_acousticness(self, harmonic_energy: float, mfcc: list[float]) -> float:
        """
        Acousticness (0-100) <- Harmonic Energy and MFCC Timbral envelope shape.

        MFCC[1] (the second coefficient) in librosa outputs typically ranges from
        approximately -100 to +100. Acoustic/natural instruments have a darker spectral
        tilt (lower MFCC[1]); electronic/synthesized sources have a brighter tilt (higher).
        We invert and normalize: mfcc_1=-100 → acoustic 100, mfcc_1=+100 → acoustic 0.
        The previous formula anchored at 50 with a /100 scale, which saturated to 0
        for virtually every real track since MFCC[1] rarely exceeds ±50 symmetrically.
        """
        harmonic_score = harmonic_energy * 100.0
        mfcc_1 = mfcc[1] if len(mfcc) > 1 else 0.0
        # Linear map: [-100, +100] → [100, 0] (inverted: darker = more acoustic)
        mfcc_score = max(0.0, min(100.0, (-mfcc_1 + 100.0) / 200.0 * 100.0))
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
