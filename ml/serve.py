"""
OcuScan AI - FastAPI Inference Server
Loads trained model and serves predictions on port 8000.
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import io
import json
import base64
import numpy as np
from PIL import Image
import keras
import tensorflow as tf
import cv2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="OcuScan AI ML Server")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, 'eye_disease_model.keras')
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, 'class_names.json')
IMG_SIZE = 256  # Default, auto-detected from model at startup

# Display names mapping
DISPLAY_NAMES = {
    'cataract': 'Cataracts',
    'diabetic_retinopathy': 'Diabetic Retinopathy',
    'glaucoma': 'Glaucoma',
    'normal': 'Normal'
}

# Severity stage mapping based on confidence and clinical thresholds
def get_severity_stage(diagnosis, confidence):
    if diagnosis == 'Normal':
        return 'Healthy'
    
    if diagnosis == 'Diabetic Retinopathy':
        if confidence > 0.9: return 'Proliferative'
        if confidence > 0.75: return 'Severe Non-Proliferative'
        if confidence > 0.55: return 'Moderate'
        return 'Mild'
    
    if diagnosis == 'Glaucoma':
        if confidence > 0.85: return 'Advanced'
        if confidence > 0.65: return 'Moderate'
        return 'Early'
    
    if diagnosis == 'Cataracts':
        if confidence > 0.8: return 'Mature'
        if confidence > 0.6: return 'Immature'
        return 'Incipient'
    
    return 'Unclassified'

# Severity heuristic based on confidence (Legacy)
def get_severity(confidence, is_primary):
    if not is_primary:
        return 'none'
    if confidence > 0.85:
        return 'severe'
    elif confidence > 0.65:
        return 'moderate'
    elif confidence > 0.4:
        return 'mild'
    return 'none'

# Recommendations per disease
RECOMMENDATIONS = {
    'Cataracts': [
        "Consult with a cataract surgeon for evaluation",
        "Update prescription lenses as needed",
        "Use brighter lighting for reading and close work",
        "Wear UV-protective sunglasses outdoors"
    ],
    'Diabetic Retinopathy': [
        "See an ophthalmologist within 2 weeks",
        "Monitor and control blood sugar levels closely",
        "Get an HbA1c test to check long-term glucose levels",
        "Avoid smoking to reduce vascular complications"
    ],
    'Glaucoma': [
        "Schedule a comprehensive glaucoma screening",
        "Intraocular pressure (IOP) measurement recommended",
        "Visual field testing to assess peripheral vision",
        "Regular follow-up every 3-6 months"
    ],
    'Normal': [
        "Continue regular annual eye examinations",
        "Maintain a balanced diet rich in vitamins A and C",
        "Protect eyes from UV exposure",
        "Report any sudden changes in vision immediately"
    ]
}

DESCRIPTIONS = {
    'Cataracts': "Analysis indicates lens opacification consistent with cataract formation. Cortical and/or nuclear changes observed that may affect visual acuity.",
    'Diabetic Retinopathy': "Retinal analysis reveals features consistent with diabetic retinopathy, including potential microaneurysms, hemorrhages, or exudates in the retinal vasculature.",
    'Glaucoma': "Optic nerve head analysis suggests glaucomatous changes, including possible increased cup-to-disc ratio and neuroretinal rim thinning.",
    'Normal': "The retinal image appears within normal limits. No significant pathological features detected. Healthy optic disc and vascular patterns observed."
}

# Load model at startup
model = None
class_names = None

@app.on_event("startup")
def load_model():
    global model, class_names, IMG_SIZE
    if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_NAMES_PATH):
        print(f"Loading model from {MODEL_PATH}")
        model = keras.models.load_model(MODEL_PATH)
        # Auto-detect input size from model
        input_shape = model.input_shape
        if input_shape and len(input_shape) >= 3:
            IMG_SIZE = input_shape[1]
            print(f"Auto-detected IMG_SIZE: {IMG_SIZE}")
        with open(CLASS_NAMES_PATH) as f:
            class_names = json.load(f)
        print(f"Model loaded. Classes: {class_names}")
    else:
        print("WARNING: No trained model found. Train first with: python train.py")

def generate_grad_cam(img_array, model, class_index, img_original, colormap=cv2.COLORMAP_JET):
    # Find the top convolutional layer dynamically
    top_conv_layer = None
    for layer in reversed(model.layers):
        if isinstance(layer, keras.layers.Conv2D):
            top_conv_layer = layer
            break
    if not top_conv_layer:
        return None  # Fallback

    grad_model = keras.models.Model(
        [model.inputs], [top_conv_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        loss = preds[:, class_index]

    grads = tape.gradient(loss, last_conv_layer_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Normalize the heatmap
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    heatmap_np = heatmap.numpy()

    # Resize heatmap to match image size
    heatmap_resized = cv2.resize(heatmap_np, (img_original.shape[1], img_original.shape[0]))
    
    # Scale to 0-255
    heatmap_resized = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_resized, colormap)
    
    # Superimpose the heatmap on the original image (converted to BGR for cv2)
    img_bgr = cv2.cvtColor(img_original, cv2.COLOR_RGB2BGR)
    superimposed_img = cv2.addWeighted(img_bgr, 0.6, heatmap_colored, 0.4, 0)
    
    # Convert back to RGB
    superimposed_rgb = cv2.cvtColor(superimposed_img, cv2.COLOR_BGR2RGB)
    
    return superimposed_rgb

class AnalyzeRequest(BaseModel):
    imageBase64: str
    mediaType: str = "image/jpeg"
    patientInfo: Optional[dict] = None
    symptoms: List[str] = []
    notes: str = ""

@app.post("/predict")
async def predict(req: AnalyzeRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Train first with: python ml/train.py")
    
    try:
        # Decode image
        img_bytes = base64.b64decode(req.imageBase64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img = img.resize((IMG_SIZE, IMG_SIZE))
        
        # EfficientNet expects [0, 255] natively
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)[0]
        predicted_idx = int(np.argmax(predictions))
        primary_class = class_names[predicted_idx]
        primary_display = DISPLAY_NAMES.get(primary_class, primary_class)
        confidence = float(predictions[predicted_idx])
        
        # Build findings
        findings = []
        for i, cn in enumerate(class_names):
            display = DISPLAY_NAMES.get(cn, cn)
            likelihood = float(predictions[i]) * 100
            is_primary = (i == predicted_idx)
            findings.append({
                "disease": display,
                "likelihood": round(likelihood, 1),
                "severity": get_severity(float(predictions[i]), is_primary),
                "description": DESCRIPTIONS.get(display, f"Analysis for {display}.") if is_primary else f"No significant findings related to {display}.",
                "recommendations": RECOMMENDATIONS.get(display, ["Routine monitoring"]) if is_primary or likelihood > 20 else ["Routine monitoring"]
            })
        
        # Determine urgency
        if primary_display == 'Normal':
            urgency = 'routine'
        elif confidence > 0.75:
            urgency = 'urgent'
        else:
            urgency = 'moderate'
            
        # Generate Grad-CAM Heatmap
        try:
            heatmap_rgb = generate_grad_cam(img_array, model, predicted_idx, np.array(img))
            if heatmap_rgb is not None:
                heatmap_pil = Image.fromarray(heatmap_rgb)
                buffer = io.BytesIO()
                heatmap_pil.save(buffer, format="JPEG")
                heatmap_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            else:
                heatmap_b64 = None
        except Exception as e:
            print(f"Grad-CAM Error: {e}")
            heatmap_b64 = None
        
        result = {
            "primary_diagnosis": primary_display,
            "severity_stage": get_severity_stage(primary_display, confidence),
            "overall_assessment": f"AI analysis of the retinal image indicates {primary_display} with {confidence:.0%} confidence.",
            "urgency": urgency,
            "heatmapBase64": heatmap_b64,
            "findings": findings,
            "general_recommendations": [
                "Schedule a comprehensive eye exam with a specialist",
                "Keep a log of any changes in vision",
                "This screening should be followed up with professional evaluation"
            ],
            "disclaimer": "This is an AI-assisted screening tool using a trained ML model. It does not replace professional medical diagnosis."
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
