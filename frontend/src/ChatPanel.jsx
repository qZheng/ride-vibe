import React, { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ onSearch, isConnected }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const response = await onSearch(userMessage);
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.message || 'Found some great mountain biking videos for you!',
        videoData: response.video_data
      }]);
    } catch (error) {
      console.error('Search error:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, I encountered an error while searching. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  return (
    <div className="chat-bubble-container">
      <div className="messages-container">
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af', 
            marginTop: '40px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: '#e8f5e8' }}>
              Welcome to TrailSense!
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Ask me about mountain biking trails, techniques, or find videos to watch.
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.type}`}>
            <div className="chat-bubble-content">
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-bubble">
            <div className="loading-bubble-content">
              <span>Searching for videos...</span>
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about mountain biking trails, techniques, or find videos..."
            disabled={isLoading}
            rows={1}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 