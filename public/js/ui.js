// public/js/ui.js

/**
 * UI module for the AHDB Meat Purchasing Guide PWA
 * Handles rendering and UI-related functionality
 */

import { getCutById, getAllCuts, getCutsByType, filterCuts } from './data/index.js';
import { navigateToCut, navigateToHome } from './routes.js';

// Store reference to main content area
const mainContent = document.getElementById('mainContent');

/**
 * Initialize the UI
 */
function initUI() {
    // Set up menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // Update aria-expanded attribute
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
    
    // Initialize modals
    initModals();
}

/**
 * Render the home page
 * @param {Object} params - URL parameters that may contain filter criteria
 */
function renderHomePage(params = {}) {
    // Update document title
    document.title = 'AHDB Meat Purchasing Guide';
    
    // Update active navigation state
    updateActiveNavigation('home');
    
    // Extract filter parameters from URL
    const filterParams = {
        type: params.type || 'all',
        search: params.search || '',
        keywords: params.keywords ? params.keywords.split(',') : []
    };
    
    // Create the home page HTML structure
    const homePageHTML = `
        <section class="hero">
            <div class="hero-content">
                <h2>Find the Perfect Cut</h2>
                <p>Explore our comprehensive guide to selecting the right meat cut for any dish or occasion.</p>
            </div>
        </section>

        <section class="filter-section" aria-labelledby="filterHeading">
            <h2 id="filterHeading" class="sr-only">Filter Options</h2>
            
            <div class="search-container">
                <label for="searchInput" class="sr-only">Search by keyword</label>
                <input type="search" id="searchInput" name="search" placeholder="Search by keyword (e.g. roast, lean, tender)" 
                       aria-label="Search for meat cuts by keyword" value="${filterParams.search}">
                <button id="searchButton" aria-label="Search">
                    <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                </button>
            </div>

            <div class="filter-controls">
                <div class="filter-group">
                    <h3>Meat Type</h3>
                    <div class="filter-options" role="group" aria-label="Filter by meat type">
                        <button class="filter-btn ${filterParams.type === 'all' ? 'active' : ''}" data-filter="all">All</button>
                        <button class="filter-btn ${filterParams.type === 'beef' ? 'active' : ''}" data-filter="beef">Beef</button>
                        <button class="filter-btn ${filterParams.type === 'lamb' ? 'active' : ''}" data-filter="lamb">Lamb</button>
                        <button class="filter-btn ${filterParams.type === 'pork' ? 'active' : ''}" data-filter="pork">Pork</button>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h3>Popular Keywords</h3>
                    <div class="keyword-cloud" role="group" aria-label="Filter by popular keywords">
                        <button class="keyword-btn ${filterParams.keywords.includes('roast') ? 'active' : ''}" data-keyword="roast">Roast</button>
                        <button class="keyword-btn ${filterParams.keywords.includes('lean') ? 'active' : ''}" data-keyword="lean">Lean</button>
                        <button class="keyword-btn ${filterParams.keywords.includes('slow cook') ? 'active' : ''}" data-keyword="slow cook">Slow Cook</button>
                        <button class="keyword-btn ${filterParams.keywords.includes('economical') ? 'active' : ''}" data-keyword="economical">Economical</button>
                        <button class="keyword-btn ${filterParams.keywords.includes('tender') ? 'active' : ''}" data-keyword="tender">Tender</button>
                        <button class="keyword-btn ${filterParams.keywords.includes('steak') ? 'active' : ''}" data-keyword="steak">Steak</button>
                    </div>
                </div>
            </div>
            
            <div class="active-filters" id="activeFilters" aria-live="polite">
                <!-- Active filters will be displayed here -->
                <span class="sr-only">Active filters:</span>
            </div>
            
            <button id="clearFilters" class="clear-btn" aria-label="Clear all filters">Clear Filters</button>
        </section>

        <section class="results-section" aria-labelledby="resultsHeading">
            <h2 id="resultsHeading">Results</h2>
            <p id="resultsCount" aria-live="polite" class="results-count">Loading cuts...</p>
            
            <div id="resultsGrid" class="results-grid">
                <!-- Results will be populated here by JavaScript -->
                <p id="noResults" class="no-results hidden">No meat cuts match your filters. Try adjusting your criteria.</p>
            </div>
        </section>
        
        <div id="loadingIndicator" class="loading-indicator" aria-hidden="true">
            <span class="sr-only">Loading results</span>
            <div class="spinner"></div>
        </div>
    `;
    
    // Set the content
    if (mainContent) {
        mainContent.innerHTML = homePageHTML;
    }
    
    // Initialize filter functionality
    initFilterButtons(filterParams);
    
    // Load initial results
    applyFilters(filterParams);
}

