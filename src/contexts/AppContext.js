import React, { createContext, useState, useCallback } from 'react';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children, value = {} }) => {
  // Modal states
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  
  // Modal open/close handlers
  const handleOpenAboutModal = useCallback(() => setIsAboutModalOpen(true), []);
  const handleCloseAboutModal = useCallback(() => setIsAboutModalOpen(false), []);
  
  const handleOpenPrivacyModal = useCallback(() => setIsPrivacyModalOpen(true), []);
  const handleClosePrivacyModal = useCallback(() => setIsPrivacyModalOpen(false), []);
  
  const handleOpenAccessibilityModal = useCallback(() => setIsAccessibilityModalOpen(true), []);
  const handleCloseAccessibilityModal = useCallback(() => setIsAccessibilityModalOpen(false), []);
  
  // Close all modals
  const closeAllModals = useCallback(() => {
    setIsAboutModalOpen(false);
    setIsPrivacyModalOpen(false);
    setIsAccessibilityModalOpen(false);
  }, []);
  
  // Combine passed value with our modal state and handlers
  const contextValue = {
    ...value,
    // Modal states
    isAboutModalOpen,
    isPrivacyModalOpen,
    isAccessibilityModalOpen,
    
    // Modal handlers
    handleOpenAboutModal,
    handleCloseAboutModal,
    handleOpenPrivacyModal,
    handleClosePrivacyModal,
    handleOpenAccessibilityModal,
    handleCloseAccessibilityModal,
    closeAllModals
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;