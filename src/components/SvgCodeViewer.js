// SvgCodeViewer component for displaying SVG source code

import { useState, useMemo } from 'react';

export default function SvgCodeViewer({ 
  svgString, 
  isExpanded = false, 
  maxPreviewLength = 200 
}) {
  const [expanded, setExpanded] = useState(isExpanded);
  
  const displayData = useMemo(() => {
    if (!svgString) {
      return {
        displayString: '',
        needsTruncation: false,
        codeLength: 0
      };
    }
    
    const codeLength = svgString.length;
    const needsTruncation = codeLength > maxPreviewLength;
    const displayString = expanded || !needsTruncation 
      ? svgString 
      : svgString.substring(0, maxPreviewLength) + '...';
    
    return {
      displayString,
      needsTruncation,
      codeLength
    };
  }, [svgString, expanded, maxPreviewLength]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div data-testid="code-viewer" className="code-viewer">
      <h3>SVG Code (Quality Indicator)</h3>
      
      <pre 
        data-testid="svg-code-block"
        className="code-block"
        role="code"
        aria-label="SVG source code"
      >
        {displayData.displayString}
      </pre>
      
      <div className="code-info">
        <p>{displayData.codeLength} characters</p>
      </div>
      
      {displayData.needsTruncation && (
        <button
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex="0"
          aria-label={expanded ? 'Show less code' : 'Show more code'}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}