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
        print(f"[DLL] Added  : {_p}")
    else:
        print(f"[DLL] MISSING: {_p}")

os.environ['TF_CPP_MIN_LOG_LEVEL']  = '1'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# ─────────────────────────────────────────────────────────────
# Imports
# ─────────────────────────────────────────────────────────────
import json
import random
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────
# Load .env
# ─────────────────────────────────────────────────────────────
load_dotenv()

DATASET_PATH     = os.getenv("DATASET_PATH",     "plantvillage dataset/color")
OUTPUT_PATH      = os.getenv("OUTPUT_PATH",      "outputs")
IMG_SIZE         = int(os.getenv("IMG_SIZE",         "200"))
BATCH_SIZE       = int(os.getenv("BATCH_SIZE",       "32"))
STEP1_EPOCHS     = int(os.getenv("STEP1_EPOCHS",     "10"))
STEP2_EPOCHS     = int(os.getenv("STEP2_EPOCHS",     "10"))
FINE_TUNE_LAYERS = int(os.getenv("FINE_TUNE_LAYERS", "50"))
RANDOM_SEED      = int(os.getenv("RANDOM_SEED",      "42"))

# ─────────────────────────────────────────────────────────────
# Seeds
# ─────────────────────────────────────────────────────────────
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

import tensorflow as tf
tf.random.set_seed(RANDOM_SEED)

from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    f1_score,
    classification_report,
)

# ─────────────────────────────────────────────────────────────
# GPU — enable memory growth
# ─────────────────────────────────────────────────────────────
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
    print(f"[GPU] Detected: {gpus}")
else:
    print("[GPU] Not detected — running on CPU")

# ─────────────────────────────────────────────────────────────
# Output folders
# ─────────────────────────────────────────────────────────────
os.makedirs(OUTPUT_PATH, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_PATH, "training_plots"), exist_ok=True)

AUTOTUNE = tf.data.AUTOTUNE

# ─────────────────────────────────────────────────────────────
# 1. Scan dataset
# ─────────────────────────────────────────────────────────────
print("\n[1/7] Scanning dataset ...")

if not os.path.isdir(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found at: {DATASET_PATH}\n"
        "Check DATASET_PATH in .env"
    )

class_names = sorted([
    d for d in os.listdir(DATASET_PATH)
    if os.path.isdir(os.path.join(DATASET_PATH, d))
])
NUM_CLASSES = len(class_names)
print(f"      Classes found : {NUM_CLASSES}")

image_paths, labels = [], []
for class_idx, class_name in enumerate(class_names):
    folder = os.path.join(DATASET_PATH, class_name)
    for fname in os.listdir(folder):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            image_paths.append(os.path.join(folder, fname))
            labels.append(class_idx)

image_paths = np.array(image_paths)
labels      = np.array(labels)
print(f"      Total images  : {len(image_paths)}")

# Save class indices
class_indices      = {str(i): name for i, name in enumerate(class_names)}
class_indices_path = os.path.join(OUTPUT_PATH, "class_indices.json")
with open(class_indices_path, "w") as f:
    json.dump(class_indices, f, indent=2)
print(f"      Saved -> {class_indices_path}")

# ─────────────────────────────────────────────────────────────
# 2. Stratified split 80/20
# ─────────────────────────────────────────────────────────────
print("\n[2/7] Splitting dataset (80/20 stratified) ...")
train_paths, val_paths, train_labels, val_labels = train_test_split(
    image_paths, labels,
    test_size=0.2,
    random_state=RANDOM_SEED,
    stratify=labels,
)
print(f"      Train : {len(train_paths)}")
print(f"      Val   : {len(val_paths)}")

# ─────────────────────────────────────────────────────────────
# 3. Class weights
# ─────────────────────────────────────────────────────────────
print("\n[3/7] Computing class weights ...")
cw_array          = compute_class_weight(
    'balanced',
    classes=np.unique(train_labels),
    y=train_labels,
)
class_weight_dict = dict(enumerate(cw_array))

# ─────────────────────────────────────────────────────────────
# 4. tf.data pipeline
# ─────────────────────────────────────────────────────────────
print("\n[4/7] Building tf.data pipeline ...")

def load_and_preprocess(path, label):
    raw   = tf.io.read_file(path)
    image = tf.image.decode_image(raw, channels=3, expand_animations=False)
    image.set_shape([None, None, 3])
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32)
    label = tf.one_hot(label, depth=NUM_CLASSES)
    return image, label

