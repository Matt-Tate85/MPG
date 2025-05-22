// src/components/ResultsSection.js
import React from 'react';
import { Link } from 'react-router-dom';

const ResultsSection = ({ results, loading, error }) => {
  // Handle loading state
  if (loading) {
    return (
      <section className="results-section" aria-labelledby="resultsHeading">
        <h2 id="resultsHeading">Results</h2>
        <div className="loading-indicator">
          <span className="sr-only">Loading results</span>
          <div className="spinner"></div>
        </div>
      </section>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <section className="results-section" aria-labelledby="resultsHeading">
        <h2 id="resultsHeading">Results</h2>
        <p className="error-message">
          Sorry, we encountered an error fetching meat cuts. Please try again later.
        </p>
      </section>
    );
  }
  
  // Handle empty results
  if (results.length === 0) {
    return (
      <section className="results-section" aria-labelledby="resultsHeading">
        <h2 id="resultsHeading">Results</h2>
        <p className="results-count">No results found</p>
        <p className="no-results">
          No meat cuts match your filters. Try adjusting your criteria.
        </p>
      </section>
    );
  }
  
  // Render results
  return (
    <section className="results-section" aria-labelledby="resultsHeading">
      <h2 id="resultsHeading">Results</h2>
      <p className="results-count">
        Showing {results.length} {results.length === 1 ? 'cut' : 'cuts'}
      </p>
      
      <div className="results-grid">
        {results.map(cut => (
          <MeatCard key={cut.id} cut={cut} />
        ))}
      </div>
    </section>
  );
};

// Individual meat cut card component
const MeatCard = ({ cut }) => {
  return (
    <Link to={`/cut/${cut.id}`} className="meat-card" aria-label={`${cut.name} - ${cut.type}`}>
      <img src={cut.image} alt={cut.name} className="meat-image" />
      <div className="meat-content">
        <span className="meat-type">{cut.type}</span>
        <h3 className="meat-title">{cut.name}</h3>
        <p className="meat-description">{cut.description}</p>
        <div className="meat-keywords">
          {cut.keywords.slice(0, 3).map(keyword => (
            <span key={keyword} className="keyword-tag">{keyword}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ResultsSection;
