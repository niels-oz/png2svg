# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PNG to SVG converter web application that converts single PNG images (line art/icons) to optimized SVG format with minimal vector points. The project is an ultra-minimal MVP focused on client-side processing.

## Architecture

**Client-Side SPA**: Single Page Application with no server-side processing
- **Framework**: Next.js 14+ with static export for Vercel deployment
- **Core Library**: ImageTracerJS for PNG to SVG conversion
- **Processing**: 100% client-side, works offline
- **Deployment**: Static files only, deployed to Vercel

### Component Structure
```
Presentation Layer:
├── DropZone - Drag-and-drop file input (PNG only)
├── ImagePreview - Side-by-side original/converted display
├── SvgCodeViewer - SVG source code display (quality indicator)
└── DownloadButton - File download functionality

Business Logic Layer:
├── ImageTracer - ImageTracerJS wrapper with optimization
├── SVGOptimizer - Post-processing for minimal point reduction
├── FileValidator - PNG validation and error handling
└── StateManager - React hooks for app state
```

## Key Implementation Details

### ImageTracerJS Configuration
The project uses aggressive optimization settings to achieve kilobyte-range output:
```javascript
const OPTIMAL_CONFIG = {
  ltres: 3,           // Higher = fewer line points
  qtres: 2,           // Higher = fewer curve points  
  pathomit: 15,       // Remove short paths (noise)
  numberofcolors: 2,  // Binary colors for line art
  roundcoords: 1      // Round to 1 decimal place
};
```

### Two-Stage Optimization Process
1. **Vectorization**: ImageTracerJS conversion
2. **Optimization**: Point reduction using ltres, qtres, pathomit settings

### Performance Targets
- Processing time: < 30 seconds per conversion
- Output size: < 10KB for typical icons
- Input limit: 5MB PNG files
- Point reduction: 80%+ compared to standard auto-trace

## Development Commands

Since this is a documentation-only phase, the actual Next.js project hasn't been initialized yet. Based on the technical design document, the expected commands will be:

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run export        # Generate static files
npm run test          # Run test suite
npm run test:watch    # Run tests in watch mode
npm run lint          # Run linting

# Deployment
npm run build && npm run export  # Full build for Vercel
```

## Testing Strategy

### Component Testing
- **DropZone**: File validation, drag-and-drop, error handling
- **ImageConverter**: Conversion accuracy, performance, error recovery
- **ImagePreview**: Display logic, statistics calculation
- **SvgCodeViewer**: Code display, expand/collapse functionality

### Integration Testing
- End-to-end conversion flow: PNG upload → processing → preview → download
- Error scenarios: invalid files, conversion failures, timeouts
- Performance validation: processing time and output size targets

## MVP Constraints

**Single File Only**: No batch processing (moved to future iterations)
**PNG Input Only**: No other image formats
**Basic Error Handling**: Simple validation and alerts
**Desktop-Primary**: Responsive but desktop-focused
**Minimal Dependencies**: Only essential packages (ImageTracerJS + Next.js)

## Future Iterations

Features explicitly removed from MVP (see `docs/future_iterations.md`):
- Multiple file support
- Copy to clipboard functionality
- Advanced progress indicators
- Syntax highlighting
- Batch processing
- Advanced optimization settings

## Documentation

The `docs/` folder contains comprehensive project documentation:
- `requirements.md` - Ultra-minimal MVP requirements
- `technical-design-document.md` - Complete implementation specifications
- `architecture.md` - System architecture and design decisions
- `completion.md` - Development checklist and deployment plan