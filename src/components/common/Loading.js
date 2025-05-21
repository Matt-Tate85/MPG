import React from 'react';
import { a11yText } from '../../data/text';

const Loading = ({ size = 'medium', message }) => {
  // Determine spinner size
  const spinnerSize = {
    small: { width: '24px', height: '24px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' }
  }[size] || { width: '40px', height: '40px' };
  
  // Custom message or default
  const loadingMessage = message || a11yText.loadingContent;
  
  return (
    <div className="loading-indicator" aria-hidden="false">
      <span className="sr-only">{loadingMessage}</span>
      <div 
        className="spinner" 
        style={spinnerSize}
        role="status"
        aria-label={loadingMessage}
      ></div>
      {/* Optional visible message */}
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;