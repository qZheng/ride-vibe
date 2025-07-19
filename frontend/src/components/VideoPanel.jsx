import React, { useEffect, useRef } from 'react';

export default function VideoPanel({ videoUrl, timestamp, metadata }) {
  const videoRef = useRef(null);

  // Debug logging for location data
  useEffect(() => {
    if (metadata) {
      console.log('VideoPanel metadata:', metadata);
      console.log('Location data:', metadata.location);
      if (metadata.location) {
        console.log('Latitude:', metadata.location.latitude);
        console.log('Longitude:', metadata.location.longitude);
      }
    }
  }, [metadata]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = timestamp || 0;
    }
  }, [videoUrl, timestamp]);

  if (!videoUrl) {
    return (
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
          🎥
        </div>
        <div style={{ 
          fontSize: 20, 
          fontWeight: 500, 
          marginBottom: 12,
          color: '#e8f5e8'
        }}>
          Waiting for your first trail clip
        </div>
        <div style={{ 
          fontSize: 15, 
          color: '#9ca3af',
          lineHeight: 1.5,
          maxWidth: 300
        }}>
          Send a vibe prompt on the left and the perfect helmet-cam moment pops up here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Video player */}
      <div style={{ 
        flex: 1, 
        minHeight: 0,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        background: '#000',
        border: '1px solid #1a2e1a'
      }}>
        <video
          ref={videoRef}
          width="100%"
          height="100%"
          controls
          src={videoUrl}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#000'
          }}
        />
      </div>

      {/* Video information and map layout */}
      {metadata && (
        <div style={{ 
          marginTop: 24,
          display: 'flex',
          gap: 16,
          height: '300px'
        }}>
          {/* Left side - Video information */}
          <div style={{ 
            flex: 1,
            padding: 24, 
            background: '#0f1a0f', 
            borderRadius: 16,
            border: '1px solid #1a2e1a',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 18, 
              fontWeight: 600,
              color: '#e8f5e8' 
            }}>
              {metadata.trail_name || 'Mountain Bike Trail'}
            </h3>
            
            {/* AI Analysis Section */}
            {metadata.summary && (
              <div style={{ 
                marginBottom: 16,
                padding: 16,
                background: 'linear-gradient(135deg, #0a0f0a 0%, #1a2e1a 100%)',
                borderRadius: 12,
                border: '1px solid #1a2e1a'
              }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#9ca3af',
                  marginBottom: 8
                }}>
                  🤖 AI Analysis
                </div>
                <div style={{ 
                  fontSize: 15, 
                  lineHeight: 1.6,
                  color: '#e8f5e8'
                }}>
                  {metadata.summary}
                </div>
              </div>
            )}
            
            {/* Key Features */}
            {metadata.key_features && metadata.key_features.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#9ca3af',
                  marginBottom: 8
                }}>
                  🎯 Key Features
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 8 
                }}>
                  {metadata.key_features.map((feature, index) => (
                    <span key={index} style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid #059669'
                    }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trail Details */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 16, 
              fontSize: 14,
              marginBottom: 16
            }}>
              {/* Difficulty - Full width */}
              <div>
                <strong style={{ color: '#9ca3af' }}>Difficulty:</strong>
                <div style={{ 
                  marginTop: 4,
                  padding: '8px 16px',
                  background: (() => {
                    if (metadata.difficulty_rating === 'Unknown' || !metadata.difficulty_rating) return '#0a0f0a';
                    const difficulty = parseFloat(metadata.difficulty_rating);
                    if (isNaN(difficulty)) return '#0a0f0a';
                    // Green to yellow to red gradient based on difficulty (1-10 scale)
                    if (difficulty <= 3) return '#064e3b'; // Green
                    if (difficulty <= 5) return '#78350f'; // Yellow/Orange
                    if (difficulty <= 7) return '#7c2d12'; // Orange/Red
                    return '#7f1d1d'; // Red
                  })(),
                  color: (() => {
                    if (metadata.difficulty_rating === 'Unknown' || !metadata.difficulty_rating) return '#9ca3af';
                    const difficulty = parseFloat(metadata.difficulty_rating);
                    if (isNaN(difficulty)) return '#9ca3af';
                    if (difficulty <= 3) return '#6ee7b7'; // Green text
                    if (difficulty <= 5) return '#fbbf24'; // Yellow text
                    if (difficulty <= 7) return '#fb923c'; // Orange text
                    return '#fca5a5'; // Red text
                  })(),
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'block',
                  border: '1px solid #1a2e1a',
                  textAlign: 'center'
                }}>
                  {metadata.difficulty_rating || 'Not rated'}
                </div>
              </div>
              
              {/* Other details in grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 16
              }}>
                <div>
                  <strong style={{ color: '#9ca3af' }}>Terrain:</strong>
                  <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                    {metadata.terrain_type || 'Unknown'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#9ca3af' }}>Indexed at:</strong>
                  <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                    {metadata.indexed_at ? new Date(metadata.indexed_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#9ca3af' }}>Latitude:</strong>
                  <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                    {metadata.location && metadata.location.latitude ? metadata.location.latitude.toFixed(6) : 'Unknown'}
                  </div>
                </div>
                <div>
                  <strong style={{ color: '#9ca3af' }}>Longitude:</strong>
                  <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                    {metadata.location && metadata.location.longitude ? metadata.location.longitude.toFixed(6) : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
            

          </div>

          {/* Right side - Google Maps embed */}
          <div style={{ 
            width: '350px',
            padding: 16, 
            background: '#0f1a0f', 
            borderRadius: 16,
            border: '1px solid #1a2e1a',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Google Maps embed */}
            {metadata.location && metadata.location.latitude && metadata.location.longitude ? (
              <div style={{ 
                flex: 1,
                borderRadius: 12,
                border: '1px solid #1a2e1a',
                overflow: 'hidden',
                minHeight: '250px'
              }}>
                <iframe
                  title="Trail Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${metadata.location.latitude},${metadata.location.longitude}&zoom=15&maptype=satellite`}
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ 
                flex: 1,
                background: '#0a0f0a',
                borderRadius: 12,
                border: '1px solid #1a2e1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 14,
                minHeight: '250px'
              }}>
                📍 Location data not available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 