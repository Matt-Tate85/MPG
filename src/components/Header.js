import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { commonText, a11yText } from '../data/text';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img 
              src="/assets/icons/ahdb-logo.svg" 
              alt="AHDB Logo" 
              className="logo"
            />
            <h1>{commonText.appName}</h1>
          </Link>
        </div>
        
        <button 
          id="menuToggle" 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          aria-label={a11yText.toggleMenu}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="menu-icon"></span>
        </button>
      </div>
      
      <nav 
        className={`main-nav ${isMenuOpen ? 'active' : ''}`} 
        id="mainNav" 
        aria-label="Main navigation"
      >
        <ul>
          <li>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {commonText.home}
            </NavLink>
          </li>
          <li>
            <a 
              href="https://ahdb.org.uk/mpg" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {commonText.ahdbWebsite}
            </a>
          </li>
          <li>
            <a href="#" id="aboutLink">
              {commonText.about}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;