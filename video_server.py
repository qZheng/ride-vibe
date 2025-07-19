from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import json
import os
from pathlib import Path
from datetime import datetime
from scripts.config import VIDEO_DIR, META_PATH
from scripts.semantic_search import search_best
from scripts.gemini_analysis import analyze_chat_message

app = Flask(__name__)
CORS(app)

# Helper functions

def load_metadata():
    if not META_PATH.exists():
        return []
    return json.loads(META_PATH.read_text())

def get_video_meta(video_id):
    for video in load_metadata():
        if video["video_id"] == video_id:
            return video
    return None

@app.route("/")
def health():
    return jsonify({"message": "TrailSense Video Server (Flask)", "status": "healthy"})

@app.route("/videos")
def list_videos():
    return jsonify(load_metadata())

@app.route("/videos/<video_id>")
def get_video(video_id):
    meta = get_video_meta(video_id)
    if not meta:
        return jsonify({"error": "Video not found"}), 404
    return jsonify(meta)

@app.route("/videos/<video_id>/file")
def get_video_file(video_id):
    meta = get_video_meta(video_id)
    if not meta:
        return jsonify({"error": "Video not found"}), 404
    file_path = VIDEO_DIR / meta["filename"]
    if not file_path.exists():
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(str(VIDEO_DIR), meta["filename"], mimetype="video/mp4")

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query", "")
    options = data.get("options", ["visual", "audio"])
    
    try:
        # Use the existing search_best function from scripts
        result = search_best(query, tuple(options))
        if result is None:
            return jsonify({}), 200
        return jsonify(result)
    except Exception as e:
        error_message = str(e)

@app.route("/gemini/chat", methods=["POST"])
def gemini_chat():
    data = request.get_json()
    message = data.get("message", "")
    
    try:
        # Use Gemini to analyze the message and determine if it's a location request
        result = analyze_chat_message(message)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload", methods=["POST"])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({"error": "No video file selected"}), 400
        
        # Validate file type
        allowed_extensions = {'.mp4', '.mov', '.avi', '.mkv'}
        file_ext = Path(video_file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            return jsonify({"error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"}), 400
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{video_file.filename}"
        file_path = VIDEO_DIR / filename
        
        # Save the file
        video_file.save(str(file_path))
        
        # Get form data
        trail_name = request.form.get('trail_name', Path(video_file.filename).stem)
        location = request.form.get('location', '')
        description = request.form.get('description', '')
        
        # Create metadata entry
        metadata = load_metadata()
        new_entry = {
            "filename": filename,
            "video_id": f"upload_{timestamp}",
            "trail_name": trail_name,
            "duration": None,  # TODO: Extract duration from video
            "indexed_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "location": {
                "latitude": None,
                "longitude": None,
                "name": location
            },
            "difficulty_rating": None,
            "description": description
        }
        
        metadata.append(new_entry)
        
        # Save updated metadata
        with open(META_PATH, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return jsonify({
            "message": "Video uploaded successfully",
            "video_id": new_entry["video_id"],
            "filename": filename
        })
        
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 