import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const appContent = (
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  // If pre-rendered content exists, hydrate it.
  ReactDOM.hydrateRoot(rootElement, appContent);
} else {
  // Otherwise, create a new root.
  ReactDOM.createRoot(rootElement).render(appContent);
}