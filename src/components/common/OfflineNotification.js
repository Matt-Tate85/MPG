import React, { useState } from 'react';
import { commonText, a11yText } from '../../data/text';

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
      <p>{commonText.offline}</p>
      <button 
        id="dismissOfflineNotification" 
        onClick={handleDismiss}
        aria-label={a11yText.dismissOffline}
      >
        &times;
      </button>
    </div>
  );
};

export default OfflineNotification;