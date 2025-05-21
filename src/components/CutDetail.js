import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRelatedCuts } from '../data';
import { commonText, cutDescriptions } from '../data/text';

// Components
import MeatCard from './MeatCard';
import Button from './common/Button';

const CutDetail = ({ cut }) => {
  const navigate = useNavigate();
  
  // Get related cuts
  const relatedCuts = getRelatedCuts(cut, 3);
  
  // Use custom description from text file if available, otherwise use default from data
  const description = cutDescriptions[cut.id] || cut.description;
  
  // Handle back button click
  const handleBack = () => {
    // Go back if there's history, otherwise go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  return (
    <section className="cut-detail-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to={`/?type=${cut.type.toLowerCase()}`}>{cut.type}</Link></li>
          <li aria-current="page">{cut.name}</li>
        </ol>
      </nav>
      
      {/* Header */}
      <div className="cut-detail-header">
        <div className="cut-detail-info">
          <span className="cut-detail-type">{cut.type}</span>
          <h2>{cut.name}</h2>
          <p className="cut-detail-description">{description}</p>
          
          <div className="cut-detail-keywords">
            {cut.keywords.map(keyword => (
              <Link 
                key={keyword} 
                to={`/?keywords=${keyword}`} 
                className="keyword-tag"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="cut-detail-image-container">
          <img 
            src={cut.image} 
            alt={`${cut.name} meat cut`} 
            className="cut-detail-image"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="cut-detail-content">
        <div className="cut-detail-main">
          {/* Use the HTML content from the fullDescription field */}
          <div dangerouslySetInnerHTML={{ __html: cut.fullDescription }} />
        </div>
        
        <aside className="cut-detail-sidebar">
          <div className="sidebar-section">
            <h3>{commonText.cookingMethods}</h3>
            <ul className="cooking-methods-list">
              {cut.cookingMethods.map(method => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3>{commonText.characteristics}</h3>
            <p>{cut.characteristics}</p>
          </div>
          
          <div className="sidebar-section">
            <h3>{commonText.alternatives}</h3>
            <ul className="alternatives-list">
              {cut.alternatives.map(alt => (
                <li key={alt}>
                  {/* Find the alternative cut and link to it if it exists */}
                  {cut.alternatives.find(a => a.name === alt) ? (
                    <Link to={`/cut/${alt.id}`}>{alt}</Link>
                  ) : (
                    alt
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3>{commonText.externalResources}</h3>
            <a 
              href={cut.externalUrl} 
              className="external-link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {commonText.viewOnWebsite}
              <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
                <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
            </a>
          </div>
        </aside>
      </div>
      
      {/* Related Cuts */}
      <div className="related-cuts">
        <h3>{commonText.relatedCuts}</h3>
        <div className="related-cuts-grid">
          {relatedCuts.map(relatedCut => (
            <MeatCard key={relatedCut.id} cut={relatedCut} />
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="cut-detail-actions">
        <Button 
          variant="secondary" 
          onClick={handleBack}
          iconLeft={
            <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          }
        >
          {commonText.back}
        </Button>
        
        <a 
          href={cut.externalUrl} 
          className="primary-btn" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {commonText.viewOnWebsite}
        </a>
      </div>
    </section>
  );
};

export default CutDetail;