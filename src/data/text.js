/**
 * UI Text Content
 * Centralized text management for the entire application
 */

// Common text used throughout the application
export const commonText = {
  // Application text
  appName: "AHDB Meat Purchasing Guide",
  appShortName: "Meat Guide",
  
  // Navigation text
  home: "Meat Guide",
  ahdbWebsite: "AHDB Website",
  about: "About",
  
  // Button text
  search: "Search",
  clear: "Clear Filters",
  install: "Install",
  notNow: "Not Now",
  back: "Back to Results",
  viewOnWebsite: "View on AHDB Website",
  
  // Filter text
  filterHeading: "Filter Options",
  searchPlaceholder: "Search by keyword (e.g. roast, lean, tender)",
  meatTypeHeading: "Meat Type",
  keywordsHeading: "Popular Keywords",
  activeFilters: "Active filters:",
  
  // Filter types
  allTypes: "All",
  beef: "Beef",
  lamb: "Lamb",
  pork: "Pork",
  
  // Results text
  resultsHeading: "Results",
  showingAllCuts: "Showing all cuts",
  noResults: "No meat cuts match your filters. Try adjusting your criteria.",
  loading: "Loading cuts...",
  
  // Details page text
  characteristics: "Characteristics",
  cookingMethods: "Cooking Methods",
  alternatives: "Alternative Cuts",
  externalResources: "External Resources",
  relatedCuts: "Related Cuts",
  
  // Offline text
  offline: "You are currently offline. Some features may be limited.",
  
  // Install prompt
  installPrompt: "Add this app to your home screen for quick access, even when offline",
};

// Cut detail descriptions - can be expanded with specific text for each cut
export const cutDescriptions = {
  topside: "A lean cut from the hindquarter, ideal for roasting. The topside is one of the most popular joints for traditional Sunday roasts.",
  silverside: "A lean cut from the hindquarter, commonly used for roasting and slow cooking methods. Often used for salt beef."
  // Add more cut-specific descriptions as needed
};

// Export all text groups
export default {
  common: commonText,
  cutDescriptions: cutDescriptions
};
