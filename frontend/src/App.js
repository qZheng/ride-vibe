import React, { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import VideoPanel from './VideoPanel';
import { api, videoApi } from './api';
import './App.css';

function App() {
  const [video, setVideo] = useState({ videoUrl: '', timestamp: 0, metadata: null });
  const [serverStatus, setServerStatus] = useState(false);

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    console.log('Checking server status...');
    const status = await videoApi.getServerStatus();
    console.log('Server status:', status);
    setServerStatus(status);
    
    // Also test the connection
    const connectionTest = await videoApi.testConnection();
    console.log('Connection test result:', connectionTest);
  };

  const handleSearch = async (userMessage) => {
    try {
      // Get response from backend
      const result = await api.searchAndGetVideo(userMessage);
      
      // Update video if one was found
      if (result.video) {
        setVideo({
          videoUrl: result.video.url,
          timestamp: result.video.timestamp,
          metadata: result.video.metadata
        });
      }
      
      return {
        message: result.message,
        video_data: result.video
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-left">
        <div className="title-bubble">
          <h1>TrailSense v0.1</h1>
        </div>
        <ChatPanel 
          onSearch={handleSearch}
          isConnected={serverStatus}
        />
      </div>
      <div className="dashboard-right">
        <VideoPanel 
          videoUrl={video.videoUrl} 
          timestamp={video.timestamp}
          metadata={video.metadata}
        />
      </div>
    </div>
  );
}

export default App;
