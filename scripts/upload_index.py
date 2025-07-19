# scripts/upload_index.py
from __future__ import annotations
import json, logging, time
from pathlib import Path
from datetime import datetime
from config import client, INDEX_ID, VIDEO_DIR, META_PATH

logging.basicConfig(level=logging.INFO, format="%(message)s")


def _load() -> list[dict]:
    return json.loads(META_PATH.read_text()) if META_PATH.exists() else []


def _save(meta: list[dict]):
    META_PATH.write_text(json.dumps(meta, indent=2))


def _wait_index_ready(idx: str, sleep: int = 3):
    i = client.index.retrieve(idx)
    while getattr(i, "status", "ready") != "ready":
        logging.info(f"index {idx} → {i.status}")  # type: ignore
        time.sleep(sleep)
        i = client.index.retrieve(idx)


def _upload(path: Path):
    try:
        task = client.task.create(index_id=INDEX_ID, file=str(path))  # type: ignore
    except Exception as exc:      
        logging.error(f"create() failed: {exc}")
        return None

    while True:
        if task.status == "ready":
            return task
        if task.status == "failed":
            logging.error(f"task failed: {task.error}")  # type: ignore
            return None
        logging.info(f"{task.id} → {task.status}")
        time.sleep(5)
        task = client.task.retrieve(task.id)        # refresh


def main():
    if not INDEX_ID:
        raise RuntimeError("add TL_INDEX_ID to .env")

    _wait_index_ready(INDEX_ID)

    meta = _load()
    done = {m["filename"] for m in meta}

    for video in VIDEO_DIR.glob("*.mp4"):
        if video.name in done:
            continue

        logging.info(f"uploading {video.name}")
        task = _upload(video)
        if not task:                     
            continue

        meta.append({
            "filename": video.name,
            "video_id": task.video_id,
            "trail_name": video.stem.replace("_", " ").title(),
            "duration": None,
            "indexed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "location": {
                "latitude": None,
                "longitude": None,
                "name": None
            },
            "difficulty_rating": None
        })
        _save(meta)


if __name__ == "__main__":
    main()
