import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, roc_auc_score
import json

# Configuration
IMG_SIZE = 256
DATASET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dataset')
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'eye_disease_model.keras')

def benchmark():
    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print("Loading validation dataset...")
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=32,
        label_mode='categorical',
        shuffle=False
    )
    
    class_names = val_ds.class_names
    
    print("Running inference...")
    y_true = []
    y_pred_probs = []
    
    for images, labels in val_ds:
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        preds = model.predict(images, verbose=0)
        y_pred_probs.extend(preds)
        
    y_true = np.array(y_true)
    y_pred_probs = np.array(y_pred_probs)
    y_pred = np.argmax(y_pred_probs, axis=1)
    
    print("\n" + "="*40)
    print("OcuScan AI - Model Performance Metrics")
    print("="*40)
    
    # Classification Report (Precision, Recall, F1)
    report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    
    # ROC-AUC (One-vs-Rest)
    # We specify labels to handle cases where some classes might be missing in the validation slice
    labels = list(range(len(class_names)))
    auc = roc_auc_score(y_true, y_pred_probs, multi_class='ovr', average='weighted', labels=labels)
    
    results = {
        "Accuracy": report['accuracy'],
        "Precision (Weighted)": report['weighted avg']['precision'],
        "Recall (Weighted)": report['weighted avg']['recall'],
        "F1-Score (Weighted)": report['weighted avg']['f1-score'],
        "ROC-AUC (Weighted)": auc,
        "Per-Class": {
            name: {
                "Precision": report[name]['precision'],
                "Recall": report[name]['recall'],
                "F1-Score": report[name]['f1-score']
            } for name in class_names
        }
    }
    
    print(json.dumps(results, indent=4))
    
    # Save to file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'metrics.json'), 'w') as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    try:
        benchmark()
    except Exception as e:
        print(f"Error during benchmarking: {e}")
