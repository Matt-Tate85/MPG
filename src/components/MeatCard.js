import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { cutDescriptions } from '../data/text';

const MeatCard = ({ cut }) => {
  const cardRef = useRef(null);
  
  // Use custom description from text file if available, otherwise use default from data
  const description = cutDescriptions[cut.id] || cut.description;
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cardRef.current.click();
    }
  };
  
  return (
    <Link 
      to={`/cut/${cut.id}`}
      className="meat-card"
      ref={cardRef}
      onKeyDown={handleKeyDown}
      aria-label={`${cut.name} - ${cut.type}`}
    >
      <img 
        src={cut.image} 
        alt={`${cut.name} meat cut`} 
        className="meat-image"
        loading="lazy"
      />
      <div className="meat-content">
        <span className="meat-type">{cut.type}</span>
        <h3 className="meat-title">{cut.name}</h3>
        <p className="meat-description">{description}</p>
        <div className="meat-keywords">
          {cut.keywords.slice(0, 3).map(keyword => (
            <span key={keyword} className="keyword-tag">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MeatCard;