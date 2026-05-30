import os
import csv
import numpy as np

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets", "audio")
FEATURES_DIR = os.path.join(DATASET_DIR, "mfcc_features")
LABELS_CSV = os.path.join(DATASET_DIR, "labels.csv")

# Constants matching the backend model expectations
MAX_AUDIO_LENGTH = 100
MFCC_BANDS = 13

def ensure_directories():
    os.makedirs(FEATURES_DIR, exist_ok=True)

def generate_synthetic_mfcc(is_native: bool) -> np.ndarray:
    """
    Generates a synthetic MFCC matrix of shape (MAX_AUDIO_LENGTH, MFCC_BANDS, 1).
    Native speakers have smoother transitions, learners have more noise/hesitation.
    """
    base_mfcc = np.sin(np.linspace(0, 10, MAX_AUDIO_LENGTH))[:, np.newaxis] * np.ones((1, MFCC_BANDS))
    
    if is_native:
        # Smooth and clear
        noise = np.random.normal(0, 0.1, (MAX_AUDIO_LENGTH, MFCC_BANDS))
    else:
        # Higher variance, hesitations
        noise = np.random.normal(0, 0.8, (MAX_AUDIO_LENGTH, MFCC_BANDS))
        
    mfcc = base_mfcc + noise
    
    # Keras Conv2D expects shape (time_steps, features, channels)
    return np.expand_dims(mfcc, axis=-1)

def generate_audio_dataset(num_samples=100):
    print(f"Generating Synthetic Audio (MFCC) Dataset with {num_samples} samples...")
    ensure_directories()
    
    labels_data = []
    
    for i in range(num_samples):
        # 50% chance of being "native" (score 90-100) vs "learner" (score 40-80)
        is_native = np.random.rand() > 0.5
        fluency_score = np.random.randint(90, 101) if is_native else np.random.randint(40, 85)
        
        mfcc = generate_synthetic_mfcc(is_native)
        
        # Save feature vector as .npy
        filename = f"audio_feat_{i:05d}.npy"
        filepath = os.path.join(FEATURES_DIR, filename)
        np.save(filepath, mfcc)
        
        # In a real scenario, text would be aligned. Using dummy text here.
        text = "안녕하세요" if is_native else "안..녕..하..세..요"
        labels_data.append([filename, fluency_score, text])
        
        if (i+1) % 20 == 0:
            print(f"Generated {i+1}/{num_samples} MFCC features...")

    # Write CSV
    with open(LABELS_CSV, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["filename", "fluency_score", "text"])
        writer.writerows(labels_data)
        
    print(f"Audio Dataset generated successfully at: {DATASET_DIR}")
    print(f"Total Samples: {num_samples}")

if __name__ == "__main__":
    generate_audio_dataset(num_samples=100)
