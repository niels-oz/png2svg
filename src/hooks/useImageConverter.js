// Custom hook for image conversion state management

import { useState, useCallback } from 'react';
import { convertPngToSvg } from '../utils/imageConverter';
import { validatePngFile } from '../utils/fileValidator';

export default function useImageConverter() {
  const [state, setState] = useState({
    file: null,
    result: null,
    isProcessing: false,
    error: null,
    progress: 0
  });

  const convertFile = useCallback(async (file) => {
    console.log('convertFile called with:', file?.name, file?.type, file?.size);
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null, 
      progress: 0 
    }));
    
    try {
      // Validate file first
      console.log('Validating file...');
      const validation = validatePngFile(file);
      if (!validation.isValid) {
        console.log('File validation failed:', validation.errors);
        setState(prev => ({ 
          ...prev, 
          error: validation.errors[0], 
          isProcessing: false,
          progress: 0
        }));
        return;
      }
      
      console.log('File validation passed');
      setState(prev => ({ ...prev, progress: 25 }));
      
      // Convert with progress tracking
      console.log('Starting conversion...');
      const result = await convertPngToSvg(file);
      console.log('Conversion completed with result:', result);
      
      setState(prev => ({ 
        ...prev, 
        file, 
        result, 
        isProcessing: false,
        progress: 100
      }));
      
    } catch (error) {
      console.error('Conversion error in hook:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isProcessing: false,
        progress: 0,
        file: null,
        result: null
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (state.file) {
      // Clean up any object URLs
      URL.revokeObjectURL(state.file.src);
    }
    setState({
      file: null,
      result: null,
      isProcessing: false,
      error: null,
      progress: 0
    });
  }, [state.file]);

  return { 
    ...state, 
    convertFile, 
    reset 
  };
}