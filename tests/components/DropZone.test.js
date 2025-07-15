import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import userEvent from '@testing-library/user-event'
import DropZone from '@/components/DropZone'
import { createMockPngFile, createMockFile } from '../test-utils'

describe('DropZone', () => {
  const mockOnFileUpload = vi.fn()

  beforeEach(() => {
    mockOnFileUpload.mockClear()
  })

  describe('rendering', () => {
    it('should render drop zone with instructions', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      expect(screen.getByText(/drag and drop png file here/i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      expect(dropZone).toHaveAttribute('tabIndex', '0')
      expect(dropZone).toHaveAttribute('aria-label', 'Upload PNG file')
    })

    it('should have proper ARIA attributes', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      expect(dropZone).toHaveAttribute('aria-label', 'Upload PNG file')
    })
  })

  describe('file selection', () => {
    it('should accept valid PNG files via file input', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const validFile = createMockPngFile('test.png', 1024)
      
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      expect(mockOnFileUpload).toHaveBeenCalledWith(validFile)
    })

    it('should reject non-PNG files', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const invalidFile = createMockFile('test.jpg', 'content', 'image/jpeg')
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      expect(mockOnFileUpload).not.toHaveBeenCalled()
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
    })

    it('should reject files larger than 5MB', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const largeFile = createMockPngFile('large.png', 6 * 1024 * 1024) // 6MB
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
      
      expect(mockOnFileUpload).not.toHaveBeenCalled()
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument()
    })
  })

  describe('drag and drop', () => {
    it('should handle drag over events', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      
      fireEvent.dragOver(dropZone, {
        dataTransfer: {
          files: [createMockPngFile('test.png', 1024)]
        }
      })
      
      expect(dropZone).toHaveClass('active')
    })

    it('should handle drag leave events', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      
      fireEvent.dragOver(dropZone)
      expect(dropZone).toHaveClass('active')
      
      fireEvent.dragLeave(dropZone)
      expect(dropZone).not.toHaveClass('active')
    })

    it('should handle file drop with valid PNG', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const validFile = createMockPngFile('test.png', 1024)
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [validFile]
        }
      })
      
      expect(mockOnFileUpload).toHaveBeenCalledWith(validFile)
      expect(dropZone).not.toHaveClass('active')
    })

    it('should handle file drop with invalid file', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const invalidFile = createMockFile('test.jpg', 'content', 'image/jpeg')
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [invalidFile]
        }
      })
      
      expect(mockOnFileUpload).not.toHaveBeenCalled()
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
    })

    it('should handle drop with multiple files (take first)', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const file1 = createMockPngFile('test1.png', 1024)
      const file2 = createMockPngFile('test2.png', 2048)
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file1, file2]
        }
      })
      
      expect(mockOnFileUpload).toHaveBeenCalledWith(file1)
      expect(mockOnFileUpload).toHaveBeenCalledTimes(1)
    })

    it('should handle drop with no files', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: []
        }
      })
      
      expect(mockOnFileUpload).not.toHaveBeenCalled()
    })
  })

  describe('keyboard interaction', () => {
    it('should open file picker on Enter key', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const fileInput = screen.getByLabelText(/select png file/i)
      
      const mockClick = vi.fn()
      fileInput.click = mockClick
      
      await userEvent.type(dropZone, '{enter}')
      
      expect(mockClick).toHaveBeenCalled()
    })

    it('should open file picker on Space key', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const fileInput = screen.getByLabelText(/select png file/i)
      
      const mockClick = vi.fn()
      fileInput.click = mockClick
      
      await userEvent.type(dropZone, ' ')
      
      expect(mockClick).toHaveBeenCalled()
    })

    it('should not respond to other keys', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const dropZone = screen.getByRole('button')
      const fileInput = screen.getByLabelText(/select png file/i)
      
      const mockClick = vi.fn()
      fileInput.click = mockClick
      
      // Use fireEvent directly to avoid issues with userEvent.type
      fireEvent.keyDown(dropZone, { key: 'a' })
      
      expect(mockClick).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should disable interactions when disabled', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} isDisabled={true} />)
      
      const dropZone = screen.getByRole('button')
      const fileInput = screen.getByLabelText(/select png file/i)
      
      expect(dropZone).toHaveAttribute('aria-disabled', 'true')
      expect(fileInput).toBeDisabled()
    })

    it('should not accept files when disabled', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} isDisabled={true} />)
      
      const dropZone = screen.getByRole('button')
      const validFile = createMockPngFile('test.png', 1024)
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [validFile]
        }
      })
      
      expect(mockOnFileUpload).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should display error message for invalid file type', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const invalidFile = createMockFile('test.txt', 'content', 'text/plain')
      
      // Use fireEvent instead of userEvent to ensure the onChange is triggered
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
      expect(screen.getByText(/please select a png file/i)).toHaveClass('error-message')
    })

    it('should clear error on valid file selection', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const invalidFile = createMockFile('test.txt', 'content', 'text/plain')
      
      // First upload invalid file
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
      
      // Then upload valid file
      const validFile = createMockPngFile('test.png', 1024)
      fireEvent.change(fileInput, { target: { files: [validFile] } })
      
      expect(screen.queryByText(/please select a png file/i)).not.toBeInTheDocument()
    })

    it('should handle multiple validation errors', async () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      const invalidFile = createMockFile('test.txt', 'x'.repeat(6 * 1024 * 1024), 'text/plain')
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      expect(screen.getByText(/please select a png file/i)).toBeInTheDocument()
    })
  })

  describe('accept attribute', () => {
    it('should use default accept attribute', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      expect(fileInput).toHaveAttribute('accept', 'image/png')
    })

    it('should use custom accept attribute', () => {
      render(<DropZone onFileUpload={mockOnFileUpload} accept="image/*" />)
      
      const fileInput = screen.getByLabelText(/select png file/i)
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })
  })
})