import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { filterCuts } from '../data';

// Create context
const FilterContext = createContext();

// Custom hook to use the filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Provider component
export const FilterProvider = ({ children }) => {
  // Filter state
  const [filterState, setFilterState] = useState({
    type: 'all',
    search: '',
    keywords: []
  });

  // Filtered results
  const [results, setResults] = useState([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Get location and navigate from router
  const location = useLocation();
  const navigate = useNavigate();
  
  // Apply filters and update results
  const applyFilters = useCallback((newState = filterState) => {
    setIsLoading(true);
    
    // Short delay to allow for UI feedback
    setTimeout(() => {
      const filteredResults = filterCuts(newState);
      setResults(filteredResults);
      setIsLoading(false);
    }, 300);
  }, [filterState]);
  
  // Update filter state and apply filters
  const updateFilters = useCallback((newFilter) => {
    setFilterState(prevState => {
      const updatedState = { ...prevState, ...newFilter };
      
      // Update URL to reflect filter state
      updateUrlWithFilters(updatedState);
      
      return updatedState;
    });
    
    applyFilters({ ...filterState, ...newFilter });
  }, [filterState, applyFilters]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    const resetState = {
      type: 'all',
      search: '',
      keywords: []
    };
    
    setFilterState(resetState);
    applyFilters(resetState);
    
    // Clear URL params
    navigate({ pathname: location.pathname }, { replace: true });
  }, [applyFilters, location.pathname, navigate]);
  
  // Initialize filters from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    const typeParam = searchParams.get('type');
    const searchParam = searchParams.get('search');
    const keywordsParam = searchParams.get('keywords');
    
    const initialState = {
      type: typeParam || 'all',
      search: searchParam || '',
      keywords: keywordsParam ? keywordsParam.split(',') : []
    };
    
    // Only update if different from current state to avoid loops
    if (
      initialState.type !== filterState.type ||
      initialState.search !== filterState.search ||
      initialState.keywords.join(',') !== filterState.keywords.join(',')
    ) {
      setFilterState(initialState);
      applyFilters(initialState);
    }
  }, [location.search, applyFilters]);
  
  // Update URL with current filter state
  const updateUrlWithFilters = (filterState) => {
    const searchParams = new URLSearchParams();
    
    if (filterState.type && filterState.type !== 'all') {
      searchParams.set('type', filterState.type);
    }
    
    if (filterState.search) {
      searchParams.set('search', filterState.search);
    }
    
    if (filterState.keywords && filterState.keywords.length > 0) {
      searchParams.set('keywords', filterState.keywords.join(','));
    }
    
    const queryString = searchParams.toString();
    const newUrl = queryString ? `${location.pathname}?${queryString}` : location.pathname;
    
    // Replace current URL to avoid adding to navigation history
    navigate(newUrl, { replace: true });
  };
  
  // Toggle a keyword filter
  const toggleKeyword = useCallback((keyword) => {
    setFilterState(prevState => {
      const keywordIndex = prevState.keywords.indexOf(keyword);
      let newKeywords;
      
      if (keywordIndex === -1) {
        // Add keyword
        newKeywords = [...prevState.keywords, keyword];
      } else {
        // Remove keyword
        newKeywords = prevState.keywords.filter(k => k !== keyword);
      }
      
      const newState = { ...prevState, keywords: newKeywords };
      
      // Update URL
      updateUrlWithFilters(newState);
      
      return newState;
    });
    
    // Apply updated filters
    setFilterState(prevState => {
      const keywordIndex = prevState.keywords.indexOf(keyword);
      const newKeywords = keywordIndex === -1
        ? [...prevState.keywords, keyword]
        : prevState.keywords.filter(k => k !== keyword);
        
      const newState = { ...prevState, keywords: newKeywords };
      applyFilters(newState);
      return newState;
    });
  }, [applyFilters]);
  
  // Set meat type filter
  const setTypeFilter = useCallback((type) => {
    updateFilters({ type });
  }, [updateFilters]);
  
  // Set search filter
  const setSearchFilter = useCallback((search) => {
    updateFilters({ search });
  }, [updateFilters]);
  
  // Check if a keyword is active
  const isKeywordActive = useCallback((keyword) => {
    return filterState.keywords.includes(keyword);
  }, [filterState.keywords]);
  
  // The context value
  const value = {
    // State
    filterState,
    results,
    isLoading,
    
    // Actions
    applyFilters,
    updateFilters,
    clearFilters,
    toggleKeyword,
    setTypeFilter,
    setSearchFilter,
    isKeywordActive
  };
  
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;