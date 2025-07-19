import React, { useEffect, useRef } from 'react';

export default function VideoPanel({ videoUrl, timestamp, metadata }) {
  const videoRef = useRef(null);

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
          marginBottom: 24,
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
          No video loaded
        </div>
        <div style={{ 
          fontSize: 15, 
          color: '#9ca3af',
          lineHeight: 1.5,
          maxWidth: 300
        }}>
          Send a message in the chat to discover mountain biking videos
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
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 16, 
              fontSize: 14,
              marginBottom: 16
            }}>
              <div>
                <strong style={{ color: '#9ca3af' }}>Difficulty:</strong>
                <div style={{ 
                  marginTop: 4,
                  padding: '4px 12px',
                  background: metadata.difficulty_rating === 'Unknown' ? '#0a0f0a' : '#064e3b',
                  color: metadata.difficulty_rating === 'Unknown' ? '#9ca3af' : '#6ee7b7',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-block',
                  border: '1px solid #1a2e1a'
                }}>
                  {metadata.difficulty_rating || 'Not rated'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#9ca3af' }}>Skill Level:</strong>
                <div style={{ 
                  marginTop: 4,
                  padding: '4px 12px',
                  background: metadata.recommended_skill_level === 'Unknown' ? '#0a0f0a' : '#065f46',
                  color: metadata.recommended_skill_level === 'Unknown' ? '#9ca3af' : '#5eead4',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-block',
                  border: '1px solid #1a2e1a'
                }}>
                  {metadata.recommended_skill_level || 'Not specified'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#9ca3af' }}>Terrain:</strong>
                <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                  {metadata.terrain_type || 'Unknown'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#9ca3af' }}>Duration:</strong>
                <div style={{ color: '#e8f5e8', marginTop: 4 }}>
                  {metadata.duration ? `${metadata.duration}s` : 'Unknown'}
                </div>
              </div>
            </div>
            
            {/* Timestamp indicator */}
            {timestamp > 0 && (
              <div style={{ 
                marginTop: 'auto',
                padding: 12, 
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', 
                borderRadius: 12,
                color: '#6ee7b7',
                fontSize: 14,
                fontWeight: 500,
                border: '1px solid #047857'
              }}>
                🎯 <strong>Jumped to:</strong> {timestamp.toFixed(1)} seconds
              </div>
            )}
          </div>

          {/* Right side - Google Maps embed */}
          <div style={{ 
            width: '300px',
            padding: 24, 
            background: '#0f1a0f', 
            borderRadius: 16,
            border: '1px solid #1a2e1a',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 18, 
              fontWeight: 600,
              color: '#e8f5e8' 
            }}>
              📍 Location
            </h3>
            
            {/* Google Maps embed placeholder */}
            <div style={{ 
              flex: 1,
              background: '#0a0f0a',
              borderRadius: 12,
              border: '1px solid #1a2e1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: 14
            }}>
              🗺️ Google Maps Embed
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 