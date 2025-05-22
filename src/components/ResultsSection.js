import React from 'react';

const ResultsSection = ({ results, loading, error }) => {
  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <section className="results-section">
      <h2>Results</h2>
      <p className="results-count">
        {results.length ? `Showing ${results.length} cuts` : 'No results found'}
      </p>
      <div className="results-grid">
        {results.map(cut => (
          <div key={cut.id} className="meat-card">
            <div className="meat-content">
              <span className="meat-type">{cut.type}</span>
              <h3 className="meat-title">{cut.name}</h3>
              <p className="meat-description">{cut.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsSection;
