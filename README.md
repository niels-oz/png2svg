# PNG to SVG Converter

A client-side web application that converts PNG images (line art/icons) to optimized SVG format with minimal vector points. Built with Next.js and ImageTracerJS for offline-capable, high-performance conversion.

## 🎯 Project Overview

This ultra-minimal MVP converts single PNG images to kilobyte-range SVG files through an intuitive drag-and-drop interface. The application runs entirely in the browser with no server-side processing required.

### Key Features

- **🖼️ Single PNG Upload**: Drag-and-drop interface for PNG files (up to 5MB)
- **⚡ Client-Side Processing**: 100% offline-capable conversion using ImageTracerJS
- **📊 Side-by-Side Preview**: Original PNG vs. converted SVG comparison
- **🔍 Code Viewer**: SVG source code display with expand/collapse functionality
- **📥 Direct Download**: One-click SVG file download
- **🎨 Optimized Output**: Aggressive optimization for minimal file size (<10KB typical)
- **📱 Responsive Design**: Works on desktop and mobile devices
- **♿ Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd png2svg

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to use the application.

### Production Build

```bash
# Build for production
npm run build

# Export static files for deployment
npm run export
```

Static files will be generated in the `out/` directory, ready for deployment to Vercel or any static hosting service.

## 📖 How to Use

1. **Upload**: Drag and drop a PNG file onto the upload area, or click to select
2. **Convert**: Processing starts automatically (typically 5-30 seconds)
3. **Preview**: View original vs. converted images side-by-side with statistics
4. **Download**: Click the download button to save the optimized SVG

### Supported Files

- **Format**: PNG images only
- **Size**: Up to 5MB
- **Best Results**: Line art, icons, simple graphics with limited colors

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15.4.1 with React 18
- **Processing**: ImageTracerJS (UMD build)
- **Styling**: CSS Modules with responsive design
- **Testing**: Vitest with React Testing Library
- **Deployment**: Static export for Vercel

### Project Structure

```
src/
├── app/
│   ├── page.js           # Main application component
│   ├── layout.js         # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── DropZone.js       # File upload component
│   ├── ImagePreview.js   # Side-by-side preview
│   ├── SvgCodeViewer.js  # SVG source display
│   └── DownloadButton.js # File download
├── utils/
│   ├── imageConverter.js # ImageTracerJS wrapper
│   ├── fileValidator.js  # PNG validation
│   ├── svgOptimizer.js   # Post-processing
│   └── downloadHelper.js # Download utilities
└── hooks/
    └── useImageConverter.js # Conversion state management
```

## ⚙️ Configuration

### ImageTracerJS Optimization

The application uses aggressive optimization settings for minimal output:

```javascript
const OPTIMAL_CONFIG = {
  ltres: 3,           // Higher = fewer line points
  qtres: 2,           // Higher = fewer curve points  
  pathomit: 15,       // Remove short paths (noise)
  numberofcolors: 2,  // Binary colors for line art
  roundcoords: 1      // Round to 1 decimal place
};
```

### Performance Targets

- **Processing Time**: < 30 seconds per conversion
- **Output Size**: < 10KB for typical icons
- **Input Limit**: 5MB PNG files
- **Point Reduction**: 80%+ compared to standard auto-trace

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage

- **205 total tests** with **170 passing** (83% pass rate)
- **Component tests**: All UI components with user interactions
- **Utility tests**: File validation, conversion logic, optimization
- **Integration tests**: End-to-end conversion flow
- **Performance tests**: Processing time and output size validation

### Test Structure

```
tests/
├── components/     # Component unit tests
├── utils/         # Utility function tests
├── hooks/         # Custom hook tests
├── integration/   # End-to-end tests
└── browser/       # Browser API tests
```

## 🚀 Deployment

### Vercel Deployment

The application is configured for static export and deploys seamlessly to Vercel:

```bash
# Build and export
npm run build && npm run export

# Deploy to Vercel
vercel --prod
```

### Configuration Files

- `next.config.js` - Next.js configuration with static export
- `vercel.json` - Vercel deployment settings
- `package.json` - Dependencies and build scripts

## 📊 Performance

### Optimization Features

- **Bundle Splitting**: Vendor and common chunks separated
- **Code Splitting**: Components loaded on demand
- **Image Optimization**: Automatic resizing for large inputs
- **Memory Management**: Cleanup of object URLs and canvas elements
- **Timeout Handling**: 30-second processing limit with graceful fallback

### Monitoring

Key metrics tracked:
- Conversion success rate
- Processing time distribution
- File size reduction ratios
- Error frequency and types

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run export       # Generate static files
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run linting
npm run type-check   # TypeScript type checking
```

### Development Guidelines

1. **Components**: Use functional components with hooks
2. **Styling**: CSS Modules for component-specific styles
3. **Testing**: Write tests for all new features
4. **Error Handling**: Implement graceful error recovery
5. **Performance**: Monitor conversion times and memory usage

## 🛠️ Troubleshooting

### Common Issues

**Processing Timeout**
- File too large or complex
- Try a smaller or simpler image
- Check browser memory usage

**Invalid File Type**
- Only PNG files are supported
- Check file extension and MIME type
- Verify file isn't corrupted

**Conversion Errors**
- Image may be too complex for vectorization
- Try reducing image size or complexity
- Check browser console for detailed errors

**Download Issues**
- Check browser download settings
- Verify popup blockers aren't interfering
- Try right-click > Save As on the download button

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow existing code style
- Write comprehensive tests
- Update documentation
- Handle errors gracefully

## 📚 Documentation

### Additional Resources

- [`docs/technical-design-document.md`](docs/technical-design-document.md) - Complete technical specifications
- [`docs/completion.md`](docs/completion.md) - Development checklist and status
- [`docs/requirements.md`](docs/requirements.md) - MVP requirements
- [`docs/architecture.md`](docs/architecture.md) - System architecture details
- [`CLAUDE.md`](CLAUDE.md) - AI assistant guidance

## 🔒 Security

### Client-Side Security

- **File Validation**: Strict PNG format checking
- **Size Limits**: Prevent memory exhaustion attacks
- **SVG Sanitization**: Remove potentially dangerous elements
- **CSP Headers**: Content Security Policy implemented
- **Input Validation**: All user inputs validated

## 📈 Roadmap

### Future Enhancements

- **Batch Processing**: Multiple file support
- **Advanced Settings**: User-configurable optimization parameters
- **Additional Formats**: Support for other image formats
- **Copy to Clipboard**: Direct SVG code copying
- **Conversion History**: Save previous conversions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ImageTracerJS** - Core conversion library
- **Next.js** - React framework
- **Vercel** - Deployment platform
- **React Testing Library** - Testing utilities

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the technical documentation

Built with ❤️ for the developer community.