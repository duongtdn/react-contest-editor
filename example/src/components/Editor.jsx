import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ExtendableCodeEditor } from 'monaco-ext';
import { ReadOnlyLines, AutoResizeHeight } from 'monaco-ext/dist/features';
import { FaPaperPlane } from 'react-icons/fa';

import themes from 'monaco-ext/dist/themes';
ExtendableCodeEditor.loadThemes(() => Promise.resolve(themes));

const Editor = ({
  files,
  theme = 'github-dark',
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit',
  submittingButtonText = 'Submitting...',
  SubmitIcon = FaPaperPlane
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const containerRef = useRef(null);
  const currentThemeRef = useRef(theme);
  const [editorsInitialized, setEditorsInitialized] = useState(false);

  const editorsRef = useRef([]);
  const editorContainersRef = useRef([]);
  const readOnlyLinesRef = useRef([]);
  const autoResizeRef = useRef([]);

  const applyEditorFeatures = (file, index) => {
    const editor = editorsRef.current[index];
    if (!editor) return;

    if (!readOnlyLinesRef.current[index]) readOnlyLinesRef.current[index] = null;
    if (!autoResizeRef.current[index]) autoResizeRef.current[index] = null;

    if (readOnlyLinesRef.current[index]) {
      editor.features.remove('readOnlyLines');
      readOnlyLinesRef.current[index] = null;
    }

    if (autoResizeRef.current[index]) {
      editor.features.remove('autoResize');
      autoResizeRef.current[index] = null;
    }

    if (file.lock) {
      readOnlyLinesRef.current[index] = editor.features.add('readOnlyLines', new ReadOnlyLines());
    } else if (file.readOnly && file.readOnly.length > 0) {
      readOnlyLinesRef.current[index] = editor.features.add('readOnlyLines', new ReadOnlyLines(file.readOnly));
    }

    autoResizeRef.current[index] = editor.features.add('autoResize', new AutoResizeHeight());

    editor.eventChannel.addListener('editor.height', (height) => {
      console.log(`Editor ${index} height changed to ${height}px`);
    });
  };

  const createEditors = () => {
    if (!containerRef.current || editorsInitialized) return;

    editorContainersRef.current = files.map((_, index) => {
      const div = document.createElement('div');
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.position = 'absolute';
      div.style.top = '0';
      div.style.left = '0';
      div.style.display = index === selectedFileIndex ? 'block' : 'none';
      containerRef.current.appendChild(div);
      return div;
    });

    editorsRef.current = files.map((file, index) => {
      const editor = new ExtendableCodeEditor(
        editorContainersRef.current[index],
        {
          language: file.language,
          value: file.initialContent,
          minimap: { enabled: false },
          lineNumberOffset: 0,
          wordWrap: true,
          tabSize: 2,
          readOnly: false,
          scrollBeyondLastLine: false,
          padding: { top: 10 }
        }
      );
      return editor;
    });

    files.forEach((file, index) => {
      applyEditorFeatures(file, index);
    });

    ExtendableCodeEditor.changeTheme(theme);
    currentThemeRef.current = theme;
    setEditorsInitialized(true);
  };

  useEffect(() => {
    return () => {
      if (editorsRef.current) {
        editorsRef.current.forEach(editor => {
          if (editor) editor.editor.dispose();
        });
        editorsRef.current = [];
      }

      editorContainersRef.current.forEach(container => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
      editorContainersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (theme !== currentThemeRef.current && editorsRef.current.length > 0) {
      ExtendableCodeEditor.changeTheme(theme);
      currentThemeRef.current = theme;

      if (typeof document !== 'undefined') {
        const isDark = theme.includes('dark');
        document.body.className = isDark ? 'dark' : 'light';
      }
    }
  }, [theme]);

  const handleFileSelect = (index) => {
    setSelectedFileIndex(index);

    if (editorContainersRef.current) {
      editorContainersRef.current.forEach((container, i) => {
        if (container) {
          container.style.display = i === index ? 'block' : 'none';
        }
      });
    }

    if (editorsRef.current && editorsRef.current[index]) {
      editorsRef.current[index].editor.layout();
    }
  };

  const handleSubmit = () => {
    if (!editorsInitialized || !editorsRef.current.length || isSubmitting) return;

    const editorContents = files.map((file, index) => ({
      filename: file.filename,
      content: editorsRef.current[index].editor.getValue()
    }));

    if (typeof onSubmit === 'function') {
      onSubmit(editorContents);
    }
  };

  if (containerRef.current && !editorsInitialized) {
    createEditors();
  }

  useLayoutEffect(() => {
    if (!editorsInitialized) {
      createEditors();
    }
  }, [editorsInitialized]);

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <div style={styles.tabsLeft}>
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                ...styles.tab,
                ...(selectedFileIndex === index ? styles.activeTab : {})
              }}
              onClick={() => handleFileSelect(index)}
            >
              {file.filename}
              {file.lock && (
                <span style={styles.lockIcon} title="This file is locked">🔒</span>
              )}
            </div>
          ))}
        </div>
        <div style={styles.tabsRight}>
          <button
            style={{
              ...styles.submitButton,
              ...(isButtonHovered && !isSubmitting ? styles.submitButtonHover : {}),
              ...(isSubmitting ? styles.submitButtonDisabled : {})
            }}
            onClick={handleSubmit}
            onMouseEnter={() => !isSubmitting && setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            disabled={isSubmitting}
            title="Submit code"
          >
            <SubmitIcon style={styles.submitIcon} />
            <span style={styles.submitText}>{isSubmitting ? submittingButtonText : submitButtonText}</span>
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        style={styles.editorContainer}
      />
    </div>
  );
};

export default Editor;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #666',
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#333',
    padding: '0',
    margin: '0',
    listStyle: 'none',
    justifyContent: 'space-between',
  },
  tabsLeft: {
    display: 'flex',
  },
  tabsRight: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: '10px',
  },
  tab: {
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#ccc',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '4px solid transparent',
		fontFamily: 'consolas, monospace',
  },
  activeTab: {
    backgroundColor: '#444',
    color: 'white',
    borderBottom: '4px solid #007acc',
  },
  lockIcon: {
    fontSize: '12px',
    marginLeft: '4px',
  },
  editorContainer: {
    width: '100%',
    minHeight: '250px',
    position: 'relative',
  },
  editorInstance: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hidden: {
    display: 'none',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#444',
    padding: '8px 12px',
    borderBottom: '1px solid #555',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitButton: {
    backgroundColor: '#007acc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    height: 'fit-content',
    transition: 'background-color 0.3s ease, opacity 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  submitButtonHover: {
    backgroundColor: '#0062a3',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  submitButtonDisabled: {
    backgroundColor: '#7f7f7f',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  submitIcon: {
    fontSize: '14px',
  },
  submitText: {
    marginLeft: '4px',
  },
};

const injectCss = () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .read-only-code-line {
      cursor: pointer !important;
      opacity: 0.8;
    }

    .light .read-only-code-line {
      background: #f1f1f1;
    }

    .dark .read-only-code-line {
      background: #414141;
    }

    .read-only-code-text {
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleEl);
};

if (typeof document !== 'undefined') {
  injectCss();
}