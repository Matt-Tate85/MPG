import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
            <h1>AHDB Meat Purchasing Guide</h1>
          </Link>
        </div>
        
        <button 
          id="menuToggle" 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          aria-label="Toggle menu"
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
            <Link to="/">Meat Guide</Link>
          </li>
          <li>
            <a 
              href="https://ahdb.org.uk/mpg" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              AHDB Website
            </a>
          </li>
          <li>
            <button 
              id="aboutLink"
              className="nav-button"
              onClick={(e) => e.preventDefault()}
            >
              About
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;


export default Header;
