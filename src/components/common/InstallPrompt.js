import React from 'react';
import { commonText } from '../../data/text';
import Button from './Button';

const InstallPrompt = ({ onInstall, onDismiss }) => {
  return (
    <div 
      id="installPrompt" 
      className="install-prompt show"
      aria-hidden="false"
    >
      <div className="prompt-content">
        <p>{commonText.installPrompt}</p>
        <div className="prompt-actions">
          <Button 
            variant="primary" 
            onClick={onInstall}
            id="installButton"
          >
            {commonText.install}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onDismiss}
            id="dismissPrompt"
          >
            {commonText.notNow}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;