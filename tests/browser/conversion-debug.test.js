import { describe, it, expect, beforeEach } from 'vitest'
import { convertPngToSvg } from '@/utils/imageConverter'
import { createMockPngFile } from '../test-utils'

describe('Browser Environment Conversion Debug', () => {
  beforeEach(() => {
    // Reset console mocks
    console.log = console.log
    console.error = console.error
  })

  it('should work with real Canvas API', async () => {
    const file = createMockPngFile('test.png', 1024)
    
    // This should work without mocking
    const result = await convertPngToSvg(file)
    
    expect(result).toBeDefined()
    expect(result.svgString).toBeDefined()
    expect(result.svgString.length).toBeGreaterThan(0)
  })

  it('should handle Image loading properly', async () => {
    const file = createMockPngFile('test.png', 1024)
    
    // Test image loading without mocks
    const imageLoadPromise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
    
    const img = await imageLoadPromise
    expect(img.width).toBeGreaterThan(0)
    expect(img.height).toBeGreaterThan(0)
  })

  it('should handle Canvas operations', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    expect(canvas).toBeDefined()
    expect(ctx).toBeDefined()
    
    canvas.width = 100
    canvas.height = 100
    
    expect(canvas.width).toBe(100)
    expect(canvas.height).toBe(100)
  })
})