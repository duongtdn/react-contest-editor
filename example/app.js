"use strict";

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FaPlay } from 'react-icons/fa';

import ContestEditor from './src/components/ContestEditor';

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
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', content: 'Welcome to the Terminal! Type a command and press Enter.' },
    { type: 'output', content: 'Try using commands like "help", "run", or "clear".' }
  ]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleSubmit = (editorContents) => {
    // Set submitting state to true to disable the button
    setIsSubmitting(true);

    console.log("Submitting...", editorContents);

    // Add submission to terminal
    const newTerminalEntry = {
      type: 'output',
      content: `Submitting code at ${new Date().toLocaleTimeString()}...`
    };
    setTerminalHistory(prev => [...prev, newTerminalEntry]);

    // Simulate an API request with a 2-second timeout
    setTimeout(() => {
      console.log("Submit complete!", editorContents);
      setIsSubmitting(false);

      // Randomly simulate errors for Python files (30% chance)
      const pythonFile = editorContents.find(file => file.filename.endsWith('.py'));
      const simulateError = pythonFile && Math.random() < 0.3;

      if (simulateError) {
        // Create a simulated Python error stack trace
        const errorLines = [
          { type: 'error', content: 'Traceback (most recent call last):' },
          { type: 'error', content: `  File "${pythonFile.filename}", line 6, in <module>` },
          { type: 'error', content: '    result = sum_numbers(a, b)' },
          { type: 'error', content: `  File "${pythonFile.filename}", line 2, in sum_numbers` },
          { type: 'error', content: '    return a + b' },
          { type: 'error', content: 'TypeError: can only concatenate str (not "int") to str' },
        ];

        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', content: 'Running main.py with arguments [5, "10"]...' },
          ...errorLines
        ]);
      } else {
        // Add successful completion message to terminal
        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', content: 'Submission successful!' },
          { type: 'output', content: `Files submitted: ${editorContents.map(file => file.filename).join(', ')}` },
          { type: 'output', content: 'Running main.py with arguments [5, 10]...' },
          { type: 'output', content: '15' }
        ]);
      }
    }, 2000);
  };

  const handleTerminalCommand = (command, callback) => {
    // Simple terminal command handling
    setTimeout(() => {
      switch(command.toLowerCase()) {
        case 'help':
          callback([
            'Available commands:',
            '  help    - Display this help message',
            '  run     - Simulate running the code',
            '  clear   - Clear the terminal',
            '  about   - Show information about the editor'
          ]);
          break;
        case 'run':
          callback([
            'Running code...',
            'Output:',
            '> Hello from the simulated runtime!'
          ]);
          break;
        case 'clear':
          setTerminalHistory([]);
          callback(null);
          break;
        case 'about':
          callback([
            'React Contest Editor with Integrated Terminal',
            'Version: 1.0.0',
            'Built with React and @duongtdn/react-scrollbox'
          ]);
          break;
        default:
          callback([`Command not found: ${command}`]);
      }
    }, 300); // Small delay to simulate processing
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
    <div style={{ width: '100%', margin: '12px auto', padding: '0 20px' }}>
      <h2>React Contest Editor Example</h2>
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

      <ContestEditor
				// Editor props
        files={files}
        editorTheme={theme}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Run Code"
        submittingButtonText="Running..."
				SubmitIcon={FaPlay}

				// Terminal props
        terminalTitle="Interactive Terminal"
        terminalHistory={terminalHistory}
        onCommand={handleTerminalCommand}
        terminalPrompt="$ "
				terminalReadOnly={false}
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
          <li>Customizable submit button text and icon</li>
          <li>Interactive terminal with command history</li>
          <li>Scrollable terminal output using react-scrollbox</li>
          <li>Vertically stacked editor and terminal using ContestEditor</li>
        </ul>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);