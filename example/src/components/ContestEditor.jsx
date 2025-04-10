// filepath: /home/duongtdn/work/duongtdn/react-contest-editor/example/src/components/ContestEditor.jsx
import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import Editor from './Editor';
import Terminal from './Terminal';

/**
 * ContestEditor component that combines Editor and Terminal components
 * in a vertical layout.
 */
const ContestEditor = ({
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
}) => {
  // Keep theme synchronized between editor and terminal
  const theme = editorTheme;

  return (
    <div style={styles.container}>
      {/* Editor Component */}
      <Editor
        files={files}
        theme={theme}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitButtonText={submitButtonText}
        submittingButtonText={submittingButtonText}
				SubmitIcon={SubmitIcon}
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
  );
};

export default ContestEditor;

// Styling for the container
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden', // Prevent scrolling in the container itself
  }
};