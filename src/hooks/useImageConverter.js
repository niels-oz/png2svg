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
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null, 
      progress: 0 
    }));
    
    try {
      // Validate file first
      const validation = validatePngFile(file);
      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          error: validation.errors[0], 
          isProcessing: false,
          progress: 0
        }));
        return;
      }
      
      setState(prev => ({ ...prev, progress: 25 }));
      
      // Convert with progress tracking
      const result = await convertPngToSvg(file);
      
      setState(prev => ({ 
        ...prev, 
        file, 
        result, 
        isProcessing: false,
        progress: 100
      }));
      
    } catch (error) {
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