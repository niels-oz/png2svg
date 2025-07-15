// ImagePreview component for side-by-side display of original and converted images

import { useMemo, useEffect, useState } from 'react';
import { formatFileSize } from '../utils/downloadHelper';

export default function ImagePreview({ originalFile, svgResult, onReset }) {
  const [originalUrl, setOriginalUrl] = useState(null);

  // Create and cleanup object URL for original image
  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [originalFile]);

  const stats = useMemo(() => {
    if (!svgResult) return null;
    
    const originalSize = originalFile.size;
    const svgSize = svgResult.svgSize;
    const compressionRatio = Math.round((1 - svgSize / originalSize) * 100);
    
    return {
      originalSize: formatFileSize(originalSize),
      svgSize: formatFileSize(svgSize),
      compressionRatio: compressionRatio >= 0 ? `${compressionRatio}%` : `${Math.abs(compressionRatio)}% increase`,
      pointCount: svgResult.pointCount,
      processingTime: `${svgResult.processingTime}ms`
    };
  }, [originalFile, svgResult]);

  if (!svgResult) return null;

  return (
    <div data-testid="preview-container" className="preview-container">
      <div data-testid="preview-panel" className="preview-panel">
        <h3>Original PNG</h3>
        {originalUrl && (
          <img 
            data-testid="original-image"
            src={originalUrl} 
            alt="Original" 
            className="preview-image"
          />
        )}
        {stats && (
          <div className="stats">
            <p>Size: {stats.originalSize}</p>
          </div>
        )}
      </div>
      
      <div data-testid="preview-panel" className="preview-panel">
        <h3>Converted SVG</h3>
        <div 
          data-testid="converted-svg"
          className="svg-preview"
          dangerouslySetInnerHTML={{ __html: svgResult.svgString }} 
        />
        {stats && (
          <div className="stats">
            <p>Size: {stats.svgSize}</p>
            <p>Reduction: {stats.compressionRatio}</p>
            <p>Points: {stats.pointCount}</p>
            <p>Time: {stats.processingTime}</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onReset}
        aria-label="Reset converter"
        tabIndex="0"
      >
        Reset
      </button>
    </div>
  );
}