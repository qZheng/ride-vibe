from twelvelabs import TwelveLabs
import time
import os

from dotenv import load_dotenv
load_dotenv()

# === Step 1: Initialize the client ===
client = TwelveLabs(
    api_key=os.getenv("TL_API_KEY")
)

# === Step 2: Upload the video ===
video_path = "data/videos/video.mp4"  # Replace with your file
video = client.videos.upload(video_path)
print(f"Uploaded video ID: {video.id}")

# === Step 3: Index the video using relevant engines ===
# For action detection like “jump”, 'visual' is essential. Optionally include 'conversation', etc.
video.index(["visual", "text_in_video"])  # text_in_video helps if there's GoPro HUD overlays, etc.

# === Step 4: Wait until indexing is complete ===
print("Indexing in progress... Please wait.")
while True:
    updated_video = client.videos.get(video.id)
    if updated_video.status == "indexed":
        print("Indexing complete.")
        break
    elif updated_video.status == "failed":
        raise Exception("Indexing failed.")
    time.sleep(5)

# === Step 5: Search for a “jump” ===
query = "mountain bike jump"  # you can try "big jump", "airtime", etc.
results = updated_video.search(query)

# === Step 6: Display results ===
if not results:
    print("No jump detected.")
else:
    for result in results:
        print(f"Match from {result.start:.2f}s to {result.end:.2f}s")
        print(f"Confidence Score: {result.score:.2f}")
        print(f"Preview URL: {result.preview_url}")
        print("-----")