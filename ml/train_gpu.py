"""
OcuScan AI - GPU Training Script (Google Colab / WSL2)
Architecture: EfficientNetB3 (upgraded from B0 for GPU)
Run this on Google Colab or WSL2 with GPU for maximum accuracy.

=== INSTRUCTIONS ===
1. Upload your dataset/ folder to Google Drive
2. Open this script in Google Colab
3. Select Runtime > Change runtime type > GPU (T4)
4. Run all cells
5. Download the generated model file back to ml/ folder
"""

import os
import json
import numpy as np

# --- CONFIGURATION ---
# If running on Colab, mount Google Drive and set this path:
# from google.colab import drive
# drive.mount('/content/drive')
# DATASET_DIR = '/content/drive/MyDrive/eye-disease-detection/dataset'

# If running locally (WSL2 or native Linux with GPU):
DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dataset')

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'eye_disease_model.keras')
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, 'class_names.json')

IMG_SIZE = 300          # Larger input = more detail (GPU can handle this)
BATCH_SIZE = 16         # Smaller batch for 4GB VRAM
EPOCHS = 50             # More epochs since GPU is fast
FINE_TUNE_EPOCHS = 30   # Additional fine-tuning epochs

import tensorflow as tf
print(f"TensorFlow version: {tf.__version__}")
print(f"GPU available: {tf.config.list_physical_devices('GPU')}")

# Enable mixed precision for faster training on RTX cards
try:
    tf.keras.mixed_precision.set_global_policy('mixed_float16')
    print("Mixed precision enabled (float16)")
except:
    print("Mixed precision not available, using float32")

from tensorflow import keras
from keras.applications import EfficientNetB3
from keras.models import Model
from keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# --- DATASET LOADING ---
print(f"\nLoading dataset from: {DATASET_DIR}")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical',
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical',
)

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"Classes: {class_names}")

# Save class names
with open(CLASS_NAMES_PATH, 'w') as f:
    json.dump(class_names, f)

# --- CLASS WEIGHTS ---
def compute_class_weights(dataset_dir, class_names):
    counts = {}
    total = 0
    for c in class_names:
        count = len([f for f in os.listdir(os.path.join(dataset_dir, c)) 
                     if os.path.isfile(os.path.join(dataset_dir, c, f))])
        counts[c] = count
        total += count
    weights = {}
    for i, name in enumerate(class_names):
        weights[i] = total / (len(class_names) * float(counts[name]))
    return weights

cls_weights = compute_class_weights(DATASET_DIR, class_names)
print(f"Class weights: {cls_weights}")

# --- DATA AUGMENTATION ---
data_augmentation = keras.Sequential([
    keras.layers.RandomFlip("horizontal_and_vertical"),
    keras.layers.RandomRotation(0.25),
    keras.layers.RandomZoom(0.2),
    keras.layers.RandomContrast(0.2),
    keras.layers.RandomTranslation(0.1, 0.1),
    keras.layers.RandomBrightness(0.15),
])

# EfficientNet expects [0, 255] - no rescaling needed
train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y),
    num_parallel_calls=tf.data.AUTOTUNE
)
train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

# ============================
# PHASE 1: Train the head only
# ============================
print("\n" + "=" * 60)
print("PHASE 1: Training classification head (base frozen)")
print("=" * 60)

base = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
base.trainable = False  # Freeze entire base

x = base.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.4)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
out = Dense(num_classes, activation='softmax', dtype='float32')(x)  # float32 output for mixed precision

model = Model(inputs=base.input, outputs=out)

model.compile(
    optimizer=Adam(learning_rate=1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"Model parameters: {model.count_params():,}")
print(f"Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")

callbacks_phase1 = [
    EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=1)
]

history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks_phase1,
    class_weight=cls_weights
)

phase1_loss, phase1_acc = model.evaluate(val_ds)
print(f"\nPhase 1 Validation Accuracy: {phase1_acc:.4f}")

# ====================================
# PHASE 2: Fine-tune top layers of base
# ====================================
print("\n" + "=" * 60)
print("PHASE 2: Fine-tuning top layers of EfficientNetB3")
print("=" * 60)

# Unfreeze the top 80 layers
base.trainable = True
for layer in base.layers[:-80]:
    layer.trainable = False

# Keep BatchNorm layers frozen to preserve running mean/variance
for layer in base.layers:
    if isinstance(layer, keras.layers.BatchNormalization):
        layer.trainable = False

# Recompile with a much lower learning rate
model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

trainable_count = sum([tf.size(w).numpy() for w in model.trainable_weights])
print(f"Trainable parameters after unfreezing: {trainable_count:,}")

callbacks_phase2 = [
    EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1),
    ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3, min_lr=1e-7, verbose=1)
]

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=callbacks_phase2,
    class_weight=cls_weights
)

# ============================
# FINAL EVALUATION
# ============================
print("\n" + "=" * 60)
print("FINAL EVALUATION")
print("=" * 60)

val_loss, val_acc = model.evaluate(val_ds)
print(f"\n✅ Final Validation Accuracy: {val_acc:.4f} ({val_acc*100:.1f}%)")
print(f"📦 Model saved to: {MODEL_PATH}")

# Per-class accuracy
print("\n--- Per-Class Accuracy ---")
all_preds = []
all_labels = []
for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    all_preds.extend(np.argmax(preds, axis=1))
    all_labels.extend(np.argmax(labels.numpy(), axis=1))

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)

for i, name in enumerate(class_names):
    mask = all_labels == i
    if mask.sum() > 0:
        class_acc = (all_preds[mask] == i).mean()
        print(f"  {name:25s}: {class_acc:.4f} ({class_acc*100:.1f}%)")

overall = (all_preds == all_labels).mean()
print(f"\n  {'Overall':25s}: {overall:.4f} ({overall*100:.1f}%)")
print("=" * 60)
