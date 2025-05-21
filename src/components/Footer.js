import React, { useContext } from 'react';
import { commonText } from '../data/text';
import AppContext from '../contexts/AppContext';

const Footer = () => {
  const { handleOpenAboutModal, handleOpenPrivacyModal, handleOpenAccessibilityModal } = useContext(AppContext);
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img 
            src="/assets/icons/ahdb-logo-white.svg" 
            alt="AHDB Logo" 
            className="logo"
          />
        </div>
        
        <div className="footer-links">
          <h3>{commonText.quickLinks}</h3>
          <ul>
            <li>
              <a 
                href="https://ahdb.org.uk" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {commonText.ahdbWebsite}
              </a>
            </li>
            <li>
              <a 
                href="https://ahdb.org.uk/mpg" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {commonText.appName}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                id="privacyLink"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenPrivacyModal();
                }}
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a 
                href="#" 
                id="accessibilityLink"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenAccessibilityModal();
                }}
              >
                Accessibility
              </a>
            </li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h3>{commonText.contact}</h3>
          <address>
            <p>{commonText.orgName}</p>
            <p>{commonText.orgAddress}</p>
            <p>Email: <a href={`mailto:${commonText.orgEmail}`}>{commonText.orgEmail}</a></p>
          </address>
        </div>
      </div>
      
      <div className="copyright">
        <p>{commonText.copyright(currentYear)}</p>
      </div>
    </footer>
  );
};

export default Footer;