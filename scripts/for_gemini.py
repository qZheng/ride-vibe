import json
import sys
from .config import client, INDEX_ID

def get_video_metadata(video_id: str) -> dict:
    try:
        videos = client.index.video.list(INDEX_ID)
        video = next((v for v in videos.root if v.id == video_id), None)
        if not video:
            raise ValueError(f"Video {video_id} not found in index {INDEX_ID}")
        
        return {
            "video_id": video_id,
            "title": getattr(video, 'title', 'Unknown'),
            "duration": getattr(video, 'duration', None),
            "description": getattr(video, 'description', ''),
        }
    except Exception as e:
        print(f"Error getting metadata for video {video_id}: {e}")
        return None

def get_metadata_text(video_id: str) -> str:
    metadata = get_video_metadata(video_id)
    if not metadata:
        return ""
    text = f"Title: {metadata['title']}\n"
    if metadata.get('duration'):
        text += f"Duration: {metadata['duration']} seconds\n"
    if metadata.get('description'):
        text += f"Description: {metadata['description']}\n"
    return text

def main():
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.get_play_by_play <video_id>")
        sys.exit(1)
    video_id = sys.argv[1]
    metadata = get_video_metadata(video_id)
    if metadata:
        print(json.dumps(metadata, indent=2))
    else:
        print("Failed to get video metadata")

if __name__ == "__main__":
    main() 