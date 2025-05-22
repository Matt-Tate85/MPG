// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterSection from '../components/FilterSection';
import ResultsSection from '../components/ResultsSection';
import { filterCuts } from '../services/meatDataService';

const HomePage = () => {
  const location = useLocation();
  
  // State for results and loading status
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parse query parameters when component mounts or URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type') || 'all';
    const searchParam = searchParams.get('search') || '';
    const keywordsParam = searchParams.get('keywords');
    
    const newFilterCriteria = {
      type: typeParam,
      search: searchParam,
      keywords: keywordsParam ? keywordsParam.split(',') : []
    };
    
    // Apply filters with the new criteria
    applyFilters(newFilterCriteria);
  }, [location.search]);
  
  // Apply filters and update results
  const applyFilters = (criteria) => {
    setLoading(true);
    
    try {
      // In a real app, this might be an API call
      // Here we're using our local data service
      const filteredResults = filterCuts(criteria);
      
      // Simulate network delay
      setTimeout(() => {
        setResults(filteredResults);
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error filtering cuts:', err);
      setError('Failed to filter meat cuts');
      setLoading(false);
    }
  };
  
  // Handle filter changes from FilterSection
  const handleFilterChange = (newCriteria) => {
    applyFilters(newCriteria);
  };
  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h2>Find the Perfect Cut</h2>
          <p>Explore our comprehensive guide to selecting the right meat cut for any dish or occasion.</p>
        </div>
      </section>
      
      <FilterSection onFilter={handleFilterChange} />
      
      <ResultsSection 
        results={results} 
        loading={loading} 
        error={error} 
      />
    </>
  );
};

export default HomePage;
