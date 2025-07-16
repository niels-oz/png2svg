import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SvgCodeViewer from '../../src/components/SvgCodeViewer';
import { vi } from 'vitest';

// Mock the clipboard hook
vi.mock('../../src/hooks/useClipboard', () => ({
  useClipboard: vi.fn(() => ({
    copyToClipboard: vi.fn().mockResolvedValue(true),
    state: 'READY',
    isSupported: true,
    isReady: true,
    isSuccess: false,
    isError: false,
    error: null,
  })),
}));

// Mock the SVG formatter
vi.mock('../../src/utils/svgFormatter', () => ({
  formatSvgString: vi.fn((svg) => svg.replace(/></g, '>\n<')),
}));

import { useClipboard } from '../../src/hooks/useClipboard';
import { formatSvgString } from '../../src/utils/svgFormatter';

describe('Enhanced SvgCodeViewer Component', () => {
  const mockSvgString = '<svg><rect x="0" y="0" width="100" height="100"/></svg>';
  const mockFormattedSvg = '<svg>\n  <rect x="0" y="0" width="100" height="100"/>\n</svg>';

  const mockUseClipboard = useClipboard;

  beforeEach(() => {
    vi.clearAllMocks();
    formatSvgString.mockReturnValue(mockFormattedSvg);
  });

  describe('formatting functionality', () => {
    it('should display formatted SVG code by default', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(formatSvgString).toHaveBeenCalledWith(mockSvgString);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toBe(mockFormattedSvg);
    });

    it('should show format toggle button', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText('Raw View')).toBeInTheDocument();
    });

    it('should toggle between formatted and raw view', async () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const toggleButton = screen.getByText('Raw View');
      await userEvent.click(toggleButton);
      
      expect(screen.getByText('Formatted View')).toBeInTheDocument();
      expect(screen.getByText(mockSvgString)).toBeInTheDocument();
    });

    it('should maintain accessibility in formatted mode', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const codeBlock = screen.getByRole('textbox');
      expect(codeBlock).toHaveAttribute('aria-label', 'SVG source code');
      expect(codeBlock).toHaveAttribute('aria-multiline', 'true');
    });
  });

  describe('copy functionality', () => {
    it('should display copy button', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText('Copy SVG')).toBeInTheDocument();
    });

    it('should copy formatted SVG to clipboard', async () => {
      const mockCopyToClipboard = vi.fn().mockResolvedValue(true);
      mockUseClipboard.mockReturnValue({
        copyToClipboard: mockCopyToClipboard,
        state: 'READY',
        isSupported: true,
        isReady: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const copyButton = screen.getByText('Copy SVG');
      await userEvent.click(copyButton);
      
      expect(mockCopyToClipboard).toHaveBeenCalledWith(mockFormattedSvg);
    });

    it('should copy raw SVG when in raw mode', async () => {
      const mockCopyToClipboard = vi.fn().mockResolvedValue(true);
      mockUseClipboard.mockReturnValue({
        copyToClipboard: mockCopyToClipboard,
        state: 'READY',
        isSupported: true,
        isReady: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      // Switch to raw mode
      const toggleButton = screen.getByText('Raw View');
      await userEvent.click(toggleButton);
      
      // Copy in raw mode
      const copyButton = screen.getByText('Copy SVG');
      await userEvent.click(copyButton);
      
      expect(mockCopyToClipboard).toHaveBeenCalledWith(mockSvgString);
    });

    it('should show success feedback after successful copy', async () => {
      mockUseClipboard.mockReturnValue({
        copyToClipboard: vi.fn().mockResolvedValue(true),
        state: 'SUCCESS',
        isSupported: true,
        isReady: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
    });

    it('should show error feedback after failed copy', async () => {
      mockUseClipboard.mockReturnValue({
        copyToClipboard: vi.fn().mockResolvedValue(false),
        state: 'ERROR',
        isSupported: true,
        isReady: false,
        isSuccess: false,
        isError: true,
        error: new Error('Copy failed'),
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText('✗ Copy Failed')).toBeInTheDocument();
    });

    it('should hide copy button when clipboard is not supported', () => {
      mockUseClipboard.mockReturnValue({
        copyToClipboard: vi.fn(),
        state: 'READY',
        isSupported: false,
        isReady: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.queryByText('Copy SVG')).not.toBeInTheDocument();
    });
  });

  describe('multiline display', () => {
    it('should display code in multiline textarea', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should not truncate long SVG strings', () => {
      const longSvg = 'a'.repeat(1000);
      formatSvgString.mockReturnValue(longSvg); // Mock to return the same long string
      render(<SvgCodeViewer svgString={longSvg} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toContain(longSvg);
    });

    it('should auto-resize textarea based on content', () => {
      const multiLineSvg = '<svg>\n  <rect/>\n  <circle/>\n</svg>';
      formatSvgString.mockReturnValue(multiLineSvg);
      
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle('height: auto');
    });
  });

  describe('keyboard accessibility', () => {
    it('should support keyboard navigation for copy button', async () => {
      const mockCopyToClipboard = vi.fn().mockResolvedValue(true);
      mockUseClipboard.mockReturnValue({
        copyToClipboard: mockCopyToClipboard,
        state: 'READY',
        isSupported: true,
        isReady: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const copyButton = screen.getByText('Copy SVG');
      copyButton.focus();
      
      await userEvent.keyboard('{Enter}');
      expect(mockCopyToClipboard).toHaveBeenCalled();
    });

    it('should support keyboard navigation for format toggle', async () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      const toggleButton = screen.getByText('Raw View');
      toggleButton.focus();
      
      await userEvent.keyboard('{Enter}');
      expect(screen.getByText('Formatted View')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle formatting errors gracefully', () => {
      formatSvgString.mockImplementation(() => {
        throw new Error('Format error');
      });

      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText(mockSvgString)).toBeInTheDocument();
    });

    it('should handle empty SVG string', () => {
      render(<SvgCodeViewer svgString="" />);
      
      expect(screen.getByText('No SVG code to display')).toBeInTheDocument();
    });

    it('should handle null SVG string', () => {
      render(<SvgCodeViewer svgString={null} />);
      
      expect(screen.getByText('No SVG code to display')).toBeInTheDocument();
    });
  });

  describe('quality indicator', () => {
    it('should display character count', () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText(`${mockSvgString.length} characters`)).toBeInTheDocument();
    });

    it('should update character count when switching modes', async () => {
      render(<SvgCodeViewer svgString={mockSvgString} />);
      
      expect(screen.getByText(`${mockSvgString.length} characters`)).toBeInTheDocument();
      
      const toggleButton = screen.getByText('Raw View');
      await userEvent.click(toggleButton);
      
      expect(screen.getByText(`${mockSvgString.length} characters`)).toBeInTheDocument();
    });
  });
});