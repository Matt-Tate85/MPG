import React from 'react';
import { Link } from 'react-router-dom';

const MeatCard = ({ cut }) => {
  if (!cut) return null;
  
  return (
    <Link 
      to={`/cut/${cut.id}`}
      className="meat-card"
      aria-label={`${cut.name} - ${cut.type}`}
    >
      <div className="meat-content">
        <span className="meat-type">{cut.type}</span>
        <h3 className="meat-title">{cut.name}</h3>
        <p className="meat-description">{cut.description}</p>
        <div className="meat-keywords">
          {cut.keywords && cut.keywords.slice(0, 3).map(keyword => (
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
