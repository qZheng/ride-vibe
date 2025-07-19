import os
from pathlib import Path
from dotenv import load_dotenv
from twelvelabs import TwelveLabs

load_dotenv()

API_KEY   = os.getenv("TWELVELABS_API_KEY")  # keep the official variable
INDEX_ID  = os.getenv("TL_INDEX_ID")         # will be filled after creation
MODEL    = os.getenv("TL_MODEL", "marengo2.7")  # default: latest multimodal

if not API_KEY:
    raise RuntimeError("Set twelve api key")

client: TwelveLabs = TwelveLabs(api_key=API_KEY)

BASE_DIR      = Path(__file__).resolve().parent.parent
VIDEO_DIR     = BASE_DIR / "data" / "videos"
META_PATH     = BASE_DIR / "data" / "trail_metadata.json"
META_PATH.parent.mkdir(parents=True, exist_ok=True)
