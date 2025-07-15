# SPARC Phase 2: Pseudocode Outline

## Development Roadmap - PNG to SVG Converter

### Application Structure

```
pages/
├── index.js                 // Main converter page
├── _app.js                  // Next.js app wrapper
└── _document.js             // HTML document structure

components/
├── DropZone.js              // Drag-and-drop file input
├── ImagePreview.js          // Side-by-side preview component
├── ConversionProgress.js    // Simple spinner component
├── SvgCodeViewer.js         // SVG source code display
└── DownloadButton.js        // SVG file download

utils/
├── imageConverter.js        // ImageTracerJS wrapper
├── svgOptimizer.js          // Point reduction logic
└── fileValidator.js         // PNG file validation

styles/
└── globals.css              // Minimal styling
```

### Core Components Pseudocode

#### 1. Main Page (index.js)
```javascript
FUNCTION MainPage() {
    // State management
    STATE originalImage = null
    STATE convertedSvg = null
    STATE isProcessing = false
    STATE error = null

    // Main conversion flow
    FUNCTION handleFileUpload(file) {
        SET isProcessing = true
        SET error = null
        
        IF validateFile(file) THEN
            SET originalImage = file
            TRY
                svgResult = convertPngToSvg(file)
                SET convertedSvg = svgResult
            CATCH error
                SET error = "Conversion failed"
            END TRY
        ELSE
            SET error = "Invalid PNG file"
        END IF
        
        SET isProcessing = false
    }

    // Render UI
    RETURN (
        IF originalImage == null THEN
            <DropZone onFileUpload={handleFileUpload} />
        ELSE
            <ConversionInterface 
                original={originalImage}
                converted={convertedSvg}
                isProcessing={isProcessing}
                error={error}
            />
        END IF
    )
}
```

#### 2. File Drop Zone (DropZone.js)
```javascript
FUNCTION DropZone({ onFileUpload }) {
    STATE isDragOver = false

    FUNCTION handleDragOver(event) {
        event.preventDefault()
        SET isDragOver = true
    }

    FUNCTION handleDragLeave() {
        SET isDragOver = false
    }

    FUNCTION handleDrop(event) {
        event.preventDefault()
        SET isDragOver = false
        
        files = event.dataTransfer.files
        IF files.length > 0 THEN
            onFileUpload(files[0])  // Single file only
        END IF
    }

    RETURN (
        <div 
            className={`dropzone ${isDragOver ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <p>Drag and drop PNG file here</p>
        </div>
    )
}
```

#### 3. Image Converter (imageConverter.js)
```javascript
IMPORT ImageTracer from 'imagetracerjs'

FUNCTION convertPngToSvg(pngFile) {
    // Step 1: Load PNG file
    imageElement = createImageElement(pngFile)
    
    // Step 2: Configure ImageTracerJS options for optimization
    options = {
        ltres: 2,           // Line threshold for point reduction
        qtres: 1,           // Quadratic threshold for curves
        pathomit: 8,        // Omit short paths (noise reduction)
        scale: 1,           // Scale factor
        strokewidth: 1,     // Stroke width
        numberofcolors: 2,  // Limit colors for line art
        colorsampling: 1,   // Color sampling method
        desc: false,        // Remove description
        viewBox: true       // Add viewBox for scaling
    }

    // Step 3: Trace image to SVG
    svgString = ImageTracer.imageToSVG(imageElement, options)
    
    // Step 4: Additional optimization
    optimizedSvg = optimizeSvgPaths(svgString)
    
    RETURN {
        svgString: optimizedSvg,
        originalSize: pngFile.size,
        svgSize: optimizedSvg.length,
        pointCount: countSvgPoints(optimizedSvg)
    }
}

FUNCTION createImageElement(file) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
    img = new Image()
    
    img.onload = FUNCTION() {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
    }
    
    img.src = URL.createObjectURL(file)
    RETURN img
}
```

#### 4. SVG Optimizer (svgOptimizer.js)
```javascript
FUNCTION optimizeSvgPaths(svgString) {
    // Remove unnecessary whitespace
    cleaned = svgString.replace(/\s+/g, ' ')
    
    // Round decimal places to reduce file size
    cleaned = cleaned.replace(/(\d+\.\d{3})\d+/g, '$1')
    
    // Remove redundant path commands
    cleaned = removeRedundantCommands(cleaned)
    
    RETURN cleaned
}

