/**
 * Data module for the AHDB Meat Purchasing Guide
 * Exports meat cut data and utility functions
 */

import { beefCuts } from './beef';
import { lambCuts } from './lamb';
import { porkCuts } from './pork';

// All meat types
export const meatTypes = ['Beef', 'Lamb', 'Pork'];

// All unique keywords across all cuts
export const allKeywords = [
    'roast', 'lean', 'economical', 'traditional', 'premium', 'steak', 'marbling', 'tender',
    'slow cook', 'braise', 'flavorful', 'stew', 'gelatinous', 'pull apart', 'quick cook',
    'chops', 'rich', 'crackling', 'succulent', 'bbq', 'sticky', 'impressive', 'juicy',
    'sunday lunch', 'meaty', 'versatile', 'ham', 'pull'
];

/**
 * Get all meat types
 * @returns {string[]} Array of meat types
 */
export const getMeatTypes = () => {
    return meatTypes;
};

/**
 * Get all meat cuts
 * @returns {Object[]} Array of all meat cuts across all types
 */
export const getAllCuts = () => {
    return [...beefCuts, ...lambCuts, ...porkCuts];
};

/**
 * Get cuts by meat type
 * @param {string} type - The meat type (e.g., 'Beef', 'Lamb', 'Pork')
 * @returns {Object[]} Array of cuts for the specified type
 */
export const getCutsByType = (type) => {
    const typeLC = type.toLowerCase();
    
    switch(typeLC) {
        case 'beef':
            return beefCuts;
        case 'lamb':
            return lambCuts;
        case 'pork':
            return porkCuts;
        default:
            return [];
    }
};

/**
 * Get a specific cut by ID
 * @param {string} id - The cut ID
 * @returns {Object|null} The meat cut object or null if not found
 */
export const getCutById = (id) => {
    return getAllCuts().find(cut => cut.id === id) || null;
};

/**
 * Get all unique keywords used across cuts
 * @returns {string[]} Array of keywords
 */
export const getAllKeywords = () => {
    return allKeywords;
};

/**
 * Filter cuts based on search criteria
 * @param {Object} criteria - Filter criteria
 * @param {string} [criteria.type] - Meat type filter
 * @param {string} [criteria.search] - Text search term
 * @param {string[]} [criteria.keywords] - Keywords to filter by
 * @returns {Object[]} Filtered array of meat cuts
 */
export const filterCuts = (criteria = {}) => {
    let results = getAllCuts();
    
    // Filter by meat type
    if (criteria.type && criteria.type !== 'all') {
        results = results.filter(cut => cut.type.toLowerCase() === criteria.type.toLowerCase());
    }
    
    // Filter by search term
    if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        results = results.filter(cut => 
            cut.name.toLowerCase().includes(searchTerm) ||
            cut.description.toLowerCase().includes(searchTerm) ||
            cut.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
        results = results.filter(cut => 
            criteria.keywords.every(keyword => 
                cut.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
            )
        );
    }
    
    return results;
};

/**
 * Get related cuts based on shared characteristics
 * @param {Object} currentCut - The reference cut
 * @param {number} count - Number of related cuts to return
 * @returns {Object[]} Array of related cuts
 */
export const getRelatedCuts = (currentCut, count = 3) => {
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
};