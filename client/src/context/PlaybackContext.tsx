import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Track {
  id: string;
  name: string;
  url: string;
}

interface PlaybackContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
  error: string | null;
  clearError: () => void;
  volume: number;
  setVolume: (vol: number) => void;
  dismissPlayer: () => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume state with audio element volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = (e: Event) => {
      console.error("Audio playback error event", e);
      setIsPlaying(false);
      setError("Playback failed. This track's physical file might have been wiped from ephemeral server storage during a redeploy.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, []);

  const playTrack = (track: Track) => {
    if (!audioRef.current) return;
    
    // Clear any previous error
    setError(null);
    
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Playback failed", err);
          setError("Playback failed. The audio stream could not be loaded.");
        });
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrack(track);
    audioRef.current.src = track.url;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Playback failed to start", err);
        setIsPlaying(false);
        setError("Failed to load audio track. If the server was redeployed, the physical file might have been wiped.");
      });
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (!audioRef.current || !currentTrack) return;
    setError(null);
    audioRef.current.play().catch((err) => {
      console.error("Resume failed", err);
      setError("Failed to resume playback.");
    });
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const dismissPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        duration,
        currentTime,
        seek,
        error,
        clearError,
        volume,
        setVolume,
        dismissPlayer,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error("usePlayback must be used within a PlaybackProvider");
  }
  return context;
}
