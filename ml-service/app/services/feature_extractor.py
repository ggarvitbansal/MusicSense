import os
import soundfile as sf
import audioread

class FeatureExtractor:
    """Service handling audio file loading and digital signal processing (DSP) feature extraction."""

    def extract_metadata(self, file_path: str) -> dict:
        """
        Verify file exists, load audio metadata, and return a dictionary of properties.
        
        Raises:
            FileNotFoundError: If the target file does not exist on disk.
            ValueError: If the file exists but has an invalid or unsupported format.
        """
        # 1. Verify the file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at path: {file_path}")

        # 2. Try loading metadata using soundfile (optimized for WAV/FLAC, supports newer libsndfile MP3s)
        try:
            info = sf.info(file_path)
            return {
                "duration": float(info.duration),
                "sampleRate": int(info.samplerate),
                "channels": int(info.channels)
            }
        except Exception:
            # 3. Fallback to audioread (robust decoder for compressed MP3/M4A streams)
            try:
                with audioread.audio_open(file_path) as f:
                    return {
                        "duration": float(f.duration),
                        "sampleRate": int(f.samplerate),
                        "channels": int(f.channels)
                    }
            except Exception as e:
                raise ValueError(f"Invalid, corrupted, or unsupported audio format: {str(e)}")
