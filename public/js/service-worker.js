// public/js/service-worker.js

/**
 * Service Worker for the AHDB Meat Purchasing Guide PWA
 * Enables offline functionality through caching
 */

const CACHE_NAME = 'ahdb-meat-guide-v1';

// Assets to cache immediately on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/css/normalize.css',
    '/js/app.js',
    '/js/data/index.js',
    '/js/data/beef.js',
    '/js/data/lamb.js',
    '/js/data/pork.js',
    '/js/routes.js',
    '/js/ui.js',
    '/offline.html',
    '/assets/icons/ahdb-logo.svg',
    '/assets/icons/ahdb-logo-white.svg',
    '/assets/icons/favicon.png',
    '/assets/images/placeholder.jpg'
];

// Function to cache meat cut URLs and images
async function cacheMeatCutAssets() {
    try {
        // Get all meat cut data
        const allCuts = await getAllMeatCuts();
        
        // Generate URLs for all cuts
        const cutURLs = allCuts.map(cut => `/cut/${cut.id}`);
        
        // Get image URLs
        const imageURLs = allCuts.map(cut => cut.image);
        
        // Open cache
        const cache = await caches.open(CACHE_NAME);
        
        // Cache meat cut images
        console.log('Caching meat cut images...');
        await Promise.allSettled(imageURLs.map(url => 
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return cache.put(url, response);
                    }
                    throw new Error(`Failed to fetch ${url}`);
                })
                .catch(error => console.log(`Warning: Could not cache ${url}: ${error.message}`))
        ));
        
        // Cache cut URLs
        console.log('Caching meat cut URLs...');
        await Promise.allSettled(cutURLs.map(url => 
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return cache.put(url, response);
                    }
                    throw new Error(`Failed to fetch ${url}`);
                })
                .catch(error => {
                    // For cut URLs, cache the index.html as a fallback
                    // This allows the client-side routing to handle the URL
                    return fetch('/')
                        .then(response => cache.put(url, response.clone()))
                        .catch(e => console.log(`Warning: Could not cache fallback for ${url}: ${e.message}`));
                })
        ));
        
        console.log('Meat cut assets cached successfully');
    } catch (error) {
        console.error('Error caching meat cut assets:', error);
    }
}

// Helper function to get all meat cuts
// This is a simplified version - the real data is imported from data modules
async function getAllMeatCuts() {
    try {
        // Try to fetch the meat data from the network
        const response = await fetch('/js/data/index.js');
        if (!response.ok) throw new Error('Network response was not ok');
        
        // We can't directly evaluate the JS module here, so we'll try to get the data from the client
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            // Ask the client for the meat data
            const client = clients[0];
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = event => {
                    resolve(event.data);
                };
                client.postMessage({
                    action: 'GET_MEAT_DATA'
                }, [messageChannel.port2]);
            });
        }
        
        // Fallback - return an empty array (this shouldn't happen in practice)
        return [];
    } catch (error) {
        console.error('Error getting meat cuts:', error);
        return [];
    }
}

// Install event - cache the core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches and cache meat cut assets
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Cache activated and old caches removed');
                // After cleaning up, cache meat cut assets
                return cacheMeatCutAssets();
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Handle navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If fetch fails (offline), try to serve from cache
                    return caches.match(event.request)
                        .then((response) => {
                            if (response) {
                                return response;
                            }
                            
                            // If not in cache, try to match the path pattern for cut pages
                            const url = new URL(event.request.url);
                            if (url.pathname.startsWith('/cut/')) {
                                // For meat cut details, try to serve the cached home page
                                // The JS will handle rendering the correct content
                                return caches.match('/');
                            }
                            
                            // If all else fails, serve the offline page
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }
    
    // For other requests (assets, API calls, etc.)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    // Return cached response but also update cache in background if possible
                    const fetchPromise = fetch(event.request)
                        .then(networkResponse => {
                            // Update the cache with the new response if it's valid
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                const cache = caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, networkResponse.clone());
                                    });
                            }
                            // We don't actually use the network response here,
                            // just using it to update the cache
                            return networkResponse;
                        })
                        .catch(() => {
                            // Network fetch failed, just continue using the cached version
                        });
                    
                    // Return the cached response immediately
                    return cachedResponse;
                }
                
                // If not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check for valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response to cache it and return it
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If fetch fails and not in cache
                        
                        // For image requests, serve placeholder
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                            return caches.match('/assets/images/placeholder.jpg');
                        }
                        
                        // For JavaScript or CSS, try to return a cached response for ANY JS or CSS file
                        if (event.request.url.match(/\.(js|css)$/)) {
                            return caches.match(event.request);
                        }
                        
                        // For other assets, return an empty response
                        return new Response('', {
                            status: 408,
                            statusText: 'Request timed out'
                        });
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    // Handle request to cache new content
    if (event.data.action === 'CACHE_MEAT_DATA') {
        // Store the meat data in a variable accessible to the service worker
        cacheMeatCutAssets()
            .then(() => {
                // Notify clients that caching is complete
                self.clients.matchAll()
                    .then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                action: 'MEAT_DATA_CACHED',
                                success: true
                            });
                        });
                    });
            })
            .catch(error => {
                console.error('Error caching content:', error);
                // Notify clients of failure
                self.clients.matchAll()
                    .then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                action: 'MEAT_DATA_CACHED',
                                success: false,
                                error: error.message
                            });
                        });
                    });
            });
    }
    
    // Respond to requests for meat data
    if (event.data.action === 'GET_MEAT_DATA' && event.ports && event.ports[0]) {
        // Return empty array - this is just a placeholder
        // The actual data will be provided by the app
        event.ports[0].postMessage([]);
    }
});