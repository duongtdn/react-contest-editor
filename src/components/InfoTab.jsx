import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ScrollBox from '@duongtdn/react-scrollbox';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const InfoPanel = ({ problem = [], hint = [], theme = 'github-dark' }) => {
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const isDarkTheme = theme?.includes('dark');

  const toggleHint = () => {
    setIsHintExpanded(!isHintExpanded);
  };

  return (
    <div style={styles.container}>
      <ScrollBox style={styles.scrollBox}>
        <div style={styles.contentWrapper}>
          {/* Problem content */}
          <div style={styles.problemContent}>
            {problem.map((item, index) => {
              if (item.type === 'Markdown') {
                return (
                  <ReactMarkdown
                    key={`problem-${index}`}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        return !inline && language ? (
                          <SyntaxHighlighter
                            style={isDarkTheme ? vscDarkPlus : vs}
                            language={language}
														wrapLines={true}
														lineProps = {{ style: { whiteSpace: 'pre-wrap', fontSize: '1.2em' } }}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                );
              }
              return null;
            })}
          </div>

          {/* Hint section */}
          {hint && hint.length > 0 && (
            <div style={styles.hintSection}>
              <div style={styles.hintHeader} onClick={toggleHint} >
                {isHintExpanded ? <FaChevronDown /> : <FaChevronRight />}
                <span style={styles.hintTitle}>Hint</span>
              </div>
              {isHintExpanded && (
                <div style={styles.hintContent} >
                  {hint.map((item, index) => {
                    if (item.type === 'Markdown') {
                      return (
                        <ReactMarkdown
                          key={`hint-${index}`}
                          components={{
                            code({node, inline, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';

                              return !inline && language ? (
                                <SyntaxHighlighter
                                  style={isDarkTheme ? vscDarkPlus : vs}
                                  language={language}
																	wrapLines={true}
																	lineProps = {{ style: { whiteSpace: 'pre-wrap', fontSize: '1.2em' } }}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollBox>
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  scrollBox: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    padding: '16px',
  },
  problemContent: {
    marginBottom: '20px',
  },
  hintSection: {
    marginTop: '20px',
    overflow: 'hidden',
  },
  hintHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    borderLeft: '4px solid #ff9800',
    cursor: 'pointer',
    userSelect: 'none',
  },
  hintTitle: {
    marginLeft: '8px',
    fontWeight: 'bold',
  },
  hintContent: {
    padding: '15px',
    borderLeft: '4px solid #ff9800', // Orange vertical line on the left side
  },
};

export default InfoPanel;