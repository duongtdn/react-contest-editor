"use strict";

import React, { useState, useRef } from 'react';
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

// Contest data including problem description and hint
const contestData = {
  problem: [
    {
      type: "Markdown",
      content: "# Sum Two Numbers\n\nImplement a function `sum_numbers(a, b)` that returns the sum of two numbers.\n\n## Requirements\n\n- The function should handle both positive and negative numbers\n- The function should return the sum of the two input parameters\n\n## Example\n\n```python\nsum_numbers(5, 3)  # returns 8\nsum_numbers(-5, 8)  # returns 3\nsum_numbers(0, 0)   # returns 0\n```\n\n## Implementation\n\nComplete the `sum_numbers` function in the editor:"
    }
  ],
  hint: [
    {
      type: "Markdown",
      content: "### Hint 1\nRemember that Python's addition operator is `+`.\n\n```python\ndef sum_numbers(a, b):\n    return a + b  # Simply return the sum of a and b\n```\n\n### Hint 2\nMake sure your function handles negative numbers correctly. Test with various inputs."
    }
  ]
};

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
  // Add state to track TabPanel fold status
  const [isTabPanelFolded, setIsTabPanelFolded] = useState(false);
  // Add ref to control the ContestEditor
  const contestEditorRef = useRef(null);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Handler for TabPanel fold changes
  const handleTabPanelFoldChange = (foldedState) => {
    setIsTabPanelFolded(foldedState);
    console.log(`TabPanel is now ${foldedState ? 'folded' : 'unfolded'}`);

    // Add a message to the terminal using ContestEditor ref
    if (contestEditorRef.current) {
      contestEditorRef.current.addTerminalEntry({
        type: 'system',
        content: `TabPanel was ${foldedState ? 'collapsed' : 'expanded'} at ${new Date().toLocaleTimeString()}`
      });
    }
  };

  // Handler for tab changes
  const handleTabChange = (index, tab) => {
    console.log(`Tab changed to "${tab.label}" (index: ${index})`);
  };

  // Returns a Promise for the submission process
  const handleSubmit = (editorContents) => {
    // Set submitting state to true to disable the button
    setIsSubmitting(true);
    console.log("Submitting...", editorContents);

    // Return a promise that resolves or rejects based on the sandbox server response
    return new Promise(async (resolve, reject) => {
      try {
        // Extract the main code to send to the sandbox server
        const mainFile = editorContents.find(file => file.filename === "main.py");
        if (!mainFile) {
          reject(new Error("No main.py file found for submission"));
          return;
        }

        // Simulate sending the code to a sandbox server
        // In a real implementation, this would be a fetch call to your sandbox API
        const response = await simulateSandboxRequest(mainFile.content);

        if (response.ok) {
          // Just resolve with the result data
          resolve(response.json);
        } else {
          // Just reject with the error
          reject(new Error(`Server error: ${response.status} ${response.statusText}`));
        }
      } catch (err) {
        // Handle any network or processing errors
        reject(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // This function simulates a request to a sandbox server
  // In a real implementation, this would be replaced with an actual fetch call
  const simulateSandboxRequest = (code) => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Random selection of response types for demonstration
        const responseType = Math.random();
        let mockResponse;

        if (responseType < 0.4) {
          // All tests pass
          mockResponse = {
            ok: true,
            json: {
              compile: { isPass: true },
              evaluate: {
                isPass: true,
                testcases: [
                  {
                    title: "Basic Test",
                    description: "Test with positive numbers",
                    isPass: true,
                    executionTime: "12189513",
                    stdout: "8",
                    stdin: "",
                    expectedStdout: "8"
                  },
                  {
                    title: "Mixed Numbers",
                    description: "Test with mixed positive and negative numbers",
                    isPass: true,
                    executionTime: "10406817",
                    stdout: "3",
                    stdin: "",
                    expectedStdout: "3"
                  },
                  {
                    title: "Edge Case",
                    description: "Test with duplicate numbers",
                    isPass: true,
                    hidden: true
                  }
                ]
              }
            }
          };
        } else if (responseType < 0.8) {
          // Some tests fail
          mockResponse = {
            ok: true,
            json: {
              compile: { isPass: true },
              evaluate: {
                isPass: false,
                testcases: [
                  {
                    title: "Basic Test",
                    description: "Test basic addition with positive numbers",
                    isPass: true,
                    executionTime: "10518563",
                    stdout: "30",
                    stdin: "10 20",
                    expectedStdout: "30"
                  },
                  {
                    title: "Negative Numbers",
                    description: "Test with negative numbers",
                    isPass: false,
                    executionTime: "9533989",
                    stdout: "30",
                    stdin: "-5 8",
                    expectedStdout: "3"
                  },
                  {
                    title: "Large Numbers",
                    description: "Test with large numbers",
                    isPass: false,
                    hidden: true
                  }
                ]
              }
            }
          };
        } else {
          // Runtime error
          mockResponse = {
            ok: true,
            json: {
              compile: { isPass: true },
              evaluate: {
                isPass: false,
                testcases: [
                  {
                    title: "Basic Test",
                    description: "Test with positive numbers",
                    isPass: false,
                    executionTime: "11180634",
                    stderr: "Program exited with error code: 1",
                    stdin: "",
                    expectedStdout: "8"
                  },
                  {
                    title: "Mixed Numbers",
                    description: "Test with mixed positive and negative numbers",
                    isPass: false,
                    executionTime: "10061135",
                    stderr: "Program exited with error code: 1",
                    stdin: "",
                    expectedStdout: "3"
                  },
                  {
                    title: "Edge Case",
                    description: "Test with duplicate numbers",
                    isPass: false,
                    hidden: true
                  }
                ]
              },
              error: "  File \"../main.py\", line 7\n    max_num = \n             ^\nSyntaxError: invalid syntax\n\n  File \"../main.py\", line 7\n    max_num = \n             ^\nSyntaxError: invalid syntax\n\n  File \"../main.py\", line 7\n    max_num = \n             ^\nSyntaxError: invalid syntax\n\n"
            }
          };
        }

        resolve(mockResponse);
      }, 1500);
    });
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
            '  about   - Show information about the editor',
            '  tab:info - Switch to Info tab',
            '  tab:test - Switch to Test Cases tab'
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
          if (contestEditorRef.current) {
            contestEditorRef.current.clearTerminal();
          }
          callback(null);
          break;
        case 'about':
          callback([
            'React Contest Editor with Integrated Terminal',
            'Version: 1.0.0',
            'Built with React and @duongtdn/react-scrollbox'
          ]);
          break;
        case 'tab:info':
          if (contestEditorRef.current) {
            const infoTabIndex = contestEditorRef.current.findTabIndexByLabel('Info');
            if (infoTabIndex !== -1) {
              contestEditorRef.current.switchTab(infoTabIndex);
              callback(['Switched to Info tab']);
            } else {
              callback(['Info tab not found']);
            }
          } else {
            callback(['Editor not ready']);
          }
          break;
        case 'tab:test':
          if (contestEditorRef.current) {
            const testCasesTabIndex = contestEditorRef.current.findTabIndexByLabel('Test Cases');
            if (testCasesTabIndex !== -1) {
              contestEditorRef.current.switchTab(testCasesTabIndex);
              callback(['Switched to Test Cases tab']);
            } else {
              callback(['Test Cases tab not found']);
            }
          } else {
            callback(['Editor not ready']);
          }
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

        {/* Display current TabPanel state */}
        <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
          TabPanel status: <strong>{isTabPanelFolded ? 'Collapsed' : 'Expanded'}</strong>
        </div>
      </div>

      <ContestEditor
        ref={contestEditorRef}
        // Editor props
        files={files}
        editorTheme={theme}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Run Code"
        submittingButtonText="Running..."
        SubmitIcon={FaPlay}

        // Contest data
        contest={contestData}

        // Terminal props
        terminalTitle="Terminal"
        initialTerminalHistory={[
          { type: 'output', content: 'Welcome to the Terminal! Type a command and press Enter.' },
          { type: 'output', content: 'Try using commands like "help", "run", or "clear".' }
        ]}
        onCommand={handleTerminalCommand}
        terminalPrompt="$ "
        terminalReadOnly={false}

        // TabPanel props
        initialActiveTab={0}
        onTabChange={handleTabChange}
        onTabPanelFoldChange={handleTabPanelFoldChange}

				height="560px"
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
          <li>TabPanel folding state notification via callbacks</li>
          <li>Programmatically switch TabPanel tabs (try running 'tab:info' or 'tab:test' in the terminal)</li>
          <li>Auto-switch to Test Cases tab after successful code submission</li>
          <li>Internal terminal management in ContestEditor component</li>
          <li>Promise-based submission handling with result/error feedback</li>
        </ul>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);