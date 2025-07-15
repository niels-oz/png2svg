// DownloadButton component for SVG file download

import { useState } from 'react';
import { downloadSvgFile, generateFilename } from '../utils/downloadHelper';

export default function DownloadButton({ 
  svgString, 
  filename = 'converted.svg', 
  onDownload,
  showSize = false
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const isDisabled = !svgString || svgString.trim() === '';
  const displayFilename = filename || 'converted.svg';

  const handleDownload = async () => {
    if (isDisabled || !svgString) {
      onDownload?.(false);
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const finalFilename = generateFilename(displayFilename);
      await downloadSvgFile(svgString, finalFilename);
      onDownload?.(true);
    } catch (error) {
      console.error('Download failed:', error);
      onDownload?.(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDownload();
    }
  };

  const buttonText = isDownloading 
    ? 'Downloading...' 
    : `Download ${displayFilename}`;

  return (
    <button
      className="download-button"
      onClick={handleDownload}
      onKeyDown={handleKeyDown}
      disabled={isDisabled || isDownloading}
      tabIndex="0"
      aria-label="Download SVG file"
      aria-disabled={isDisabled}
    >
      {buttonText}
      {showSize && svgString && (
        <span> ({svgString.length} bytes)</span>
      )}
    </button>
  );
}