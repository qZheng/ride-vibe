import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatPanel from './components/ChatPanel';
import VideoPanel from './components/VideoPanel';
import { api, videoApi } from './api';

function DiscoverPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [video, setVideo] = useState({ videoUrl: '', timestamp: 0, metadata: null });
  const [serverStatus, setServerStatus] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check server status on mount and handle selected video from gallery
  useEffect(() => {
    checkServerStatus();
    
    // Handle selected video from gallery
    if (location.state?.selectedVideoId) {
      loadSelectedVideo(location.state.selectedVideoId);
      // Clear the state to prevent reloading on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const checkServerStatus = async () => {
    console.log('Checking server status...');
    const status = await videoApi.getServerStatus();
    console.log('Server status:', status);
    setServerStatus(status);
    
    // Also test the connection
    const connectionTest = await videoApi.testConnection();
    console.log('Connection test result:', connectionTest);
  };

  const loadSelectedVideo = async (videoId) => {
    try {
      const metadata = await videoApi.getVideoMetadata(videoId);
      setVideo({
        videoUrl: videoApi.getVideoUrl(videoId),
        timestamp: 0,
        metadata: metadata
      });
    } catch (error) {
      console.error('Error loading selected video:', error);
    }
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

  const handleSidebarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = (item) => {
    console.log(`Selected: ${item}`);
    setIsDropdownOpen(false);
    
    if (item === 'Upload') {
      navigate('/upload');
    } else if (item === 'Gallery') {
      navigate('/gallery');
    }
    // Discover button does nothing when already on discover page
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.sidebar-button') && !e.target.closest('.dropdown-menu')) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="dashboard-root">
      <div className="dashboard-left">
        <div className="title-bubble">
          <div className="sidebar-button" onClick={handleSidebarClick}>
            <div className="sidebar-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item current-page" onClick={() => handleDropdownItemClick('Discover')}>
                  Discover
                </div>
                <div className="dropdown-item" onClick={() => handleDropdownItemClick('Upload')}>
                  Upload
                </div>
                <div className="dropdown-item" onClick={() => handleDropdownItemClick('Gallery')}>
                  Gallery
                </div>
              </div>
            )}
          </div>
          <h1>TrailSense<small><small><small> v0.1</small></small></small></h1>
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

export default DiscoverPage; 