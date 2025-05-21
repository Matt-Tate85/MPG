import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import { commonText } from '../data/text';

const ActiveFilters = () => {
  const { 
    filterState, 
    setTypeFilter, 
    toggleKeyword, 
    setSearchFilter 
  } = useFilters();
  
  // Helper to check if there are any active filters
  const hasActiveFilters = () => {
    return (
      filterState.type !== 'all' || 
      filterState.search || 
      (filterState.keywords && filterState.keywords.length > 0)
    );
  };
  
  // If no active filters, don't render anything
  if (!hasActiveFilters()) {
    return null;
  }
  
  return (
    <div className="active-filters" id="activeFilters" aria-live="polite">
      <span className="sr-only">{commonText.activeFilters}</span>
      
      {/* Type filter tag */}
      {filterState.type !== 'all' && (
        <FilterTag 
          text={`Type: ${filterState.type}`} 
          onRemove={() => setTypeFilter('all')}
        />
      )}
      
      {/* Search filter tag */}
      {filterState.search && (
        <FilterTag 
          text={`Search: ${filterState.search}`} 
          onRemove={() => setSearchFilter('')}
        />
      )}
      
      {/* Keyword filter tags */}
      {filterState.keywords && filterState.keywords.map(keyword => (
        <FilterTag 
          key={keyword}
          text={`Keyword: ${keyword}`} 
          onRemove={() => toggleKeyword(keyword)}
        />
      ))}
    </div>
  );
};

// Filter tag component
const FilterTag = ({ text, onRemove }) => {
  return (
    <div className="filter-tag" role="status">
      <span>{text}</span>
      <button 
        className="remove-tag"
        onClick={onRemove}
        aria-label={`Remove filter ${text}`}
      >
        &times;
      </button>
    </div>
  );
};

export default ActiveFilters;