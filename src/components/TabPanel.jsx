import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * TabPanel component that displays content in tabs on the left side of the editor.
 * Takes full height to match the Editor and Terminal components.
 * Tab bar is always in dark mode for consistency.
 * Includes fold/unfold functionality to collapse into a vertical icon bar.
 * Can be controlled externally by providing activeTabIndex prop.
 */
const TabPanel = forwardRef(({
  tabs = [],
  defaultActiveTab = 0,
  activeTabIndex: externalActiveTabIndex = null,
  onTabChange = () => {},
  width = '250px',
  theme = 'github-dark',
  onFoldChange = () => {},
  height = '100%',
}, ref) => {
  const [internalActiveTabIndex, setInternalActiveTabIndex] = useState(defaultActiveTab);
  const [isFolded, setIsFolded] = useState(false);
  const isDarkTheme = theme.includes('dark');
  const headerRef = useRef(null);
  const [tabHeaderHeight, setTabHeaderHeight] = useState(40); // Default until measured

  // Use external tab index if provided, otherwise use internal state
  const activeTabIndex = externalActiveTabIndex !== null ? externalActiveTabIndex : internalActiveTabIndex;

  useEffect(() => {
    if (externalActiveTabIndex !== null) {
      setInternalActiveTabIndex(externalActiveTabIndex);
    }
  }, [externalActiveTabIndex]);

  // Measure actual header height after render
  useEffect(() => {
    if (headerRef.current && !isFolded) {
      const height = headerRef.current.getBoundingClientRect().height;
      setTabHeaderHeight(height);
    }
  }, [isFolded]);

  // Calculate tab content height by subtracting tab header height
  const tabContentHeight = height ? `${height - tabHeaderHeight}px` : '100%';

  // Theme-specific colors
  const colors = {
    background: isDarkTheme ? '#1e1e1e' : '#f8f8f8',
    // Tab bar is always dark regardless of theme
    headerBg: '#333',
    text: isDarkTheme ? '#f0f0f0' : '#333',
    buttonBorder: isDarkTheme ? '#666' : '#ddd',
    // Active tab is always dark
    activeTabBg: '#444',
    activeBorder: '#007acc'
  };

  const toggleFold = () => {
    const newFoldedState = !isFolded;
    setIsFolded(newFoldedState);
    onFoldChange(newFoldedState);
  };

  const handleTabClick = (index) => {
    setInternalActiveTabIndex(index);
    onTabChange(index);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #666',
      borderRadius: '4px',
      overflow: 'hidden',
      width: isFolded ? '48px' : width,
      backgroundColor: isFolded ? colors.headerBg : colors.background,
      marginRight: '8px',
      transition: 'width 0.3s ease',
      height: height ? `${height}px` : '100%',
    }}>
      {!isFolded && (
        <div ref={headerRef} style={{
          display: 'flex',
          backgroundColor: colors.headerBg,
          padding: '0',
          margin: '0',
          listStyle: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: `${tabHeaderHeight}px`,
        }}>
          <div style={{
            display: 'flex',
            flex: 1,
            overflow: 'visible'
          }}>
            {tabs.map((tab, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  cursor: 'pointer',
                  color: activeTabIndex === index ? '#fff' : '#ccc',
                  backgroundColor: activeTabIndex === index ? colors.activeTabBg : 'transparent',
                  borderBottom: activeTabIndex === index ? `4px solid ${colors.activeBorder}` : '4px solid transparent',
                  fontFamily: 'consolas, monospace',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleTabClick(index)}
                title={tab.title || tab.label}
              >
                {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
                {tab.label}
              </div>
            ))}
          </div>

          {/* Fold button */}
          <div
            style={{
              padding: '8px',
              cursor: 'pointer',
              color: '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={toggleFold}
            title="Collapse panel"
          >
            <FiChevronLeft />
          </div>
        </div>
      )}

      {isFolded ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.headerBg,
          height: height ? `${height - tabHeaderHeight}px` : '100%',
          alignItems: 'center',
        }}>
          {/* Unfold button at the top */}
          <div
            style={{
              padding: '12px',
              cursor: 'pointer',
              color: '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #555',
              width: '100%',
            }}
            onClick={toggleFold}
            title="Expand panel"
          >
            <FiChevronRight />
          </div>

          {/* Vertical tabs with icons only */}
          {tabs.map((tab, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                cursor: 'pointer',
                color: activeTabIndex === index ? '#fff' : '#ccc',
                backgroundColor: activeTabIndex === index ? colors.activeTabBg : 'transparent',
                borderLeft: activeTabIndex === index ? `4px solid ${colors.activeBorder}` : '4px solid transparent',
                fontFamily: 'consolas, monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
              onClick={() => { toggleFold(); handleTabClick(index); }}
              title={tab.title || tab.label}
            >
              {tab.icon ? tab.icon : tab.label.charAt(0)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          height: tabContentHeight,
          overflow: 'hidden',
        }}
>
          {tabs.map((tab, index) => (
            <div
              key={index}
              style={{
                display: index === activeTabIndex ? 'block' : 'none',
                height: '100%',
                color: colors.text,
                overflow: 'auto',
              }}
            >
              {tab.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TabPanel;