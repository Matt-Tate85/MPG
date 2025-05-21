import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import { allKeywords } from '../data';
import { commonText, a11yText } from '../data/text';

// Components
import SearchBar from './SearchBar';
import ActiveFilters from './ActiveFilters';

const FilterSection = () => {
  const { 
    filterState, 
    setTypeFilter, 
    toggleKeyword, 
    clearFilters, 
    isKeywordActive 
  } = useFilters();

  // Get the most common keywords for the filter UI (limit to popular ones)
  const popularKeywords = allKeywords.slice(0, 6);

  return (
    <section className="filter-section" aria-labelledby="filterHeading">
      <h2 id="filterHeading" className="sr-only">{commonText.filterHeading}</h2>
      
      {/* Search Bar */}
      <SearchBar />
      
      <div className="filter-controls">
        {/* Meat Type Filter */}
        <div className="filter-group">
          <h3>{commonText.meatTypeHeading}</h3>
          <div className="filter-options" role="group" aria-label={`Filter by ${commonText.meatTypeHeading.toLowerCase()}`}>
            <button 
              className={`filter-btn ${filterState.type === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
              aria-pressed={filterState.type === 'all'}
            >
              {commonText.allTypes}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'beef' ? 'active' : ''}`}
              onClick={() => setTypeFilter('beef')}
              aria-pressed={filterState.type === 'beef'}
            >
              {commonText.beef}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'lamb' ? 'active' : ''}`}
              onClick={() => setTypeFilter('lamb')}
              aria-pressed={filterState.type === 'lamb'}
            >
              {commonText.lamb}
            </button>
            <button 
              className={`filter-btn ${filterState.type === 'pork' ? 'active' : ''}`}
              onClick={() => setTypeFilter('pork')}
              aria-pressed={filterState.type === 'pork'}
            >
              {commonText.pork}
            </button>
          </div>
        </div>
        
        {/* Popular Keywords Filter */}
        <div className="filter-group">
          <h3>{commonText.keywordsHeading}</h3>
          <div className="keyword-cloud" role="group" aria-label={`Filter by ${commonText.keywordsHeading.toLowerCase()}`}>
            {popularKeywords.map(keyword => (
              <button 
                key={keyword}
                className={`keyword-btn ${isKeywordActive(keyword) ? 'active' : ''}`}
                onClick={() => toggleKeyword(keyword)}
                aria-pressed={isKeywordActive(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Active Filters Display */}
      <ActiveFilters />
      
      {/* Clear Filters Button */}
      <button 
        id="clearFilters" 
        className={`clear-btn ${!hasActiveFilters(filterState) ? 'hidden' : ''}`}
        onClick={clearFilters}
        aria-label={commonText.clear}
      >
        {commonText.clear}
      </button>
    </section>
  );
};

// Helper function to check if there are active filters
const hasActiveFilters = (filterState) => {
  return (
    filterState.type !== 'all' || 
    filterState.search || 
    (filterState.keywords && filterState.keywords.length > 0)
  );
};

export default FilterSection;