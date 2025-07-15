import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function with providers
const customRender = (
  ui,
  options = {}
) => {
  const AllTheProviders = ({ children }) => {
    return children
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Mock file creation helper
export const createMockFile = (filename, content = 'mock content', type = 'image/png') => {
  const file = new File([content], filename, { type })
  return file
}

// Mock PNG file with specific size
export const createMockPngFile = (filename, sizeInBytes = 1024) => {
  const content = 'x'.repeat(sizeInBytes)
  return createMockFile(filename, content, 'image/png')
}

// Mock SVG string for testing
export const mockSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M10 10 L20 20 L30 10 Z" fill="black"/>
</svg>`

// Mock conversion result
export const mockConversionResult = {
  svgString: mockSvgString,
  originalSize: 2048,
  svgSize: 256,
  pointCount: 15,
  processingTime: 1500
}

// Performance testing helper
export const measurePerformance = async (fn) => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return {
    result,
    duration: end - start
  }
}

// Wait for async operations
export const waitForAsync = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Export customRender as render
export { customRender as render }