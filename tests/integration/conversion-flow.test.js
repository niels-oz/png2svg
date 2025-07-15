import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import App from '@/app/page'
import { createMockPngFile, createMockFile, mockConversionResult } from '../test-utils'
import * as imageConverter from '@/utils/imageConverter'

vi.mock('@/utils/imageConverter')

describe('Complete Conversion Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
  })

  describe('successful conversion flow', () => {
    it('should complete full conversion from upload to download', async () => {
      render(<App />)
      
      // Initial state - should show drop zone
      expect(screen.getByText(/png to svg converter/i)).toBeInTheDocument()
      expect(screen.getByText(/drag and drop png file here/i)).toBeInTheDocument()
      
      // Upload a PNG file
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      // Should show processing state
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      
      // Wait for conversion to complete
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Should show preview with original and converted images
      expect(screen.getByText('Original PNG')).toBeInTheDocument()
      expect(screen.getByText('Converted SVG')).toBeInTheDocument()
      expect(screen.getByTestId('original-image')).toBeInTheDocument()
      expect(screen.getByTestId('converted-svg')).toBeInTheDocument()
      
      // Should show SVG code viewer
      expect(screen.getByText('SVG Code (Quality Indicator)')).toBeInTheDocument()
      expect(screen.getByTestId('svg-code-block')).toBeInTheDocument()
      
      // Should show download button
      const downloadButton = screen.getByRole('button', { name: /download svg/i })
      expect(downloadButton).toBeInTheDocument()
      expect(downloadButton).not.toBeDisabled()
      
      // Should show reset button
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
      
      // Verify conversion was called with correct parameters
      expect(imageConverter.convertPngToSvg).toHaveBeenCalledWith(mockFile)
    })

    it('should handle file download correctly', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      }
      
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockLink),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      })
      
      render(<App />)
      
      // Upload and convert file
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Click download button
      const downloadButton = screen.getByRole('button', { name: /download svg/i })
      await userEvent.click(downloadButton)
      
      // Should trigger file download
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toBe('test.svg')
    })

    it('should handle reset functionality', async () => {
      render(<App />)
      
      // Upload and convert file
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Click reset button
      const resetButton = screen.getByRole('button', { name: /reset/i })
      await userEvent.click(resetButton)
      
      // Should return to initial state
      expect(screen.getByText(/drag and drop png file here/i)).toBeInTheDocument()
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
    })

    it('should display correct statistics', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Check statistics display
      expect(screen.getByText(/size: 2\.0 kb/i)).toBeInTheDocument() // Original size
      expect(screen.getByText(/size: 256 b/i)).toBeInTheDocument() // SVG size
      expect(screen.getByText(/reduction: 88%/i)).toBeInTheDocument() // Compression
      expect(screen.getByText(/points: 15/i)).toBeInTheDocument() // Point count
      expect(screen.getByText(/time: 1500ms/i)).toBeInTheDocument() // Processing time
    })
  })

  describe('error handling scenarios', () => {
    it('should handle invalid file type', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const invalidFile = createMockFile('test.jpg', 'content', 'image/jpeg')
      
      await userEvent.upload(fileInput, invalidFile)
      
      // Should show error message
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
      
      // Should not show processing or preview
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
    })

    it('should handle file size limit exceeded', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const largeFile = createMockPngFile('large.png', 6 * 1024 * 1024) // 6MB
      
      await userEvent.upload(fileInput, largeFile)
      
      // Should show error message
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument()
      
      // Should not start conversion
      expect(imageConverter.convertPngToSvg).not.toHaveBeenCalled()
    })

    it('should handle conversion failure', async () => {
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error('Conversion failed'))
      
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      // Should show processing initially
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      
      // Should show error after conversion fails
      await waitFor(() => {
        expect(screen.getByText(/conversion failed/i)).toBeInTheDocument()
      })
      
      // Should not show preview
      expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument()
    })

    it('should handle processing timeout', async () => {
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error('PROCESSING_TIMEOUT'))
      
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByText(/processing_timeout/i)).toBeInTheDocument()
      })
      
      // Should provide option to try again
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    })

    it('should handle memory exceeded error', async () => {
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValue(new Error('MEMORY_EXCEEDED'))
      
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByText(/memory_exceeded/i)).toBeInTheDocument()
      })
    })

    it('should allow retry after error', async () => {
      vi.mocked(imageConverter.convertPngToSvg).mockRejectedValueOnce(new Error('First error'))
      vi.mocked(imageConverter.convertPngToSvg).mockResolvedValue(mockConversionResult)
      
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      // First attempt fails
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByText(/first error/i)).toBeInTheDocument()
      })
      
      // Reset and try again
      const resetButton = screen.getByRole('button', { name: /reset/i })
      await userEvent.click(resetButton)
      
      // Second attempt succeeds
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      expect(screen.queryByText(/first error/i)).not.toBeInTheDocument()
    })
  })

  describe('drag and drop functionality', () => {
    it('should handle drag and drop upload', async () => {
      render(<App />)
      
      const dropZone = screen.getByRole('button', { name: /upload png file/i })
      const mockFile = createMockPngFile('test.png', 2048)
      
      // Simulate drag and drop
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile]
        }
      })
      
      // Should start conversion
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
    })

    it('should show visual feedback during drag', () => {
      render(<App />)
      
      const dropZone = screen.getByRole('button', { name: /upload png file/i })
      
      // Simulate drag over
      fireEvent.dragOver(dropZone)
      
      expect(dropZone).toHaveClass('active')
      
      // Simulate drag leave
      fireEvent.dragLeave(dropZone)
      
      expect(dropZone).not.toHaveClass('active')
    })
  })

  describe('performance requirements', () => {
    it('should complete conversion within time limit', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      const startTime = performance.now()
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(30000) // Should complete within 30 seconds
    })

    it('should produce optimized SVG output', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('icon.png', 100 * 1024) // 100KB
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Should show compression ratio indicating optimization
      expect(screen.getByText(/reduction: \d+%/i)).toBeInTheDocument()
    })

    it('should handle memory efficiently', async () => {
      const largeMockFile = createMockPngFile('large.png', 4 * 1024 * 1024) // 4MB
      
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      
      await userEvent.upload(fileInput, largeMockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Should complete without memory errors
      expect(screen.queryByText(/memory_exceeded/i)).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should maintain focus management during conversion', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Download button should be focusable
      const downloadButton = screen.getByRole('button', { name: /download svg/i })
      expect(downloadButton).toBeInTheDocument()
      
      // Reset button should be focusable
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('should provide proper ARIA labels and roles', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // Check ARIA labels
      expect(screen.getByTestId('original-image')).toHaveAttribute('alt', 'Original')
      expect(screen.getByTestId('svg-code-block')).toHaveAttribute('aria-label', 'SVG source code')
    })

    it('should support keyboard navigation', async () => {
      render(<App />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const mockFile = createMockPngFile('test.png', 2048)
      
      await userEvent.upload(fileInput, mockFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeInTheDocument()
      })
      
      // All interactive elements should be keyboard accessible
      const downloadButton = screen.getByRole('button', { name: /download svg/i })
      const resetButton = screen.getByRole('button', { name: /reset/i })
      
      expect(downloadButton).toHaveAttribute('tabIndex', '0')
      expect(resetButton).toHaveAttribute('tabIndex', '0')
    })
  })
})