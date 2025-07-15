import { describe, it, expect, vi } from 'vitest'
import { convertPngToSvg, optimizeSvgString, countSvgPoints } from '@/utils/imageConverter'
import { createMockPngFile, measurePerformance, mockSvgString } from '../test-utils'
import ImageTracer from 'imagetracerjs'

describe('imageConverter', () => {
  describe('convertPngToSvg', () => {
    it('should convert PNG to SVG using ImageTracerJS', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      
      const result = await convertPngToSvg(mockFile)
      
      expect(result).toHaveProperty('svgString')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('svgSize')
      expect(result).toHaveProperty('pointCount')
      expect(result).toHaveProperty('processingTime')
      expect(result.svgString).toContain('<svg')
      expect(result.originalSize).toBe(1024)
    })

    it('should complete conversion within time limit', async () => {
      const mockFile = createMockPngFile('test.png', 2 * 1024 * 1024) // 2MB
      
      const { duration, result } = await measurePerformance(async () => {
        return await convertPngToSvg(mockFile)
      })
      
      expect(duration).toBeLessThan(30000) // 30 seconds
      expect(result).toBeDefined()
    })

    it('should produce optimized SVG with minimal points', async () => {
      const mockFile = createMockPngFile('icon.png', 100 * 1024) // 100KB
      
      const result = await convertPngToSvg(mockFile)
      
      expect(result.svgSize).toBeLessThan(10 * 1024) // < 10KB
      expect(result.pointCount).toBeLessThan(100) // < 100 points
    })

    it('should handle conversion errors gracefully', async () => {
      // Mock ImageTracer to throw an error
      vi.mocked(ImageTracer.imageToSVG).mockImplementationOnce(() => {
        throw new Error('ImageTracer failed')
      })
      
      const mockFile = createMockPngFile('invalid.png', 1024)
      
      await expect(convertPngToSvg(mockFile)).rejects.toThrow('Conversion failed')
    })

    it('should use optimal configuration for minimal output', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      
      await convertPngToSvg(mockFile)
      
      expect(ImageTracer.imageToSVG).toHaveBeenCalledWith(
        expect.any(Object), // image element
        expect.objectContaining({
          ltres: 3,
          qtres: 2,
          pathomit: 15,
          numberofcolors: 2,
          roundcoords: 1
        })
      )
    })

    it('should handle large files by optimizing image size', async () => {
      const largeFile = createMockPngFile('large.png', 4 * 1024 * 1024) // 4MB
      
      const result = await convertPngToSvg(largeFile)
      
      expect(result).toBeDefined()
      expect(result.svgString).toContain('<svg')
    })

    it('should clean up resources after conversion', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      
      await convertPngToSvg(mockFile)
      
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should track processing time accurately', async () => {
      const mockFile = createMockPngFile('test.png', 1024)
      
      const result = await convertPngToSvg(mockFile)
      
      expect(result.processingTime).toBeGreaterThan(0)
      expect(typeof result.processingTime).toBe('number')
    })
  })

  describe('optimizeSvgString', () => {
    it('should remove unnecessary whitespace', () => {
      const unoptimizedSvg = `<svg xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20" />
      </svg>`
      
      const optimized = optimizeSvgString(unoptimizedSvg)
      
      expect(optimized).not.toContain('\\n')
      expect(optimized.length).toBeLessThan(unoptimizedSvg.length)
    })

    it('should round coordinates to reduce file size', () => {
      const svgWithPreciseCoords = '<svg><path d="M10.123456 10.789012 L20.345678 20.901234"/></svg>'
      
      const optimized = optimizeSvgString(svgWithPreciseCoords)
      
      expect(optimized).toContain('10.1')
      expect(optimized).toContain('10.7')
      expect(optimized).not.toContain('10.123456')
    })

    it('should remove redundant path commands', () => {
      const svgWithRedundantCommands = '<svg><path d="M10 10 M10 10 L20 20 L20 20"/></svg>'
      
      const optimized = optimizeSvgString(svgWithRedundantCommands)
      
      expect(optimized).not.toMatch(/M10 10 M10 10/)
      expect(optimized).not.toMatch(/L20 20 L20 20/)
    })

    it('should remove empty attributes', () => {
      const svgWithEmptyAttributes = '<svg fill="" stroke="" opacity=""><path d="M10 10"/></svg>'
      
      const optimized = optimizeSvgString(svgWithEmptyAttributes)
      
      expect(optimized).not.toContain('fill=""')
      expect(optimized).not.toContain('stroke=""')
      expect(optimized).not.toContain('opacity=""')
    })

    it('should preserve essential SVG structure', () => {
      const optimized = optimizeSvgString(mockSvgString)
      
      expect(optimized).toContain('<svg')
      expect(optimized).toContain('</svg>')
      expect(optimized).toContain('<path')
    })
  })

  describe('countSvgPoints', () => {
    it('should count path commands accurately', () => {
      const svgWithMultipleCommands = '<svg><path d="M10 10 L20 20 L30 30 C40 40 50 50 60 60"/></svg>'
      
      const count = countSvgPoints(svgWithMultipleCommands)
      
      expect(count).toBe(4) // M, L, L, C
    })

    it('should handle SVG without path commands', () => {
      const svgWithoutPaths = '<svg><circle cx="50" cy="50" r="20"/></svg>'
      
      const count = countSvgPoints(svgWithoutPaths)
      
      expect(count).toBe(0)
    })

    it('should handle empty SVG string', () => {
      const count = countSvgPoints('')
      
      expect(count).toBe(0)
    })

    it('should count case-insensitive commands', () => {
      const svgWithMixedCase = '<svg><path d="m10 10 l20 20 L30 30"/></svg>'
      
      const count = countSvgPoints(svgWithMixedCase)
      
      expect(count).toBe(3) // m, l, L
    })
  })
})