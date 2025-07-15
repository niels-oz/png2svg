import { describe, it, expect } from 'vitest'
import { 
  optimizeSvgPaths, 
  removeRedundantCommands,
  roundCoordinates,
  removeEmptyAttributes,
  calculateCompressionRatio
} from '@/utils/svgOptimizer'
import { mockSvgString } from '../test-utils'

describe('svgOptimizer', () => {
  describe('optimizeSvgPaths', () => {
    it('should reduce SVG file size significantly', () => {
      const unoptimizedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M10.123456 10.789012 L20.345678 20.901234 L30.567890 30.123456 Z" fill="black" stroke="" opacity=""/>
      </svg>`
      
      const optimized = optimizeSvgPaths(unoptimizedSvg)
      
      expect(optimized.length).toBeLessThan(unoptimizedSvg.length)
      expect(optimized).toContain('<svg')
      expect(optimized).toContain('</svg>')
    })

    it('should preserve essential SVG structure', () => {
      const optimized = optimizeSvgPaths(mockSvgString)
      
      expect(optimized).toContain('<svg')
      expect(optimized).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(optimized).toContain('viewBox="0 0 100 100"')
      expect(optimized).toContain('<path')
      expect(optimized).toContain('</svg>')
    })

    it('should remove XML declarations and comments', () => {
      const svgWithDeclaration = `<?xml version="1.0" encoding="UTF-8"?>
        <!-- This is a comment -->
        <svg xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10 L20 20"/>
        </svg>`
      
      const optimized = optimizeSvgPaths(svgWithDeclaration)
      
      expect(optimized).not.toContain('<?xml')
      expect(optimized).not.toContain('<!-- This is a comment -->')
    })

    it('should minimize whitespace between elements', () => {
      const svgWithSpaces = `<svg>
        <path d="M10 10 L20 20"/>
        <path d="M30 30 L40 40"/>
      </svg>`
      
      const optimized = optimizeSvgPaths(svgWithSpaces)
      
      expect(optimized).not.toContain('\\n')
      expect(optimized).not.toMatch(/>\s+</)
    })

    it('should achieve minimum 20% size reduction', () => {
      const unoptimizedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M10.123456789 10.123456789 L20.123456789 20.123456789 L30.123456789 30.123456789 Z" fill="black" stroke="" opacity="" />
      </svg>`
      
      const optimized = optimizeSvgPaths(unoptimizedSvg)
      const reductionRatio = 1 - (optimized.length / unoptimizedSvg.length)
      
      expect(reductionRatio).toBeGreaterThan(0.2) // > 20% reduction
    })
  })

  describe('removeRedundantCommands', () => {
    it('should remove consecutive duplicate commands', () => {
      const svgWithDuplicates = '<svg><path d="M10 10 M10 10 L20 20 L20 20"/></svg>'
      
      const optimized = removeRedundantCommands(svgWithDuplicates)
      
      expect(optimized).not.toMatch(/M10 10 M10 10/)
      expect(optimized).not.toMatch(/L20 20 L20 20/)
    })

    it('should preserve necessary commands', () => {
      const svgWithNecessaryCommands = '<svg><path d="M10 10 L20 20 M30 30 L40 40"/></svg>'
      
      const optimized = removeRedundantCommands(svgWithNecessaryCommands)
      
      expect(optimized).toContain('M10 10')
      expect(optimized).toContain('L20 20')
      expect(optimized).toContain('M30 30')
      expect(optimized).toContain('L40 40')
    })

    it('should handle empty input', () => {
      const optimized = removeRedundantCommands('')
      
      expect(optimized).toBe('')
    })

    it('should handle case-insensitive commands', () => {
      const svgWithMixedCase = '<svg><path d="m10 10 m10 10 L20 20 l20 20"/></svg>'
      
      const optimized = removeRedundantCommands(svgWithMixedCase)
      
      expect(optimized).not.toMatch(/m10 10 m10 10/)
      expect(optimized).not.toMatch(/L20 20 l20 20/)
    })
  })

  describe('roundCoordinates', () => {
    it('should round coordinates to 1 decimal place', () => {
      const svgWithPreciseCoords = '<svg><path d="M10.123456 10.789012 L20.345678 20.901234"/></svg>'
      
      const rounded = roundCoordinates(svgWithPreciseCoords, 1)
      
      expect(rounded).toContain('10.1')
      expect(rounded).toContain('10.8')
      expect(rounded).toContain('20.3')
      expect(rounded).toContain('20.9')
      expect(rounded).not.toContain('10.123456')
    })

    it('should handle integer coordinates', () => {
      const svgWithIntegers = '<svg><path d="M10 10 L20 20"/></svg>'
      
      const rounded = roundCoordinates(svgWithIntegers, 1)
      
      expect(rounded).toContain('M10 10')
      expect(rounded).toContain('L20 20')
    })

    it('should round to specified decimal places', () => {
      const svgWithPreciseCoords = '<svg><path d="M10.123456 10.789012"/></svg>'
      
      const rounded2 = roundCoordinates(svgWithPreciseCoords, 2)
      const rounded3 = roundCoordinates(svgWithPreciseCoords, 3)
      
      expect(rounded2).toContain('10.12')
      expect(rounded2).toContain('10.79')
      expect(rounded3).toContain('10.123')
      expect(rounded3).toContain('10.789')
    })

    it('should handle negative coordinates', () => {
      const svgWithNegativeCoords = '<svg><path d="M-10.123456 -10.789012"/></svg>'
      
      const rounded = roundCoordinates(svgWithNegativeCoords, 1)
      
      expect(rounded).toContain('-10.1')
      expect(rounded).toContain('-10.8')
    })
  })

  describe('removeEmptyAttributes', () => {
    it('should remove empty attributes', () => {
      const svgWithEmptyAttrs = '<svg fill="" stroke="" opacity=""><path d="M10 10" class=""/></svg>'
      
      const cleaned = removeEmptyAttributes(svgWithEmptyAttrs)
      
      expect(cleaned).not.toContain('fill=""')
      expect(cleaned).not.toContain('stroke=""')
      expect(cleaned).not.toContain('opacity=""')
      expect(cleaned).not.toContain('class=""')
    })

    it('should preserve non-empty attributes', () => {
      const svgWithMixedAttrs = '<svg fill="red" stroke="" opacity="0.5"><path d="M10 10" class="active"/></svg>'
      
      const cleaned = removeEmptyAttributes(svgWithMixedAttrs)
      
      expect(cleaned).toContain('fill="red"')
      expect(cleaned).toContain('opacity="0.5"')
      expect(cleaned).toContain('class="active"')
      expect(cleaned).not.toContain('stroke=""')
    })

    it('should handle various quote styles', () => {
      const svgWithDifferentQuotes = `<svg fill='' stroke="" opacity=''><path d="M10 10"/></svg>`
      
      const cleaned = removeEmptyAttributes(svgWithDifferentQuotes)
      
      expect(cleaned).not.toContain(`fill=''`)
      expect(cleaned).not.toContain('stroke=""')
      expect(cleaned).not.toContain(`opacity=''`)
    })
  })

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      const originalSize = 1000
      const compressedSize = 200
      
      const ratio = calculateCompressionRatio(originalSize, compressedSize)
      
      expect(ratio).toBe(0.8) // 80% compression
    })

    it('should handle edge cases', () => {
      expect(calculateCompressionRatio(100, 100)).toBe(0) // No compression
      expect(calculateCompressionRatio(100, 0)).toBe(1) // Complete compression
      expect(calculateCompressionRatio(0, 0)).toBe(0) // Both zero
    })

    it('should handle larger compressed size', () => {
      const originalSize = 100
      const compressedSize = 150
      
      const ratio = calculateCompressionRatio(originalSize, compressedSize)
      
      expect(ratio).toBe(-0.5) // 50% increase
    })
  })
})