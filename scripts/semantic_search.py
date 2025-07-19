from __future__ import annotations
import json
from pathlib import Path
from typing import Any
from .config import client, INDEX_ID, META_PATH
try:
    from .gemini_analysis import analyze_video
except ImportError:
    # Fallback for when running as script
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from scripts.gemini_analysis import analyze_video


def _meta() -> dict[str, dict]:
    return {} if not META_PATH.exists() else {
        m["video_id"]: m for m in json.loads(META_PATH.read_text())
    }


def _times(d: dict[str, Any]) -> tuple[Any, Any]:
    return (
        d.get("start") or d.get("moment_start") or d.get("start_time"),
        d.get("end")   or d.get("moment_end")   or d.get("end_time"),
    )


def search_best(
    query: str,
    options: tuple[str, ...] = ("visual", "audio"),
) -> dict[str, Any] | None:
    if not INDEX_ID:
        raise RuntimeError("TL_INDEX_ID missing")

    resp = client.search.query(INDEX_ID, options=list(options), query_text=query)  # type: ignore
    results = getattr(resp, "results", None) or getattr(resp, "data", [])
    if not results:
        return None

    best = max(results, key=lambda r: r.score)
    d = best.model_dump() if hasattr(best, "model_dump") else best.dict()

    start, end = _times(d)
    meta = _meta().get(d["video_id"], {})

    # Get Gemini analysis for the video
    gemini_result = None
    try:
        gemini_result = analyze_video(d["video_id"], query)
        if gemini_result and "error" not in gemini_result:
            meta.update(gemini_result)
    except Exception as e:
        print(f"Warning: Failed to get Gemini analysis: {e}")

    return {**d, "start_sec": start, "end_sec": end, **meta}


if __name__ == "__main__":
    print(search_best("big jump on mountain bike"))
