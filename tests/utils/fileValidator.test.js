import { describe, it, expect } from 'vitest'
import { validatePngFile, isValidPngFile, checkFileSize } from '@/utils/fileValidator'
import { createMockFile, createMockPngFile } from '../test-utils'

describe('fileValidator', () => {
  describe('validatePngFile', () => {
    it('should validate a valid PNG file', () => {
      const validFile = createMockPngFile('test.png', 1024)
      
      const result = validatePngFile(validFile)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject non-PNG files', () => {
      const jpegFile = createMockFile('test.jpg', 'content', 'image/jpeg')
      
      const result = validatePngFile(jpegFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Please select a PNG file')
    })

    it('should reject files without .png extension', () => {
      const fileWithoutExtension = createMockFile('test.jpg', 'content', 'image/png')
      
      const result = validatePngFile(fileWithoutExtension)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid file extension')
    })

    it('should reject files larger than 5MB', () => {
      const largeFile = createMockPngFile('large.png', 6 * 1024 * 1024) // 6MB
      
      const result = validatePngFile(largeFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File size must be less than 5MB')
    })

    it('should reject files with very long names', () => {
      const longName = 'a'.repeat(101) + '.png'
      const fileWithLongName = createMockPngFile(longName, 1024)
      
      const result = validatePngFile(fileWithLongName)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Filename too long')
    })

    it('should return multiple errors for invalid files', () => {
      const invalidFile = createMockFile('test.txt', 'content', 'text/plain')
      
      const result = validatePngFile(invalidFile)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('isValidPngFile', () => {
    it('should return true for valid PNG files', () => {
      const validFile = createMockPngFile('test.png', 1024)
      
      expect(isValidPngFile(validFile)).toBe(true)
    })

    it('should return false for invalid files', () => {
      const invalidFile = createMockFile('test.jpg', 'content', 'image/jpeg')
      
      expect(isValidPngFile(invalidFile)).toBe(false)
    })
  })

  describe('checkFileSize', () => {
    it('should return true for files within size limit', () => {
      const smallFile = createMockPngFile('small.png', 1024)
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      expect(checkFileSize(smallFile, maxSize)).toBe(true)
    })

    it('should return false for files exceeding size limit', () => {
      const largeFile = createMockPngFile('large.png', 6 * 1024 * 1024) // 6MB
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      expect(checkFileSize(largeFile, maxSize)).toBe(false)
    })

    it('should handle edge case of exact size limit', () => {
      const exactSizeFile = createMockPngFile('exact.png', 5 * 1024 * 1024) // 5MB
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      expect(checkFileSize(exactSizeFile, maxSize)).toBe(true)
    })
  })
})