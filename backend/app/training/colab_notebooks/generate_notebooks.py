import os
import nbformat as nbf

NOTEBOOK_DIR = os.path.dirname(__file__)

def create_ocr_notebook():
    nb = nbf.v4.new_notebook()
    
    nb['cells'] = [
        nbf.v4.new_markdown_cell("# K-Mastery: OCR CRNN Training Notebook\n\nThis notebook trains a CRNN (Convolutional Recurrent Neural Network) on the synthetic OCR dataset to recognize Korean handwriting/signage."),
        nbf.v4.new_code_cell("!pip install tensorflow keras matplotlib pillow"),
        nbf.v4.new_markdown_cell("## 1. Upload Dataset\nUpload the `ocr_dataset.zip` generated locally to Colab's workspace and unzip it."),
        nbf.v4.new_code_cell("""
import zipfile
import os

# Assuming ocr_dataset.zip is uploaded to the root dir
if os.path.exists('/content/ocr_dataset.zip'):
    with zipfile.ZipFile('/content/ocr_dataset.zip', 'r') as zip_ref:
        zip_ref.extractall('/content/dataset/')
    print("Dataset extracted!")
else:
    print("Please upload ocr_dataset.zip using the file browser on the left.")
"""),
        nbf.v4.new_markdown_cell("## 2. Define CRNN Model Architecture"),
        nbf.v4.new_code_cell("""
import tensorflow as tf
from tensorflow.keras import layers, Model

def build_crnn_model(img_width=256, img_height=64, num_classes=1000):
    # Input shape
    input_img = layers.Input(shape=(img_width, img_height, 1), name="image", dtype="float32")
    
    # Convolutional layers
    x = layers.Conv2D(32, (3, 3), activation="relu", padding="same", name="Conv1")(input_img)
    x = layers.MaxPooling2D((2, 2), name="pool1")(x)
    
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="Conv2")(x)
    x = layers.MaxPooling2D((2, 2), name="pool2")(x)
    
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="Conv3")(x)
    x = layers.MaxPooling2D((2, 1), name="pool3")(x)
    
    # Reshape for RNN
    new_shape = ((img_width // 8), (img_height // 4) * 128)
    x = layers.Reshape(target_shape=new_shape, name="reshape")(x)
    x = layers.Dense(64, activation="relu", name="dense1")(x)
    
    # RNNs
    x = layers.Bidirectional(layers.LSTM(128, return_sequences=True, dropout=0.25))(x)
    x = layers.Bidirectional(layers.LSTM(64, return_sequences=True, dropout=0.25))(x)
    
    # Output layer
    output = layers.Dense(num_classes + 1, activation="softmax", name="dense2")(x)
    
    model = Model(inputs=input_img, outputs=output, name="ocr_model_v1")
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model

model = build_crnn_model()
model.summary()
"""),
        nbf.v4.new_markdown_cell("## 3. Train and Export\nRun your training loop using the dataset, then export the weights to `.h5`."),
        nbf.v4.new_code_cell("""
# model.fit(...)
# After training, save the weights:
model.save_weights('/content/ocr_weights.h5')
print("Model weights saved to ocr_weights.h5. Download this file and place it in the backend/models directory.")
""")
    ]
    
    with open(os.path.join(NOTEBOOK_DIR, 'K_Mastery_OCR_Training.ipynb'), 'w', encoding='utf-8') as f:
        nbf.write(nb, f)
    print("Created OCR Notebook.")

def create_audio_notebook():
    nb = nbf.v4.new_notebook()
    
    nb['cells'] = [
        nbf.v4.new_markdown_cell("# K-Mastery: Audio Fluency Scoring Training Notebook\n\nTrains a 2D CNN on MFCC audio features to predict Korean speaking fluency scores (0-100)."),
        nbf.v4.new_code_cell("!pip install tensorflow keras librosa numpy pandas"),
        nbf.v4.new_markdown_cell("## 1. Load Dataset"),
        nbf.v4.new_code_cell("""
import zipfile
import os
import numpy as np
import pandas as pd

# Load synthetic MFCC data
# In production, use librosa.feature.mfcc on real .wav files
if os.path.exists('/content/audio_dataset.zip'):
    with zipfile.ZipFile('/content/audio_dataset.zip', 'r') as zip_ref:
        zip_ref.extractall('/content/audio/')
"""),
        nbf.v4.new_markdown_cell("## 2. Define CNN Architecture"),
        nbf.v4.new_code_cell("""
import tensorflow as tf
from tensorflow.keras import layers, Model

def build_fluency_model(input_shape=(100, 13, 1)):
    inputs = layers.Input(shape=input_shape)
    
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.Flatten()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    
    # Regression output (0-100 score)
    outputs = layers.Dense(1, activation='linear')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

model = build_fluency_model()
model.summary()
"""),
        nbf.v4.new_markdown_cell("## 3. Train and Export"),
        nbf.v4.new_code_cell("""
# model.fit(...)
# After training, save the weights:
model.save_weights('/content/audio_fluency_weights.h5')
print("Model weights saved. Download and place in backend/models.")
""")
    ]
    
    with open(os.path.join(NOTEBOOK_DIR, 'K_Mastery_Audio_Fluency_Training.ipynb'), 'w', encoding='utf-8') as f:
        nbf.write(nb, f)
    print("Created Audio Notebook.")

if __name__ == "__main__":
    os.makedirs(NOTEBOOK_DIR, exist_ok=True)
    create_ocr_notebook()
    create_audio_notebook()
    print("Notebook generation complete!")
