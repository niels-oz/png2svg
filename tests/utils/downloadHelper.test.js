import { describe, it, expect, vi } from 'vitest'
import { 
  downloadSvgFile, 
  generateFilename, 
  createDownloadBlob,
  formatFileSize
} from '@/utils/downloadHelper'
import { mockSvgString } from '../test-utils'

describe('downloadHelper', () => {
  describe('downloadSvgFile', () => {
    it('should trigger file download with correct parameters', () => {
      const mockCreateElement = vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
        style: { display: '' }
      }))
      
      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()
      
      vi.stubGlobal('document', {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        }
      })
      
      downloadSvgFile(mockSvgString, 'test.svg')
      
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })

    it('should create blob with correct MIME type', () => {
      const mockBlob = vi.fn()
      vi.stubGlobal('Blob', mockBlob)
      
      downloadSvgFile(mockSvgString, 'test.svg')
      
      expect(mockBlob).toHaveBeenCalledWith(
        [mockSvgString],
        { type: 'image/svg+xml' }
      )
    })

    it('should handle download errors gracefully', () => {
      const mockCreateElement = vi.fn(() => {
        throw new Error('Download failed')
      })
      
      vi.stubGlobal('document', {
        createElement: mockCreateElement
      })
      
      expect(() => {
        downloadSvgFile(mockSvgString, 'test.svg')
      }).not.toThrow()
    })

    it('should clean up object URL after download', () => {
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
      
      downloadSvgFile(mockSvgString, 'test.svg')
      
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('generateFilename', () => {
    it('should convert PNG filename to SVG', () => {
      const pngFilename = 'image.png'
      
      const svgFilename = generateFilename(pngFilename)
      
      expect(svgFilename).toBe('image.svg')
    })

    it('should handle files without extension', () => {
      const filename = 'image'
      
      const svgFilename = generateFilename(filename)
      
      expect(svgFilename).toBe('image.svg')
    })

    it('should handle files with multiple dots', () => {
      const filename = 'my.image.file.png'
      
      const svgFilename = generateFilename(filename)
      
      expect(svgFilename).toBe('my.image.file.svg')
    })

    it('should sanitize invalid filename characters', () => {
      const filename = 'image<>:|?.png'
      
      const svgFilename = generateFilename(filename)
      
      expect(svgFilename).not.toContain('<')
      expect(svgFilename).not.toContain('>')
      expect(svgFilename).not.toContain(':')
      expect(svgFilename).not.toContain('|')
      expect(svgFilename).not.toContain('?')
      expect(svgFilename).toContain('.svg')
    })

    it('should handle empty filename', () => {
      const filename = ''
      
      const svgFilename = generateFilename(filename)
      
      expect(svgFilename).toBe('converted.svg')
    })

    it('should handle very long filenames', () => {
      const longFilename = 'a'.repeat(200) + '.png'
      
      const svgFilename = generateFilename(longFilename)
      
      expect(svgFilename.length).toBeLessThan(100)
      expect(svgFilename).toEndWith('.svg')
    })

    it('should preserve case sensitivity', () => {
      const filename = 'MyImage.PNG'
      
      const svgFilename = generateFilename(filename)
      
      expect(svgFilename).toBe('MyImage.svg')
    })
  })

  describe('createDownloadBlob', () => {
    it('should create blob with SVG content', () => {
      const blob = createDownloadBlob(mockSvgString)
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/svg+xml')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should handle empty SVG string', () => {
      const blob = createDownloadBlob('')
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBe(0)
    })

    it('should handle large SVG strings', () => {
      const largeSvgString = mockSvgString.repeat(1000)
      
      const blob = createDownloadBlob(largeSvgString)
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(mockSvgString.length)
    })

    it('should use correct MIME type', () => {
      const blob = createDownloadBlob(mockSvgString)
      
      expect(blob.type).toBe('image/svg+xml')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1536 * 1024)).toBe('1.5 MB')
      expect(formatFileSize(2048 * 1024)).toBe('2.0 MB')
    })

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
      expect(formatFileSize(1536 * 1024 * 1024)).toBe('1.5 GB')
    })

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should handle negative values', () => {
      expect(formatFileSize(-1024)).toBe('0 B')
    })

    it('should round to one decimal place', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1638)).toBe('1.6 KB')
      expect(formatFileSize(1740)).toBe('1.7 KB')
    })

    it('should handle very large files', () => {
      const veryLarge = 1024 * 1024 * 1024 * 1024 // 1TB
      
      expect(formatFileSize(veryLarge)).toBe('1024.0 GB')
    })
  })
})