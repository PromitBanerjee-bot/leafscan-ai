import os

# ─────────────────────────────────────────────────────────────
# GPU DLL paths — MUST come before any tensorflow import
# ─────────────────────────────────────────────────────────────
_dll_paths = [
    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\bin",
    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\libnvvp",
]
for _p in _dll_paths:
    if os.path.isdir(_p):
        os.add_dll_directory(_p)

os.environ['TF_CPP_MIN_LOG_LEVEL']  = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# ─────────────────────────────────────────────────────────────
# Imports
# ─────────────────────────────────────────────────────────────
import json
import io
import base64
import numpy as np
from PIL import Image
import tensorflow as tf
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────
# Load environment variables
# ─────────────────────────────────────────────────────────────
load_dotenv()

SAVED_MODEL_PATH   = os.getenv("SAVED_MODEL_PATH",  "model_files/saved_model")
CLASS_INDICES_PATH = os.getenv("CLASS_INDICES_PATH", "model_files/class_indices.json")
IMG_SIZE           = int(os.getenv("IMG_SIZE",    "200"))
NUM_CLASSES        = int(os.getenv("NUM_CLASSES", "38"))

# ─────────────────────────────────────────────────────────────
# GPU — enable memory growth
# ─────────────────────────────────────────────────────────────
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

# ─────────────────────────────────────────────────────────────
# Singletons
# ─────────────────────────────────────────────────────────────
_model:         object = None
_class_indices: dict   = None
_disease_info:  dict   = None


def _parse_class_name(raw_name: str):
    """'Apple___Black_rot'  ->  ('Apple', 'Black Rot')"""
    parts     = raw_name.split("___")
    crop      = parts[0].replace("_", " ").strip()
    condition = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Unknown"
    return crop, condition


def load_model_once():
    global _model, _class_indices, _disease_info

    if not os.path.isdir(SAVED_MODEL_PATH):
        raise FileNotFoundError(
            f"SavedModel not found: {SAVED_MODEL_PATH}\n"
            "Run training/train.py first, then copy outputs/saved_model "
            "to backend/model_files/saved_model"
        )

    if not os.path.exists(CLASS_INDICES_PATH):
        raise FileNotFoundError(
            f"class_indices.json not found: {CLASS_INDICES_PATH}"
        )

    print(f"[model] Loading SavedModel from {SAVED_MODEL_PATH} ...")
    _model = tf.saved_model.load(SAVED_MODEL_PATH)
    print(f"[model] Model loaded successfully.")

    with open(CLASS_INDICES_PATH, "r") as f:
        _class_indices = json.load(f)

    # Load disease info
    disease_info_path = os.path.join(
        os.path.dirname(__file__), "disease_info.json"
    )
    with open(disease_info_path, "r") as f:
        _disease_info = json.load(f)

    print(f"[model] Ready - {NUM_CLASSES} classes loaded.")


def _compute_gradcam(img_array: np.ndarray, class_idx: int) -> np.ndarray:
    """
    Compute Grad-CAM using input gradient visualisation.
    Uses GradientTape directly on the SavedModel.
    Returns a heatmap array of shape (IMG_SIZE, IMG_SIZE) with values in [0, 1].
    """
    img_tensor = tf.Variable(
        tf.cast(img_array, tf.float32), trainable=True
    )

    with tf.GradientTape() as tape:
        tape.watch(img_tensor)
        predictions = _model(img_tensor, training=False)
        loss        = predictions[:, class_idx]

    # Compute input gradients
    grads = tape.gradient(loss, img_tensor)

    if grads is None:
        return None

    # Average across colour channels to get importance per pixel
    grads_np = grads.numpy()[0]                      # shape (H, W, 3)
    heatmap  = np.mean(np.abs(grads_np), axis=-1)   # shape (H, W)

    # Apply ReLU — only keep positive contributions
    heatmap = np.maximum(heatmap, 0)

    # Normalise to [0, 1]
    max_val = np.max(heatmap)
    if max_val == 0:
        return None
    heatmap = heatmap / max_val

    return heatmap


