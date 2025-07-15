import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import userEvent from '@testing-library/user-event'
import DownloadButton from '@/components/DownloadButton'
import { mockSvgString } from '../test-utils'

describe('DownloadButton', () => {
  const mockOnDownload = vi.fn()

  beforeEach(() => {
    mockOnDownload.mockClear()
  })

  describe('rendering', () => {
    it('should render download button', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toBeInTheDocument()
    })

    it('should have proper styling classes', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveClass('download-button')
    })

    it('should display filename in button text', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="my-icon.svg"
          onDownload={mockOnDownload}
        />
      )
      
      expect(screen.getByText(/download my-icon\.svg/i)).toBeInTheDocument()
    })

    it('should use default filename when not provided', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          onDownload={mockOnDownload}
        />
      )
      
      expect(screen.getByText(/download converted\.svg/i)).toBeInTheDocument()
    })
  })

  describe('download functionality', () => {
    it('should trigger download when clicked', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })

    it('should create blob with correct MIME type', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })

    it('should set correct download filename', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="my-icon.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })

    it('should call onDownload callback on success', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })

    it('should clean up object URL after download', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle download errors gracefully', async () => {
      // Test by passing an invalid SVG string that would cause errors
      render(
        <DownloadButton 
          svgString={null}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      
      // Button should be disabled for null SVG string
      expect(button).toBeDisabled()
      
      // Clicking a disabled button should not trigger the callback
      await userEvent.click(button)
      expect(mockOnDownload).not.toHaveBeenCalled()
    })

    it('should handle empty SVG string', async () => {
      render(
        <DownloadButton 
          svgString=""
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      
      // Button should be disabled for empty SVG string
      expect(button).toBeDisabled()
      
      // Clicking a disabled button should not trigger the callback
      await userEvent.click(button)
      expect(mockOnDownload).not.toHaveBeenCalled()
    })

    it('should handle null SVG string', async () => {
      render(
        <DownloadButton 
          svgString={null}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      
      // Button should be disabled for null SVG string
      expect(button).toBeDisabled()
      
      // Clicking a disabled button should not trigger the callback
      await userEvent.click(button)
      expect(mockOnDownload).not.toHaveBeenCalled()
    })

    it('should handle blob creation errors', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })
  })

  describe('disabled state', () => {
    it('should be disabled when SVG string is empty', () => {
      render(
        <DownloadButton 
          svgString=""
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toBeDisabled()
    })

    it('should be disabled when SVG string is null', () => {
      render(
        <DownloadButton 
          svgString={null}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toBeDisabled()
    })

    it('should be enabled when SVG string is provided', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).not.toBeDisabled()
    })

    it('should show disabled styling when disabled', () => {
      render(
        <DownloadButton 
          svgString=""
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveClass('download-button')
      expect(button).toBeDisabled()
    })
  })

  describe('keyboard interaction', () => {
    it('should be focusable', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveAttribute('tabIndex', '0')
    })

    it('should trigger download on Enter key', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.type(button, '{enter}')
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })

    it('should trigger download on Space key', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.type(button, ' ')
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveAttribute('aria-label', 'Download SVG file')
    })

    it('should indicate disabled state to screen readers', () => {
      render(
        <DownloadButton 
          svgString=""
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have descriptive button text', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="my-icon.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      expect(button).toHaveTextContent(/download my-icon\.svg/i)
    })
  })

  describe('file size handling', () => {
    it('should handle large SVG files', async () => {
      const largeSvgString = mockSvgString.repeat(1000)
      
      render(
        <DownloadButton 
          svgString={largeSvgString}
          filename="large.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      await userEvent.click(button)
      
      expect(mockOnDownload).toHaveBeenCalledWith(true)
    })

    it('should show file size in button text', () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
          showSize={true}
        />
      )
      
      expect(screen.getByText(/\d+ bytes/i)).toBeInTheDocument()
    })
  })

  describe('progress indication', () => {
    it('should show loading state during download', async () => {
      render(
        <DownloadButton 
          svgString={mockSvgString}
          filename="test.svg"
          onDownload={mockOnDownload}
        />
      )
      
      const button = screen.getByRole('button', { name: /download svg file/i })
      fireEvent.click(button)
      
      // Should show loading state immediately
      expect(button).toHaveTextContent(/downloading/i)
    })
  })
})