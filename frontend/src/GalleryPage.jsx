import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoApi } from './api';

function GalleryPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const videosPerPage = 6; // 2x3 grid

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const videoList = await videoApi.getVideos();
      console.log('Fetched videos:', videoList);
      setVideos(videoList);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
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
    } else if (item === 'Discover') {
      navigate('/');
    }
    // Gallery button does nothing when already on gallery page
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.sidebar-button') && !e.target.closest('.dropdown-menu')) {
      setIsDropdownOpen(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(videos.length / videosPerPage);
    setCurrentPage(prev => Math.min(maxPage, prev + 1));
  };

  const handleVideoClick = (videoId) => {
    // Navigate to discover page with the selected video
    navigate('/', { state: { selectedVideoId: videoId } });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Calculate pagination
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const currentVideos = videos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(videos.length / videosPerPage);

  // Create placeholder videos if not enough videos
  const displayVideos = [...currentVideos];
  while (displayVideos.length < videosPerPage) {
    displayVideos.push({ id: `placeholder-${displayVideos.length}`, isPlaceholder: true });
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-left">
        <div className="title-section">
          <div className="title-bubble">
            <div className="sidebar-button" onClick={handleSidebarClick}>
              <div className="sidebar-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('Discover')}>
                    Discover
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('Upload')}>
                    Upload
                  </div>
                  <div className="dropdown-item current-page" onClick={() => handleDropdownItemClick('Gallery')}>
                    Gallery
                  </div>
                </div>
              )}
            </div>
            <h1>TrailSense<small><small><small> v0.1</small></small></small></h1>
          </div>

          {/* Small Pagination Bubble */}
          <div className="pagination-bubble">
            <button 
              className="page-arrow left" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              ←
            </button>
            <span className="page-info">{currentPage} / {Math.max(1, totalPages)}</span>
            <button 
              className="page-arrow right" 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : (
          <div className="video-grid">
            {displayVideos.map((video, index) => (
              <div 
                key={video.video_id || video.id || `video-${index}`} 
                className={`video-bubble ${video.isPlaceholder ? 'placeholder' : ''} ${index < 3 ? 'large' : 'small'}`}
                onClick={() => !video.isPlaceholder && handleVideoClick(video.video_id || video.id)}
              >
                {video.isPlaceholder ? (
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📹</div>
                    <p>No video available</p>
                  </div>
                ) : (
                  <>
                    <video 
                      className="video-thumbnail"
                      muted
                      onLoadedData={(e) => {
                        // Set video to a specific frame for thumbnail
                        e.target.currentTime = 2;
                      }}
                    >
                      <source src={videoApi.getVideoUrl(video.video_id || video.id)} type="video/mp4" />
                    </video>
                    <div className="video-info">
                      <h4>{video.trail_name || `Video ${video.video_id || video.id}`}</h4>
                      <p>{video.location?.name || (typeof video.location === 'string' ? video.location : 'Unknown location')}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryPage; 