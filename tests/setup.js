import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Set test environment
process.env.NODE_ENV = 'test'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Next.js navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props) => {
    const { createElement } = require('react')
    return createElement('img', props)
  },
}))

// Mock File API for testing
global.File = class MockFile {
  constructor(parts, filename, options = {}) {
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = options.type || 'application/octet-stream'
    this.lastModified = Date.now()
    this.parts = parts
  }
}

// Mock Image for testing
global.Image = class MockImage {
  constructor() {
    this.onload = null
    this.onerror = null
    this.src = ''
    this.width = 100
    this.height = 100
  }
}

// Mock FileReader
global.FileReader = class MockFileReader {
  constructor() {
    this.readAsDataURL = vi.fn((file) => {
      setTimeout(() => {
        this.result = `data:${file.type};base64,mock-base64-data`
        this.onload?.()
      }, 0)
    })
    this.readAsArrayBuffer = vi.fn()
    this.readAsText = vi.fn()
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
  }
}

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  canvas: {
    width: 100,
    height: 100
  }
}))

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
}

// Mock ImageTracerJS
vi.mock('imagetracerjs', () => ({
  default: {
    imageToSVG: vi.fn(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 L20 20 L30 30 Z"/></svg>'),
    imageToTracedata: vi.fn(() => ({ layers: [] })),
    imageToSVGString: vi.fn(() => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 L20 20 L30 30 Z"/></svg>')
  }
}))

// Mock Blob constructor
global.Blob = class MockBlob {
  constructor(content, options) {
    this.size = content.reduce((acc, item) => acc + item.length, 0)
    this.type = options?.type || 'application/octet-stream'
    this.content = content
  }
}

// Mock document.createElement to avoid DOM issues in tests
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: vi.fn(),
      style: { display: '' },
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  }
  return originalCreateElement(tagName)
})

// Mock document.body methods
const originalAppendChild = document.body.appendChild.bind(document.body)
const originalRemoveChild = document.body.removeChild.bind(document.body)

document.body.appendChild = vi.fn((element) => {
  // Only mock for anchor elements used in downloads
  if (element.tagName === 'A' || element.href !== undefined) {
    return element
  }
  return originalAppendChild(element)
})

document.body.removeChild = vi.fn((element) => {
  // Only mock for anchor elements used in downloads
  if (element.tagName === 'A' || element.href !== undefined) {
    return element
  }
  return originalRemoveChild(element)
})