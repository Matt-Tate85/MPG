import React, { useState, useEffect } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { commonText, a11yText } from '../data/text';

const SearchBar = () => {
  const { filterState, setSearchFilter } = useFilters();
  const [searchValue, setSearchValue] = useState(filterState.search || '');
  
  // Update local state when the filter state changes (e.g., when filters are cleared)
  useEffect(() => {
    setSearchValue(filterState.search || '');
  }, [filterState.search]);
  
  // Handle input change
  const handleChange = (e) => {
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
    <div className="search-container">
      <label htmlFor="searchInput" className="sr-only">
        Search by keyword
      </label>
      <input 
        type="search" 
        id="searchInput" 
        name="search" 
        placeholder={commonText.searchPlaceholder}
        aria-label="Search for meat cuts by keyword"
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button 
        id="searchButton" 
        aria-label={a11yText.searchButton}
        onClick={handleSearch}
      >
        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;