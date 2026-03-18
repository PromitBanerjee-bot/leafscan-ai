<div align="center">

# 🌿 LeafScan AI
### Plant Disease Detection using Deep Learning

[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10.0-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

> **Final Year Engineering Capstone Project** — An end-to-end plant disease detection system using EfficientNetB3 transfer learning, served through a FastAPI backend and visualised with a React frontend.

<br/>

![LeafScan AI Demo](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Accuracy](https://img.shields.io/badge/Accuracy-97.74%25-success?style=flat-square)
![Classes](https://img.shields.io/badge/Disease%20Classes-38-blue?style=flat-square)
![Dataset](https://img.shields.io/badge/Training%20Images-54K%2B-orange?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Model Architecture](#-model-architecture)
- [Results](#-results)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Dataset](#-dataset)
- [Supported Crops & Diseases](#-supported-crops--diseases)
- [Limitations](#-limitations)

---

## 🌱 Overview

LeafScan AI is a full-stack plant disease detection application that allows users to upload a photo of a plant leaf and receive an instant AI-powered diagnosis. The system identifies 38 different plant disease classes across 14 crop species with **97.74% validation accuracy**.

The project demonstrates a complete machine learning pipeline from data preparation and model training to API deployment and frontend visualisation, including advanced features like Grad-CAM attention heatmaps and detailed disease information.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Disease Detection** | Identifies 38 plant disease classes with high accuracy |
| 📊 **Confidence Scoring** | Shows prediction confidence with colour-coded indicators |
| 🏆 **Top 3 Predictions** | Displays the top 3 most likely diagnoses |
| 📋 **Disease Information** | Detailed info on cause, treatment, and prevention for each disease |
| 🔥 **Grad-CAM Heatmap** | Visual explanation of which leaf regions the model focused on |
| ⚠️ **Confidence Warnings** | Alerts when model confidence is low with photo tips |
| 🎯 **Test Time Augmentation** | Multiple crop predictions averaged for better real-world performance |
| 🌿 **14 Crop Species** | Covers the most common agricultural crops |

---

## 🛠 Tech Stack

### Machine Learning
- **TensorFlow 2.10.0** — Model training and inference
- **EfficientNetB3** — Pre-trained backbone (ImageNet weights)
- **Transfer Learning** — Two-step frozen base + fine-tuning
- **Grad-CAM** — Input gradient visualisation

### Backend
- **FastAPI** — High-performance Python API framework
- **Uvicorn** — ASGI server
- **OpenCV** — Heatmap generation
- **Pillow** — Image preprocessing

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast build tool
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client

### Hardware Used for Training
- **GPU** — NVIDIA RTX 4050
- **CUDA** — 11.2
- **cuDNN** — 8.1

---

## 📁 Project Structure

```
plant_disease/
│
├── training/                          # Model training pipeline
│   ├── train.py                       # Main training script
│   ├── .env                           # Training configuration
│   ├── .env.example                   # Environment variable template
│   └── outputs/                       # Generated after training
│       ├── saved_model/               # TF SavedModel format
│       ├── class_indices.json         # Class name mapping
│       └── training_plots/            # Training curve plots
│           ├── step1_curves.png
│           └── step2_curves.png
│
├── backend/                           # FastAPI backend
│   ├── app/
│   │   ├── main.py                    # FastAPI app and routes
│   │   ├── model.py                   # Model loading and prediction
│   │   ├── schemas.py                 # Request/response schemas
│   │   ├── disease_info.json          # Disease information database
│   │   └── __init__.py
│   ├── model_files/                   # Model files (not in git)
│   │   ├── saved_model/               # Copy from training/outputs
│   │   └── class_indices.json         # Copy from training/outputs
│   ├── .env.example                   # Environment variable template
│   └── requirements.txt               # Python dependencies
│
└── frontend/                          # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── Hero.jsx               # Header and stats
    │   │   ├── Uploader.jsx           # Drag and drop upload
    │   │   ├── ResultCard.jsx         # Prediction results
    │   │   ├── DiseaseInfo.jsx        # Disease information panel
    │   │   ├── GradCam.jsx            # Heatmap visualisation
    │   │   └── HowItWorks.jsx         # Steps explanation
    │   ├── App.jsx                    # Main application
    │   ├── main.jsx                   # React entry point
    │   └── index.css                  # Global styles
    ├── .env.example                   # Environment variable template
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🧠 Model Architecture

The model uses **EfficientNetB3** as a backbone with a custom classification head:

```
Input (200×200×3)
    │
    ▼
Data Augmentation
  ├── RandomFlip (horizontal + vertical)
  ├── RandomRotation (±0.3)
  ├── RandomZoom (±0.2)
  ├── RandomContrast (±0.3)
  └── RandomTranslation (±0.1)
    │
    ▼
EfficientNetB3 (ImageNet pretrained)
  └── 10.7M parameters
    │
    ▼
GlobalAveragePooling2D
    │
    ▼
BatchNormalization
    │
    ▼
Dense (256, ReLU)
    │
    ▼
Dropout (0.4)
    │
    ▼
Dense (38, Softmax)
```

### Training Strategy

**Step 1 — Frozen Base (10 epochs)**
- Base model frozen, only classification head trained
- Learning rate: 1e-3
- Loss: Categorical Crossentropy with label smoothing (0.1)

**Step 2 — Fine-tuning (10 epochs)**
- Last 50 layers of EfficientNetB3 unfrozen
- Learning rate: 1e-4 (10x lower to prevent catastrophic forgetting)
- Same loss function

---

## 📈 Results

| Metric | Step 1 (Frozen) | Step 2 (Fine-tuned) |
|---|---|---|
| Training Accuracy | 88.32% | 98.16% |
| Validation Accuracy | 90.52% | **97.55%** |
| Validation Loss | 1.103 | 0.798 |

### Final Evaluation on Validation Set

| Metric | Score |
|---|---|
| Accuracy | **97.74%** |
| Weighted Precision | **97.85%** |
| Weighted F1 Score | **97.74%** |

---

## 🚀 Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Python 3.10
- Node.js 18+ and npm
- CUDA 11.2 (for GPU training)
- cuDNN 8.1
- Git

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/leafscan-ai.git
cd leafscan-ai
```

### Dataset Download

Download the PlantVillage dataset from Kaggle:

```bash
pip install kaggle
kaggle datasets download -d abdallahalidev/plantvillage-dataset
```

Extract only the `color` folder and place it at:
```
training/plantvillage dataset/color/
```

Alternatively download manually from:
```
https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
```

### Training Setup

```bash
cd training

# Create virtual environment
py -3.10 -m venv training_venv
training_venv\Scripts\activate     # Windows
# source training_venv/bin/activate  # Linux/Mac

# Install dependencies
pip install tensorflow==2.10.0
pip install scikit-learn==1.3.2
pip install numpy==1.23.5
pip install Pillow==10.0.0
pip install matplotlib==3.7.3
pip install python-dotenv==1.0.1

# Copy environment file
copy .env.example .env             # Windows
# cp .env.example .env              # Linux/Mac
```

### Backend Setup

```bash
cd backend

# Create virtual environment
py -3.10 -m venv backend_venv
backend_venv\Scripts\activate      # Windows
# source backend_venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt
pip install opencv-python-headless
pip install numpy==1.23.5 --force-reinstall

# Copy environment file
copy .env.example .env             # Windows
# cp .env.example .env              # Linux/Mac
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
npm install axios
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/postcss

# Copy environment file
copy .env.example .env             # Windows
# cp .env.example .env              # Linux/Mac
```

---

## ▶️ Running the Project

### Step 1 — Train the Model

```bash
cd training
training_venv\Scripts\activate
python train.py
```

Training takes approximately **2 hours** on an RTX 4050 GPU.

After training completes, copy the outputs to the backend:

```bash
# Windows
xcopy /E /I training\outputs\saved_model backend\model_files\saved_model
copy training\outputs\class_indices.json backend\model_files\

# Linux/Mac
cp -r training/outputs/saved_model backend/model_files/
cp training/outputs/class_indices.json backend/model_files/
```

### Step 2 — Start the Backend

```bash
cd backend
backend_venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Step 3 — Start the Frontend

```bash
cd frontend
npm run dev
```

Website will be available at `http://localhost:5173`

---

## 🔧 Environment Variables

### training/.env

| Variable | Default | Description |
|---|---|---|
| `DATASET_PATH` | `plantvillage dataset/color` | Path to dataset color folder |
| `OUTPUT_PATH` | `outputs` | Where to save model outputs |
| `IMG_SIZE` | `200` | Image resize dimensions |
| `BATCH_SIZE` | `32` | Training batch size |
| `STEP1_EPOCHS` | `10` | Epochs for frozen base training |
| `STEP2_EPOCHS` | `10` | Epochs for fine-tuning |
| `FINE_TUNE_LAYERS` | `50` | Number of layers to unfreeze |
| `RANDOM_SEED` | `42` | Random seed for reproducibility |

### backend/.env

| Variable | Default | Description |
|---|---|---|
| `SAVED_MODEL_PATH` | `model_files/saved_model` | Path to TF SavedModel |
| `CLASS_INDICES_PATH` | `model_files/class_indices.json` | Path to class mapping |
| `IMG_SIZE` | `200` | Must match training IMG_SIZE |
| `NUM_CLASSES` | `38` | Number of disease classes |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowed origins |
| `PORT` | `8000` | API server port |

### frontend/.env

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

---

## 📡 API Reference

### GET /health

Check if the API is running.

**Response:**
```json
{ "status": "ok" }
```

### POST /predict

Upload a leaf image and get a disease prediction.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` — JPG or PNG image

**Response:**
```json
{
  "success": true,
  "class_name": "Tomato___Early_blight",
  "crop": "Tomato",
  "condition": "Early blight",
  "confidence": 0.956,
  "is_healthy": false,
  "top_3": [
    { "rank": 1, "class_name": "Tomato___Early_blight", "crop": "Tomato", "condition": "Early blight", "confidence": 0.956 },
    { "rank": 2, "class_name": "Tomato___Late_blight",  "crop": "Tomato", "condition": "Late blight",  "confidence": 0.031 },
    { "rank": 3, "class_name": "Potato___Early_blight", "crop": "Potato", "condition": "Early blight", "confidence": 0.008 }
  ],
  "model_name": "EfficientNetB3",
  "disease_info": {
    "description": "Early blight on tomato causes dark brown concentric ring lesions...",
    "severity": "Moderate",
    "cause": "Fungus - Alternaria solani",
    "treatment": "Apply fungicides containing chlorothalonil or mancozeb...",
    "prevention": "Use mulch to prevent soil splash, rotate crops..."
  },
  "gradcam_image": "<base64 encoded PNG string>"
}
```

---

## 🌾 Dataset

This project uses the **PlantVillage Dataset** from Kaggle.

- **Total Images:** 54,305
- **Classes:** 38 (disease and healthy)
- **Crops:** 14 species
- **Format:** Color JPG images
- **Split:** 80% training / 20% validation (stratified)

Download: [https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)

---

## 🌿 Supported Crops & Diseases

| Crop | Diseases Covered |
|---|---|
| 🍎 Apple | Apple Scab, Black Rot, Cedar Apple Rust, Healthy |
| 🫐 Blueberry | Healthy |
| 🍒 Cherry | Powdery Mildew, Healthy |
| 🌽 Corn | Cercospora Leaf Spot, Common Rust, Northern Leaf Blight, Healthy |
| 🍇 Grape | Black Rot, Esca, Leaf Blight, Healthy |
| 🍊 Orange | Haunglongbing (Citrus Greening) |
| 🍑 Peach | Bacterial Spot, Healthy |
| 🌶️ Pepper | Bacterial Spot, Healthy |
| 🥔 Potato | Early Blight, Late Blight, Healthy |
| 🫐 Raspberry | Healthy |
| 🌱 Soybean | Healthy |
| 🎃 Squash | Powdery Mildew |
| 🍓 Strawberry | Leaf Scorch, Healthy |
| 🍅 Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |

---

## ⚠️ Limitations

- **Domain Gap** — The model was trained on controlled lab-style images from PlantVillage. Real-world photos with complex backgrounds may produce less accurate results. For best results, photograph the leaf against a plain white background.

- **Supported Species Only** — The model can only identify diseases for the 14 supported crop species. Uploading images of other plants will produce incorrect results.

- **Single Leaf** — The model expects a single leaf image. Photos of whole plants or multiple leaves may reduce accuracy.

- **Image Quality** — Blurry, dark, or very small images will reduce prediction confidence. The app shows a warning when confidence falls below 50%.

---

## 👨‍💻 Author

**Promit** — Final Year Engineering Student

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Made with 🌿 for the PlantVillage dataset and the farming community

</div>
