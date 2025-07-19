import React, { useState, useRef } from 'react';
import { videoApi } from './api';

const UploadPanel = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [trailName, setTrailName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      // Auto-generate trail name from filename
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTrailName(name.charAt(0).toUpperCase() + name.slice(1));
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file first');
      return;
    }

    if (!trailName.trim()) {
      alert('Please enter a trail name');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Preparing upload...');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('trail_name', trailName);

      // Simulate upload progress (since we don't have actual upload endpoint yet)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to backend
      const response = await videoApi.uploadVideo(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('Upload completed successfully!');

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setTrailName('');
        setUploadProgress(0);
        setUploadStatus('');
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTrailName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <div className="upload-section">
          <h3>Add your gnarly POV riding footage:</h3>
          <div 
            className="file-drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div className="file-selected">
                <div className="file-icon">🎬</div>
                <div className="file-info">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div className="file-placeholder">
                <div className="upload-icon">📁</div>
                <p>Drag or click to add your riding footage</p>
                <p className="file-hint">MP4 / MOV / AVI ≤ 3 min</p>
              </div>
            )}
          </div>
        </div>

        <div className="upload-section">
          <div className="form-group">
            <label>Trail Name (required)</label>
            <input
              type="text"
              value={trailName}
              onChange={(e) => setTrailName(e.target.value)}
              placeholder="e.g. “Dirt Merchant, Whistler”"
              disabled={isUploading}
            />
          </div>
        </div>

        {isUploading && (
          <div className="upload-progress-section">
            <h3>Uploading...</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="upload-status">{uploadStatus}</p>
          </div>
        )}

        <div className="upload-actions">
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Uploading...' : 'Index This Clip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel; 