import React, { createContext, useContext, useState, useCallback } from 'react';

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

  // Filtered results - in a real app, this would use real data
  const [results, setResults] = useState([
    {
      id: 'topside',
      name: 'Topside',
      type: 'Beef',
      description: 'A lean cut from the hindquarter, commonly used for roasting. Its leanness makes it a popular choice for those looking for a healthier option.',
      image: '/assets/images/beef/topside.jpg',
      keywords: ['roast', 'lean', 'economical', 'traditional'],
    }
  ]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply filters and update results
  const applyFilters = useCallback((newState = filterState) => {
    setIsLoading(true);
    
    // Short delay to simulate loading
    setTimeout(() => {
      setResults([
        {
          id: 'topside',
          name: 'Topside',
          type: 'Beef',
          description: 'A lean cut from the hindquarter, commonly used for roasting. Its leanness makes it a popular choice for those looking for a healthier option.',
          image: '/assets/images/beef/topside.jpg',
          keywords: ['roast', 'lean', 'economical', 'traditional'],
        }
      ]);
      setIsLoading(false);
    }, 300);
  }, [filterState]);
  
  // Update filter state and apply filters
  const updateFilters = useCallback((newFilter) => {
    setFilterState(prevState => {
      const updatedState = { ...prevState, ...newFilter };
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
  }, [applyFilters]);
  
  // Set meat type filter
  const setTypeFilter = useCallback((type) => {
    updateFilters({ type });
  }, [updateFilters]);
  
  // Set search filter
  const setSearchFilter = useCallback((search) => {
    updateFilters({ search });
  }, [updateFilters]);
  
  // Toggle a keyword filter
  const toggleKeyword = useCallback((keyword) => {
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
