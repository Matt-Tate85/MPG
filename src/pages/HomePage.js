import React, { useEffect } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { commonText } from '../data/text';

const HomePage = () => {
  const { results, isLoading, applyFilters } = useFilters();
  
  // Apply initial filters on component mount
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Generate the results heading text
  const getResultsCountText = () => {
    if (isLoading) return commonText.loading;
    
    if (results.length === 0) return commonText.noResults;
    
    return `Showing ${results.length} ${results.length === 1 ? 'cut' : 'cuts'}`;
  };
  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h2>Find the Perfect Cut</h2>
          <p>Explore our comprehensive guide to selecting the right meat cut for any dish or occasion.</p>
        </div>
      </section>
      
      <div className="filter-section">
        <h2 id="filterHeading" className="sr-only">Filter Options</h2>
        
        <div className="search-container">
          <label htmlFor="searchInput" className="sr-only">Search by keyword</label>
          <input 
            type="search" 
            id="searchInput" 
            name="search" 
            placeholder="Search by keyword (e.g. roast, lean, tender)"
            aria-label="Search for meat cuts by keyword"
          />
          <button id="searchButton" aria-label="Search">Search</button>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <h3>Meat Type</h3>
            <div className="filter-options" role="group" aria-label="Filter by meat type">
              <button className="filter-btn active" data-filter="all">All</button>
              <button className="filter-btn" data-filter="beef">Beef</button>
              <button className="filter-btn" data-filter="lamb">Lamb</button>
              <button className="filter-btn" data-filter="pork">Pork</button>
            </div>
          </div>
        </div>
      </div>
      
      <section className="results-section" aria-labelledby="resultsHeading">
        <h2 id="resultsHeading">Results</h2>
        <p id="resultsCount" aria-live="polite" className="results-count">
          {getResultsCountText()}
        </p>
        
        {isLoading ? (
          <div className="loading-indicator">
            <span className="sr-only">Loading results</span>
            <div className="spinner"></div>
          </div>
        ) : (
          <div id="resultsGrid" className="results-grid">
            {results.length === 0 ? (
              <p id="noResults" className="no-results">
                No meat cuts match your filters. Try adjusting your criteria.
              </p>
            ) : (
              <div className="meat-card">
                <div className="meat-content">
                  <span className="meat-type">Beef</span>
                  <h3 className="meat-title">Topside</h3>
                  <p className="meat-description">A lean cut from the hindquarter, commonly used for roasting.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;


export default HomePage;
