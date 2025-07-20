# scripts/upload_index.py
from __future__ import annotations
import json, logging, time
from pathlib import Path
from datetime import datetime

from twelvelabs import APIStatusError

from config import client, INDEX_ID, VIDEO_DIR, META_PATH

logging.basicConfig(level=logging.INFO, format="%(message)s")


def _get_or_create_index(name: str) -> str:
    if INDEX_ID:
        logging.info(f"Using index from environment variable: {INDEX_ID}")
        return INDEX_ID
    try:
        indexes = client.index.list()
        for i in indexes:
            if i.name == name:
                logging.info(f"using existing index {i.name} ({i.id})")
                return i.id
        logging.info("creating new index")
        index = client.index.create(
            name=name,
            models=[
                {"name": "marengo2.7", "options": ["visual"]},
                {"name": "pegasus1.2", "options": ["visual"]},
            ],
        )
        return index.id
    except APIStatusError as e:
        logging.error(f"APIStatusError: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    raise RuntimeError("could not get/create index")


def _load() -> list[dict]:
    return json.loads(META_PATH.read_text()) if META_PATH.exists() else []


def _save(meta: list[dict]):
    META_PATH.write_text(json.dumps(meta, indent=2))


def _analyze_video(video_id: str, index_id: str) -> dict:
    logging.info(f"Analyzing video {video_id}")
    prompt = (
        "Analyze the provided mountain biking video. Based on the video content, provide a JSON object with the "
        "following keys: "
        '\\"difficulty_rating\\" (a string rating from \\"1/10\\" to \\"10/10\\" assessing the trail\'s technical '
        "difficulty), "
        '\\"terrain\\" (a brief description of the trail\'s terrain, e.g., \\"rocky, rooty, with some flowy '
        'sections\\"), and '
        '\\"description\\" (a short summary of the video).'
    )
    try:
        result = client.analyze(video_id=video_id, index_id=index_id, prompt=prompt)

        analysis_data = json.loads(result.data)

        return {
            "difficulty_rating": analysis_data.get("difficulty_rating"),
            "terrain": analysis_data.get("terrain"),
            "description": analysis_data.get("description"),
        }
    except json.JSONDecodeError:
        logging.error(f"Failed to decode JSON from analysis response: {result.data}")
    except Exception as e:
        logging.error(f"Failed to analyze video {video_id}: {e}")

    return {
        "difficulty_rating": None,
        "terrain": None,
        "description": None,
    }


def _upload(index_id: str, path: Path):
    try:
        task = client.task.create(index_id=index_id, file=str(path))  # type: ignore
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
    index_id = _get_or_create_index("trailsense")

    meta = _load()
    done = {m["filename"] for m in meta}

    for video in VIDEO_DIR.glob("*.mp4"):
        if video.name in done:
            continue

        logging.info(f"uploading {video.name}")
        task = _upload(index_id, video)
        if not task:                     
            continue

        analysis = _analyze_video(task.video_id, index_id)

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
            "difficulty_rating": analysis.get("difficulty_rating"),
            "terrain": analysis.get("terrain"),
            "description": analysis.get("description"),
        })
        _save(meta)


if __name__ == "__main__":
    main()
