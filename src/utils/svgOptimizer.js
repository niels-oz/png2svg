// SVG optimization utility for reducing file size and point count

export function optimizeSvgPaths(svgString) {
  let optimized = svgString;
  
  // Remove XML declarations and comments
  optimized = optimized.replace(/<\?xml[^>]*>/gi, '');
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Minimize whitespace
  optimized = optimized.replace(/\s+/g, ' ');
  optimized = optimized.replace(/>\s+</g, '><');
  
  // Round coordinates to reduce file size
  optimized = roundCoordinates(optimized, 1);
  
  // Remove redundant path commands
  optimized = removeRedundantCommands(optimized);
  
  // Remove empty attributes
  optimized = removeEmptyAttributes(optimized);
  
  return optimized.trim();
}

export function removeRedundantCommands(svgString) {
  // Remove consecutive duplicate commands with coordinates
  return svgString.replace(/([MLHVCSQTAZ])\s*(\d+(?:\.\d+)?)\s*(\d+(?:\.\d+)?)\s*\1\s*\2\s*\3/gi, '$1 $2 $3');
}

export function roundCoordinates(svgString, decimalPlaces) {
  const regex = /(-?\d+\.\d+)/g;
  return svgString.replace(regex, (match) => {
    const num = parseFloat(match);
    return num.toFixed(decimalPlaces);
  });
}

export function removeEmptyAttributes(svgString) {
  // Remove empty attributes with double quotes
  let cleaned = svgString.replace(/\s+[a-zA-Z-]+=""/g, '');
  
  // Remove empty attributes with single quotes
  cleaned = cleaned.replace(/\s+[a-zA-Z-]+=''/g, '');
  
  return cleaned;
}

export function calculateCompressionRatio(originalSize, compressedSize) {
  if (originalSize === 0) return 0;
  return (originalSize - compressedSize) / originalSize;
}