train_dataset = (
    tf.data.Dataset.from_tensor_slices((train_paths, train_labels))
    .shuffle(buffer_size=2000, seed=RANDOM_SEED)
    .map(load_and_preprocess, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

val_dataset = (
    tf.data.Dataset.from_tensor_slices((val_paths, val_labels))
    .map(load_and_preprocess, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

# ─────────────────────────────────────────────────────────────
# 5. Build model
#
# !! ARCHITECTURE LOCK !!
# These 4 augmentation layers + EfficientNetB3 + head
# must be IDENTICAL in train.py and backend/app/model.py.
# Do NOT add or remove any layers without updating both files.
# RandomBrightness is intentionally excluded — TF 2.10 only.
# ─────────────────────────────────────────────────────────────
print("\n[5/7] Building EfficientNetB3 model ...")

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
base_model.trainable = False

model = tf.keras.models.Sequential([
    data_augmentation,
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32'),
])

# Use a real forward pass to fully initialise all layers
# before training begins — prevents axes mismatch on save/load
dummy = np.zeros((1, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
model(dummy, training=False)
print("      Model initialised via forward pass.")
model.summary()

# ─────────────────────────────────────────────────────────────
# 6. Train
# ─────────────────────────────────────────────────────────────
print("\n[6/7] Training ...")

callbacks_step1 = [
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.2, patience=3,
        min_lr=1e-6, verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', patience=5,
        restore_best_weights=True, verbose=1,
    ),
]

callbacks_step2 = [
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.2, patience=2,
        min_lr=1e-7, verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', patience=5,
        restore_best_weights=True, verbose=1,
    ),
]

# Step 1 — frozen base
print("\n  Step 1: frozen base ...")
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy'],
)
history1 = model.fit(
    train_dataset,
    epochs=STEP1_EPOCHS,
    validation_data=val_dataset,
    class_weight=class_weight_dict,
    callbacks=callbacks_step1,
    verbose=1,
)

# Step 2 — fine-tune last FINE_TUNE_LAYERS
print(f"\n  Step 2: fine-tuning last {FINE_TUNE_LAYERS} layers ...")
base_model.trainable = True
for layer in base_model.layers[:-FINE_TUNE_LAYERS]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy'],
)
history2 = model.fit(
    train_dataset,
    epochs=STEP2_EPOCHS,
    validation_data=val_dataset,
    class_weight=class_weight_dict,
    callbacks=callbacks_step2,
    verbose=1,
)

# ─────────────────────────────────────────────────────────────
# 7. Save weights + evaluate + plot
# ─────────────────────────────────────────────────────────────
print("\n[7/7] Saving weights, evaluating, plotting ...")

# Save full model in TF SavedModel format — most reliable across versions
saved_model_path = os.path.join(OUTPUT_PATH, "saved_model")
model.save(saved_model_path, save_format='tf')
print(f"      Full model saved -> {saved_model_path}")

# Also save weights as backup
weights_path = os.path.join(OUTPUT_PATH, "model_weights.weights.h5")
model.save_weights(weights_path)
print(f"      Weights saved -> {weights_path}")

print("      Running validation predictions ...")
y_pred_probs = model.predict(val_dataset, verbose=1)
y_pred       = np.argmax(y_pred_probs, axis=1)

y_true = []
for _, label_batch in val_dataset:
    y_true.extend(np.argmax(label_batch.numpy(), axis=1).tolist())
y_true = np.array(y_true[:len(y_pred)])

acc  = accuracy_score(y_true, y_pred)
prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
f1   = f1_score(y_true,        y_pred, average='weighted', zero_division=0)

print("\n" + "=" * 50)
print("  FINAL RESULTS")
print("=" * 50)
print(f"  Accuracy  : {acc  * 100:.2f}%")
print(f"  Precision : {prec * 100:.2f}%")
print(f"  F1 Score  : {f1   * 100:.2f}%")
print("=" * 50)
print(classification_report(
    y_true, y_pred,
    target_names=class_names,
    zero_division=0
))


def save_plot(history, title, filename):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    ax1.plot(history.history['accuracy'],     'b-o', label='Train', linewidth=2, markersize=4)
    ax1.plot(history.history['val_accuracy'], 'r-o', label='Val',   linewidth=2, markersize=4)
    ax1.set_title(f'{title} — Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax2.plot(history.history['loss'],     'b-o', label='Train', linewidth=2, markersize=4)
    ax2.plot(history.history['val_loss'], 'r-o', label='Val',   linewidth=2, markersize=4)
    ax2.set_title(f'{title} — Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    plt.tight_layout()
    path = os.path.join(OUTPUT_PATH, "training_plots", filename)
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"      Plot saved -> {path}")


save_plot(history1, "Step 1 — Frozen Base", "step1_curves.png")
save_plot(history2, "Step 2 — Fine Tuning",  "step2_curves.png")

print("\n Training complete!")
print(f"  Weights       : {weights_path}")
print(f"  Class indices : {class_indices_path}")
print(f"  Plots         : {OUTPUT_PATH}/training_plots/")