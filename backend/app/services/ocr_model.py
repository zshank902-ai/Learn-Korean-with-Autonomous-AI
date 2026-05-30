import tensorflow as tf
from tensorflow.keras import layers, models

def build_ocr_model(img_width=256, img_height=64, max_label_len=32, num_chars=1200):
    """
    Principal Multimodal Engineer: Strict CRNN Architecture for Korean OCR.
    Backbone: CNN (Spatial) -> RNN (Sequential) -> CTC (Classification).
    """
    
    # 1. Input Layer
    input_img = layers.Input(shape=(img_width, img_height, 1), name="image", dtype="float32")
    
    # 2. CNN Backbone (Downsampling & Feature Extraction)
    # Block 1
    x = layers.Conv2D(32, (3, 3), activation="relu", padding="same", name="Conv1")(input_img)
    x = layers.MaxPooling2D((2, 2), name="pool1")(x)
    
    # Block 2
    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="Conv2")(x)
    x = layers.MaxPooling2D((2, 2), name="pool2")(x)
    
    # Block 3
    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="Conv3")(x)
    x = layers.MaxPooling2D((1, 2), name="pool3")(x) # Selective downsampling for width
    
    # 3. Reshape for RNN (Bridging Spatial to Sequential)
    # We collapse the height dimension to treat width as time steps
    new_shape = ((img_width // 4), (img_height // 8) * 128)
    x = layers.Reshape(target_shape=new_shape, name="reshape")(x)
    x = layers.Dense(64, activation="relu", name="dense1")(x)
    x = layers.Dropout(0.2)(x)
    
    # 4. RNN Layers (Bidirectional LSTM for Syllable Context)
    x = layers.Bidirectional(layers.LSTM(128, return_sequences=True, dropout=0.25))(x)
    x = layers.Bidirectional(layers.LSTM(64, return_sequences=True, dropout=0.25))(x)
    
    # 5. Output Layer (Softmax over Character Vocabulary)
    # num_chars should match the unique Hangul syllables supported
    output = layers.Dense(num_chars + 1, activation="softmax", name="dense2")(x)
    
    # 6. Final Model
    model = models.Model(inputs=input_img, outputs=output, name="ocr_model_v1")
    
    return model

# Mock initialization to verify structure
if __name__ == "__main__":
    ocr_model = build_ocr_model()
    ocr_model.summary()