def _overlay_heatmap_on_image(
    original_img: Image.Image,
    heatmap: np.ndarray
) -> str:
    """
    Overlay Grad-CAM heatmap on the original image.
    Uses TURBO colormap and Gaussian blur for a clean result.
    Returns the result as a base64 encoded PNG string.
    """
    import cv2

    img_w, img_h = original_img.size

    # Resize heatmap to match original image size
    heatmap_resized = cv2.resize(heatmap, (img_w, img_h))

    # Apply Gaussian blur to smooth out noise
    heatmap_resized = cv2.GaussianBlur(heatmap_resized, (15, 15), 0)

    # Re-normalise after blur
    if heatmap_resized.max() > 0:
        heatmap_resized = heatmap_resized / heatmap_resized.max()

    # Apply TURBO colormap — cleaner and more perceptually uniform than JET
    heatmap_colored = cv2.applyColorMap(
        np.uint8(255 * heatmap_resized), cv2.COLORMAP_TURBO
    )
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    # Convert original image to numpy array
    original_array = np.array(original_img.convert("RGB"), dtype=np.float32)

    # Blend: 50% original + 50% heatmap for clear visualisation
    heatmap_float = heatmap_colored.astype(np.float32)
    blended       = 0.5 * original_array + 0.5 * heatmap_float
    blended       = np.clip(blended, 0, 255).astype(np.uint8)

    # Convert result to base64 PNG
    result_img = Image.fromarray(blended)
    buffer     = io.BytesIO()
    result_img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode("utf-8")


def predict_image(image_bytes: bytes) -> dict:
    """
    Accept raw image bytes.
    Returns prediction + Grad-CAM heatmap as base64 image.
    """
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h     = original.size

    def make_variants(pil_img):
        variants = []
        for scale in [1.0, 0.9, 0.85]:
            nw      = int(w * scale)
            nh      = int(h * scale)
            left    = (w - nw) // 2
            top     = (h - nh) // 2
            cropped = pil_img.crop((left, top, left + nw, top + nh))
            resized = cropped.resize((IMG_SIZE, IMG_SIZE))
            arr     = np.array(resized, dtype=np.float32)
            variants.append(arr)
            variants.append(np.fliplr(arr))
        return variants

    # Run TTA prediction
    variants  = make_variants(original)
    batch     = np.stack(variants, axis=0)
    preds     = _model(batch, training=False).numpy()
    avg_preds = np.mean(preds, axis=0)
    top3_idx  = np.argsort(avg_preds)[::-1][:3]

    top_3 = []
    for rank, idx in enumerate(top3_idx):
        class_name      = _class_indices[str(idx)]
        crop, condition = _parse_class_name(class_name)
        top_3.append({
            "rank":       rank + 1,
            "class_name": class_name,
            "crop":       crop,
            "condition":  condition,
            "confidence": round(float(avg_preds[idx]), 6),
        })

    best          = top_3[0]
    is_healthy    = "healthy" in best["condition"].lower()
    top_class_idx = int(top3_idx[0])

    # Compute Grad-CAM heatmap
    gradcam_image = None
    try:
        img_for_gradcam = original.resize((IMG_SIZE, IMG_SIZE))
        arr_for_gradcam = np.expand_dims(
            np.array(img_for_gradcam, dtype=np.float32), axis=0
        )
        heatmap = _compute_gradcam(arr_for_gradcam, top_class_idx)
        if heatmap is not None:
            gradcam_image = _overlay_heatmap_on_image(original, heatmap)
            print("[gradcam] Heatmap computed successfully.")
        else:
            print("[gradcam] Heatmap was None — skipping.")
    except Exception as e:
        print(f"[gradcam] Heatmap computation failed: {e}")
        gradcam_image = None

    # Get disease info
    disease_info = _disease_info.get(best["class_name"], {
        "description": "No information available for this condition.",
        "severity":    "Unknown",
        "cause":       "Unknown",
        "treatment":   "Consult a plant pathologist.",
        "prevention":  "Monitor plants regularly.",
    })

    return {
        "success":       True,
        "class_name":    best["class_name"],
        "crop":          best["crop"],
        "condition":     best["condition"],
        "confidence":    best["confidence"],
        "is_healthy":    is_healthy,
        "top_3":         top_3,
        "model_name":    "EfficientNetB3",
        "disease_info":  disease_info,
        "gradcam_image": gradcam_image,
    }