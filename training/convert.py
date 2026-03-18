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

import numpy as np
import tensorflow as tf
from dotenv import load_dotenv

load_dotenv()

IMG_SIZE    = int(os.getenv("IMG_SIZE",    "200"))
NUM_CLASSES = int(os.getenv("NUM_CLASSES", "38"))

WEIGHTS_IN  = os.path.join("outputs", "model_weights.weights.h5")
WEIGHTS_OUT = os.path.join("outputs", "model_weights_converted.weights.h5")

print(f"IMG_SIZE    : {IMG_SIZE}")
print(f"NUM_CLASSES : {NUM_CLASSES}")
print(f"Loading from: {WEIGHTS_IN}")

# ── Build model ───────────────────────────────────────────────
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal_and_vertical'),
    tf.keras.layers.RandomRotation(0.2),
    tf.keras.layers.RandomZoom(0.15),
    tf.keras.layers.RandomContrast(0.2),
], name='augmentation')

base_model = tf.keras.applications.EfficientNetB3(
    weights=None,
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)

model = tf.keras.models.Sequential([
    data_augmentation,
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32'),
])

# ── Build with a real forward pass to initialise all layers ──
dummy = np.zeros((1, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
model(dummy, training=False)
print("Model built and initialised.")

# ── Load weights ──────────────────────────────────────────────
print("Loading weights ...")
model.load_weights(WEIGHTS_IN)
print("Weights loaded successfully.")

# ── Save in new format ────────────────────────────────────────
print(f"Saving converted weights to: {WEIGHTS_OUT}")
model.save_weights(WEIGHTS_OUT)
print("Done.")
print()
print("Next step: copy outputs/model_weights_converted.weights.h5")
print("        to backend/model_files/model_weights.weights.h5")