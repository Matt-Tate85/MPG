import React, { createContext } from 'react';

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children, value = {} }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
