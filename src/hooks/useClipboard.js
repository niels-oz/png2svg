import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for clipboard operations with proper error handling and state management
 * @param {number} delay - Time in milliseconds to reset state after operation (default: 1500)
 * @returns {Object} Clipboard hook state and functions
 */
export function useClipboard(delay = 1500) {
  const [state, setState] = useState('READY');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      'clipboard' in navigator && 
      (window.isSecureContext || 
       location.protocol === 'https:' || 
       location.hostname === 'localhost' ||
       location.hostname === '127.0.0.1')
    );
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    if (!navigator.clipboard || !isSupported) {
      const error = new Error('Clipboard API not supported in this environment');
      setError(error);
      setState('ERROR');
      setTimeout(() => {
        setState('READY');
        setError(null);
      }, delay);
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setState('SUCCESS');
      setError(null);
      
      setTimeout(() => setState('READY'), delay);
      return true;
    } catch (err) {
      setError(err);
      setState('ERROR');
      
      setTimeout(() => {
        setState('READY');
        setError(null);
      }, delay);
      
      return false;
    }
  }, [isSupported, delay]);

  const readFromClipboard = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Clipboard API not supported');
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [isSupported]);

  return {
    copyToClipboard,
    readFromClipboard,
    state,
    error,
    isSupported,
    isReady: state === 'READY',
    isSuccess: state === 'SUCCESS',
    isError: state === 'ERROR'
  };
}