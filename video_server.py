"""
Video Server for Ride Vibe
Lightweight video hosting service for streaming videos to React frontend
"""

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import json
from pathlib import Path
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
    return jsonify({"message": "Ride Vibe Video Server (Flask)", "status": "healthy"})

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
        
        # Check if it's a rate limit error
        if "429" in error_message or "too_many_requests" in error_message.lower():
            return jsonify({
                "error": "Rate limit exceeded",
                "message": "We've hit our daily search limit. Please try again tomorrow or contact support for more searches.",
                "rate_limited": True
            }), 429
        elif "rate limit" in error_message.lower():
            return jsonify({
                "error": "Rate limit exceeded",
                "message": "We've hit our daily search limit. Please try again tomorrow or contact support for more searches.",
                "rate_limited": True
            }), 429
        else:
            return jsonify({"error": str(e)}), 500

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 