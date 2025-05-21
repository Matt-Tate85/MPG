import React from 'react';

const InstallPrompt = ({ onInstall, onDismiss }) => {
  return (
    <div 
      id="installPrompt" 
      className="install-prompt"
      aria-hidden="false"
    >
      <div className="prompt-content">
        <p>Add this app to your home screen for quick access, even when offline</p>
        <div className="prompt-actions">
          <button 
            className="primary-btn"
            onClick={onInstall}
            id="installButton"
          >
            Install
          </button>
          <button 
            className="secondary-btn"
            onClick={onDismiss}
            id="dismissPrompt"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
