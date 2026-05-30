import os

def build_audio_scorer_model(input_shape=(128, 128, 1)):
    if os.environ.get("RENDER"): return "mock"
    
    import tensorflow as tf
    from tensorflow.keras import layers, models
    """
    Principal Multimodal Engineer: Pronunciation Embedding Model.
    Designed to extract acoustic signatures from Mel-Spectrograms.
    Architecture: CNN Feature Extractor -> Global Pooling -> Embedding Space.
    """
    
    # 1. Input Layer (Expecting Mel-Spectrogram)
    input_audio = layers.Input(shape=input_shape, name="audio_input")
    
    # 2. Convolutional Feature Extraction (2D CNNs for Spectrogram analysis)
    # Block 1: Captures low-level acoustic patterns
    x = layers.Conv2D(32, (3, 3), activation="relu", padding="same", name="Audio_Conv1")(input_audio)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    # Block 2: Captures phoneme-level variations
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="Audio_Conv2")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    # Block 3: High-level sequence patterns
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="Audio_Conv3")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((4, 4))(x)
    
    # 3. Aggregation (Making the model length-invariant)
    # GlobalAveragePooling allows us to process audio of different durations
    x = layers.GlobalAveragePooling2D(name="Global_Avg_Pool")(x)
    
    # 4. Embedding Layer (The "Acoustic Signature")
    # This 256-dim vector will be compared using Cosine Similarity
    embedding = layers.Dense(256, activation="linear", name="Acoustic_Embedding")(x)
    
    # 5. Final Model
    model = models.Model(inputs=input_audio, outputs=embedding, name="audio_scorer_v1")
    
    return model

# Verification of Model Parameters
if __name__ == "__main__":
    audio_model = build_audio_scorer_model()
    audio_model.summary()
