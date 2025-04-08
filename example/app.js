"use strict";

import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
      <h2>React Contest Editor Example</h2>
    </div>
  );
}

// Initialize the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);