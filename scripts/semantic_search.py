from __future__ import annotations
import json
from pathlib import Path
from typing import Any
from config import client, INDEX_ID, META_PATH


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
        raise RuntimeError("TL_INDEX_ID missin")

    resp = client.search.query(INDEX_ID, options=list(options), query_text=query)
    results = getattr(resp, "results", None) or getattr(resp, "data", [])
    if not results:
        return None

    best = max(results, key=lambda r: r.score)
    d = best.model_dump() if hasattr(best, "model_dump") else best.dict()

    start, end = _times(d)
    meta = _meta().get(d["video_id"], {})

    return {**d, "start_sec": start, "end_sec": end, **meta}


if __name__ == "__main__":
    print(search_best("foggy forest descent with roots"))
