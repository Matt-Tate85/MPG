import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { commonText } from '../data/text';

const CutDetailPage = () => {
  const { cutId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cut, setCut] = useState(null);
  
  // Demo cut data for testing
  const sampleCut = {
    id: 'topside',
    name: 'Topside',
    type: 'Beef',
    description: 'A lean cut from the hindquarter, commonly used for roasting. Its leanness makes it a popular choice for those looking for a healthier option.',
    image: '/assets/images/beef/topside.jpg',
    keywords: ['roast', 'lean', 'economical', 'traditional'],
    cookingMethods: ['Roasting', 'Pot-roasting', 'Braising'],
    characteristics: 'Lean, tender when cooked properly, economical',
    alternatives: ['Silverside', 'Top Rump'],
    fullDescription: `
      <h2>Topside</h2>
      <p>Topside is a lean cut from the hindquarter of the animal, commonly used for roasting joints.</p>
      <h3>Characteristics</h3>
      <ul>
        <li>Lean with minimal fat</li>
        <li>Tender when cooked properly</li>
        <li>Economical compared to premium cuts</li>
        <li>Traditional British roasting joint</li>
      </ul>
    `
  };
  
  // Simulating data fetching - using a reference to sampleCut without causing dependencies
  // This is a workaround for the demo; in a real app, you'd fetch from an API
  useEffect(() => {
    setIsLoading(true);
    
    // Simulated data fetch delay
    const timer = setTimeout(() => {
      // In a real app, you'd fetch data based on cutId
      // For demo, we're using the sample data directly
      setCut(sampleCut);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cutId]); // only depend on cutId, not sampleCut
  
  // Handle back button click
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-indicator">
        <span className="sr-only">Loading cut details</span>
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!cut) {
    return (
      <div className="error-content">
        <h2>Cut Not Found</h2>
        <p>Sorry, the meat cut you're looking for does not exist.</p>
        <Link to="/" className="primary-btn">Go to Home Page</Link>
      </div>
    );
  }
  
  return (
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
      </div>
      
      <div className="cut-detail-content">
        <div className="cut-detail-main">
          <div dangerouslySetInnerHTML={{ __html: cut.fullDescription }} />
        </div>
        
        <aside className="cut-detail-sidebar">
          <div className="sidebar-section">
            <h3>{commonText.cookingMethods || 'Cooking Methods'}</h3>
            <ul className="cooking-methods-list">
              {cut.cookingMethods.map(method => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h3>{commonText.characteristics || 'Characteristics'}</h3>
            <p>{cut.characteristics}</p>
          </div>
          
          <div className="sidebar-section">
            <h3>{commonText.alternatives || 'Alternative Cuts'}</h3>
            <ul className="alternatives-list">
              {cut.alternatives.map(alt => (
                <li key={alt}>{alt}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      
      <div className="cut-detail-actions">
        <button 
          className="secondary-btn"
          onClick={handleBack}
        >
          Back to Results
        </button>
      </div>
    </section>
  );
};

export default CutDetailPage;


export default CutDetailPage;
