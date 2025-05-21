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
  showingCount: (count) => `Showing ${count} ${count === 1 ? 'cut' : 'cuts'}`,
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
  offlineTitle: "You're offline",
  offlineMessage: "Sorry, you don't have an internet connection right now, and the page you're trying to access hasn't been cached for offline use.",
  offlineSubMessage: "You can still access previously viewed content from the main page.",
  goToHome: "Go to Home Page",
  
  // Install prompt
  installPrompt: "Add this app to your home screen for quick access, even when offline",
  
  // Footer text
  quickLinks: "Quick Links",
  contact: "Contact",
  copyright: (year) => `© ${year} Agriculture and Horticulture Development Board. All rights reserved.`,
  
  // Organization details
  orgName: "Agriculture and Horticulture Development Board",
  orgAddress: "Stoneleigh Park, Kenilworth, Warwickshire, CV8 2TL",
  orgEmail: "info@ahdb.org.uk"
};

// Modal content
export const modalText = {
  // About modal
  aboutTitle: "About the Meat Purchasing Guide",
  aboutContent: [
    "The AHDB Meat Purchasing Guide is a comprehensive resource for selecting the right meat cuts for any dish or occasion.",
    "This Progressive Web App (PWA) allows you to browse and filter meat cuts by type, keywords, and characteristics, even without an internet connection once installed."
  ],
  aboutHowToUse: {
    title: "How to Use",
    items: [
      "Use the search box to find specific cuts by name or characteristic",
      "Filter by meat type using the buttons",
      "Click on keyword tags to narrow down your search",
      "Tap any meat cut to view detailed information"
    ]
  },
  aboutInstall: {
    title: "Install as App",
    items: [
      "For the best experience, install this web app on your device:",
      "iOS: Tap the share button and select \"Add to Home Screen\"",
      "Android: Tap the menu and select \"Install app\" or \"Add to Home Screen\"",
      "Desktop: Look for the install icon in your browser's address bar"
    ]
  },
  aboutOffline: {
    title: "Offline Use",
    content: "Once installed, this app works offline, allowing you to access the meat guide anywhere, even without internet access."
  },
  
  // Accessibility modal
  accessibilityTitle: "Accessibility",
  accessibilityContent: [
    "We are committed to ensuring this app is accessible to all users, including those with disabilities."
  ],
  accessibilityFeatures: {
    title: "Accessibility Features",
    items: [
      "Keyboard navigation: All functions can be accessed using a keyboard",
      "Screen reader support: Compatible with screen readers on all major platforms",
      "Text alternatives: All images have appropriate text alternatives",
      "Colour contrast: All text meets WCAG AA contrast standards",
      "Resizable text: Text can be resized up to 200% without loss of content",
      "Focus indicators: Visible focus indicators for keyboard navigation"
    ]
  },
  accessibilityKeyboard: {
    title: "Keyboard Shortcuts",
    items: [
      "Tab: Navigate between interactive elements",
      "Enter or Space: Activate buttons and links",
      "Escape: Close modals and dialogs"
    ]
  },
  accessibilityStatement: {
    title: "Accessibility Statement",
    content: "This application has been developed to meet WCAG 2.1 Level AA standards. If you encounter any accessibility issues, please contact us at accessibility@ahdb.org.uk."
  },
  
  // Privacy modal
  privacyTitle: "Privacy Policy",
  privacyContent: [
    "This app is provided by the Agriculture and Horticulture Development Board (AHDB)."
  ],
  privacyData: {
    title: "Data Collection",
    content: "This app stores data locally on your device to enable offline functionality. We do not collect any personal information through this app."
  },
  privacyCookies: {
    title: "Cookies and Storage",
    content: "This app uses local storage and IndexedDB to store app data and preferences on your device. This information is not transmitted to our servers."
  },
  privacyThirdParty: {
    title: "Third-Party Services",
    content: "When accessing external links to the AHDB website, you will be subject to the AHDB website's privacy policy."
  },
  privacyContact: {
    title: "Contact",
    content: "For any questions regarding privacy, please contact privacy@ahdb.org.uk."
  }
};

// Error page text
export const errorText = {
  notFound: {
    title: "Page Not Found",
    message: "Sorry, the page you are looking for does not exist.",
    action: "Go to Home Page"
  },
  offline: {
    title: "You're Offline",
    message: "Please check your internet connection and try again.",
    action: "Try Again"
  }
};

// Help text for assistive technology
export const a11yText = {
  skipToContent: "Skip to main content",
  toggleMenu: "Toggle menu",
  searchButton: "Search",
  dismissOffline: "Dismiss offline notification",
  loadingContent: "Loading content",
  closeModal: "Close modal"
};

// Cut detail descriptions - can be expanded with specific text for each cut
export const cutDescriptions = {
  // Beef
  topside: "A lean cut from the hindquarter, ideal for roasting. The topside is one of the most popular joints for traditional Sunday roasts.",
  silverside: "A lean cut from the hindquarter, commonly used for roasting and slow cooking methods. Often used for salt beef."
  // Add more cut-specific descriptions as needed
};

// Export all text groups
export default {
  common: commonText,
  modal: modalText,
  error: errorText,
  a11y: a11yText,
  cutDescriptions: cutDescriptions
};