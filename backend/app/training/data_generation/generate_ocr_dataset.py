import os
import csv
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import urllib.request

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets", "ocr")
IMAGES_DIR = os.path.join(DATASET_DIR, "images")
LABELS_CSV = os.path.join(DATASET_DIR, "labels.csv")

IMG_WIDTH = 256
IMG_HEIGHT = 64

# A small subset of Korean vocabulary for demonstration. 
# In production, this would read from a massive HuggingFace ko_wikitext text dump.
SAMPLE_TEXTS = [
    "안녕하세요", "한국어", "어렵지 않아요", "케이 마스터리", 
    "부산역", "지하철 타는 곳", "김치찌개", "비빔밥", "할인 행사", 
    "환영합니다", "조심하세요", "출구", "입구", "화장실", "병원"
]

def ensure_directories():
    os.makedirs(IMAGES_DIR, exist_ok=True)

def download_korean_font():
    """Downloads an open-source Google Noto Sans Korean font if not present."""
    font_path = os.path.join(DATASET_DIR, "NotoSansKR-Regular.ttf")
    if not os.path.exists(font_path):
        print("Downloading Noto Sans KR Font...")
        url = "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf"
        try:
            urllib.request.urlretrieve(url, font_path)
            print("Font downloaded successfully.")
        except Exception as e:
            print(f"Failed to download font: {e}. Falling back to default system font (might cause tofu boxes).")
            return None
    return font_path

def apply_augmentations(img: Image) -> Image:
    """Applies realistic noise and slight rotations to mimic real-world signage."""
    # 1. Slight Rotation (-2 to 2 degrees)
    angle = random.uniform(-2, 2)
    img = img.rotate(angle, resample=Image.BILINEAR, fillcolor="white")
    
    # 2. Gaussian Blur (simulating camera out-of-focus)
    if random.random() > 0.5:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))
        
    # 3. Add random noise
    img_array = np.array(img)
    noise = np.random.randint(0, 30, img_array.shape, dtype='uint8')
    img_array = np.clip(img_array - noise, 0, 255).astype('uint8')
    
    return Image.fromarray(img_array)

def generate_image(text: str, filename: str, font_path: str):
    """Renders text into a 256x64 grayscale image."""
    # Create white canvas (Grayscale 'L' mode)
    img = Image.new("L", (IMG_WIDTH, IMG_HEIGHT), color="white")
    draw = ImageDraw.Draw(img)
    
    # Try loading the font, scale it down slightly
    try:
        font = ImageFont.truetype(font_path, size=32)
    except:
        font = ImageFont.load_default()

    # Calculate text bounding box to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (IMG_WIDTH - text_w) // 2
    y = (IMG_HEIGHT - text_h) // 2
    
    # Draw black text
    draw.text((x, y), text, fill="black", font=font)
    
    # Augment
    img = apply_augmentations(img)
    
    # Save
    filepath = os.path.join(IMAGES_DIR, filename)
    img.save(filepath)

def generate_dataset(num_samples=100):
    print(f"Generating OCR Dataset with {num_samples} samples...")
    ensure_directories()
    font_path = download_korean_font()
    
    labels_data = []
    
    for i in range(num_samples):
        # Pick a random text, potentially combining two for variety
        text = random.choice(SAMPLE_TEXTS)
        if random.random() > 0.7:
            text += " " + random.choice(SAMPLE_TEXTS)
            
        filename = f"sample_{i:05d}.png"
        generate_image(text, filename, font_path)
        labels_data.append([filename, text])
        
        if (i+1) % 20 == 0:
            print(f"Generated {i+1}/{num_samples} images...")

    # Write CSV
    with open(LABELS_CSV, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["filename", "text"])
        writer.writerows(labels_data)
        
    print(f"Dataset generated successfully at: {DATASET_DIR}")
    print(f"Total Images: {num_samples}")

if __name__ == "__main__":
    # Generate a small initial dataset for testing
    generate_dataset(num_samples=100)
