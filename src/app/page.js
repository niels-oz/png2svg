'use client'

import { useState } from 'react'
import DropZone from '../components/DropZone'
import ImagePreview from '../components/ImagePreview'
import SvgCodeViewer from '../components/SvgCodeViewer'
import DownloadButton from '../components/DownloadButton'
import useImageConverter from '../hooks/useImageConverter'

export default function Home() {
  const {
    file,
    result,
    isProcessing,
    error,
    convertFile,
    reset
  } = useImageConverter()

  const handleFileUpload = (uploadedFile) => {
    convertFile(uploadedFile)
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div>
      <h1>PNG to SVG Converter</h1>
      <p>Convert PNG images to optimized SVG format with minimal vector points</p>
      
      {!file ? (
        <DropZone onFileUpload={handleFileUpload} />
      ) : (
        <div>
          {isProcessing && (
            <div data-testid="spinner" className="spinner"></div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {result && (
            <>
              <div data-testid="image-preview">
                <ImagePreview 
                  originalFile={file}
                  svgResult={result}
                  onReset={handleReset}
                />
              </div>
              
              <SvgCodeViewer 
                svgString={result.svgString}
              />
              
              <DownloadButton 
                svgString={result.svgString}
                filename={file.name.replace('.png', '.svg')}
              />
            </>
          )}
          
          <button onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
    </div>
  )
}