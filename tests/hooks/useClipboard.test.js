import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../../src/hooks/useClipboard';
import { vi } from 'vitest';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
});

describe('useClipboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
    mockClipboard.readText.mockResolvedValue('test text');
  });

  describe('initialization', () => {
    it('should initialize with READY state', () => {
      const { result } = renderHook(() => useClipboard());
      
      expect(result.current.state).toBe('READY');
      expect(result.current.isReady).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should detect clipboard support', () => {
      const { result } = renderHook(() => useClipboard());
      
      expect(result.current.isSupported).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text successfully', async () => {
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        const success = await result.current.copyToClipboard('test text');
        expect(success).toBe(true);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(result.current.state).toBe('SUCCESS');
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should handle clipboard API errors', async () => {
      const error = new Error('Clipboard access denied');
      mockClipboard.writeText.mockRejectedValue(error);
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        const success = await result.current.copyToClipboard('test text');
        expect(success).toBe(false);
      });

      expect(result.current.state).toBe('ERROR');
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });

    it('should reset state after delay', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useClipboard(1000));
      
      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(result.current.state).toBe('SUCCESS');
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state).toBe('READY');
      vi.useRealTimers();
    });

    it('should handle unsupported clipboard API', async () => {
      // Mock unsupported environment
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());
      
      // Wait for useEffect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        const success = await result.current.copyToClipboard('test text');
        expect(success).toBe(false);
      });

      expect(result.current.state).toBe('ERROR');
      expect(result.current.error.message).toContain('Clipboard API not supported');
      
      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });
    });
  });

  describe('readFromClipboard', () => {
    beforeEach(() => {
      // Ensure clipboard is restored before each test
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });
    });

    it('should read text from clipboard', async () => {
      const { result } = renderHook(() => useClipboard());
      
      let text;
      await act(async () => {
        text = await result.current.readFromClipboard();
      });

      expect(text).toBe('test text');
      expect(mockClipboard.readText).toHaveBeenCalled();
    });

    it('should handle read errors', async () => {
      const error = new Error('Read access denied');
      mockClipboard.readText.mockRejectedValue(error);
      
      const { result } = renderHook(() => useClipboard());
      
      await act(async () => {
        await expect(result.current.readFromClipboard()).rejects.toThrow('Read access denied');
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('security context', () => {
    it('should handle insecure context', () => {
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
      });
      
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:', hostname: 'example.com' },
        writable: true,
      });

      const { result } = renderHook(() => useClipboard());
      
      expect(result.current.isSupported).toBe(false);
      
      // Restore secure context
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });
    });
  });
});