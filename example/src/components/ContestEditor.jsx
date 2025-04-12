import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FaPaperPlane, FaInfo } from 'react-icons/fa';
import { GrTest } from "react-icons/gr";

import Editor from './Editor';
import Terminal from './Terminal';
import TabPanel from './TabPanel';

/**
 * ContestEditor component that combines TabPanel, Editor and Terminal components
 * with TabPanel on the left and Editor/Terminal in a vertical layout on the right.
 */
const ContestEditor = forwardRef(({
  // Editor props
  files,
  editorTheme = 'github-dark',
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  submitButtonText = 'Submit',
  submittingButtonText = 'Submitting...',
  SubmitIcon = FaPaperPlane,

  // Terminal props
  terminalTitle = 'Terminal',
  initialTerminalHistory = [],
  onCommand = null,
  terminalPrompt = '$ ',
  terminalReadOnly = false,

  // TabPanel props
  tabPanelWidth = '450px',
  leftTabs = [
    {
      label: 'Info',
      icon: <FaInfo />,
      title: 'Contest Information',
      content: <div>Contest information goes here</div>
    },
    {
      label: 'Test Cases',
      icon: <GrTest />,
      title: 'Task List',
      content: <div>Test Cases goes here</div>
    }
  ],
  initialActiveTab = 0,
  onTabChange = null,

  // Panel state callbacks
  onTabPanelFoldChange = null
}, ref) => {
  // Keep theme synchronized between editor and terminal
  const theme = editorTheme;

  // Track TabPanel folded state
  const [isTabPanelFolded, setIsTabPanelFolded] = useState(false);

  // Track active tab
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTab);

  // Internal submission state
  const [isSubmitting, setIsSubmitting] = useState(externalIsSubmitting);

  // Internal terminal history state
  const [terminalHistory, setTerminalHistory] = useState(initialTerminalHistory);

  // Refs for components
  const editorCtrl = useRef();
  const rightPanelRef = useRef();
  const tabPanelRef = useRef();

  // Update internal submission state when external state changes
  useEffect(() => {
    setIsSubmitting(externalIsSubmitting);
  }, [externalIsSubmitting]);

  // Add terminal entry
  const addTerminalEntry = (entry) => {
    setTerminalHistory(prev => [...prev, entry]);
  };

  // Add multiple terminal entries
  const addTerminalEntries = (entries) => {
    setTerminalHistory(prev => [...prev, ...entries]);
  };

  // Handle terminal commands internally
  const handleTerminalCommand = (command, callback) => {
    if (onCommand) {
      onCommand(command, (response) => {
        if (response !== null) {
          if (Array.isArray(response)) {
            addTerminalEntries(response.map(content => ({ type: 'output', content })));
          } else {
            addTerminalEntry({ type: 'output', content: response });
          }
        }
        if (callback) callback(response);
      });
    }
  };

  // Handle submission with Promise
  const handleSubmit = async (editorContents) => {
    // Set internal submitting state
    setIsSubmitting(true);

    // Add submission notification to terminal
    addTerminalEntry({
      type: 'output',
      content: `Submitting code at ${new Date().toLocaleTimeString()}...`
    });

    try {
      // Call external onSubmit handler which should return a Promise
      const result = await onSubmit(editorContents);

      // Check if there's an error in the code (syntax error, runtime error, etc.)
      if (result.error) {
        addTerminalEntry({ type: 'error', content: result.error });
        return result;
      }

      // Check compilation status
      if (!result.compile?.isPass) {
        addTerminalEntry({ type: 'error', content: 'Compilation error:' });
        if (result?.error) {
          addTerminalEntry({ type: 'error', content: result.error });
        }
        return result;
      }

      // Handle successful execution
      const isAllTestsPassed = result.evaluate?.isPass;
      const testCases = result.evaluate?.testcases || [];

      // Display test results summary
      addTerminalEntry({ type: 'output', content: 'Submission successful!' });
      addTerminalEntry({
        type: 'output',
        content: isAllTestsPassed
          ? '✅ All test cases passed!'
          : `⚠️ ${testCases.filter(t => t.isPass).length}/${testCases.length} test cases passed.`
      });

      // Add detailed test case results for failing tests
      if (!isAllTestsPassed) {
        addTerminalEntry({ type: 'output', content: '\nTest case results:' });

        testCases.forEach((test, index) => {
          // Skip detailed output for hidden test cases
          if (test.hidden) {
            addTerminalEntry({
              type: test.isPass ? 'output' : 'error',
              content: `${test.isPass ? '✅' : '❌'} Test #${index+1}: ${test.title} ${test.hidden ? '(hidden)' : ''}`
            });
          } else if (!test.isPass) {
            // Show details only for failing non-hidden tests
            addTerminalEntry({
              type: 'error',
              content: `❌ Test #${index+1}: ${test.title}`
            });

            if (test.description) {
              addTerminalEntry({
                type: 'output',
                content: `   Description: ${test.description}`
              });
            }

            if (test.stdin) {
              addTerminalEntry({
                type: 'output',
                content: `   Input: ${test.stdin}`
              });
            }

            if (test.stdout) {
              addTerminalEntry({
                type: 'error',
                content: `   Your output: ${test.stdout}`
              });
              addTerminalEntry({
                type: 'output',
                content: `   Expected: ${test.expectedStdout}`
              });
            }

            if (test.stderr) {
              addTerminalEntry({
                type: 'error',
                content: `   Error: ${test.stderr}`
              });
            }
          }
        });

        const testCasesTabIndex = leftTabs.findIndex(tab => tab.label === 'Test Cases');
				if (testCasesTabIndex !== -1) {
					setActiveTabIndex(testCasesTabIndex);
				}
      }

      return result;
    } catch (error) {
      // Handle network or server errors
      addTerminalEntry({
        type: 'error',
        content: `Error: ${error.message || 'Unknown error occurred'}`
      });
      throw error; // Re-throw to let the parent component handle it if needed
    } finally {
      // Reset submitting state
      setIsSubmitting(false);
    }
  };

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    // Method to switch tab programmatically
    switchTab: (tabIndex) => {
      if (tabIndex >= 0 && tabIndex < leftTabs.length) {
        setActiveTabIndex(tabIndex);
      }
    },
    // Method to get current active tab index
    getActiveTabIndex: () => activeTabIndex,
    // Method to find tab index by label
    findTabIndexByLabel: (label) => {
      return leftTabs.findIndex(tab => tab.label === label);
    },
    // Method to add terminal entries
    addTerminalEntry,
    // Method to add multiple terminal entries
    addTerminalEntries,
    // Method to clear terminal
    clearTerminal: () => setTerminalHistory([])
  }));

  // Handle fold state changes
  const handleTabPanelFoldChange = (foldedState) => {
    setIsTabPanelFolded(foldedState);
    // Call external handler if provided
    if (onTabPanelFoldChange) {
      onTabPanelFoldChange(foldedState);
    }
  };

  // Handle tab changes
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    // Call external handler if provided
    if (onTabChange) {
      onTabChange(index, leftTabs[index]);
    }
  };

  // Setup ResizeObserver to refresh editor when the container is resized
  useEffect(() => {
    if (!rightPanelRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editorCtrl.current && editorCtrl.current.refresh) {
        editorCtrl.current.refresh();
      }
    });

    resizeObserver.observe(rightPanelRef.current);

    // Cleanup observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* TabPanel Component on the left */}
      <TabPanel
        ref={tabPanelRef}
        tabs={leftTabs}
        defaultActiveTab={initialActiveTab}
        activeTabIndex={activeTabIndex}
        onTabChange={handleTabChange}
        width={tabPanelWidth}
        theme={theme}
        onFoldChange={handleTabPanelFoldChange}
      />

      {/* Editor and Terminal Stack on the right */}
      <div ref={rightPanelRef} style={styles.rightPanel}>
        {/* Editor Component */}
        <Editor
          files={files}
          theme={theme}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={submitButtonText}
          submittingButtonText={submittingButtonText}
          SubmitIcon={SubmitIcon}
          onReady={(ctrl) => editorCtrl.current = ctrl}
        />

        {/* Terminal Component */}
        <Terminal
          title={terminalTitle}
          history={terminalHistory}
          onCommand={handleTerminalCommand}
          prompt={terminalPrompt}
          readOnly={terminalReadOnly}
          theme={theme}
        />
      </div>
    </div>
  );
});

export default ContestEditor;

// Styling for the container
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden', // Prevent scrolling in the container itself
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  }
};