# MusicSense ML Roadmap

A detailed technical blueprint for the machine learning services, signal processing pipelines, and neural networks powering MusicSense: An AI-powered Music Intelligence Platform.

---

## Overview
This roadmap outlines the mathematical, signal processing, and modeling steps required to transform raw time-domain audio signals into structured semantic descriptions (Music DNA) and high-dimensional vector spaces (Music Genome). The ML service is built as a separate microservice (`ml-service`) running in a Python 3.10 environment to utilize scientific packages like Librosa, NumPy, and TensorFlow.

## Purpose
Raw audio files are dense, high-dimensional data streams (e.g., a 4-minute stereo track at 44.1 kHz contains over 21 million amplitude samples). Standard database models cannot parse or index this data. 

The ML roadmap defines the engineering path to bridge the gap between time-domain audio amplitudes and human-understandable musical concepts. It translates raw waveforms into frequency-domain representations, extracts acoustic features, passes them through deep convolutional neural networks (CNNs), and maps the resulting latent states into a vector database for similarity and recommendation tasks.

## Design Goals
- **Compute Efficiency**: Optimize DSP preprocessing and model inference to run on standard CPUs, targeting less than 5 seconds of processing time per 4-minute track.
- **Representational Accuracy**: Ensure that the vector embedding space (Music Genome) preserves acoustic, structural, and harmonic relationships.
- **Explainability**: Architect models so that intermediate features can be extracted and explained to the user (e.g. mapping high-level metrics like "energy" directly to spectral characteristics).
- **Scalability**: Build modular pipelines where feature extraction algorithms can be updated or replaced without modifying downstream database or API interfaces.

### Current Status
- **Current Stage**: Stage 1 — Audio Preprocessing & Feature Extraction (Complete).
- **Completed Sprint**: Sprint 1.4 completed advanced DSP feature extraction (producing `AudioFeatures`).
- **Active Task**: Stage 2 — High-Level Musicality & Music DNA compilation (incorporating classifiers and key profilers).

## Future Scope
As the platform matures, we plan to transition from simple classification models to joint text-audio contrastive learning spaces (CLAP), enabling true natural language query mapping ("Search by Feeling") and interactive AI assistants.

## Possible Improvements
- **Transfer Learning**: Incorporating pre-trained audio representation models (such as YAMNet, VGGish, or OpenL3) as frozen feature extractors to accelerate training of the genre and mood classifiers.
- **On-Device Feature Extraction**: Compiling python preprocessing scripts to WebAssembly to allow background feature extraction directly on client machines before uploading raw files.

---

## ML Ingestion & Inference Pipeline Flow

```mermaid
graph TD
    Audio["Raw Audio File<br>(.mp3, .wav, .flac)"]
    Decoder["1. Audio Decoder & Ingestion<br>(Load Waveform Once)"]
    
    subgraph AudioFeatures Layer (DSP Output)
        Tempo["Tempo & BPM<br>(Onset strength envelope)"]
        Energy["RMS Energy & ZCR<br>(Envelope dynamics)"]
        Spectral["Spectral Attributes<br>(Centroid, Bandwidth, Rolloff, Contrast)"]
        Timbral["Timbre Features<br>(13 MFCC Means)"]
        Chroma["Harmonic Features<br>(12 Chroma STFT Means)"]
        HPSS["HPSS Separator<br>(Normalized energies)"]
        Silence["Silence Ratio<br>(Low energy percentage)"]
    end
    
    subgraph Music DNA Compiler (Semantic Layer)
        Semantic["Semantic Attributes<br>(Energy, Danceability, Valence, Acousticness, Instrumentalness, Speechiness)"]
        Mood["CNN Mood Classifier<br>(Valence-Arousal Grid)"]
        Genre["CNN Genre Classifier<br>(Multi-label probability)"]
        Struct["Structural Segmenter<br>(Intro / Verse / Chorus / Outro)"]
    end
    
    subgraph Music Genome Layer (Embedding Layer)
        Embed["Genome Embedding<br>(128D Latent Vector)"]
    end
    
    Audio --> Decoder
    Decoder --> Tempo
    Decoder --> Energy
    Decoder --> Spectral
    Decoder --> Timbral
    Decoder --> Chroma
    Decoder --> HPSS
    Decoder --> Silence
    
    Tempo & Energy & Spectral & Timbral & Chroma & HPSS & Silence --> Semantic
    Tempo & Energy & Spectral & Timbral & Chroma & HPSS & Silence --> Mood
    Tempo & Energy & Spectral & Timbral & Chroma & HPSS & Silence --> Genre
    Tempo & Energy & Spectral & Timbral & Chroma & HPSS & Silence --> Struct
    
    Semantic & Mood & Genre & Struct --> Embed
```

---

## ML Development Stages

### Stage 1 — Audio Preprocessing & Feature Extraction (Complete)
Establish the digital signal processing (DSP) foundations and extract the physical `AudioFeatures` parameter set.

