// SvgCodeViewer component for displaying SVG source code

import { useState, useMemo } from 'react';
import { formatSvgString } from '../utils/svgFormatter';
import { useClipboard } from '../hooks/useClipboard';

export default function SvgCodeViewer({ svgString }) {
  const [isFormatted, setIsFormatted] = useState(true);
  const { copyToClipboard, isSupported, isSuccess, isError } = useClipboard();
  
  const displayData = useMemo(() => {
    if (!svgString) {
      return {
        displayString: '',
        codeLength: 0
      };
    }
    
    const codeLength = svgString.length;
    let displayString;
    
    if (isFormatted) {
      try {
        displayString = formatSvgString(svgString);
      } catch (error) {
        console.warn('SVG formatting failed:', error);
        displayString = svgString;
      }
    } else {
      displayString = svgString;
    }
    
    return {
      displayString,
      codeLength
    };
  }, [svgString, isFormatted]);

  const handleFormatToggle = () => {
    setIsFormatted(!isFormatted);
  };

  const handleCopy = async () => {
    await copyToClipboard(displayData.displayString);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (event.target.textContent.includes('View')) {
        handleFormatToggle();
      } else if (event.target.textContent.includes('Copy')) {
        handleCopy();
      }
    }
  };

  if (!svgString) {
    return (
      <div data-testid="code-viewer" className="code-viewer">
        <h3>SVG Code (Quality Indicator)</h3>
        <p>No SVG code to display</p>
      </div>
    );
  }

  return (
    <div data-testid="code-viewer" className="code-viewer">
      <h3>SVG Code (Quality Indicator)</h3>
      
      <div className="code-viewer-controls">
        <button
          onClick={handleFormatToggle}
          onKeyDown={handleKeyDown}
          tabIndex="0"
          aria-label={isFormatted ? 'Switch to raw view' : 'Switch to formatted view'}
        >
          {isFormatted ? 'Raw View' : 'Formatted View'}
        </button>
        
        {isSupported && (
          <button
            onClick={handleCopy}
            onKeyDown={handleKeyDown}
            tabIndex="0"
            aria-label="Copy SVG code to clipboard"
            className={`copy-button ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}
          >
            {isSuccess ? '✓ Copied!' : isError ? '✗ Copy Failed' : 'Copy SVG'}
          </button>
        )}
      </div>
      
      <textarea
        data-testid="svg-code-block"
        className="code-block"
        value={displayData.displayString}
        readOnly
        aria-label="SVG source code"
        aria-multiline="true"
        style={{
          height: 'auto',
          minHeight: '200px',
          resize: 'vertical'
        }}
      />
      
      <div className="code-info">
        <p>{displayData.codeLength} characters</p>
      </div>
    </div>
  );
}