/**
 * Render a detailed page for a specific meat cut
 * @param {string} cutId - The ID of the meat cut to display
 */
function renderCutDetailsPage(cutId) {
    const cut = getCutById(cutId);
    
    if (!cut) {
        // Cut not found, redirect to home page
        navigateToHome();
        return;
    }
    
    // Update document title
    document.title = `${cut.name} - AHDB Meat Purchasing Guide`;
    
    // Update active navigation based on meat type
    updateActiveNavigation(cut.type.toLowerCase());
    
    // Create the cut detail page HTML structure
    const cutDetailHTML = `
        <section class="cut-detail-container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <ol>
                    <li><a href="/">Home</a></li>
                    <li><a href="/?type=${cut.type.toLowerCase()}">${cut.type}</a></li>
                    <li aria-current="page">${cut.name}</li>
                </ol>
            </nav>
            
            <div class="cut-detail-header">
                <div class="cut-detail-info">
                    <span class="cut-detail-type">${cut.type}</span>
                    <h2>${cut.name}</h2>
                    <p class="cut-detail-description">${cut.description}</p>
                    
                    <div class="cut-detail-keywords">
                        ${cut.keywords.map(keyword => `
                            <a href="/?keywords=${keyword}" class="keyword-tag">${keyword}</a>
                        `).join('')}
                    </div>
                </div>
                
                <div class="cut-detail-image-container">
                    <img src="${cut.image}" alt="${cut.name}" class="cut-detail-image">
                </div>
            </div>
            
            <div class="cut-detail-content">
                <div class="cut-detail-main">
                    ${cut.fullDescription}
                </div>
                
                <aside class="cut-detail-sidebar">
                    <div class="sidebar-section">
                        <h3>Cooking Methods</h3>
                        <ul class="cooking-methods-list">
                            ${cut.cookingMethods.map(method => `<li>${method}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>Characteristics</h3>
                        <p>${cut.characteristics}</p>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>Alternative Cuts</h3>
                        <ul class="alternatives-list">
                            ${cut.alternatives.map(alt => {
                                const altCut = getAllCuts().find(c => c.name === alt);
                                if (altCut) {
                                    return `<li><a href="/cut/${altCut.id}">${alt}</a></li>`;
                                } else {
                                    return `<li>${alt}</li>`;
                                }
                            }).join('')}
                        </ul>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>External Resources</h3>
                        <a href="${cut.externalUrl}" class="external-link" target="_blank" rel="noopener">
                            View on AHDB Website
                            <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
                                <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
                            </svg>
                        </a>
                    </div>
                </aside>
            </div>
            
            <div class="related-cuts">
                <h3>Related Cuts</h3>
                <div class="related-cuts-grid">
                    ${getRelatedCuts(cut, 3).map(relatedCut => `
                        <div class="meat-card" tabindex="0" role="button" aria-label="${relatedCut.name} - ${relatedCut.type}" data-cut-id="${relatedCut.id}">
                            <img src="${relatedCut.image}" alt="${relatedCut.name}" class="meat-image">
                            <div class="meat-content">
                                <span class="meat-type">${relatedCut.type}</span>
                                <h3 class="meat-title">${relatedCut.name}</h3>
                                <div class="meat-keywords">
                                    ${relatedCut.keywords.slice(0, 3).map(keyword => `
                                        <span class="keyword-tag">${keyword}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="cut-detail-actions">
                <button id="backToResults" class="secondary-btn">
                    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
                    </svg>
                    Back to Results
                </button>
                <a href="${cut.externalUrl}" class="primary-btn" target="_blank" rel="noopener">
                    View on AHDB Website
                </a>
            </div>
        </section>
    `;
    
    // Set the content
    if (mainContent) {
        mainContent.innerHTML = cutDetailHTML;
    }
    
    // Add event listeners for related cuts
    document.querySelectorAll('.meat-card[data-cut-id]').forEach(card => {
        card.addEventListener('click', () => {
            navigateToCut(card.dataset.cutId);
        });
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCut(card.dataset.cutId);
            }
        });
    });
    
    // Add event listener for back button
    const backButton = document.getElementById('backToResults');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Go back if there's history, otherwise go to home
            if (window.history.length > 1) {
                window.history.back();
            } else {
                navigateToHome();
            }
        });
    }
}

/**
 * Update active navigation state
 * @param {string} activePage - The active page/section
 */
function updateActiveNavigation(activePage) {
    // Remove active class from all navigation links
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });
    
    // Add active class to the correct navigation link
    let activeSelector = '.main-nav a[href="/"]';
    if (activePage === 'beef' || activePage === 'lamb' || activePage === 'pork') {
        // For meat type pages, we keep the home link active
        // but could add type-specific navigation if needed
    }
    
    const activeLink = document.querySelector(activeSelector);
    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
    }
}

/**
 * Get related cuts based on type and keywords
 * @param {Object} currentCut - The current meat cut
 * @param {number} count - Number of related cuts to return
 * @returns {Object[]} Array of related cuts
 */
function getRelatedCuts(currentCut, count = 3) {
    // Get all cuts of the same type
    const sameTerm = getCutsByType(currentCut.type).filter(cut => 
        cut.id !== currentCut.id
    );
    
    // Find cuts that share keywords
    const withSharedKeywords = sameTerm.map(cut => {
        // Count shared keywords
        const sharedKeywords = cut.keywords.filter(keyword => 
            currentCut.keywords.includes(keyword)
        ).length;
        
        return {
            ...cut,
            relevance: sharedKeywords
        };
    });
    
    // Sort by relevance (shared keywords)
    const sorted = withSharedKeywords.sort((a, b) => b.relevance - a.relevance);
    
    // Return the top matches
    return sorted.slice(0, count);
}

/**
 * Initialize modal functionality
 */
function initModals() {
    // About modal
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    
    if (aboutLink && aboutModal && closeAboutModal) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(aboutModal);
        });
        
        closeAboutModal.addEventListener('click', () => {
            closeModal(aboutModal);
        });
    }
    
    // Privacy modal
    const privacyLink = document.getElementById('privacyLink');
    const privacyModal = document.getElementById('privacyModal');
    const closePrivacyModal = document.getElementById('closePrivacyModal');
    
    if (privacyLink && privacyModal && closePrivacyModal) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
        
        closePrivacyModal.addEventListener('click', () => {
            closeModal(privacyModal);
        });
    }
    
    // Accessibility modal
    const accessibilityLink = document.getElementById('accessibilityLink');
    const accessibilityModal = document.getElementById('accessibilityModal');
    const closeAccessibilityModal = document.getElementById('closeAccessibilityModal');
    
    if (accessibilityLink && accessibilityModal && closeAccessibilityModal) {
        accessibilityLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(accessibilityModal);
        });
        
        closeAccessibilityModal.addEventListener('click', () => {
            closeModal(accessibilityModal);
        });
    }
    
    // Close modals when clicking outside or pressing Escape
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCurrentModal();
        }
    });
}

/**
 * Open a modal
 * @param {HTMLElement} modal - The modal element to open
 */
function openModal(modal) {
    // Close any open modals first
    closeCurrentModal();
    
    // Open the specified modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Set focus to the close button
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
        closeButton.focus();
    }
    
    // Trap focus within the modal
    trapFocusInModal(modal);
}

/**
 * Close a specific modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

/**
 * Close the currently open modal (if any)
 */
function closeCurrentModal() {
    const openModals = document.querySelectorAll('.modal.active');
    openModals.forEach(modal => {
        closeModal(modal);
    });
}

/**
 * Trap keyboard focus within the modal for accessibility
 * @param {HTMLElement} modal - The modal element
 */
function trapFocusInModal(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Shift + Tab
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            // Tab
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}

/**
 * Initialize filter buttons functionality
 * @param {Object} initialFilters - Initial filter state
 */
function initFilterButtons(initialFilters = {}) {
    // Current filter state
    const filterState = {
        type: initialFilters.type || 'all',
        search: initialFilters.search || '',
        keywords: initialFilters.keywords || []
    };
    
    // Set up event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons in the group
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update filter state
            filterState.type = button.dataset.filter;
            
            // Apply filters
            applyFilters(filterState);
            
            // Update URL
            updateUrlWithFilters(filterState);
        });
    });
    
    // Set up event listeners for keyword buttons
    const keywordButtons = document.querySelectorAll('.keyword-btn');
    keywordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const keyword = button.dataset.keyword;
            
            // Toggle active class
            button.classList.toggle('active');
            
            // Update filter state
            if (button.classList.contains('active')) {
                // Add keyword if not already in the array
                if (!filterState.keywords.includes(keyword)) {
                    filterState.keywords.push(keyword);
                }
            } else {
                // Remove keyword
                filterState.keywords = filterState.keywords.filter(k => k !== keyword);
            }
            
            // Apply filters
            applyFilters(filterState);
            
            // Update URL
            updateUrlWithFilters(filterState);
        });
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener('click', () => {
            filterState.search = searchInput.value.trim();
            applyFilters(filterState);
            updateUrlWithFilters(filterState);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                filterState.search = searchInput.value.trim();
                applyFilters(filterState);
                updateUrlWithFilters(filterState);
            }
        });
    }
    
    // Clear filters button
    const clearFiltersButton = document.getElementById('clearFilters');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', () => {
            clearAllFilters(filterState);
        });
    }
    
    // Initial active filters display
    updateActiveFiltersDisplay(filterState);
}

/**
 * Update the URL with current filter parameters
 * @param {Object} filterState - Current filter state
 */
function updateUrlWithFilters(filterState) {
    const url = new URL(window.location.href);
    
    // Clear existing params
    url.searchParams.delete('type');
    url.searchParams.delete('search');
    url.searchParams.delete('keywords');
    
    // Add current filters
    if (filterState.type && filterState.type !== 'all') {
        url.searchParams.set('type', filterState.type);
    }
    
    if (filterState.search) {
        url.searchParams.set('search', filterState.search);
    }
    
    if (filterState.keywords && filterState.keywords.length > 0) {
        url.searchParams.set('keywords', filterState.keywords.join(','));
    }
    
    // Update URL without reloading the page
    window.history.replaceState({}, '', url);
}

/**
 * Clear all active filters
 * @param {Object} filterState - Current filter state
 */
function clearAllFilters(filterState) {
    // Reset filter state
    filterState.type = 'all';
    filterState.search = '';
    filterState.keywords = [];
    
    // Reset UI
    // Reset type filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Reset keyword buttons
    document.querySelectorAll('.keyword-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Apply filters
    applyFilters(filterState);
    
    // Update URL
    updateUrlWithFilters(filterState);
}

/**
 * Show the loading indicator
 */
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Hide the loading indicator
 */
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Apply the current filters and update the UI
 * @param {Object} filterState - Current filter state
 */
function applyFilters(filterState) {
    // Show loading indicator
    showLoadingIndicator();
    
    // Simulate a delay for loading (can be removed in production)
    setTimeout(() => {
        // Get filtered results based on current filter state
        const filteredResults = filterCuts(filterState);
        
        // Update the UI
        renderResults(filteredResults);
        updateActiveFiltersDisplay(filterState);
        
        // Hide loading indicator
        hideLoadingIndicator();
    }, 300);
}

/**
 * Update the display of active filters
 * @param {Object} filterState - Current filter state
 */
function updateActiveFiltersDisplay(filterState) {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '<span class="sr-only">Active filters:</span>';
    
    // Add meat type filter tag if not 'all'
    if (filterState.type !== 'all') {
        const typeTag = createFilterTag(`Type: ${filterState.type}`, () => {
            // Reset type filter
            const allButton = document.querySelector(`.filter-btn[data-filter="all"]`);
            if (allButton) {
                allButton.click();
            } else {
                // Fallback if button not found
                filterState.type = 'all';
                applyFilters(filterState);
                updateUrlWithFilters(filterState);
            }
        });
        activeFiltersContainer.appendChild(typeTag);
    }
    
    // Add search term filter tag if present
    if (filterState.search) {
        const searchTag = createFilterTag(`Search: ${filterState.search}`, () => {
            // Clear search input and filter
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
            filterState.search = '';
            applyFilters(filterState);
            updateUrlWithFilters(filterState);
        });
        activeFiltersContainer.appendChild(searchTag);
    }
    
    // Add keyword filter tags
    if (filterState.keywords && filterState.keywords.length > 0) {
        filterState.keywords.forEach(keyword => {
            const keywordTag = createFilterTag(`Keyword: ${keyword}`, () => {
                // Remove keyword from filter state
                filterState.keywords = filterState.keywords.filter(k => k !== keyword);
                
                // Update keyword button UI
                const keywordButton = document.querySelector(`.keyword-btn[data-keyword="${keyword}"]`);
                if (keywordButton) {
                    keywordButton.classList.remove('active');
                }
                
                // Apply filters
                applyFilters(filterState);
                updateUrlWithFilters(filterState);
            });
            activeFiltersContainer.appendChild(keywordTag);
        });
    }
    
    // Show clear filters button if any filters are active
    const clearFiltersButton = document.getElementById('clearFilters');
    if (clearFiltersButton) {
        if (filterState.type !== 'all' || filterState.search || (filterState.keywords && filterState.keywords.length > 0)) {
            clearFiltersButton.classList.remove('hidden');
        } else {
            clearFiltersButton.classList.add('hidden');
        }
    }
}

/**
 * Create a filter tag element
 * @param {string} text - The tag text
 * @param {Function} removeCallback - Callback function when removing the tag
 * @returns {HTMLElement} The filter tag element
 */
function createFilterTag(text, removeCallback) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.setAttribute('role', 'status');
    
    const tagText = document.createElement('span');
    tagText.textContent = text;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-tag';
    removeButton.innerHTML = '&times;';
    removeButton.setAttribute('aria-label', `Remove filter ${text}`);
    removeButton.addEventListener('click', removeCallback);
    
    tag.appendChild(tagText);
    tag.appendChild(removeButton);
    
    return tag;
}

/**
 * Render the meat cut results
 * @param {Object[]} results - Array of meat cut objects to render
 */
function renderResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (!resultsGrid || !resultsCount || !noResults) return;
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Add no results message if applicable
    if (results.length === 0) {
        noResults.classList.remove('hidden');
        resultsCount.textContent = 'No results found';
    } else {
        noResults.classList.add('hidden');
        resultsCount.textContent = `Showing ${results.length} ${results.length === 1 ? 'cut' : 'cuts'}`;
        
        // Render each meat cut card
        results.forEach(cut => {
            const cutCard = createMeatCutCard(cut);
            resultsGrid.appendChild(cutCard);
        });
    }
}

/**
 * Create a meat cut card element
 * @param {Object} cut - The meat cut object
 * @returns {HTMLElement} The meat cut card element
 */
function createMeatCutCard(cut) {
    const card = document.createElement('div');
    card.className = 'meat-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${cut.name} - ${cut.type}`);
    
    // Create the card content
    card.innerHTML = `
        <img src="${cut.image}" alt="${cut.name}" class="meat-image">
        <div class="meat-content">
            <span class="meat-type">${cut.type}</span>
            <h3 class="meat-title">${cut.name}</h3>
            <p class="meat-description">${cut.description}</p>
            <div class="meat-keywords">
                ${cut.keywords.slice(0, 3).map(keyword => `
                    <span class="keyword-tag">${keyword}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to navigate to the cut detail page
    card.addEventListener('click', () => {
        navigateToCut(cut.id);
    });
    
    // Add keyboard support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToCut(cut.id);
        }
    });
    
    return card;
}

export {
    initUI,
    showLoadingIndicator,
    hideLoadingIndicator,
    renderResults,
    renderHomePage,
    renderCutDetailsPage
};