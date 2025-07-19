import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadPanel from './UploadPanel';

function UploadPage() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    // TODO: Implement Gallery page
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
                <div className="dropdown-item" onClick={() => handleDropdownItemClick('Discover')}>
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
        <div className="upload-bubble-container">
          <UploadPanel />
        </div>
      </div>
      <div className="dashboard-right">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#9ca3af',
          fontSize: 16,
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ 
            fontSize: 64, 
            marginBottom: 0,
            opacity: 0.6
          }}>
            🎬
          </div>
          <div style={{ 
            fontSize: 20, 
            fontWeight: 500, 
            marginBottom: 12,
            color: '#e8f5e8'
          }}>
            Share a Trail Video
          </div>
          <div style={{ 
            fontSize: 15, 
            color: '#9ca3af',
            lineHeight: 1.5,
            maxWidth: 300
          }}>
            Help riders preview the journey before the ride.
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage; 