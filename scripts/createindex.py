from __future__ import annotations
from config import client, MODEL

INDEX_NAME = "trailsense"

def create_index(name: str = INDEX_NAME, model: str = MODEL) -> str:
    idx = client.index.create(
        name=name,
        models=[{
            "name":    model,
            "options": ["visual", "audio"]
        }]
    )
    print("index created:", idx.id)
    return idx.id


if __name__ == "__main__":
    index_id = create_index()