// src/components/FilterSection.js - Enhanced with functional filters
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FilterSection = ({ onFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize filter state from URL query parameters
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    keywords: []
  });
  
  // Popular keywords that users can quickly filter by
  const popularKeywords = [
    'roast', 'lean', 'slow cook', 'economical', 
    'tender', 'steak', 'premium', 'traditional'
  ];
  
  // Parse query parameters when component mounts or URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type') || 'all';
    const searchParam = searchParams.get('search') || '';
    const keywordsParam = searchParams.get('keywords');
    
    const updatedFilters = {
      type: typeParam,
      search: searchParam,
      keywords: keywordsParam ? keywordsParam.split(',') : []
    };
    
    setFilters(updatedFilters);
    
    // Notify parent component about filter changes
    if (onFilter) {
      onFilter(updatedFilters);
    }
  }, [location.search, onFilter]);
  
  // Update URL with current filters
  const updateUrlWithFilters = (newFilters) => {
    const searchParams = new URLSearchParams();
    
    if (newFilters.type && newFilters.type !== 'all') {
      searchParams.set('type', newFilters.type);
    }
    
    if (newFilters.search) {
      searchParams.set('search', newFilters.search);
    }
    
    if (newFilters.keywords && newFilters.keywords.length > 0) {
      searchParams.set('keywords', newFilters.keywords.join(','));
    }
    
    const queryString = searchParams.toString();
    navigate(queryString ? `?${queryString}` : '');
  };
  
  // Handle meat type filter changes
  const handleTypeChange = (type) => {
    const newFilters = { ...filters, type };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };
  
  // Handle keyword toggle
  const toggleKeyword = (keyword) => {
    let newKeywords;
    
    if (filters.keywords.includes(keyword)) {
      // Remove keyword if already selected
      newKeywords = filters.keywords.filter(k => k !== keyword);
    } else {
      // Add keyword if not selected
      newKeywords = [...filters.keywords, keyword];
    }
    
    const newFilters = { ...filters, keywords: newKeywords };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };
  
  // Handle search input changes
  const [searchInput, setSearchInput] = useState(filters.search);
  
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);
  
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  
  const handleSearch = () => {
    const newFilters = { ...filters, search: searchInput.trim() };
    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      type: 'all',
      search: '',
      keywords: []
    };
    
    setFilters(clearedFilters);
    setSearchInput('');
    updateUrlWithFilters(clearedFilters);
  };
  
  // Check if there are any active filters
  const hasActiveFilters = () => {
    return (
      filters.type !== 'all' || 
      filters.search || 
      filters.keywords.length > 0
    );
  };
  
  return (
    <section className="filter-section" aria-labelledby="filterHeading">
      <h2 id="filterHeading" className="sr-only">Filter Options</h2>
      
      <div className="search-container">
        <label htmlFor="searchInput" className="sr-only">Search by keyword</label>
        <input 
          type="search" 
          id="searchInput" 
          name="search" 
          placeholder="Search by keyword (e.g. roast, lean, tender)"
          aria-label="Search for meat cuts by keyword"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
        <button 
          id="searchButton" 
          aria-label="Search"
          onClick={handleSearch}
        >
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <h3>Meat Type</h3>
          <div className="filter-options" role="group" aria-label="Filter by meat type">
            <button 
              className={`filter-btn ${filters.type === 'all' ? 'active' : ''}`}
              onClick={() => handleTypeChange('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filters.type === 'beef' ? 'active' : ''}`}
              onClick={() => handleTypeChange('beef')}
            >
              Beef
            </button>
            <button 
              className={`filter-btn ${filters.type === 'lamb' ? 'active' : ''}`}
              onClick={() => handleTypeChange('lamb')}
            >
              Lamb
            </button>
            <button 
              className={`filter-btn ${filters.type === 'pork' ? 'active' : ''}`}
              onClick={() => handleTypeChange('pork')}
            >
              Pork
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <h3>Popular Keywords</h3>
          <div className="keyword-cloud" role="group" aria-label="Filter by popular keywords">
            {popularKeywords.map(keyword => (
              <button 
                key={keyword}
                className={`keyword-btn ${filters.keywords.includes(keyword) ? 'active' : ''}`}
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters() && (
        <div className="active-filters" aria-live="polite">
          <span className="sr-only">Active filters:</span>
          
          {filters.type !== 'all' && (
            <div className="filter-tag">
              <span>Type: {filters.type}</span>
              <button 
                className="remove-tag"
                onClick={() => handleTypeChange('all')}
                aria-label={`Remove filter Type: ${filters.type}`}
              >
                &times;
              </button>
            </div>
          )}
          
          {filters.search && (
            <div className="filter-tag">
              <span>Search: {filters.search}</span>
              <button 
                className="remove-tag"
                onClick={() => {
                  const newFilters = { ...filters, search: '' };
                  setFilters(newFilters);
                  setSearchInput('');
                  updateUrlWithFilters(newFilters);
                }}
                aria-label={`Remove filter Search: ${filters.search}`}
              >
                &times;
              </button>
            </div>
          )}
          
          {filters.keywords.map(keyword => (
            <div key={keyword} className="filter-tag">
              <span>Keyword: {keyword}</span>
              <button 
                className="remove-tag"
                onClick={() => toggleKeyword(keyword)}
                aria-label={`Remove filter Keyword: ${keyword}`}
              >
                &times;
              </button>
            </div>
          ))}
          
          <button 
            className="clear-btn"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};

export default FilterSection;
