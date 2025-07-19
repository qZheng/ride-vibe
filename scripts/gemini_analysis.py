#!/usr/bin/env python3
"""
Analyze video summaries using Gemini AI
"""

import json
import os
import google.generativeai as genai
from .for_gemini import get_metadata_text

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY')) # type: ignore
model = genai.GenerativeModel('gemini-1.5-flash') # type: ignore

def analyze_chat_message(message: str) -> dict:
    """Analyze a chat message to determine if user is looking for a location or asking a general question"""
    try:
        prompt = f"""
        You are a helpful mountain biking assistant for TrailSense. Analyze this user message:

        User message: "{message}"

        Determine if the user is:
        1. Looking for a specific location/trail to ride (e.g., "where can I find jumps", "show me downhill trails", "find me a flow trail")
        2. Asking a general mountain biking question (e.g., "how to bunny hop", "what gear do I need", "tips for beginners")

        Respond with JSON in this exact format:
        {{
            "isLocation": true/false,
            "response": "your response here"
        }}

        If isLocation is true, the response should be brief since we'll search for videos.
        If isLocation is false, provide a helpful, casual response about mountain biking (keep it short and friendly).
        
        Examples:
        - "show me jumps" → {{"isLocation": true, "response": "Looking for jump videos..."}}
        - "how do I bunny hop" → {{"isLocation": false, "response": "Start with your pedals level, compress down, then explode upward while pulling up on the bars. Practice on flat ground first!"}}
        - "where are good trails" → {{"isLocation": true, "response": "Searching for trail videos..."}}
        - "what's the best bike" → {{"isLocation": false, "response": "Depends on your riding style! Hardtails are great for beginners, full suspension for rougher terrain. What kind of riding are you into?"}}
        """
        
        response = model.generate_content(prompt)
        
        try:
            text = response.text
            if '```json' in text:
                json_start = text.find('```json') + 7
                json_end = text.find('```', json_start)
                json_str = text[json_start:json_end].strip()
            elif '```' in text:
                json_start = text.find('```') + 3
                json_end = text.find('```', json_start)
                json_str = text[json_start:json_end].strip()
            else:
                json_str = text.strip()
            
            result = json.loads(json_str)
            
            if 'isLocation' not in result or 'response' not in result:
                raise ValueError("Invalid response format")
                
            return result
            
        except (json.JSONDecodeError, ValueError) as e:
            return {
                "isLocation": False,
                "response": "I'm here to help with mountain biking questions! Feel free to ask about techniques, gear, or search for specific trail videos."
            }
            
    except Exception as e:
        return {
            "isLocation": False,
            "response": "Sorry, I'm having trouble processing that right now. Try asking about mountain biking techniques or searching for specific trails!"
        }

def analyze_video(video_id: str, search_query: str = "") -> dict:
    """Analyze a video using Gemini AI based on Twelve Labs summary and search context"""
    try:
        # Get video metadata from Twelve Labs
        summary_text = get_metadata_text(video_id)
        
        # Create a more comprehensive prompt that works with limited metadata
        prompt = f"""
        Analyze this mountain biking video based on the available information and search context:

        Video Metadata:
        {summary_text}

        Search Query: {search_query}

        Based on the search query and available metadata, provide insights about this mountain biking video.
        If metadata is limited, use the search query context to infer what the user is looking for.

        Please provide a JSON response with the following structure:
        {{
            "summary": "A concise 2-3 sentence summary based on available info and search context",
            "difficulty_rating": "A difficulty rating from 1-10 (1=easy, 10=extreme) or 'Unknown' if insufficient info",
            "key_features": ["List of 3-5 key trail features or obstacles based on search context"],
            "recommended_skill_level": "Beginner/Intermediate/Advanced/Expert/Unknown",
            "terrain_type": "Type of terrain (e.g., flow trail, technical, downhill, etc.) or 'Unknown'"
        }}

        Focus on mountain biking trail characteristics and provide actionable insights for riders.
        If information is limited, be honest about what can and cannot be determined.
        """
        
        response = model.generate_content(prompt)
        
        # Try to parse JSON from response
        try:
            # Extract JSON from the response text
            text = response.text
            # Find JSON block if it's wrapped in markdown
            if '```json' in text:
                json_start = text.find('```json') + 7
                json_end = text.find('```', json_start)
                json_str = text[json_start:json_end].strip()
            elif '```' in text:
                json_start = text.find('```') + 3
                json_end = text.find('```', json_start)
                json_str = text[json_start:json_end].strip()
            else:
                json_str = text.strip()
            
            analysis = json.loads(json_str)
            return analysis
            
        except json.JSONDecodeError as e:
            # Fallback: return structured text response
            return {
                "summary": response.text[:200] + "..." if len(response.text) > 200 else response.text,
                "difficulty_rating": "Unknown",
                "key_features": [],
                "recommended_skill_level": "Unknown",
                "terrain_type": "Unknown",
                "raw_response": response.text
            }
            
    except Exception as e:
        return {"error": f"Gemini analysis failed: {str(e)}"}

def main():
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.gemini_analysis <video_id> [search_query]")
        sys.exit(1)
    
    video_id = sys.argv[1]
    search_query = sys.argv[2] if len(sys.argv) > 2 else ""
    analysis = analyze_video(video_id, search_query)
    print(json.dumps(analysis, indent=2))

if __name__ == "__main__":
    main() 