import React, { useEffect } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Helmet } from 'react-helmet-async';
import { commonText } from '../data/text';

// Components
import FilterSection from '../components/FilterSection';
import MeatCard from '../components/MeatCard';
import Loading from '../components/common/Loading';

const HomePage = () => {
  const { results, isLoading, applyFilters, filterState } = useFilters();
  
  // Apply initial filters on component mount
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Generate the results heading text
  const getResultsCountText = () => {
    if (isLoading) return commonText.loading;
    
    if (results.length === 0) return commonText.noResults;
    
    return commonText.showingCount(results.length);
  };
  
  return (
    <>
      <Helmet>
        <title>{commonText.appName}</title>
        <meta 
          name="description" 
          content="Interactive guide to meat cuts and purchasing information from the Agriculture and Horticulture Development Board"
        />
      </Helmet>
      
      <section className="hero">
        <div className="hero-content">
          <h2>Find the Perfect Cut</h2>
          <p>Explore our comprehensive guide to selecting the right meat cut for any dish or occasion.</p>
        </div>
      </section>
      
      <FilterSection />
      
      <section className="results-section" aria-labelledby="resultsHeading">
        <h2 id="resultsHeading">{commonText.resultsHeading}</h2>
        <p id="resultsCount" aria-live="polite" className="results-count">
          {getResultsCountText()}
        </p>
        
        {isLoading ? (
          <Loading />
        ) : (
          <div id="resultsGrid" className="results-grid">
            {results.length === 0 ? (
              <p id="noResults" className="no-results">
                {commonText.noResults}
              </p>
            ) : (
              results.map(cut => (
                <MeatCard key={cut.id} cut={cut} />
              ))
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;