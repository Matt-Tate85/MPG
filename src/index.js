import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// This function creates a diagnostic report of the DOM structure
function logDomStructure() {
  console.log('HTML Body children:', Array.from(document.body.children).map(el => ({
    tagName: el.tagName,
    id: el.id,
    className: el.className
  })));
  
  console.log('Looking for #root:', document.getElementById('root'));
  console.log('Looking for #mainContent:', document.getElementById('mainContent'));
}

// Log the DOM structure to help diagnose the issue
logDomStructure();

// Try to find a suitable mount point
let rootElement = document.getElementById('root');

// If root element doesn't exist, try to find mainContent
if (!rootElement) {
  rootElement = document.getElementById('mainContent');
  console.log('Root element not found, trying to use mainContent instead:', rootElement);
}

// If neither exists, create a new div and append it to the body
if (!rootElement) {
  console.log('Creating new root element');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Now we should have a valid element to mount to
try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
  
  console.log('React successfully mounted to:', rootElement);
} catch (error) {
  console.error('Failed to mount React application:', error);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note that this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
