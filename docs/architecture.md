# SPARC Phase 3: System Architecture

## PNG to SVG Converter - Technical Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE ONLY                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Next.js Frontend                         ││
│  │  ┌─────────────────┐  ┌─────────────────┐              ││
│  │  │   UI Components │  │  Business Logic │              ││
│  │  │                 │  │                 │              ││
│  │  │  • DropZone     │  │  • ImageTracer  │              ││
│  │  │  • ImagePreview │  │  • SVG Optimizer│              ││
│  │  │  • CodeViewer   │  │  • File Validator│              ││
│  │  │  • Download     │  │                 │              ││
│  │  └─────────────────┘  └─────────────────┘              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Static Deploy  │
                    │   (Vercel)      │
                    └─────────────────┘
```

### Architectural Style: Client-Side SPA

**Chosen Architecture**: Single Page Application (SPA) with client-side processing  
**Justification**: 
- Eliminates server costs and complexity
- Enables offline functionality
- Reduces latency (no server round-trips)
- Simplifies deployment (static files only)
- Perfect for MVP scope

### Technology Stack

#### Core Framework
- **Next.js 14+**: React framework with static export capability
- **React 18**: Component-based UI library
- **TypeScript**: Type safety (optional for MVP)

#### Processing Libraries
- **ImageTracerJS**: Primary PNG to SVG conversion
- **File API**: Browser-native file handling
- **Canvas API**: Image processing support

#### Styling
- **CSS Modules**: Scoped styling
- **Tailwind CSS**: Utility-first CSS (optional)

#### Build & Deployment
- **Vercel**: Static site deployment
- **Next.js Static Export**: Generates static HTML/CSS/JS

### System Architecture Diagram

```
User Interface Layer
├── pages/
│   ├── index.js              // Main conversion page
│   ├── _app.js               // App wrapper
│   └── _document.js          // HTML structure
│
├── components/
│   ├── DropZone/
│   │   ├── index.js          // Drag-and-drop logic
│   │   └── DropZone.module.css
│   ├── ImagePreview/
│   │   ├── index.js          // Side-by-side preview
│   │   └── ImagePreview.module.css
│   ├── SvgCodeViewer/
│   │   ├── index.js          // Source code display
│   │   └── SvgCodeViewer.module.css
│   └── DownloadButton/
│       ├── index.js          // File download
│       └── DownloadButton.module.css
│
Business Logic Layer
├── utils/
│   ├── imageConverter.js     // ImageTracerJS wrapper
│   ├── svgOptimizer.js       // Point reduction
│   ├── fileValidator.js      // PNG validation
│   └── downloadHelper.js     // File download logic
│
Data Layer
├── hooks/
│   ├── useFileUpload.js      // File handling logic
│   ├── useImageConverter.js  // Conversion state
│   └── useLocalStorage.js    // Settings persistence
│
Configuration Layer
├── config/
│   ├── imageTracer.js        // ImageTracerJS settings
│   └── constants.js          // App constants
```

### Key Components Design

#### 1. Main Application Component
```javascript
// pages/index.js
export default function Home() {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState(null)

    const handleFileUpload = useCallback(async (uploadedFile) => {
        // Validation → Conversion → State Update
    }, [])

    return (
        <div className="container">
            {!file ? (
                <DropZone onFileUpload={handleFileUpload} />
            ) : (
                <ConversionInterface 
                    originalFile={file}
                    result={result}
                    isProcessing={isProcessing}
                    error={error}
                />
            )}
        </div>
    )
}
```

#### 2. ImageTracerJS Integration
```javascript
// utils/imageConverter.js
import ImageTracer from 'imagetracerjs'

const OPTIMAL_OPTIONS = {
    ltres: 2,           // Line error threshold
    qtres: 1,           // Quadratic error threshold  
    pathomit: 8,        // Omit short paths
    scale: 1,           // No scaling
    strokewidth: 1,     // Minimal stroke
    numberofcolors: 2,  // Binary for line art
    colorsampling: 1,   // Precise sampling
    desc: false,        // Remove descriptions
    viewBox: true       // Enable scaling
}

