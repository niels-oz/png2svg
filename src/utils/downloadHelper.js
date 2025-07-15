// Download utility for SVG files

export function downloadSvgFile(svgString, filename) {
  try {
    const blob = createDownloadBlob(svgString);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

export function generateFilename(originalName) {
  if (!originalName) {
    return 'converted.svg';
  }
  
  // Remove invalid characters
  let sanitized = originalName.replace(/[<>:"|?*]/g, '');
  
  // Truncate if too long
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 90);
  }
  
  // Replace extension with .svg
  const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, '');
  return nameWithoutExt + '.svg';
}

export function createDownloadBlob(svgString) {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

export function formatFileSize(bytes) {
  if (bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i === 0) {
    return bytes + ' ' + sizes[i];
  }
  
  if (i >= sizes.length) {
    return (bytes / Math.pow(k, sizes.length - 1)).toFixed(1) + ' ' + sizes[sizes.length - 1];
  }
  
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}