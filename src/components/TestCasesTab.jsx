import React, { useState } from 'react';
import ScrollBox from '@duongtdn/react-scrollbox';
import { FaChevronDown, FaChevronRight, FaCheckCircle, FaTimesCircle, FaLock, FaCodeBranch } from 'react-icons/fa';

const TestCasesPanel = ({ testCases = [], theme = 'github-dark' }) => {
  // Track expanded state for each test case
  const [expandedTests, setExpandedTests] = useState({});
  const isDarkTheme = theme?.includes('dark');

  // Separate visible and hidden test cases
  const visibleTestCases = testCases.filter(test => !test.hidden);
  const hiddenTestCases = testCases.filter(test => test.hidden).map((test, index) => ({
		...test,
		title: `Hidden Test ${index + 1}`,
		description: 'This test case is hidden and cannot be expanded.',
	}));

  // Sort test cases: visible tests first, then hidden tests
  const sortedTestCases = [...visibleTestCases, ...hiddenTestCases];

  const toggleExpand = (index) => {
    // Don't toggle expansion for hidden test cases
    if (sortedTestCases[index]?.hidden) {
      return;
    }

    setExpandedTests(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Render empty state when no test cases available
  if (testCases.length === 0) {
    return (
      <div style={styles.container}>
        <ScrollBox style={styles.scrollBox}>
          <div style={styles.emptyState}>
            <FaCodeBranch size={32} color={isDarkTheme ? "#666" : "#999"} />
            <h3 style={styles.emptyStateTitle}>No Test Results</h3>
            <p style={styles.emptyStateText}>
              Test results will appear here after you run your code.
            </p>
          </div>
        </ScrollBox>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ScrollBox style={styles.scrollBox}>
        <div style={styles.contentWrapper}>
          <div style={styles.summary}>
            <span style={{
              ...styles.summaryText,
              color: testCases.every(test => test.isPass) ? '#4CAF50' : '#f44336'
            }}>
              {testCases.filter(test => test.isPass).length}/{testCases.length} Tests Passed
            </span>
          </div>

          <div style={styles.testList}>
            {sortedTestCases.map((testCase, index) => (
              <div key={index} style={styles.testCase}>
                <div
                  style={{
                    ...styles.testHeader,
                    backgroundColor: isDarkTheme ? '#333' : '#e8e8e8',
                    borderLeft: `4px solid ${testCase.isPass ? '#4CAF50' : '#f44336'}`
                  }}
                  onClick={() => toggleExpand(index)}
                >
                  {testCase.hidden ? (
                    <FaLock size={12} style={styles.lockIcon} />
                  ) : (
                    expandedTests[index] ? <FaChevronDown /> : <FaChevronRight />
                  )}
                  <span
										style={{
											marginLeft: '8px',
											fontWeight: 'bold',
											fontStyle: testCase.hidden ? 'italic' : 'normal',
											color: testCase.hidden ? '#888' : 'inherit',
											display: 'flex',
											alignItems: 'center'
											}}
									>
                    {testCase.title}
                  </span>
                  <span style={{ marginLeft: 'auto' }}>
                    {testCase.isPass ? (
                      <FaCheckCircle color="#4CAF50" />
                    ) : (
                      <FaTimesCircle color="#f44336" />
                    )}
                  </span>
                </div>

                {/* Only show details for non-hidden test cases */}
                {expandedTests[index] && !testCase.hidden && (
                  <div style={styles.testDetails}>
                    {testCase.description && (
                      <div style={styles.detailRow}>
                        <span style={styles.description}>{testCase.description}</span>
                      </div>
                    )}

                    {testCase.executionTime && (
                      <div style={styles.detailRow}>
                        <span>Execution Time: {parseInt(testCase.executionTime)/1000000} ms</span>
                      </div>
                    )}

                    {testCase.stdin && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Input:</span>
                        <pre style={styles.codeBlock}>{testCase.stdin}</pre>
                      </div>
                    )}

                    {testCase.expectedStdout && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Expected Output:</span>
                        <pre style={styles.codeBlock}>{testCase.expectedStdout}</pre>
                      </div>
                    )}

                    {testCase.stdout && (
                      <div style={styles.detailRow}>
                        <span style={{
                          ...styles.detailLabel,
                          color: testCase.stdout === testCase.expectedStdout ?
                            '#4CAF50' : '#f44336'
                        }}>
                          Received Output:
                        </span>
                        <pre style={{
                          ...styles.codeBlock,
                          borderColor: testCase.stdout === testCase.expectedStdout ?
                            '#4CAF50' : '#f44336'
                        }}>
                          {testCase.stdout}
                        </pre>
                      </div>
                    )}

                    {testCase.stderr && (
                      <div style={styles.detailRow}>
                        <span style={{...styles.detailLabel, color: '#f44336'}}>Error:</span>
                        <pre style={{...styles.codeBlock, borderColor: '#f44336'}}>{testCase.stderr}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
		fontFamily: 'Consolas, monospace',
  },
  scrollBox: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    padding: '16px',
  },
  summary: {
    marginBottom: '16px',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  summaryText: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  testList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  testCase: {
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  },
  testHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  testDetails: {
    padding: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  detailLabel: {
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: '8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    border: '1px solid #ccc',
    marginTop: '4px',
  },
  hiddenTestMessage: {
    padding: '16px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888'
  },
  lockIcon: {
    marginRight: '4px',
    opacity: 0.7
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 20px',
    height: '100%',
  },
  emptyStateTitle: {
    marginTop: '16px',
    marginBottom: '8px',
    fontWeight: 'normal',
  },
  emptyStateText: {
    color: '#888',
    maxWidth: '280px',
    lineHeight: '1.5',
  },
  description: {
		fontWeight: 'bold',
    fontSize: '24px',
  }
};

export default TestCasesPanel;