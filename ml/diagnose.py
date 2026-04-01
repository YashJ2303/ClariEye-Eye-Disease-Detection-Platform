"""
OcuScan AI - Diagnostic Script
Tests the saved model against known images to verify accuracy.
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import json
import numpy as np
from PIL import Image
import keras
import tensorflow as tf

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(MODEL_DIR, 'eye_disease_model.keras')
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, 'class_names.json')
DATASET_DIR = os.path.join(MODEL_DIR, '..', 'dataset')
IMG_SIZE = 256

print("=" * 60)
print("OcuScan AI - Model Diagnostic")
print("=" * 60)

# Load model and class names
print(f"\nLoading model from: {MODEL_PATH}")
model = keras.models.load_model(MODEL_PATH)
with open(CLASS_NAMES_PATH) as f:
    class_names = json.load(f)
print(f"Classes: {class_names}")

# --- Test 1: Evaluate on full validation set (same as training) ---
print("\n--- Test 1: Full Validation Set Evaluation ---")
val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=1337,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=32,
    label_mode='categorical',
)
val_loss, val_acc = model.evaluate(val_ds, verbose=1)
print(f"Validation Accuracy: {val_acc:.4f}")
print(f"Validation Loss:     {val_loss:.4f}")

# --- Test 2: Individual image predictions using PIL (same as serve.py) ---
print("\n--- Test 2: Individual Image Predictions (PIL path, like serve.py) ---")
test_images = {}
for cls in class_names:
    cls_dir = os.path.join(DATASET_DIR, cls)
    files = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    # Pick first 3 images from each class
    test_images[cls] = [os.path.join(cls_dir, f) for f in files[:3]]

correct = 0
total = 0
for true_class, paths in test_images.items():
    for p in paths:
        img = Image.open(p).convert('RGB')
        img = img.resize((IMG_SIZE, IMG_SIZE))
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        
        pred = model.predict(img_array, verbose=0)[0]
        pred_idx = int(np.argmax(pred))
        pred_class = class_names[pred_idx]
        conf = float(pred[pred_idx])
        
        match = "✅" if pred_class == true_class else "❌"
        if pred_class == true_class:
            correct += 1
        total += 1
        
        print(f"  {match} {os.path.basename(p):30s} | True: {true_class:25s} | Pred: {pred_class:25s} | Conf: {conf:.2f}")

print(f"\nPIL-based accuracy: {correct}/{total} = {correct/total*100:.1f}%")

# --- Test 3: Compare TF dataset loading vs PIL loading for same image ---
print("\n--- Test 3: TF vs PIL Preprocessing Comparison ---")
sample_path = test_images[class_names[0]][0]
print(f"Sample image: {sample_path}")

# PIL method
pil_img = Image.open(sample_path).convert('RGB').resize((IMG_SIZE, IMG_SIZE))
pil_array = np.array(pil_img, dtype=np.float32)
print(f"  PIL  -> min: {pil_array.min():.1f}, max: {pil_array.max():.1f}, mean: {pil_array.mean():.1f}, dtype: {pil_array.dtype}")

# TF method (what image_dataset_from_directory produces)
tf_img = tf.io.read_file(sample_path)
tf_img = tf.image.decode_image(tf_img, channels=3)
tf_img = tf.image.resize(tf_img, [IMG_SIZE, IMG_SIZE])
tf_array = tf_img.numpy()
print(f"  TF   -> min: {tf_array.min():.1f}, max: {tf_array.max():.1f}, mean: {tf_array.mean():.1f}, dtype: {tf_array.dtype}")

# Predict with both
pil_pred = model.predict(np.expand_dims(pil_array, 0), verbose=0)[0]
tf_pred = model.predict(np.expand_dims(tf_array, 0), verbose=0)[0]
print(f"  PIL pred: {list(zip(class_names, [f'{p:.3f}' for p in pil_pred]))}")
print(f"  TF  pred: {list(zip(class_names, [f'{p:.3f}' for p in tf_pred]))}")

print("\n" + "=" * 60)
print("Diagnostic complete.")
