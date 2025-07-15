import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useImageConverter from '@/hooks/useImageConverter'
import { createMockPngFile, mockConversionResult } from '../test-utils'
import * as imageConverter from '@/utils/imageConverter'

vi.mock('@/utils/imageConverter')

describe('useImageConverter', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useImageConverter())
    
    expect(result.current.file).toBe(null)
    expect(result.current.result).toBe(null)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.progress).toBe(0)
  })

  it('should provide convertFile and reset functions', () => {
    const { result } = renderHook(() => useImageConverter())
    
    expect(typeof result.current.convertFile).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  describe('convertFile', () => {
    it('should set processing state during conversion', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      act(() => {
        result.current.convertFile(mockFile)
      })
      
      expect(result.current.isProcessing).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.progress).toBe(0)
    })

    it('should update state with successful conversion result', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.file).toBe(mockFile)
      expect(result.current.result).toBe(mockConversionResult)
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.progress).toBe(100)
    })

    it('should handle conversion errors', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      const errorMessage = 'Conversion failed'
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error(errorMessage))
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.file).toBe(null)
      expect(result.current.result).toBe(null)
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(result.current.progress).toBe(0)
    })

    it('should validate file before conversion', async () => {
      const invalidFile = createMockPngFile('test.jpg', 1024)
      Object.defineProperty(invalidFile, 'type', { value: 'image/jpeg' })
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(invalidFile)
      })
      
      expect(result.current.error).toContain('Please select a PNG file')
      expect(result.current.isProcessing).toBe(false)
      expect(imageConverter.convertPngToSvg).not.toHaveBeenCalled()
    })

    it('should handle file size validation', async () => {
      const largeFile = createMockPngFile('large.png', 6 * 1024 * 1024) // 6MB
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(largeFile)
      })
      
      expect(result.current.error).toContain('File size must be less than 5MB')
      expect(result.current.isProcessing).toBe(false)
      expect(imageConverter.convertPngToSvg).not.toHaveBeenCalled()
    })

    it('should track progress during conversion', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockImplementation(async () => {
        // Simulate progress updates
        return mockConversionResult
      })
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.progress).toBe(100)
    })

    it('should handle multiple consecutive conversions', async () => {
      const mockFile1 = createMockPngFile('test1.png', 1024)
      const mockFile2 = createMockPngFile('test2.png', 2048)
      
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile1)
      })
      
      expect(result.current.file).toBe(mockFile1)
      
      await act(async () => {
        await result.current.convertFile(mockFile2)
      })
      
      expect(result.current.file).toBe(mockFile2)
    })

    it('should cancel previous conversion when new one starts', async () => {
      const mockFile1 = createMockPngFile('test1.png', 1024)
      const mockFile2 = createMockPngFile('test2.png', 2048)
      
      let resolveFirst
      const firstPromise = new Promise(resolve => {
        resolveFirst = resolve
      })
      
      vi.mocked(imageConverter.convertPngToSvg).mockImplementationOnce(() => firstPromise)
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      act(() => {
        result.current.convertFile(mockFile1)
      })
      
      act(() => {
        result.current.convertFile(mockFile2)
      })
      
      // Resolve first conversion after second has started
      resolveFirst(mockConversionResult)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(result.current.file).toBe(mockFile2)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      // First convert a file
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      // Then reset
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.file).toBe(null)
      expect(result.current.result).toBe(null)
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.progress).toBe(0)
    })

    it('should clean up object URLs when resetting', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      act(() => {
        result.current.reset()
      })
      
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should cancel ongoing conversion when reset', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      
      let resolveConversion
      const conversionPromise = new Promise(resolve => {
        resolveConversion = resolve
      })
      
      vi.mocked(imageConverter.convertPngToSvg).mockImplementation(() => conversionPromise)
      
      const { result } = renderHook(() => useImageConverter())
      
      act(() => {
        result.current.convertFile(mockFile)
      })
      
      expect(result.current.isProcessing).toBe(true)
      
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.file).toBe(null)
      
      // Even if conversion completes, state should remain reset
      resolveConversion(mockConversionResult)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(result.current.result).toBe(null)
    })
  })

  describe('error handling', () => {
    it('should clear error on successful conversion', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValueOnce(new Error('First error'))
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      const { result } = renderHook(() => useImageConverter())
      
      // First conversion fails
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.error).toBe('First error')
      
      // Second conversion succeeds
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.error).toBe(null)
    })

    it('should handle timeout errors', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error('PROCESSING_TIMEOUT'))
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.error).toBe('PROCESSING_TIMEOUT')
    })

    it('should handle memory errors', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error('MEMORY_EXCEEDED'))
      
      const { result } = renderHook(() => useImageConverter())
      
      await act(async () => {
        await result.current.convertFile(mockFile)
      })
      
      expect(result.current.error).toBe('MEMORY_EXCEEDED')
    })
  })
})