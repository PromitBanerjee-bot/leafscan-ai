import os

_dll_paths = [
    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\bin",
    r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.2\libnvvp",
]
for _p in _dll_paths:
    if os.path.isdir(_p):
        os.add_dll_directory(_p)

os.environ['TF_CPP_MIN_LOG_LEVEL']  = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import numpy as np
import tensorflow as tf
from dotenv import load_dotenv

load_dotenv()

IMG_SIZE    = int(os.getenv("IMG_SIZE",    "200"))
NUM_CLASSES = int(os.getenv("NUM_CLASSES", "38"))

WEIGHTS_IN       = os.path.join("outputs", "model_weights.weights.h5")
SAVED_MODEL_OUT  = os.path.join("outputs", "saved_model")

print(f"IMG_SIZE    : {IMG_SIZE}")
print(f"NUM_CLASSES : {NUM_CLASSES}")
print(f"Loading weights from: {WEIGHTS_IN}")

# ── Build full model (with augmentation) to load weights ──────
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal_and_vertical'),
    tf.keras.layers.RandomRotation(0.3),
    tf.keras.layers.RandomZoom(0.2),
    tf.keras.layers.RandomContrast(0.3),
    tf.keras.layers.RandomTranslation(0.1, 0.1),
], name='augmentation')

base_model = tf.keras.applications.EfficientNetB3(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)
base_model.trainable = True

full_model = tf.keras.models.Sequential([
    data_augmentation,
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32'),
])

dummy = np.zeros((1, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
full_model(dummy, training=False)
print("Full model initialised.")

# Load trained weights into full model
import h5py
var_map = {var.name: var for var in full_model.variables}
loaded = 0
with h5py.File(WEIGHTS_IN, 'r') as f:
    def assign_weight(name, obj):
        global loaded
        if not isinstance(obj, h5py.Dataset):
            return
        for var_name, var in var_map.items():
            clean_var = var_name.replace(':0', '')
            if clean_var.endswith(name) or name.endswith(clean_var):
                try:
                    var.assign(np.array(obj))
                    loaded += 1
                    return
                except Exception:
                    return
    f.visititems(assign_weight)
print(f"Loaded {loaded} weights into full model.")

# ── Build inference model WITHOUT augmentation ────────────────
inference_model = tf.keras.models.Sequential([
    tf.keras.applications.EfficientNetB3(
        weights=None,
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    ),
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32'),
])

inference_model(dummy, training=False)
print("Inference model initialised.")

# Copy weights from full model to inference model (skip layer 0 = augmentation)
for i, layer in enumerate(inference_model.layers):
    src_layer = full_model.layers[i + 1]  # +1 skips augmentation
    weights   = src_layer.get_weights()
    if weights:
        layer.set_weights(weights)
        print(f"  Copied weights: {layer.name}")

# Save inference model
print(f"\nSaving to {SAVED_MODEL_OUT} ...")
tf.saved_model.save(inference_model, SAVED_MODEL_OUT)
print("Done! SavedModel saved successfully.")