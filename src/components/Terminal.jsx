import React, { useState, useRef, useEffect, useMemo } from 'react';
import ScrollBox from '@duongtdn/react-scrollbox';
import { FaCopy, FaTrash, FaCheck, FaTerminal, FaAngleUp, FaAngleDown } from 'react-icons/fa';

const Terminal = ({
  title = 'Terminal',
  history = [],
  onCommand = null,
  prompt = '$ ',
  readOnly = false,
  theme = 'github-dark',
  height = 300,
  onFoldChange = null,
  isFolded: controlledFold = null
}) => {
  const [lines, setLines] = useState(history);
  const [currentInput, setCurrentInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [internalFolded, setInternalFolded] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    clear: { hover: false },
    copy: { hover: false },
    fold: { hover: false },
  });
  const inputRef = useRef(null);
  const scrollHandlerRef = useRef(null);

  // Use controlled fold state if provided, otherwise use internal state
  const isFolded = controlledFold !== null ? controlledFold : internalFolded;

  const styles = useMemo(() => createStyles(theme, height, isFolded), [theme, height, isFolded]);

  useEffect(() => {
    setLines(history);
    if (scrollHandlerRef.current) {
      // Use setTimeout to ensure the DOM has been updated
      setTimeout(() => {
        scrollHandlerRef.current.scrollToBottom();
      }, 10);
    }
  }, [history]);

  // Call the onFoldChange callback when folded state changes
  useEffect(() => {
    if (typeof onFoldChange === 'function') {
      onFoldChange(isFolded);
    }
  }, [isFolded, onFoldChange]);

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && currentInput.trim() !== '') {
      const command = currentInput.trim();

      // insert command into lines
      const newLines = [...lines, { type: 'command', content: `${prompt}${command}` }];
      setLines(newLines);
      setCurrentInput('');

      if (typeof onCommand === 'function') {
        onCommand(command, (output) => {
          if (output) {
            const outputLines = Array.isArray(output) ? output : [output];
            const updatedLines = [...newLines, ...outputLines.map(line => ({
              type: 'output',
              content: line
            }))];

            setLines(updatedLines);

            setTimeout(() => {
              if (scrollHandlerRef.current) {
                scrollHandlerRef.current.scrollToBottom();
              }
            }, 10);
          }
        });
      }
    }
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleCopy = () => {
    const content = lines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(content)
      .then(() => {
        // Show temporary success state with icon
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch(err => console.error('Failed to copy terminal content', err));
  };

  const handleFoldToggle = () => {
    // Update internal state if we're not controlled
    setInternalFolded(!isFolded);

    // Also call onFoldChange to inform parent of the requested change
    if (typeof onFoldChange === 'function') {
      onFoldChange(!isFolded);
    }
  };

  const handleTerminalClick = () => {
    if (inputRef.current && !readOnly) {
      inputRef.current.focus();
    }
  };

  // Handle button states
  const handleButtonHover = (button, isHovered) => {
    setButtonStates(prev => ({
      ...prev,
      [button]: { ...prev[button], hover: isHovered }
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}><FaTerminal style={styles.icon} /> {title}</h3>
        <div style={styles.buttons}>
          {!isFolded && (
            <>
              <div style={styles.tooltipContainer}>
                <button
                  style={{
                    ...styles.button,
                    ...(buttonStates.copy.hover ? styles.buttonHover : {})
                  }}
                  onClick={handleCopy}
                  onMouseEnter={() => handleButtonHover('copy', true)}
                  onMouseLeave={() => handleButtonHover('copy', false)}
                  title={isCopied ? "Copied!" : "Copy terminal content"}
                >
                  {isCopied ? <FaCheck size={14} color={theme.includes('dark') ? "#4CAF50" : "#0c7d15"} /> : <FaCopy size={14} />}
                </button>
              </div>

              <div style={styles.tooltipContainer}>
                <button
                  style={{
                    ...styles.button,
                    ...(buttonStates.clear.hover ? styles.buttonHover : {})
                  }}
                  onClick={handleClear}
                  onMouseEnter={() => handleButtonHover('clear', true)}
                  onMouseLeave={() => handleButtonHover('clear', false)}
                  title="Clear terminal"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </>
          )}

          <div style={styles.tooltipContainer}>
            <button
              style={{
                ...styles.button,
                ...(buttonStates.fold.hover ? styles.buttonHover : {})
              }}
              onClick={handleFoldToggle}
              onMouseEnter={() => handleButtonHover('fold', true)}
              onMouseLeave={() => handleButtonHover('fold', false)}
              title={isFolded ? "Expand terminal" : "Fold terminal"}
            >
              {isFolded ? <FaAngleUp size={14} /> : <FaAngleDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {!isFolded && (
        <div style={styles.terminalContent} onClick={handleTerminalClick}>
          <ScrollBox
            alwaysShowScrollBar={true}
            onMounted={(handler) => scrollHandlerRef.current = handler}
          >
            <div style={styles.scrollBoxContent}>
              {lines.map((line, index) => (
                <div key={index} style={{
                  ...styles.line,
                  ...(line.type === 'error' ? styles.errorLine : {})
                }}>
                  {line.content}
                </div>
              ))}
              {!readOnly && (
                <div style={styles.promptLine}>
                  <span style={styles.prompt}>{prompt}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    style={styles.input}
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </ScrollBox>
        </div>
      )}
    </div>
  );
};

export default Terminal;

const createStyles = (theme = 'github-dark', height = 300, isFolded = false) => {
  const isDarkTheme = theme.includes('dark');

  // Theme-specific colors
  const colors = {
    background: isDarkTheme ? '#1e1e1e' : '#f8f8f8',
    headerBg: isDarkTheme ? '#333' : '#eaeaea',
    text: isDarkTheme ? '#f0f0f0' : '#333',
    promptColor: isDarkTheme ? '#4CAF50' : '#0c7d15',
    buttonBorder: isDarkTheme ? '#666' : '#ddd',
    buttonHoverBg: isDarkTheme ? '#444' : '#e0e0e0',
    buttonHoverBorder: isDarkTheme ? '#888' : '#bbb',
    scrollbarThumb: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    scrollbarThumbHover: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    errorText: isDarkTheme ? '#ff4d4d' : '#d32f2f',
  };

  return {
    container: {
      borderLeft: '1px solid #666',
			borderRight: '1px solid #666',
			borderBottom: '1px solid #666',
      borderRadius: '0 0 4px 4px',
      overflow: 'hidden',
      fontFamily: 'monospace',
      backgroundColor: colors.background,
      color: colors.text,
      width: '100%',
      height: isFolded ? 'auto' : `${height}px`,
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      backgroundColor: colors.headerBg,
      padding: '8px 12px',
      borderBottom: `1px solid ${isDarkTheme ? '#444' : '#aaa'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 'bold',
      color: colors.text,
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginRight: '8px',
    },
    buttons: {
      display: 'flex',
      gap: '8px',
    },
    button: {
      backgroundColor: 'transparent',
      border: `1px solid`,
			borderColor: colors.buttonBorder,
      borderRadius: '3px',
      color: colors.text,
      padding: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '28px',
      height: '28px',
    },
    buttonHover: {
      backgroundColor: colors.buttonHoverBg,
      borderColor: colors.buttonHoverBorder,
    },
    tooltipContainer: {
      position: 'relative',
      display: 'inline-block',
    },
    tooltip: {
      position: 'absolute',
      bottom: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '3px 6px',
      borderRadius: '3px',
      fontSize: '10px',
      whiteSpace: 'nowrap',
      zIndex: 10,
      pointerEvents: 'none',
    },
    terminalContent: {
      flex: 1,
      padding: '0',
      margin: '0',
      overflow: 'hidden',
    },
    scrollBoxContent: {
      padding: '10px',
    },
    line: {
      margin: '3px 0',
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
    errorLine: {
      color: colors.errorText,
    },
    promptLine: {
      display: 'flex',
    },
    prompt: {
      color: colors.promptColor,
      marginRight: '8px',
    },
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text,
      outline: 'none',
      font: 'inherit',
      flex: 1,
    },
    scrollbarStyles: {
      '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.scrollbarThumb,
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: colors.scrollbarThumbHover,
      }
    }
  };
};