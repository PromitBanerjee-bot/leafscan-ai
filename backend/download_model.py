import os

HF_REPO_ID        = os.getenv("HF_REPO_ID", "")
MODEL_OUTPUT_DIR  = os.getenv("SAVED_MODEL_PATH",  "model_files/saved_model")
INDICES_FILE      = os.getenv("CLASS_INDICES_PATH", "model_files/class_indices.json")
MODEL_FILES_DIR   = "model_files"


def download_model():
    if os.path.isdir(MODEL_OUTPUT_DIR) and os.path.exists(INDICES_FILE):
        print("[download] Model files already exist. Skipping download.")
        return

    if not HF_REPO_ID:
        raise ValueError(
            "HF_REPO_ID environment variable is not set."
        )

    print(f"[download] Downloading model from Hugging Face ({HF_REPO_ID}) ...")

    from huggingface_hub import snapshot_download
    os.makedirs(MODEL_FILES_DIR, exist_ok=True)

    snapshot_download(
        repo_id=HF_REPO_ID,
        local_dir=MODEL_FILES_DIR,
        repo_type="model",
        ignore_patterns=["*.git*", "*.gitattributes"],
    )
    print("[download] Model downloaded successfully.")


if __name__ == "__main__":
    download_model()