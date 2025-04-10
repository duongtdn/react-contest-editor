import React, { useState } from 'react';

/**
 * TabPanel component that displays content in tabs on the left side of the editor.
 * Takes full height to match the Editor and Terminal components.
 * Tab bar is always in dark mode for consistency.
 */
const TabPanel = ({
  tabs = [],
  defaultActiveTab = 0,
  width = '250px',
  theme = 'github-dark'
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(defaultActiveTab);
  const isDarkTheme = theme.includes('dark');

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #666',
      borderRadius: '4px',
      overflow: 'hidden',
      width: width,
      backgroundColor: colors.background,
      marginRight: '8px',
      alignSelf: 'stretch',
    }}>
      {/* Tabs navigation - always dark */}
      <div style={{
        display: 'flex',
        backgroundColor: colors.headerBg,
        padding: '0',
        margin: '0',
        listStyle: 'none',
      }}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: activeTabIndex === index ? '#fff' : '#ccc',
              backgroundColor: activeTabIndex === index ? colors.activeTabBg : 'transparent',
              borderBottom: activeTabIndex === index ? `2px solid ${colors.activeBorder}` : '2px solid transparent',
              fontFamily: 'consolas, monospace',
            }}
            onClick={() => setActiveTabIndex(index)}
            title={tab.title}
          >
            {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab content - adapts to theme */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            style={{
              display: index === activeTabIndex ? 'block' : 'none',
              padding: '10px',
              height: '100%',
              color: colors.text
            }}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabPanel;