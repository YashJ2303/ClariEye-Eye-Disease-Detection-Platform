"""
OcuScan AI - Train Eye Disease Detection Model
Architecture: EfficientNetB0
Description: Retrains with deeper fine-tuning (top 60 layers unfreezing),
             enhanced data augmentation, and class weighting to maximize 
             accuracy on retinal medical imagery.
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import json
import numpy as np
import keras
from keras.applications import EfficientNetB0
from keras.models import Model
from keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from keras.optimizers import Adam
from keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import tensorflow as tf

# Config
IMG_SIZE = 256
BATCH_SIZE = 32
EPOCHS = 35
DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dataset')
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'eye_disease_model.keras')

def compute_class_weights(dataset_dir, class_names):
    """Calculates class weights to handle slight imbalances."""
    counts = {}
    total = 0
    for c in class_names:
        count = len([f for f in os.listdir(os.path.join(dataset_dir, c)) if os.path.isfile(os.path.join(dataset_dir, c, f))])
        counts[c] = count
        total += count
    
    weights = {}
    num_classes = len(class_names)
    for i, name in enumerate(class_names):
        weights[i] = total / (num_classes * float(counts[name]))
    
    return weights

def create_model(num_classes=4):
    """Builds EfficientNetB0 with the top layers unfrozen."""
    base = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Freeze the bottom ~178 layers and leave the top ~60 layers trainable
    # This captures complex eye textures better than freezing entirely
    for layer in base.layers[:-60]:
        layer.trainable = False
        
    for layer in base.layers[-60:]:
        # Keep BatchNormalization layers frozen usually to retain ImageNet moving variance stats, 
        # but the Dense/Conv2D layers will update.
        if isinstance(layer, keras.layers.BatchNormalization):
            layer.trainable = False
        else:
            layer.trainable = True
            
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    out = Dense(num_classes, activation='softmax')(x)
    
    return Model(inputs=base.input, outputs=out)

# Enhanced data augmentation tailored for varying medical image qualities
data_augmentation = keras.Sequential([
    keras.layers.RandomFlip("horizontal_and_vertical"),
    keras.layers.RandomRotation(0.2),         # 72 degrees max
    keras.layers.RandomZoom(0.2),             # More zoom to catch crops
    keras.layers.RandomContrast(0.2),         # Contrast shifts for different fundus lighting
    keras.layers.RandomTranslation(0.1, 0.1), # Slight panning
])

def train():
    print("=" * 60)
    print("OcuScan AI - High-Accuracy Model Training (EfficientNetB0)")
    print("=" * 60)
    
    print(f"\nLoading dataset from: {DATASET_DIR}")
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=1337,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode='categorical',
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode='categorical',
    )
    
    class_names = train_ds.class_names
    print(f"Classes: {class_names}")
    
    # Calculate weights
    cls_weights = compute_class_weights(DATASET_DIR, class_names)
    print(f"Computed Class Weights: {cls_weights}")
    
    with open(os.path.join(MODEL_DIR, 'class_names.json'), 'w') as f:
        json.dump(class_names, f)
    
    # EfficientNet expects [0, 255] native RGB pixels, no rescaling required!
    # Just apply the augmentation layer for training
    train_ds = train_ds.map(lambda x, y: (data_augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    
    # Prefetch
    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)
    
    model = create_model(num_classes=len(class_names))
    
    # Lower base LR for fine-tuning deep layers
    model.compile(
        optimizer=Adam(learning_rate=5e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"\nModel parameters: {model.count_params():,}")
    
    callbacks = [
        EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1),
        ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3, min_lr=1e-7, verbose=1)
    ]
    
    print("\nStarting Training Pipeline...\n")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
        class_weight=cls_weights
    )
    
    val_loss, val_acc = model.evaluate(val_ds)
    print(f"\n{'=' * 50}")
    print(f"✅ Final Validation Accuracy: {val_acc:.4f}")
    print(f"📦 Model strategically saved to: {MODEL_PATH}")
    print(f"{'=' * 50}")

if __name__ == '__main__':
    train()
