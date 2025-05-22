// src/pages/CutDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCutById, getRelatedCuts } from '../services/meatDataService';

const CutDetailPage = () => {
  const { cutId } = useParams();
  const navigate = useNavigate();
  
  const [cut, setCut] = useState(null);
  const [relatedCuts, setRelatedCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch cut data and related cuts
  useEffect(() => {
    setLoading(true);
    
    try {
      // In a real app, this might be an API call
      // Here we're using our local data service
      const cutData = getCutById(cutId);
      
      if (cutData) {
        setCut(cutData);
        setRelatedCuts(getRelatedCuts(cutData, 3));
      } else {
        setError('Cut not found');
      }
      
      // Simulate network delay
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error fetching cut details:', err);
      setError('Failed to fetch cut details');
      setLoading(false);
    }
  }, [cutId]);
  
  // Handle back button click
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="loading-indicator">
        <span className="sr-only">Loading cut details</span>
        <div className="spinner"></div>
      </div>
    );
  }
  
  // Handle error state
  if (error || !cut) {
    return (
      <div className="error-content">
        <h2>Cut Not Found</h2>
        <p>Sorry, the meat cut you're looking for does not exist or could not be loaded.</p>
        <Link to="/" className="primary-btn">Go to Home Page</Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{cut.name} - AHDB Meat Purchasing Guide</title>
        <meta name="description" content={cut.description} />
      </Helmet>
      
      <section className="cut-detail-container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to={`/?type=${cut.type.toLowerCase()}`}>{cut.type}</Link></li>
            <li aria-current="page">{cut.name}</li>
          </ol>
        </nav>
        
        <div className="cut-detail-header">
          <div className="cut-detail-info">
            <span className="cut-detail-type">{cut.type}</span>
            <h2>{cut.name}</h2>
            <p className="cut-detail-description">{cut.description}</p>
            
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
            <img src={cut.image} alt={cut.name} className="cut-detail-image" />
          </div>
        </div>
        
        <div className="cut-detail-content">
          <div className="cut-detail-main">
            <div dangerouslySetInnerHTML={{ __html: cut.fullDescription }} />
          </div>
          
          <aside className="cut-detail-sidebar">
            <div className="sidebar-section">
              <h3>Cooking Methods</h3>
              <ul className="cooking-methods-list">
                {cut.cookingMethods.map(method => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            </div>
            
            <div className="sidebar-section">
              <h3>Characteristics</h3>
              <p>{cut.characteristics}</p>
            </div>
            
            <div className="sidebar-section">
              <h3>Alternative Cuts</h3>
              <ul className="alternatives-list">
                {cut.alternatives.map(alt => {
                  const altCut = getCutById(alt.toLowerCase().replace(/\s+/g, '-'));
                  if (altCut) {
                    return (
                      <li key={alt}>
                        <Link to={`/cut/${altCut.id}`}>{alt}</Link>
                      </li>
                    );
                  } else {
                    return <li key={alt}>{alt}</li>;
                  }
                })}
              </ul>
            </div>
            
            <div className="sidebar-section">
              <h3>External Resources</h3>
              <a 
                href={cut.externalUrl} 
                className="external-link" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on AHDB Website
                <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </svg>
              </a>
            </div>
          </aside>
        </div>
        
        {relatedCuts.length > 0 && (
          <div className="related-cuts">
            <h3>Related Cuts</h3>
            <div className="related-cuts-grid">
              {relatedCuts.map(relatedCut => (
                <Link 
                  key={relatedCut.id}
                  to={`/cut/${relatedCut.id}`}
                  className="meat-card"
                >
                  <img src={relatedCut.image} alt={relatedCut.name} className="meat-image" />
                  <div className="meat-content">
                    <span className="meat-type">{relatedCut.type}</span>
                    <h3 className="meat-title">{relatedCut.name}</h3>
                    <div className="meat-keywords">
                      {relatedCut.keywords.slice(0, 3).map(keyword => (
                        <span key={keyword} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="cut-detail-actions">
          <button 
            className="secondary-btn"
            onClick={handleBack}
          >
            <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Results
          </button>
          
          <a 
            href={cut.externalUrl}
            className="primary-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on AHDB Website
          </a>
        </div>
      </section>
    </>
  );
};

export default CutDetailPage;
