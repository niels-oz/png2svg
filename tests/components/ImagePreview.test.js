import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import ImagePreview from '@/components/ImagePreview'
import { createMockPngFile, mockConversionResult } from '../test-utils'

describe('ImagePreview', () => {
  const mockOnReset = vi.fn()
  const mockFile = createMockPngFile('test.png', 2048)

  beforeEach(() => {
    mockOnReset.mockClear()
  })

  describe('rendering', () => {
    it('should render side-by-side preview panels', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText('Original PNG')).toBeInTheDocument()
      expect(screen.getByText('Converted SVG')).toBeInTheDocument()
      expect(screen.getByTestId('original-image')).toBeInTheDocument()
      expect(screen.getByTestId('converted-svg')).toBeInTheDocument()
    })

    it('should display original image with object URL', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const originalImage = screen.getByTestId('original-image')
      expect(originalImage).toHaveAttribute('src', 'mock-object-url')
      expect(originalImage).toHaveAttribute('alt', 'Original')
    })

    it('should display converted SVG', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const svgContainer = screen.getByTestId('converted-svg')
      expect(svgContainer.innerHTML).toContain('<svg')
      expect(svgContainer.innerHTML).toContain('<path')
    })

    it('should render reset button', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
    })
  })

  describe('statistics display', () => {
    it('should display file size information', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/size: 2\.0 kb/i)).toBeInTheDocument() // Original
      expect(screen.getByText(/size: 256 b/i)).toBeInTheDocument() // SVG
    })

    it('should display compression ratio', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/reduction: 88%/i)).toBeInTheDocument()
    })

    it('should display SVG point count', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/points: 15/i)).toBeInTheDocument()
    })

    it('should display processing time', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/time: 1500ms/i)).toBeInTheDocument()
    })

    it('should calculate compression ratio correctly', () => {
      const customResult = {
        ...mockConversionResult,
        svgSize: 1024 // 50% of original 2048
      }
      
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={customResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/reduction: 50%/i)).toBeInTheDocument()
    })

    it('should handle cases where SVG is larger than original', () => {
      const customResult = {
        ...mockConversionResult,
        svgSize: 4096 // Larger than original 2048
      }
      
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={customResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/increase:/i)).toBeInTheDocument()
    })
  })

  describe('responsive layout', () => {
    it('should have responsive CSS classes', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const container = screen.getByTestId('preview-container')
      expect(container).toHaveClass('preview-container')
      
      const panels = screen.getAllByTestId(/preview-panel/)
      panels.forEach(panel => {
        expect(panel).toHaveClass('preview-panel')
      })
    })

    it('should handle different image aspect ratios', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const originalImage = screen.getByTestId('original-image')
      expect(originalImage).toHaveClass('preview-image')
    })
  })

  describe('interactions', () => {
    it('should call onReset when reset button is clicked', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const resetButton = screen.getByRole('button', { name: /reset/i })
      fireEvent.click(resetButton)
      
      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })

    it('should be keyboard accessible', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
      
      fireEvent.keyDown(resetButton, { key: 'Enter' })
      expect(mockOnReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('memory management', () => {
    it('should create object URL for original image', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile)
    })

    it('should clean up object URL on unmount', () => {
      const { unmount } = render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      unmount()
      
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url')
    })

    it('should handle file prop changes', () => {
      const { rerender } = render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const newFile = createMockPngFile('new.png', 1024)
      
      rerender(
        <ImagePreview 
          originalFile={newFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url')
      expect(URL.createObjectURL).toHaveBeenCalledWith(newFile)
    })
  })

  describe('error handling', () => {
    it('should handle missing svgResult gracefully', () => {
      expect(() => {
        render(
          <ImagePreview 
            originalFile={mockFile}
            svgResult={null}
            onReset={mockOnReset}
          />
        )
      }).not.toThrow()
    })

    it('should handle corrupted SVG strings', () => {
      const corruptedResult = {
        ...mockConversionResult,
        svgString: 'invalid svg'
      }
      
      expect(() => {
        render(
          <ImagePreview 
            originalFile={mockFile}
            svgResult={corruptedResult}
            onReset={mockOnReset}
          />
        )
      }).not.toThrow()
    })

    it('should handle very large numbers in statistics', () => {
      const largeResult = {
        ...mockConversionResult,
        originalSize: 999999999,
        svgSize: 1,
        processingTime: 999999
      }
      
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={largeResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/reduction: 100%/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const originalImage = screen.getByTestId('original-image')
      expect(originalImage).toHaveAttribute('alt', 'Original')
      
      const resetButton = screen.getByRole('button', { name: /reset/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('should have semantic HTML structure', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings).toHaveLength(2)
      expect(headings[0]).toHaveTextContent('Original PNG')
      expect(headings[1]).toHaveTextContent('Converted SVG')
    })

    it('should provide meaningful text for screen readers', () => {
      render(
        <ImagePreview 
          originalFile={mockFile}
          svgResult={mockConversionResult}
          onReset={mockOnReset}
        />
      )
      
      expect(screen.getByText(/size: 2\.0 kb/i)).toBeInTheDocument()
      expect(screen.getByText(/reduction: 88%/i)).toBeInTheDocument()
      expect(screen.getByText(/points: 15/i)).toBeInTheDocument()
    })
  })
})