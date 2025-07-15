// File validation utility for PNG files

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILENAME_LENGTH = 100;

export function validatePngFile(file) {
  const errors = [];
  
  // Type validation
  if (file.type !== 'image/png') {
    errors.push('Please select a PNG file');
  }
  
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    errors.push('File size must be less than 5MB');
  }
  
  // Extension validation
  if (!file.name.toLowerCase().endsWith('.png')) {
    errors.push('Invalid file extension');
  }
  
  // Name validation
  if (file.name.length > MAX_FILENAME_LENGTH) {
    errors.push('Filename too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isValidPngFile(file) {
  const result = validatePngFile(file);
  return result.isValid;
}

export function checkFileSize(file, maxSize) {
  return file.size <= maxSize;
}