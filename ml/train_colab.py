# ============================================================
# OcuScan AI - Google Colab GPU Training Notebook
# ============================================================
# INSTRUCTIONS:
# 1. Zip your dataset/ folder and upload it to Google Drive
# 2. Open Google Colab: https://colab.research.google.com
# 3. Upload this file: File > Upload notebook > choose this .py
#    OR paste this code into a new Colab notebook
# 4. Runtime > Change Runtime Type > GPU (T4 Free)
# 5. Run all cells
# 6. Download the model from Google Drive when done
# ============================================================

# --- CELL 1: Mount Google Drive & Upload Dataset ---
from google.colab import drive
drive.mount('/content/drive')

import os
import zipfile

# Set your paths - CHANGE THESE if your file is named differently
DRIVE_PATH = '/content/drive/MyDrive'
DATASET_ZIP = os.path.join(DRIVE_PATH, 'dataset.zip')
DATASET_DIR = '/content/dataset'
OUTPUT_DIR = os.path.join(DRIVE_PATH, 'ocuscan_model')

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Extract dataset
if os.path.exists(DATASET_ZIP):
    print(f"Extracting {DATASET_ZIP}...")
    with zipfile.ZipFile(DATASET_ZIP, 'r') as z:
        z.extractall('/content/')
    print("Dataset extracted!")
elif os.path.exists(os.path.join(DRIVE_PATH, 'dataset')):
    DATASET_DIR = os.path.join(DRIVE_PATH, 'dataset')
    print(f"Using dataset folder directly from Drive: {DATASET_DIR}")
else:
    raise FileNotFoundError(
        "Dataset not found! Please either:\n"
        "  a) Upload 'dataset.zip' to the root of your Google Drive, OR\n"
        "  b) Upload a 'dataset/' folder to the root of your Google Drive\n"
        "The dataset folder should contain subfolders: cataract, diabetic_retinopathy, glaucoma, normal"
    )

# Verify dataset structure
for cls in ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']:
    cls_path = os.path.join(DATASET_DIR, cls)
    if os.path.exists(cls_path):
        count = len(os.listdir(cls_path))
        print(f"  {cls}: {count} images")
    else:
        print(f"  WARNING: {cls} folder not found!")

# --- CELL 2: Imports & GPU Check ---
import json
import numpy as np
import tensorflow as tf

print(f"\nTensorFlow version: {tf.__version__}")
gpus = tf.config.list_physical_devices('GPU')
print(f"GPUs available: {gpus}")
if gpus:
    print(f"GPU Name: {gpus[0].name}")
    # Prevent TF from allocating all GPU memory at once
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
else:
    print("WARNING: No GPU detected! Training will be slow.")

# Enable mixed precision for faster training
tf.keras.mixed_precision.set_global_policy('mixed_float16')
print("Mixed precision (float16) enabled for faster training")

from tensorflow import keras
from keras.applications import EfficientNetB3
from keras.models import Model
from keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

# --- CELL 3: Configuration ---
IMG_SIZE = 300
BATCH_SIZE = 16
HEAD_EPOCHS = 30
FINETUNE_EPOCHS = 40

MODEL_PATH = os.path.join(OUTPUT_DIR, 'eye_disease_model.keras')
CLASS_NAMES_PATH = os.path.join(OUTPUT_DIR, 'class_names.json')

# --- CELL 4: Load Dataset ---
print("Loading training data...")
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

with open(CLASS_NAMES_PATH, 'w') as f:
    json.dump(class_names, f)

# --- CELL 5: Class Weights ---
counts = {}
total = 0
for c in class_names:
    n = len(os.listdir(os.path.join(DATASET_DIR, c)))
    counts[c] = n
    total += n

cls_weights = {}
for i, name in enumerate(class_names):
    cls_weights[i] = total / (num_classes * float(counts[name]))
print(f"Class weights: {cls_weights}")

# --- CELL 6: Data Augmentation ---
data_augmentation = keras.Sequential([
    keras.layers.RandomFlip("horizontal_and_vertical"),
    keras.layers.RandomRotation(0.25),
    keras.layers.RandomZoom(0.2),
    keras.layers.RandomContrast(0.2),
    keras.layers.RandomTranslation(0.1, 0.1),
    keras.layers.RandomBrightness(0.15),
])

train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y),
    num_parallel_calls=tf.data.AUTOTUNE
)
train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

# ============================================================
# PHASE 1: Train classification head (base frozen)
# ============================================================
print("\n" + "=" * 60)
print("PHASE 1: Training classification head only")
print("=" * 60)

base = EfficientNetB3(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
base.trainable = False

x = base.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.4)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
out = Dense(num_classes, activation='softmax', dtype='float32')(x)

model = Model(inputs=base.input, outputs=out)
model.compile(optimizer=Adam(learning_rate=1e-3), loss='categorical_crossentropy', metrics=['accuracy'])

print(f"Total params: {model.count_params():,}")

history1 = model.fit(
    train_ds, validation_data=val_ds,
    epochs=HEAD_EPOCHS,
    callbacks=[
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=1)
    ],
    class_weight=cls_weights
)

p1_loss, p1_acc = model.evaluate(val_ds)
print(f"\nPhase 1 Accuracy: {p1_acc*100:.1f}%")

# ============================================================
# PHASE 2: Fine-tune top layers of EfficientNetB3
# ============================================================
print("\n" + "=" * 60)
print("PHASE 2: Fine-tuning EfficientNetB3 top layers")
print("=" * 60)

base.trainable = True
for layer in base.layers[:-80]:
    layer.trainable = False
for layer in base.layers:
    if isinstance(layer, keras.layers.BatchNormalization):
        layer.trainable = False

model.compile(optimizer=Adam(learning_rate=1e-5), loss='categorical_crossentropy', metrics=['accuracy'])

history2 = model.fit(
    train_ds, validation_data=val_ds,
    epochs=FINETUNE_EPOCHS,
    callbacks=[
        EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1),
        ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3, min_lr=1e-7, verbose=1)
    ],
    class_weight=cls_weights
)

# ============================================================
# FINAL RESULTS
# ============================================================
print("\n" + "=" * 60)
print("FINAL RESULTS")
print("=" * 60)

val_loss, val_acc = model.evaluate(val_ds)
print(f"\n✅ Final Validation Accuracy: {val_acc*100:.1f}%")

# Per-class accuracy
all_preds, all_labels = [], []
for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    all_preds.extend(np.argmax(preds, axis=1))
    all_labels.extend(np.argmax(labels.numpy(), axis=1))

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)

print("\nPer-Class Accuracy:")
for i, name in enumerate(class_names):
    mask = all_labels == i
    if mask.sum() > 0:
        acc = (all_preds[mask] == i).mean()
        print(f"  {name:25s}: {acc*100:.1f}%")

overall = (all_preds == all_labels).mean()
print(f"  {'OVERALL':25s}: {overall*100:.1f}%")

print(f"\n📦 Model saved to: {MODEL_PATH}")
print(f"📋 Class names saved to: {CLASS_NAMES_PATH}")
print(f"\nDownload these 2 files from your Google Drive 'ocuscan_model' folder")
print(f"and place them in your local ml/ directory to use with the app!")
print("=" * 60)
