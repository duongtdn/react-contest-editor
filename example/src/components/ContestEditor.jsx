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
  isSubmitting = false,
  submitButtonText = 'Submit',
  submittingButtonText = 'Submitting...',
  SubmitIcon = FaPaperPlane,

  // Terminal props
  terminalTitle = 'Terminal',
  terminalHistory = [],
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

  // Refs for components
  const editorCtrl = useRef();
  const rightPanelRef = useRef();
  const tabPanelRef = useRef();

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
    }
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
          onSubmit={onSubmit}
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
          onCommand={onCommand}
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