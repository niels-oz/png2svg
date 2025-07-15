// Image conversion utility using ImageTracerJS

// Dynamic import of ImageTracerJS will be used inside convertPngToSvg
import { optimizeSvgPaths } from './svgOptimizer';

// Optimal configuration for minimal output
const OPTIMAL_CONFIG = {
  // Aggressive point reduction
  ltres: 3,           // Line threshold - higher = fewer points
  qtres: 2,           // Quadratic threshold - higher = smoother curves
  pathomit: 15,       // Remove short paths (noise reduction)
  
  // Quality optimization
  scale: 1,           // No scaling to maintain quality
  strokewidth: 0.5,   // Thin strokes for clean output
  numberofcolors: 2,  // Binary colors for line art
  colorsampling: 0,   // Fastest sampling method
  
  // Output optimization
  desc: false,        // Remove SVG descriptions
  viewBox: true,      // Enable responsive scaling
  roundcoords: 1      // Round coordinates to 1 decimal place
};

export async function convertPngToSvg(file) {
  const startTime = performance.now();

  // Validate file
  if (!file || file.type !== 'image/png') {
    throw new Error('Invalid PNG file');
  }

  // Load image as HTMLImageElement
  const img = await loadImageFromFile(file);

  // Optimize image size for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  const maxDimension = 1000;
  const scale = Math.min(maxDimension / img.width, maxDimension / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Dynamically load ImageTracerJS UMD build
  async function ensureImageTracerLoaded() {
    if (typeof window === 'undefined') throw new Error('ImageTracerJS can only run in the browser.');
    if (window.ImageTracer && typeof window.ImageTracer.imageToSVG === 'function') return;
    // Not loaded: dynamically inject script
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="/imagetracer_v1.2.6.js"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', () => reject(new Error('Failed to load ImageTracerJS UMD script.')));
        return;
      }
      const script = document.createElement('script');
      script.src = '/imagetracer_v1.2.6.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load ImageTracerJS UMD script.'));
      document.body.appendChild(script);
    });
    if (!window.ImageTracer || typeof window.ImageTracer.imageToSVG !== 'function') {
      throw new Error('ImageTracerJS UMD did not load properly.');
    }
  }

  await ensureImageTracerLoaded();

  console.log('Canvas size before tracing:', canvas.width, canvas.height);
  let svgString;
  try {
    // Draw image on canvas and get pixel data
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    svgString = window.ImageTracer.imagedataToSVG(imageData, OPTIMAL_CONFIG);
    console.log('Result of window.ImageTracer.imagedataToSVG:', svgString);
  } catch (e) {
    console.warn('window.ImageTracer.imageToSVGString failed:', e);
  }
  if (!svgString || typeof svgString !== 'string') {
    throw new Error('ImageTracerJS failed to generate SVG (UMD build, imageData input).');
  }
  const optimized = optimizeSvgPaths(svgString);

  // Clean up
  URL.revokeObjectURL(img.src);

  const endTime = performance.now();
  return {
    svgString: optimized,
    originalSize: file.size,
    svgSize: new Blob([optimized]).size,
    pointCount: countSvgPoints(optimized),
    processingTime: Math.round(endTime - startTime)
  };
}

// Helper to load an image from a File and return HTMLImageElement
async function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timeout'));
      }, 30000);
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image failed to load'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file as data URL'));
    };
    reader.readAsDataURL(file);
  });
}

export function optimizeSvgString(svgString) {
  return optimizeSvgPaths(svgString);
}

export function countSvgPoints(svgString) {
  if (!svgString) return 0;
  
  // Extract only the path data (d attribute content)
  const pathData = svgString.match(/d="([^"]*)"/g);
  if (!pathData) return 0;
  
  let totalCommands = 0;
  pathData.forEach(path => {
    const commands = path.match(/[MLHVCSQTAZ]/gi);
    if (commands) {
      totalCommands += commands.length;
    }
  });
  
  return totalCommands;
}