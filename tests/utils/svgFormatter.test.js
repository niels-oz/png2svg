import { formatSvgString } from '../../src/utils/svgFormatter';

describe('SVG Formatter', () => {
  describe('formatSvgString', () => {
    it('should format single line SVG into multiple lines', () => {
      const singleLineSvg = '<svg><rect x="0" y="0" width="100" height="100"/></svg>';
      const expected = '<svg>\n  <rect x="0" y="0" width="100" height="100"/>\n</svg>';
      
      const result = formatSvgString(singleLineSvg);
      expect(result).toBe(expected);
    });

    it('should handle nested SVG elements with proper indentation', () => {
      const nestedSvg = '<svg><g><rect x="0" y="0" width="100" height="100"/></g></svg>';
      const expected = '<svg>\n  <g>\n    <rect x="0" y="0" width="100" height="100"/>\n  </g>\n</svg>';
      
      const result = formatSvgString(nestedSvg);
      expect(result).toBe(expected);
    });

    it('should handle self-closing tags properly', () => {
      const selfClosingSvg = '<svg><rect x="0" y="0" width="100" height="100"/><circle cx="50" cy="50" r="25"/></svg>';
      const expected = '<svg>\n  <rect x="0" y="0" width="100" height="100"/>\n  <circle cx="50" cy="50" r="25"/>\n</svg>';
      
      const result = formatSvgString(selfClosingSvg);
      expect(result).toBe(expected);
    });

    it('should handle complex SVG with paths and attributes', () => {
      const complexSvg = '<svg viewBox="0 0 100 100"><path d="M10 10 L90 90"/><text x="50" y="50">Test</text></svg>';
      const expected = '<svg viewBox="0 0 100 100">\n  <path d="M10 10 L90 90"/>\n  <text x="50" y="50">Test</text>\n</svg>';
      
      const result = formatSvgString(complexSvg);
      expect(result).toBe(expected);
    });

    it('should handle empty SVG', () => {
      const emptySvg = '<svg></svg>';
      const expected = '<svg></svg>';
      
      const result = formatSvgString(emptySvg);
      expect(result).toBe(expected);
    });

    it('should handle invalid input gracefully', () => {
      expect(formatSvgString('')).toBe('');
      expect(formatSvgString(null)).toBe('');
      expect(formatSvgString(undefined)).toBe('');
    });

    it('should respect custom indent size', () => {
      const svg = '<svg><rect x="0" y="0" width="100" height="100"/></svg>';
      const expected = '<svg>\n    <rect x="0" y="0" width="100" height="100"/>\n</svg>';
      
      const result = formatSvgString(svg, { indentSize: 4 });
      expect(result).toBe(expected);
    });

    it('should handle long attribute lists', () => {
      const svgWithLongAttrs = '<svg><rect x="0" y="0" width="100" height="100" fill="red" stroke="blue" stroke-width="2"/></svg>';
      const result = formatSvgString(svgWithLongAttrs);
      
      expect(result).toContain('rect x="0" y="0" width="100" height="100" fill="red" stroke="blue" stroke-width="2"');
      expect(result).toContain('\n  <rect');
    });
  });
});