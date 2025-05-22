// Fixed Footer.js
import React, { useContext } from 'react';
import AppContext from '../contexts/AppContext';

const Footer = () => {
  const appContext = useContext(AppContext);
  const currentYear = new Date().getFullYear();
  
  // Simplified with fallback functions if context values are not available
  const handleOpenPrivacyModal = appContext?.handleOpenPrivacyModal || (() => {});
  const handleOpenAccessibilityModal = appContext?.handleOpenAccessibilityModal || (() => {});
  
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
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a 
                href="https://ahdb.org.uk" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                AHDB Website
              </a>
            </li>
            <li>
              <a 
                href="https://ahdb.org.uk/mpg" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Meat Purchasing Guide
              </a>
            </li>
            <li>
              <button 
                id="privacyLink"
                className="footer-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenPrivacyModal();
                }}
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button 
                id="accessibilityLink"
                className="footer-button"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenAccessibilityModal();
                }}
              >
                Accessibility
              </button>
            </li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h3>Contact</h3>
          <address>
            <p>Agriculture and Horticulture Development Board</p>
            <p>Stoneleigh Park, Kenilworth, Warwickshire, CV8 2TL</p>
            <p>Email: <a href="mailto:info@ahdb.org.uk">info@ahdb.org.uk</a></p>
          </address>
        </div>
      </div>
      
      <div className="copyright">
        <p>&copy; {currentYear} Agriculture and Horticulture Development Board. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
