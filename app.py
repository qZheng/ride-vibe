import streamlit as st
from scripts.semantic_search import search_best
from scripts.config import VIDEO_DIR
import os
import json

# Set page config
st.set_page_config(
    page_title="Trail Video Search",
    page_icon="🌲",
    layout="wide"
)

# Load trail metadata
def load_metadata():
    with open('data/trail_metadata.json') as f:
        return json.load(f)
    
metadata = load_metadata()

# Header
st.title("🌲 Trail Video Search")
query = st.text_input("Describe the trail experience you're looking for:", 
                      placeholder="Find a moody forest ride with fog and roots")

# Search function
def perform_search():
    if not query:
        st.warning("Please enter a search query")
        return None
    
    with st.spinner("Searching for matching trails..."):
        result = search_best(query)
        return result

# Display results
if st.button("Search") or query:
    result = perform_search()
    
    if result:
        video_id = result["video_id"]
        start_sec = result["start_sec"]
        end_sec = result["end_sec"]
        video_meta = next((item for item in metadata if item["video_id"] == video_id), None)
        
        if video_meta:
            col1, col2 = st.columns([1, 2])
            
            with col1:
                # Thumbnail would go here - we need to implement thumbnail generation
                st.image("https://placehold.co/600x400?text=Trail+Thumbnail", 
                         caption=f"{video_meta['trail_name']} - {video_meta['location']}")
                
                # Timestamp link
                st.write(f"**Matched Segment:** {start_sec//60}:{start_sec%60:02d}-{end_sec//60}:{end_sec%60:02d}")
                
            with col2:
                st.subheader(video_meta["trail_name"])
                st.caption(f"📍 {video_meta['location']} | ⏱️ {video_meta['duration']} min")
                st.write(video_meta["description"])
                
                # Highlights section
                st.subheader("Key Moments")
                if "features" in video_meta:
                    for feature in video_meta["features"]:
                        if "big airtime" in feature["description"].lower():
                            st.success(f"🚀 Big Airtime: {feature['description']} (at {feature['time']} min)")
                        if "sketchy" in feature["description"].lower():
                            st.warning(f"⚠️ Sketchy Descent: {feature['description']} (at {feature['time']} min)")
        else:
            st.error("No metadata found for this video")
    else:
        st.info("No matching trails found")