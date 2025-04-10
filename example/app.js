"use strict";

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import Editor from './src/components/Editor';

// Available themes for the editor
const THEMES = [
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'solarized-dark', label: 'Solarized Dark' }
];

// Example file configuration
const files = [
  {
    filename: "main.py",
    initialContent: "def sum_numbers(a, b):\n    return a + b\n\nif __name__ == \"__main__\":\n    import sys\n    a, b = map(int, sys.argv[1:3])\n    result = sum_numbers(a, b)\n    print(result, end = \"\")",
    language: "python",
    lock: false,
    readOnly: [1, 2, 4]
  },
  {
    filename: "test.txt",
    initialContent: "This is a read-only text file example.",
    language: "text",
    lock: true
  },
  {
    filename: "script.js",
    initialContent: "function calculateSum(a, b) {\n  return a + b;\n}\n\nconsole.log(calculateSum(5, 10));",
    language: "javascript",
    lock: false
  }
];

const App = () => {
  const [theme, setTheme] = useState('github-dark');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSubmit = (editorContents) => {
    // Set submitting state to true to disable the button
    setIsSubmitting(true);

    console.log("Submitting...", editorContents);

    // Simulate an API request with a 2-second timeout
    setTimeout(() => {
      console.log("Submit complete!", editorContents);
      setIsSubmitting(false);
    }, 2000);
  };

  // Theme selector styles
  const themeSelectStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
    },
    label: {
      marginRight: '10px',
      fontWeight: 'bold',
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      backgroundColor: '#fff',
      fontSize: '14px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>React Contest Editor Example</h1>
      <p>A lightweight React-based code editor for live coding contests, built on monaco-ext.</p>

      {/* Theme selector */}
      <div style={themeSelectStyles.container}>
        <label style={themeSelectStyles.label}>Theme:</label>
        <select
          value={theme}
          onChange={handleThemeChange}
          style={themeSelectStyles.select}
        >
          {THEMES.map(themeOption => (
            <option key={themeOption.value} value={themeOption.value}>
              {themeOption.label}
            </option>
          ))}
        </select>
      </div>

      <h2>Example Editor</h2>
      <Editor
        files={files}
        theme={theme}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Features demonstrated:</strong></p>
        <ul>
          <li>Multiple file support with tab navigation</li>
          <li>Read-only lines (lines 1, 2, 4 in main.py)</li>
          <li>Fully locked files (test.txt)</li>
          <li>Monaco Editor with syntax highlighting for different languages</li>
          <li>Auto-resizing height based on content</li>
          <li>Theme switching via the theme selector</li>
        </ul>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);