export async function convertPngToSvg(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            try {
                const svgString = ImageTracer.imageToSVG(img, OPTIMAL_OPTIONS)
                const optimized = optimizeSvgString(svgString)
                resolve({
                    svgString: optimized,
                    originalSize: file.size,
                    svgSize: optimized.length,
                    pointCount: countSvgPoints(optimized)
                })
            } catch (error) {
                reject(error)
            }
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
    })
}
```

#### 3. State Management Pattern
```javascript
// hooks/useImageConverter.js
export function useImageConverter() {
    const [state, setState] = useState({
        file: null,
        result: null,
        isProcessing: false,
        error: null
    })

    const convertFile = useCallback(async (file) => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }))
        
        try {
            const result = await convertPngToSvg(file)
            setState(prev => ({ 
                ...prev, 
                file, 
                result, 
                isProcessing: false 
            }))
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: error.message, 
                isProcessing: false 
            }))
        }
    }, [])

    const reset = useCallback(() => {
        setState({
            file: null,
            result: null,
            isProcessing: false,
            error: null
        })
    }, [])

    return { ...state, convertFile, reset }
}
```

### Data Models and Schemas

#### File Input Model
```javascript
interface PngFile {
    name: string
    size: number
    type: 'image/png'
    lastModified: number
    file: File
}
```

#### Conversion Result Model
```javascript
interface ConversionResult {
    svgString: string      // Optimized SVG content
    originalSize: number   // PNG file size in bytes
    svgSize: number       // SVG string length
    pointCount: number    // Estimated path complexity
    processingTime: number // Conversion duration
}
```

#### Application State Model
```javascript
interface AppState {
    file: PngFile | null
    result: ConversionResult | null
    isProcessing: boolean
    error: string | null
}
```

### Performance Optimizations

#### 1. Image Processing
- **Canvas optimization**: Efficient image loading and processing
- **Memory management**: Proper cleanup of object URLs
- **Processing feedback**: Real-time progress indicators

#### 2. SVG Optimization
- **Point reduction**: Aggressive path simplification
- **Decimal precision**: Limit to 2-3 decimal places
- **Redundancy removal**: Eliminate duplicate commands

#### 3. UI Performance
- **Component memoization**: Prevent unnecessary re-renders
- **Lazy loading**: Load ImageTracerJS only when needed
- **Debounced updates**: Smooth processing feedback

### Security Considerations

#### Client-Side Security
- **File validation**: Strict PNG format checking
- **Size limits**: Prevent memory exhaustion
- **Sanitization**: Clean SVG output for XSS prevention

#### Code Security
```javascript
// fileValidator.js
export function validatePngFile(file) {
    // Type validation
    if (file.type !== 'image/png') {
        throw new Error('Only PNG files are supported')
    }
    
    // Size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)')
    }
    
    // Extension validation
    if (!file.name.toLowerCase().endsWith('.png')) {
        throw new Error('Invalid file extension')
    }
    
    return true
}
```

### Deployment Architecture

#### Vercel Configuration
```javascript
// next.config.js
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    }
}

module.exports = nextConfig
```

#### Static Export Structure
```
out/
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   │   └── pages/
│   │   │       └── index-[hash].js
│   │   └── css/
│   │       └── [hash].css
├── index.html
└── 404.html
```

### Scalability & Performance

#### Current Architecture Benefits
- **Zero server costs**: Completely client-side
- **Infinite scaling**: CDN-distributed static files
- **Low latency**: No API calls required
- **Offline support**: Works without internet

#### Future Scalability Considerations
- **Service Worker**: Enhanced offline capabilities
- **IndexedDB**: Local storage for settings
- **Web Workers**: Background processing
- **WebAssembly**: Performance-critical conversions

### Error Handling Strategy

#### Error Boundaries
```javascript
// components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
```

### Testing Strategy

#### Unit Testing
- **File validation**: Test PNG format validation
- **SVG optimization**: Test point reduction algorithms
- **Component logic**: Test React component behavior

#### Integration Testing
- **File upload flow**: End-to-end conversion testing
- **Error scenarios**: Invalid file handling
- **Performance testing**: Large file processing

#### Test Structure
```
__tests__/
├── utils/
│   ├── fileValidator.test.js
│   ├── imageConverter.test.js
│   └── svgOptimizer.test.js
├── components/
│   ├── DropZone.test.js
│   ├── ImagePreview.test.js
│   └── SvgCodeViewer.test.js
└── integration/
    └── conversion-flow.test.js
```

---

*This architecture provides a solid foundation for the PNG to SVG converter MVP with clear separation of concerns, optimal performance, and straightforward deployment.*