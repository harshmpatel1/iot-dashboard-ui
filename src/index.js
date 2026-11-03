// **src/index.js** (or src/index.tsx)

import React from 'react';
import { createRoot } from 'react-dom/client'; // For React 18+

// Import your main App component
import App from './App';
import './index.css';
// ... other imports like CSS files (e.g., import './index.css';)

// Find the root DOM element defined in public/index.html
const rootElement = document.getElementById('root');

// Use the createRoot API for React 18+ to render the application
// This is where the magic happens: it injects the <App /> component 
// into the <div id="root"></div> in your HTML.
const root = createRoot(rootElement);
root.render(
  // The <React.StrictMode> is a tool for highlighting potential problems in an application.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