*(Note: Preprocessing, modular single-load DSP extraction, and advanced features including MFCCs, Chroma, Contrast, HPSS, and Silence ratios are completed. These are structured under the AudioFeatures layer as inputs for Stage 2 classifiers).*

#### 1. Audio Preprocessing Pipeline
- **Format Decoding**: Convert compressed formats (MP3, FLAC, M4A) into raw floating-point arrays.
- **Downsampling**: Resample all incoming audio streams to a standardized sampling rate of **22,050 Hz** (sufficient to capture frequencies up to 11,025 Hz, preserving core musical information while reducing compute footprint by 50%).
- **Channel Downmixing**: Merge stereo channels into a single mono channel to simplify spatial audio variances.
- **Chunk Segmentation**: Segment audio arrays into sliding windows (e.g. 3-second frames with 50% overlap) to prepare inputs for time-series modeling.

#### 2. Feature Extraction Algorithms (Librosa)
- **Mel-Frequency Spectrograms**: Map short-time Fourier transform amplitudes to the logarithmic Mel scale, matching human hearing sensitivity.
- **Mel-Frequency Cepstral Coefficients (MFCCs)**: Extract 13 to 20 coefficients to capture timbral envelopes and vocal characteristics.
- **Chromagrams (Chroma STFT)**: Project spectral energy onto the 12 semitone bins of the octave to analyze harmonic composition.
- **Root-Mean-Square Energy (RMSE)**: Track overall envelope dynamics and volume changes.

#### 3. Core Genre Classifier
- **Model Architecture**: 2D Convolutional Neural Network (CNN) trained on Mel-spectrogram images.
- **Output Layer**: Multi-label classifier with Softmax/Sigmoid activation yielding confidence values across primary genres (e.g., Electronic, Rock, Jazz, Classical).

---

### Stage 2 — High-Level Musicality & Music DNA
Extract musical and emotional descriptors to construct the structured semantic profile of a track.

#### 1. Mood & Valence-Arousal Classifier
- **Model Framework**: Two-axis regression network mapping audio features to the Valence (positivity) and Arousal (energy) emotional scale.
- **Output Labels**: Map 2D coordinate placements to mood categories (e.g., high-arousal/low-valence maps to "Aggressive"; high-arousal/high-valence maps to "Energetic").

#### 2. Temporal & Harmonic Extraction
- **Tempo Estimation (BPM)**: Compute onset strength envelopes and calculate autocorrelation peaks to identify average tempo.
- **Harmonic Key Detection**: Extract chromagram vectors, average them over time, and correlate the resulting profile with Krumhansl-Schmuckler key profile templates to identify root keys (e.g., C Major, A Minor).

#### 3. DNA Serialization
- **Compilation Service**: Aggregate the classifier outputs, key profiles, and tempo metrics into a clean, serialized JSON profile (Music DNA) and write it to the PostgreSQL database.

---

### Stage 3 — Latent Representation & Similarity
Extract low-dimensional representations to create comparison and recommendation spaces.

#### 1. Song Embeddings
- **Mechanism**: Rather than predicting class labels, extract the outputs of the bottleneck layer (the last fully connected layer prior to the classification head) of the CNN models.
- **Dimensionality**: Target a dense **128-dimensional float vector** containing abstract acoustic features.

#### 2. Similarity Metric
- **Cosine Similarity**: Calculate the geometric angle between embedding vectors:
  $$\text{Similarity}(A, B) = \cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$$
- **Harmonic Filtering**: Combine vector similarity calculations with key metadata to ensure recommendations are in compatible keys.

#### 3. Nearest-Neighbor Indexing
- **Database Search**: Query the database using cosine similarity bounds to locate the top $N$ closest audio vectors to a target song.

---

### Stage 4 — Music Genome & Semantic Interaction
Integrate vector query architectures and build natural language search frameworks.

#### 1. Music Genome Integration
- **pgvector Database Configuration**: Initialize vector indexing structures (HNSW - Hierarchical Navigable Small World graphs) in the database to scale vector search searches to millions of files.

#### 2. Explainable AI (XAI)
- **Feature Attribution Mapping**: Implement SHAP (SHapley Additive exPlanations) or LIME methodologies on the CNN models to explain *why* the model grouped two songs together. The system translates these attributions into user-friendly explanations (e.g. "Shared frequency peaks in the 200Hz - 500Hz range").

#### 3. Contrastive Language-Audio Pre-training (CLAP)
- **Search by Feeling Pipeline**: Map text queries and audio files into a shared vector space. The system encodes text search queries (e.g., "slow piano on a rainy afternoon") using a text encoder (Sentence-BERT) and finds tracks with matching audio embeddings.

```
                  [Text Input] ---> Text Encoder (S-BERT) ---\
                                                             ---> [Cosine Similarity]
  [Raw Audio] ---> Audio Encoder (CNN Bottleneck) -----------/
```

#### 4. Conversational Assistant Integration
- **LLM Interface**: Connect a Large Language Model to the MusicSense backend APIs, allowing the LLM to write structured database queries based on conversational user inputs.
