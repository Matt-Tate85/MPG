// public/js/app.js

/**
 * Main application script for the AHDB Meat Purchasing Guide PWA
 */

import { initUI } from './ui.js';
import { initRoutes } from './routes.js';
import { getAllCuts } from './data/index.js';

// Application state
const appState = {
    isOnline: navigator.onLine,
    isInstalled: false,
    serviceWorkerRegistration: null
};

/**
 * Initialize the application
 */
function initApp() {
    // Initialize UI components
    initUI();
    
    // Initialize routing
    initRoutes();
    
    // Initialize service worker
    initServiceWorker();
    
    // Initialize online/offline detection
    initOnlineStatus();
    
    // Initialize install prompt
    initInstallPrompt();
    
    // Add keyboard navigation support
    initKeyboardNavigation();
    
    console.log('AHDB Meat Purchasing Guide initialized');
}

/**
 * Initialize the service worker
 */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/js/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);
                    appState.serviceWorkerRegistration = registration;
                    
                    // Set up message handling from service worker
                    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
                    
                    // Send meat data to service worker for caching
                    if (navigator.serviceWorker.controller) {
                        sendMeatDataToServiceWorker();
                    } else {
                        // Wait for the service worker to be controlling this page
                        navigator.serviceWorker.addEventListener('controllerchange', sendMeatDataToServiceWorker);
                    }
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
}

/**
 * Send meat cut data to the service worker for caching
 */
function sendMeatDataToServiceWorker() {
    if (navigator.serviceWorker.controller) {
        const meatData = getAllCuts();
        navigator.serviceWorker.controller.postMessage({
            action: 'CACHE_MEAT_DATA',
            data: meatData
        });
        
        console.log('Sent meat data to service worker for caching');
    }
}

/**
 * Handle messages from the service worker
 */
function handleServiceWorkerMessage(event) {
    const message = event.data;
    
    if (message.action === 'MEAT_DATA_CACHED') {
        if (message.success) {
            console.log('Meat data cached successfully');
        } else {
            console.error('Failed to cache meat data:', message.error);
        }
    }
}

/**
 * Initialize online/offline status detection
 */
function initOnlineStatus() {
    const offlineNotification = document.getElementById('offlineNotification');
    const dismissOfflineNotification = document.getElementById('dismissOfflineNotification');
    
    // Update online status
    function updateOnlineStatus() {
        appState.isOnline = navigator.onLine;
        
        if (offlineNotification) {
            if (!appState.isOnline) {
                offlineNotification.classList.remove('hidden');
                offlineNotification.setAttribute('aria-hidden', 'false');
            } else {
                offlineNotification.classList.add('hidden');
                offlineNotification.setAttribute('aria-hidden', 'true');
            }
        }
        
        // Dispatch custom event for components to react to
        window.dispatchEvent(new CustomEvent('onlineStatusChanged', { 
            detail: { isOnline: appState.isOnline } 
        }));
        
        console.log('Online status changed:', appState.isOnline ? 'online' : 'offline');
    }
    
    // Initial status check
    updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Dismiss offline notification
    if (dismissOfflineNotification) {
        dismissOfflineNotification.addEventListener('click', () => {
            offlineNotification.classList.add('hidden');
            offlineNotification.setAttribute('aria-hidden', 'true');
        });
    }
}

/**
 * Initialize PWA install prompt
 */
function initInstallPrompt() {
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installButton = document.getElementById('installButton');
    const dismissPrompt = document.getElementById('dismissPrompt');
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        appState.isInstalled = true;
        console.log('Application is already installed');
        return;
    }
    
    // Capture the install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show the install prompt
        if (installPrompt) {
            installPrompt.classList.remove('hidden');
            installPrompt.setAttribute('aria-hidden', 'false');
        }
        
        console.log('Install prompt captured and displayed');
    });
    
    // Handle the install button click
    if (installButton) {
        installButton.addEventListener('click', () => {
            // Hide the prompt
            if (installPrompt) {
                installPrompt.classList.add('hidden');
                installPrompt.setAttribute('aria-hidden', 'true');
            }
            
            // Show the browser install prompt
            if (deferredPrompt) {
                deferredPrompt.prompt();
                
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        appState.isInstalled = true;
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            }
        });
    }
    
    // Handle the dismiss button click
    if (dismissPrompt && installPrompt) {
        dismissPrompt.addEventListener('click', () => {
            installPrompt.classList.add('hidden');
            installPrompt.setAttribute('aria-hidden', 'true');
            console.log('Install prompt dismissed by user');
        });
    }
    
    // Listen for the app being installed
    window.addEventListener('appinstalled', (e) => {
        appState.isInstalled = true;
        console.log('Application was installed');
    });
}

/**
 * Initialize keyboard navigation support
 */
function initKeyboardNavigation() {
    // Skip link functionality - pressing Tab at the beginning should focus a skip link
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                e.preventDefault();
                skipLink.classList.add('visible');
                skipLink.focus();
            }
        }
    });
    
    // Handle skip link behavior
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('blur', () => {
            skipLink.classList.remove('visible');
        });
        
        skipLink.addEventListener('click', () => {
            skipLink.classList.remove('visible');
        });
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export app state and functions for potential use by other modules
export { appState };