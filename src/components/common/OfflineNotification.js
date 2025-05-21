import React, { useState } from 'react';

const OfflineNotification = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Close notification
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      id="offlineNotification" 
      className="offline-notification"
      aria-hidden="false"
      role="alert"
    >
      <p>You are currently offline. Some features may be limited.</p>
      <button 
        id="dismissOfflineNotification" 
        onClick={handleDismiss}
        aria-label="Dismiss offline notification"
      >
        &times;
      </button>
    </div>
  );
};

export default OfflineNotification;
