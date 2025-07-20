from __future__ import annotations

import logging
import time
import json
from pathlib import Path
from datetime import datetime

from twelvelabs import APIStatusError, TwelveLabs
from .config import client, INDEX_ID, VIDEO_DIR, META_PATH

logging.basicConfig(level=logging.INFO, format="%(message)s")


def _get_or_create_index(name: str) -> str:
    """Gets an existing index by name or creates a new one."""
    try:
        indexes = client.index.list()
        for i in indexes:
            if i.name == name:
                logging.info(f"Using existing index '{i.name}' ({i.id})")
                return i.id

        logging.info("Creating new index...")
        index = client.index.create(
            name=name,
            models=[
                {"name": "marengo2.7", "options": ["visual"]},
                {"name": "pegasus1.2", "options": ["visual"]},
            ],
        )
        logging.info(f"Successfully created index '{index.name}' ({index.id})")
        return index.id
    except APIStatusError as e:
        logging.error(f"APIStatusError: {e}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    raise RuntimeError("Could not get or create index.")


def _upload_video(index_id: str, url: str) -> str | None:
    """Uploads a video to the specified index and returns the task ID."""
    logging.info(f"Uploading video from URL: {url}")
    try:
        task = client.task.create(index_id=index_id, video_url=url, language="en")
        logging.info(f"Task created with ID: {task.id}")

        while True:
            task = client.task.retrieve(id=task.id)
            status = task.status
            logging.info(f"Task '{task.id}'' is {status}")
            if status in ("ready", "failed"):
                if status == "failed":
                    logging.error(f"Task failed with error: {task.error}")
                break
            time.sleep(5)
        return task.video_id
    except APIStatusError as e:
        logging.error(f"APIStatusError: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
    return None


def _analyze_with_pegasus(video_id: str, index_id: str) -> dict | None:
    """Analyzes a video with the Pegasus model using a specified prompt."""
    logging.info(f"Analyzing video {video_id} with Pegasus...")
    prompt = (
        "Generate a brief, engaging summary of the mountain biking video. "
        "Focus on the trail's most exciting features and the overall rider experience."
    )

    try:
        result = client.analyze.generate(video_id=video_id, prompt=prompt)
        return {"analysis_summary": result.data}
    except APIStatusError as e:
        logging.error(f"APIStatusError during analysis: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred during analysis: {e}")
    return None


def main():
    """Main function to run the Pegasus endpoint test."""
    test_index_name = "pegasus-test-index"
    index_id = _get_or_create_index(test_index_name)

    video_url = "https://nnyagdev.org/wp-content/uploads/2021/01/sample-mp4-file.mp4"

    video_id = _upload_video(index_id, video_url)
    if not video_id:
        logging.error("Video upload failed, aborting analysis.")
        return

    analysis_result = _analyze_with_pegasus(video_id, index_id)
    if analysis_result:
        logging.info("Pegasus analysis successful!")
        logging.info(f"Analysis result: {json.dumps(analysis_result, indent=2)}")
    else:
        logging.error("Pegasus analysis failed.")


if __name__ == "__main__":
    main() 