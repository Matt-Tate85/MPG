import React, { useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { commonText } from '../data/text';

const FilterSection = () => {
  const { 
    filterState, 
    setTypeFilter, 
    setSearchFilter,
    toggleKeyword, 
    isKeywordActive
  } = useFilters();
  
  const [searchValue, setSearchValue] = useState(filterState.search || '');
  
  // Popular keywords
  const popularKeywords = [
    'roast', 'lean', 'slow cook', 'economical', 'tender', 'steak'
  ];
  
  // Handle input change
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  // Handle search submission
  const handleSearch = () => {
    setSearchFilter(searchValue.trim());
  };
  
  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <section className="filter-section" aria-labelledby="filterHeading">
      <h2 id="filterHeading" className="sr-only">{commonText.filterHeading}</h2>
      
      <div className="search-container">
        <label htmlFor="searchInput" className="sr-only">Search by keyword</label>
        <input 
          type="search" 
          id="searchInput" 
          name="search" 
          placeholder={commonText.searchPlaceholder}
          aria-label="Search for meat cuts by keyword"
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button 
          id="searchButton" 
          onClick={handleSearch}
          aria-label={commonText.search}
        >
          <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>
      
      <div className="filter-controls">
        <div className="filter-group">
          <h3>{commonText.meatTypeHeading}</h3>
          <div className="filter-options" role="group" aria-label={`Filter by ${commonText.meatTypeHeading.toLowerCase()}`}>
            <button 
              className={`filter-btn ${filterState.type === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              {commonText.allTypes}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'beef' ? 'active' : ''}`}
              onClick={() => setTypeFilter('beef')}
            >
              {commonText.beef}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'lamb' ? 'active' : ''}`}
              onClick={() => setTypeFilter('lamb')}
            >
              {commonText.lamb}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'pork' ? 'active' : ''}`}
              onClick={() => setTypeFilter('pork')}
            >
              {commonText.pork}
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <h3>{commonText.keywordsHeading}</h3>
          <div className="keyword-cloud" role="group" aria-label={`Filter by ${commonText.keywordsHeading.toLowerCase()}`}>
            {popularKeywords.map(keyword => (
              <button 
                key={keyword}
                className={`keyword-btn ${isKeywordActive(keyword) ? 'active' : ''}`}
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;
