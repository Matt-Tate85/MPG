// public/js/routes.js

/**
 * Routes module for the AHDB Meat Purchasing Guide PWA
 * Handles internal routing for the application
 */

import { getCutById } from './data/index.js';
import { renderCutDetailsPage, renderHomePage } from './ui.js';

// Route types
const ROUTES = {
    HOME: 'home',
    CUT_DETAILS: 'cut-details'
};

// Current route state
let currentRoute = {
    type: ROUTES.HOME,
    params: {}
};

/**
 * Initialize the routing functionality
 */
function initRoutes() {
    // Listen for URL changes (History API)
    window.addEventListener('popstate', handleRouteChange);
    
    // Handle initial route
    handleRouteChange();
    
    // Intercept all internal links to use History API
    document.addEventListener('click', (e) => {
        // Find clicked link
        let target = e.target;
        
        // Traverse up to find closest link (in case clicked on child of link)
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target) break;
        }
        
        // If link exists and is internal
        if (target && target.tagName === 'A' && 
            target.href.startsWith(window.location.origin) && 
            !target.getAttribute('target') &&
            !target.getAttribute('download') &&
            !(target.getAttribute('rel') === 'external')) {
            
            e.preventDefault();
            navigateTo(target.href);
        }
    });
}

/**
 * Handle route changes
 */
function handleRouteChange() {
    const url = new URL(window.location.href);
    const path = url.pathname;
    
    // Extract route type and parameters
    if (path === '/' || path === '/index.html') {
        // Home route
        currentRoute = {
            type: ROUTES.HOME,
            params: Object.fromEntries(url.searchParams)
        };
        renderHomePage(currentRoute.params);
    } else if (path.startsWith('/cut/')) {
        // Cut details route
        const cutId = path.replace('/cut/', '').replace(/\.html$/, '');
        currentRoute = {
            type: ROUTES.CUT_DETAILS,
            params: { 
                id: cutId,
                ...Object.fromEntries(url.searchParams)
            }
        };
        renderCutDetailsPage(currentRoute.params.id);
    } else {
        // 404 - Not found, redirect to home
        navigateTo('/');
    }
}

/**
 * Navigate to a specific URL
 * @param {string} url - The URL to navigate to
 */
function navigateTo(url) {
    window.history.pushState({}, '', url);
    handleRouteChange();
}

/**
 * Generate the URL for a specific meat cut
 * @param {string} cutId - The ID of the meat cut
 * @returns {string} The URL for the meat cut
 */
function getCutUrl(cutId) {
    return `/cut/${cutId}`;
}

/**
 * Navigate to a specific meat cut
 * @param {string} cutId - The ID of the meat cut
 */
function navigateToCut(cutId) {
    navigateTo(getCutUrl(cutId));
}

/**
 * Navigate to the home page with optional filter parameters
 * @param {Object} params - Optional filter parameters
 */
function navigateToHome(params = {}) {
    let url = '/';
    
    // Add query parameters if they exist
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            searchParams.append(key, value);
        }
    }
    
    const queryString = searchParams.toString();
    if (queryString) {
        url += `?${queryString}`;
    }
    
    navigateTo(url);
}

export {
    initRoutes,
    navigateToCut,
    navigateToHome,
    getCutUrl,
    ROUTES
};