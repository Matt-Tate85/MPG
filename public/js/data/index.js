// data/index.js - Main data module that combines all meat types
import { beefCuts } from './beef.js';
import { lambCuts } from './lamb.js';
import { porkCuts } from './pork.js';

// All meat types
const meatTypes = ['Beef', 'Lamb', 'Pork'];

// All unique keywords across all cuts
const allKeywords = [
    'roast', 'lean', 'economical', 'traditional', 'premium', 'steak', 'marbling', 'tender',
    'slow cook', 'braise', 'flavorful', 'stew', 'gelatinous', 'pull apart', 'quick cook',
    'chops', 'rich', 'crackling', 'succulent', 'bbq', 'sticky', 'impressive', 'juicy',
    'sunday lunch', 'meaty', 'versatile', 'ham', 'pull'
];

/**
 * Get all meat types
 * @returns {string[]} Array of meat types
 */
function getMeatTypes() {
    return meatTypes;
}

/**
 * Get all meat cuts
 * @returns {Object[]} Array of all meat cuts across all types
 */
function getAllCuts() {
    return [...beefCuts, ...lambCuts, ...porkCuts];
}

/**
 * Get cuts by meat type
 * @param {string} type - The meat type (e.g., 'Beef', 'Lamb', 'Pork')
 * @returns {Object[]} Array of cuts for the specified type
 */
function getCutsByType(type) {
    switch(type.toLowerCase()) {
        case 'beef':
            return beefCuts;
        case 'lamb':
            return lambCuts;
        case 'pork':
            return porkCuts;
        default:
            return [];
    }
}

/**
 * Get a specific cut by ID
 * @param {string} id - The cut ID
 * @returns {Object|null} The meat cut object or null if not found
 */
function getCutById(id) {
    return getAllCuts().find(cut => cut.id === id) || null;
}

/**
 * Get all unique keywords used across cuts
 * @returns {string[]} Array of keywords
 */
function getAllKeywords() {
    return allKeywords;
}

/**
 * Filter cuts based on search criteria
 * @param {Object} criteria - Filter criteria
 * @param {string} [criteria.type] - Meat type filter
 * @param {string} [criteria.search] - Text search term
 * @param {string[]} [criteria.keywords] - Keywords to filter by
 * @returns {Object[]} Filtered array of meat cuts
 */
function filterCuts(criteria = {}) {
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
}

export {
    getMeatTypes,
    getAllCuts,
    getCutsByType,
    getCutById,
    getAllKeywords,
    filterCuts
};