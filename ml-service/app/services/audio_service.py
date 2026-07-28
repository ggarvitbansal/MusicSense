class AudioService:
    """Service handling audio file loading, downsampling, and DSP feature extraction."""
    
    def load_audio(self, file_path: str):
        """Placeholder method to decode and resample raw audio time-series."""
        raise NotImplementedError("load_audio is not yet implemented")

    def extract_features(self, file_path: str):
        """Placeholder method to compute Mel-spectrograms, MFCCs, and Chroma features."""
        raise NotImplementedError("extract_features is not yet implemented")
