import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import userEvent from '@testing-library/user-event'
import SvgCodeViewer from '@/components/SvgCodeViewer'
import { mockSvgString } from '../test-utils'

describe('SvgCodeViewer', () => {
  describe('rendering', () => {
    it('should render with SVG code', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      expect(screen.getByText('SVG Code (Quality Indicator)')).toBeInTheDocument()
      expect(screen.getByTestId('svg-code-block')).toBeInTheDocument()
    })

    it('should display SVG code in code block', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent('<svg')
      expect(codeBlock).toHaveTextContent('</svg>')
    })

    it('should have proper styling classes', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const container = screen.getByTestId('code-viewer')
      expect(container).toHaveClass('code-viewer')
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveClass('code-block')
    })
  })

  describe('code truncation', () => {
    const longSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      ${'<path d="M10 10 L20 20"/>'.repeat(50)}
    </svg>`

    it('should truncate long SVG strings by default', () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock.textContent.length).toBeLessThan(longSvgString.length)
      expect(screen.getByText('Show More')).toBeInTheDocument()
    })

    it('should show full string when expanded', async () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByText('Show More')
      await userEvent.click(expandButton)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent(longSvgString)
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })

    it('should collapse when Show Less is clicked', async () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByText('Show More')
      await userEvent.click(expandButton)
      
      const collapseButton = screen.getByText('Show Less')
      await userEvent.click(collapseButton)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock.textContent.length).toBeLessThan(longSvgString.length)
      expect(screen.getByText('Show More')).toBeInTheDocument()
    })

    it('should not show expand/collapse for short strings', () => {
      const shortSvgString = '<svg><path d="M10 10"/></svg>'
      
      render(<SvgCodeViewer svgString={shortSvgString} />)
      
      expect(screen.queryByText('Show More')).not.toBeInTheDocument()
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument()
    })

    it('should use custom maxPreviewLength', () => {
      const customMaxLength = 50
      
      render(
        <SvgCodeViewer 
          svgString={longSvgString} 
          maxPreviewLength={customMaxLength}
        />
      )
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock.textContent.length).toBeLessThanOrEqual(customMaxLength + 10) // +10 for "..." and buffer
    })
  })

  describe('quality indicator', () => {
    it('should indicate good quality for short code', () => {
      const shortSvgString = '<svg><path d="M10 10 L20 20"/></svg>'
      
      render(<SvgCodeViewer svgString={shortSvgString} />)
      
      expect(screen.getByText('SVG Code (Quality Indicator)')).toBeInTheDocument()
    })

    it('should display code length information', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      expect(screen.getByText(/characters/i)).toBeInTheDocument()
    })

    it('should show quality metrics', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const codeLength = mockSvgString.length
      expect(screen.getByText(`${codeLength} characters`)).toBeInTheDocument()
    })
  })

  describe('keyboard interaction', () => {
    const longSvgString = `<svg xmlns="http://www.w3.org/2000/svg">
      ${'<path d="M10 10 L20 20"/>'.repeat(20)}
    </svg>`

    it('should expand with Enter key', async () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByText('Show More')
      await userEvent.type(expandButton, '{enter}')
      
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })

    it('should expand with Space key', async () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByText('Show More')
      await userEvent.type(expandButton, ' ')
      
      expect(screen.getByText('Show Less')).toBeInTheDocument()
    })

    it('should be focusable', () => {
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByText('Show More')
      expect(expandButton).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('prop handling', () => {
    it('should handle empty SVG string', () => {
      render(<SvgCodeViewer svgString="" />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent('')
    })

    it('should handle null SVG string', () => {
      render(<SvgCodeViewer svgString={null} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent('')
    })

    it('should handle undefined SVG string', () => {
      render(<SvgCodeViewer svgString={undefined} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent('')
    })

    it('should handle isExpanded prop', () => {
      const longSvgString = `<svg>${'<path d="M10 10"/>'.repeat(20)}</svg>`
      
      render(<SvgCodeViewer svgString={longSvgString} isExpanded={true} />)
      
      expect(screen.getByText('Show Less')).toBeInTheDocument()
      expect(screen.queryByText('Show More')).not.toBeInTheDocument()
    })
  })

  describe('code formatting', () => {
    it('should preserve SVG structure', () => {
      const formattedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M10 10 L20 20"/>
</svg>`
      
      render(<SvgCodeViewer svgString={formattedSvg} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent(formattedSvg)
    })

    it('should handle special characters', () => {
      const svgWithSpecialChars = '<svg><path d="M10&lt;10 L20&gt;20"/></svg>'
      
      render(<SvgCodeViewer svgString={svgWithSpecialChars} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent(svgWithSpecialChars)
    })

    it('should handle malformed SVG', () => {
      const malformedSvg = '<svg><path d="M10 10 L20 20"</svg>' // Missing closing bracket
      
      expect(() => {
        render(<SvgCodeViewer svgString={malformedSvg} />)
      }).not.toThrow()
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveTextContent(malformedSvg)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveAttribute('role', 'code')
      expect(codeBlock).toHaveAttribute('aria-label', 'SVG source code')
    })

    it('should have semantic HTML structure', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('SVG Code (Quality Indicator)')
      
      const codeBlock = screen.getByRole('code')
      expect(codeBlock).toBeInTheDocument()
    })

    it('should provide meaningful button labels', () => {
      const longSvgString = `<svg>${'<path d="M10 10"/>'.repeat(20)}</svg>`
      
      render(<SvgCodeViewer svgString={longSvgString} />)
      
      const expandButton = screen.getByRole('button', { name: /show more/i })
      expect(expandButton).toBeInTheDocument()
    })

    it('should support screen readers', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />)
      
      const codeBlock = screen.getByTestId('svg-code-block')
      expect(codeBlock).toHaveAttribute('aria-label', 'SVG source code')
    })
  })

  describe('performance', () => {
    it('should handle very large SVG strings', () => {
      const veryLargeSvg = `<svg>${'<path d="M10 10 L20 20"/>'.repeat(1000)}</svg>`
      
      expect(() => {
        render(<SvgCodeViewer svgString={veryLargeSvg} />)
      }).not.toThrow()
    })

    it('should efficiently truncate large strings', () => {
      const largeSvg = `<svg>${'<path d="M10 10 L20 20"/>'.repeat(100)}</svg>`
      
      const { rerender } = render(<SvgCodeViewer svgString={largeSvg} />)
      
      // Should render quickly even with large input
      expect(screen.getByTestId('svg-code-block')).toBeInTheDocument()
      
      // Should handle updates efficiently
      rerender(<SvgCodeViewer svgString={mockSvgString} />)
      expect(screen.getByTestId('svg-code-block')).toBeInTheDocument()
    })
  })
})