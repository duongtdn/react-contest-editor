# React Contest Editor

A lightweight React-based code editor for live coding contests, built on monaco-ext.

## Features

- **Multiple File Support** - Edit multiple files with easy tab navigation
- **Monaco Editor Integration** - Powered by Monaco Editor with syntax highlighting for different languages
- **Terminal Integration** - Interactive terminal with command history
- **Split Layout** - Information panel, code editor, and terminal in one component
- **Test Case Visualization** - View test case results with pass/fail status
- **Code Line Highlighting** - Ability to highlight specific lines of code
- **Customizable Themes** - Light and dark themes available
- **Read-Only Support** - Set specific lines or entire files as read-only
- **Rich Contest Information** - Display problem statements and hints

## Installation

```bash
npm install react-contest-editor --save
```

## Basic Usage

```jsx
import React, { useRef } from 'react';
import ContestEditor from 'react-contest-editor';
import { FaPlay } from 'react-icons/fa';

const MyContestApp = () => {
  const contestEditorRef = useRef(null);

  const files = [
    {
      filename: "main.py",
      initialContent: "def solution():\n    # Your code here\n    pass",
      language: "python",
      readOnly: [1] // Line 1 will be read-only
    }
  ];

  const contestData = {
    problem: [
      {
        type: "Markdown",
        content: "# Problem Title\n\nProblem description goes here..."
      }
    ],
    hint: [
      {
        type: "Markdown",
        content: "### Hint\nHelpful hints for solving the problem..."
      }
    ]
  };

  const handleSubmit = async (editorContents) => {
    // Process the submission
    // Return a response object with compile and evaluate results
    return {
      compile: { isPass: true },
      evaluate: {
        isPass: true,
        testcases: [
          {
            title: "Test Case 1",
            description: "Basic test",
            isPass: true,
            stdout: "Expected output"
          }
        ]
      }
    };
  };

  return (
    <ContestEditor
      ref={contestEditorRef}
      files={files}
      contest={contestData}
      onSubmit={handleSubmit}
      submitButtonText="Run"
      SubmitIcon={FaPlay}
      height="600px"
    />
  );
};
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | Array | | Array of file objects to be displayed in the editor |
| `editorTheme` | String | 'github-dark' | Theme for the editor ('github-light', 'github-dark', 'solarized-light', 'solarized-dark') |
| `height` | String | '600px' | Height of the overall component |
| `contest` | Object | `{ problem: [], hint: [] }` | Contest data containing problem statements and hints |

### Editor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | Function | | Callback function when code is submitted, should return a Promise |
| `isSubmitting` | Boolean | false | Indicator if submission is in progress |
| `submitButtonText` | String | 'Submit' | Text for the submit button |
| `submittingButtonText` | String | 'Submitting...' | Text shown during submission |
| `SubmitIcon` | Component | FaPaperPlane | Icon component for the submit button |

### Terminal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `terminalTitle` | String | 'Terminal' | Title for the terminal panel |
| `initialTerminalHistory` | Array | [] | Initial entries in the terminal |
| `onCommand` | Function | null | Callback for handling terminal commands |
| `terminalPrompt` | String | '$ ' | Prompt displayed in the terminal |
| `terminalReadOnly` | Boolean | false | Whether terminal is in read-only mode |

### TabPanel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftTabs` | Array | null | Custom tabs for the left panel (default: Info and Test Cases) |
| `initialActiveTab` | Number | 0 | Index of initially active tab |
| `onTabChange` | Function | null | Callback when tab is changed |
| `onTabPanelFoldChange` | Function | null | Callback when tab panel is folded/unfolded |
| `onTerminalFoldChange` | Function | null | Callback when terminal is folded/unfolded |

## File Object Structure

Each file in the `files` array should have the following structure:

```javascript
{
  filename: "main.py",         // Required: Name of the file
  initialContent: "...",       // Required: Initial content
  language: "python",          // Required: Language for syntax highlighting
  lock: false,                 // Optional: If true, file is fully read-only
  readOnly: [1, 2, 4]          // Optional: Array of line numbers (0-based) that are read-only
}
```

## Contest Data Structure

The contest object contains problem statements and hints:

```javascript
{
  problem: [
    {
      type: "Markdown",
      content: "# Problem Title\n\nDescription..."
    }
  ],
  hint: [
    {
      type: "Markdown",
      content: "### Hint\nHelpful tips..."
    }
  ]
}
```

## Submission Response Format

The `onSubmit` callback should return a Promise that resolves to an object with the following structure:

```javascript
{
  compile: {
    isPass: true // Whether compilation succeeded
  },
  evaluate: {
    isPass: true, // Whether all test cases passed
    testcases: [
      {
        title: "Test Case 1",
        description: "Basic test",
        isPass: true,
        executionTime: "12189513", // Optional: execution time in nanoseconds
        stdout: "8", // Optional: actual output
        stdin: "5 3", // Optional: input provided
        expectedStdout: "8", // Optional: expected output
        hidden: false // Optional: if test case details should be hidden
      }
    ]
  },
  error: "Error message" // Optional: error message if any
}
```

## Methods (using ref)

| Method | Parameters | Description |
|--------|------------|-------------|
| `switchTab` | `(tabIndex)` | Switch to tab at specified index |
| `getActiveTabIndex` | | Get current active tab index |
| `findTabIndexByLabel` | `(label)` | Find tab index by label |
| `addTerminalEntry` | `(entry)` | Add single entry to terminal |
| `addTerminalEntries` | `(entries)` | Add multiple entries to terminal |
| `clearTerminal` | | Clear terminal history |
| `toggleTerminalFold` | | Toggle terminal fold state |
| `isTerminalFolded` | | Get terminal fold state |
| `highlight` | `(filename, lines)` | Highlight specific lines in a file |

### Terminal Entry Format

```javascript
{
  type: 'output', // 'output', 'error', 'system', 'command'
  content: 'Output text'
}
```

## Example Use Cases

### Creating Custom Terminal Commands

```jsx
const handleTerminalCommand = (command, callback) => {
  switch(command.toLowerCase()) {
    case 'help':
      callback([
        'Available commands:',
        '  help    - Display this help message',
        '  run     - Simulate running the code',
        '  clear   - Clear the terminal'
      ]);
      break;
    case 'clear':
      contestEditorRef.current.clearTerminal();
      callback(null); // No output needed
      break;
    default:
      callback([`Command not found: ${command}`]);
  }
};
```

### Highlighting Code Lines

```jsx
// Highlight specific lines in a file
contestEditorRef.current.highlight("main.py", [2, 3, 4]);

// Clear highlights
contestEditorRef.current.highlight("main.py", []);
```

### Switching Tabs Programmatically

```jsx
// Switch to Test Cases tab
const testCasesTabIndex = contestEditorRef.current.findTabIndexByLabel('Test Cases');
if (testCasesTabIndex !== -1) {
  contestEditorRef.current.switchTab(testCasesTabIndex);
}
```

## Dependencies

- `@duongtdn/react-scrollbox`: Scrollable container for terminal
- `monaco-ext`: Extended Monaco Editor with additional features
- `react-icons`: Icons used throughout the interface
- `react-markdown`: Markdown rendering for problem statements
- `react-syntax-highlighter`: Syntax highlighting for code snippets in Info panel

## License

MIT