import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { FilterProvider } from './contexts/FilterContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import OfflineNotification from './components/common/OfflineNotification';
import InstallPrompt from './components/common/InstallPrompt';

// Pages
import HomePage from './pages/HomePage';
import CutDetailPage from './pages/CutDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import './App.css';

function App() {
  // Track online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Install prompt state
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
  // Modal states for AppProvider
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  
  // Check if app is already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsAppInstalled(true);
    }
  }, []);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  // Handle install button click
  const handleInstall = () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };
  
  // Modal handlers
  const handleOpenAboutModal = () => setAboutModalOpen(true);
  const handleCloseAboutModal = () => setAboutModalOpen(false);
  const handleOpenPrivacyModal = () => setPrivacyModalOpen(true);
  const handleClosePrivacyModal = () => setPrivacyModalOpen(false);
  const handleOpenAccessibilityModal = () => setAccessibilityModalOpen(true);
  const handleCloseAccessibilityModal = () => setAccessibilityModalOpen(false);
  
  // App context value
  const appContextValue = {
    isOnline,
    isAppInstalled,
    handleOpenAboutModal,
    handleCloseAboutModal,
    handleOpenPrivacyModal,
    handleClosePrivacyModal,
    handleOpenAccessibilityModal,
    handleCloseAccessibilityModal
  };
  
  return (
    <AppProvider value={appContextValue}>
      <FilterProvider>
        <Router>
          <div className="app">
            {!isOnline && <OfflineNotification />}
            
            <Header />
            
            <main id="mainContent">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cut/:cutId" element={<CutDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            <Footer />
            
            {!isAppInstalled && installPrompt && (
              <InstallPrompt onInstall={handleInstall} onDismiss={() => setInstallPrompt(null)} />
            )}
            
            <a href="#mainContent" className="skip-link">Skip to main content</a>
          </div>
        </Router>
      </FilterProvider>
    </AppProvider>
  );
}

export default App;