FUNCTION removeRedundantCommands(svgString) {
    // Remove duplicate consecutive commands
    // Combine adjacent line commands
    // Remove zero-length segments
    RETURN optimizedString
}

FUNCTION countSvgPoints(svgString) {
    // Count path commands (M, L, C, etc.) to estimate complexity
    pathCommands = svgString.match(/[MLHVCSQTAZ]/g)
    RETURN pathCommands ? pathCommands.length : 0
}
```

#### 5. Image Preview Component (ImagePreview.js)
```javascript
FUNCTION ImagePreview({ originalFile, convertedSvg }) {
    originalUrl = URL.createObjectURL(originalFile)
    
    RETURN (
        <div className="preview-container">
            <div className="preview-panel">
                <h3>Original PNG</h3>
                <img src={originalUrl} alt="Original" />
                <p>Size: {formatFileSize(originalFile.size)}</p>
            </div>
            
            <div className="preview-panel">
                <h3>Converted SVG</h3>
                <div dangerouslySetInnerHTML={{ __html: convertedSvg.svgString }} />
                <p>Size: {formatFileSize(convertedSvg.svgSize)}</p>
                <p>Points: {convertedSvg.pointCount}</p>
            </div>
        </div>
    )
}
```

#### 6. SVG Code Viewer (SvgCodeViewer.js)
```javascript
FUNCTION SvgCodeViewer({ svgString }) {
    STATE isExpanded = false
    
    // Truncate long SVG strings for preview
    previewString = svgString.length > 200 
        ? svgString.substring(0, 200) + "..."
        : svgString
    
    RETURN (
        <div className="code-viewer">
            <h3>SVG Code (Quality Indicator)</h3>
            <pre className="code-block">
                {isExpanded ? svgString : previewString}
            </pre>
            <button onClick={() => SET isExpanded = !isExpanded}>
                {isExpanded ? "Show Less" : "Show More"}
            </button>
        </div>
    )
}
```

#### 7. Download Button (DownloadButton.js)
```javascript
FUNCTION DownloadButton({ svgString, filename = "converted.svg" }) {
    FUNCTION handleDownload() {
        blob = new Blob([svgString], { type: 'image/svg+xml' })
        url = URL.createObjectURL(blob)
        
        link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        
        URL.revokeObjectURL(url)
    }
    
    RETURN (
        <button 
            className="download-button"
            onClick={handleDownload}
        >
            Download SVG
        </button>
    )
}
```

#### 8. File Validator (fileValidator.js)
```javascript
FUNCTION validateFile(file) {
    // Check file type
    IF file.type !== 'image/png' THEN
        RETURN false
    END IF
    
    // Check file size (reasonable limit)
    maxSize = 10 * 1024 * 1024  // 10MB
    IF file.size > maxSize THEN
        RETURN false
    END IF
    
    // Check file extension
    IF !file.name.toLowerCase().endsWith('.png') THEN
        RETURN false
    END IF
    
    RETURN true
}
```

### Application Flow

```
1. User visits page
2. DropZone component renders
3. User drags PNG file onto drop zone
4. File validation occurs
5. If valid:
   a. Show loading spinner
   b. Convert PNG to SVG using ImageTracerJS
   c. Optimize SVG paths
   d. Display side-by-side preview
   e. Show SVG code viewer
   f. Enable download button
6. If invalid:
   a. Show error message
   b. Reset to initial state
```

### Key Integration Points

1. **ImageTracerJS Integration**: Configure optimal settings for line art conversion
2. **File Handling**: Secure client-side file processing
3. **State Management**: Simple React state for conversion flow
4. **Performance**: Efficient rendering of large SVG previews
5. **Error Handling**: Graceful failure recovery

### Development Priorities

1. **Core conversion logic** (imageConverter.js)
2. **Basic UI components** (DropZone, ImagePreview)
3. **File validation and error handling**
4. **SVG optimization and download**
5. **Styling and responsive design**

---

*This pseudocode serves as the development roadmap for the PNG to SVG converter MVP, focusing on essential functionality with minimal complexity.*