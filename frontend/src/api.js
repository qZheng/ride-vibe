const API_BASE_URL = 'http://localhost:8000';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Video Server API
export const videoApi = {
  async getServerStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.ok;
    } catch (error) {
      console.error('Server status check failed:', error);
      return false;
    }
  },

  async testConnection() {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();
      console.log('Backend connection successful:', data);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  },

  async getVideos() {
    try {
      const response = await fetch(`${API_BASE_URL}/videos`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      return [];
    }
  },

  async getVideoMetadata(videoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch video metadata:', error);
      return null;
    }
  },

  getVideoUrl(videoId) {
    return `${API_BASE_URL}/videos/${videoId}/file`;
  }
};

// Gemini API for chat and location detection
export const geminiApi = {
  async chat(message) {
    try {
      console.log('Sending message to Gemini:', message);
      const response = await fetch(`${API_BASE_URL}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      console.log('Gemini response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini chat failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Gemini response data:', data);
      
      return data;
    } catch (error) {
      console.error('Gemini chat error:', error);
      return {
        isLocation: false,
        response: "Sorry, I'm having trouble processing your request right now."
      };
    }
  }
};

// Real backend search using /search endpoint
export const twelveLabsApi = {
  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) {
        return {
          message: "Sorry, I couldn't find any videos matching your request.",
          videoId: null,
          timestamp: 0
        };
      }
      const data = await response.json();
      if (!data || !data.video_id) {
        return {
          message: "Sorry, I couldn't find any videos matching your request.",
          videoId: null,
          timestamp: 0
        };
      }
      const formattedTime = formatTime(data.start_sec || 0);
      return {
        message: `Here's a clip that matches your vibe: **${data.trail_name}**. Jumping to ${formattedTime}.`,
        videoId: data.video_id,
        timestamp: data.start_sec || 0
      };
    } catch (error) {
      return {
        message: "Sorry, there was an error searching for videos.",
        videoId: null,
        timestamp: 0
      };
    }
  }
};

export const api = {
  async searchAndGetVideo(query) {
    try {
            let geminiResult;
      try {
        geminiResult = await geminiApi.chat(query);
      } catch (geminiError) {
        geminiResult = { isLocation: true, response: "Searching for videos..." };
      }
      
      if (geminiResult.isLocation) {
        console.log('lf location, searching videos...');
        const searchResult = await twelveLabsApi.search(query);
        
        if (searchResult.videoId) {
          const metadata = await videoApi.getVideoMetadata(searchResult.videoId);
          return {
            message: searchResult.message,
            video: {
              url: videoApi.getVideoUrl(searchResult.videoId),
              timestamp: searchResult.timestamp,
              metadata: metadata
            }
          };
        }
        return {
          message: searchResult.message,
          video: null
        };
      } else {
        console.log('general question, returning Gemini response');
        return {
          message: geminiResult.response,
          video: null
        };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "Sorry, I encountered an error while processing your request. Try asking about mountain biking techniques or searching for specific trails!",
        video: null
      };
    }
  }
}; 