// DropZone component for drag-and-drop file upload

import { useState, useRef } from 'react';
import { validatePngFile } from '../utils/fileValidator';

export default function DropZone({ onFileUpload, isDisabled = false, accept = 'image/png' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isDisabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (isDisabled) return;
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setError(null);
    
    const validation = validatePngFile(file);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }
    
    onFileUpload(file);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <div 
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        role="button"
        tabIndex="0"
        aria-label="Upload PNG file"
        aria-disabled={isDisabled}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isDisabled}
          style={{ display: 'none' }}
          aria-label="Select PNG file"
        />
        <p>Drag and drop PNG file here or click to select</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}