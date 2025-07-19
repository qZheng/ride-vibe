# scripts/upload_index.py
from __future__ import annotations
import json, logging, time
from pathlib import Path
from datetime import datetime
from config import client, INDEX_ID, VIDEO_DIR, META_PATH

logging.basicConfig(level=logging.INFO, format="%(message)s")

def load_meta() -> list[dict]:
    return json.loads(META_PATH.read_text()) if META_PATH.exists() else []

def save_meta(meta: list[dict]) -> None:
    META_PATH.write_text(json.dumps(meta, indent=2))

def upload_one(path: Path):
    task = client.task.create(index_id=INDEX_ID, file=str(path))
    while True:
        logging.info(f"{task.id} → {task.status}")
        if task.status in {"ready", "failed"}:
            return task
        time.sleep(5)
        task = client.task.retrieve(task.id)   # refresh via new GET

def main():
    if not INDEX_ID:
        raise RuntimeError("Add TL_INDEX_ID to .env first")

    meta = load_meta()
    processed = {m["filename"] for m in meta}

    for video in VIDEO_DIR.glob("*.mp4"):
        if video.name in processed:
            continue

        logging.info(f"Uploading {video.name}")
        task = upload_one(video)

        if task.status == "ready":
            # if your SDK lacks client.video.retrieve(), skip duration or
            # replace with a constant / another call
            meta.append({
                "filename":   video.name,
                "video_id":   task.video_id,
                "trail_name": video.stem.replace("_", " ").title(),
                "duration":   None,      # fill later if needed
                "indexed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z"
            })
            save_meta(meta)
        else:
            logging.warning(f"❌ Task failed: {task.error}")

if __name__ == "__main__":
    main()
