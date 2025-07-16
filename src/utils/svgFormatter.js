/**
 * Formats SVG strings with proper indentation and line breaks
 * @param {string} svgString - The SVG string to format
 * @param {Object} options - Formatting options
 * @param {number} options.indentSize - Number of spaces for indentation (default: 2)
 * @param {boolean} options.preserveWhitespace - Whether to preserve xml:space="preserve" content (default: true)
 * @returns {string} Formatted SVG string
 */
export function formatSvgString(svgString, options = {}) {
  const {
    indentSize = 2,
    preserveWhitespace = true,
  } = options;

  // Handle invalid input
  if (!svgString || typeof svgString !== 'string') {
    return '';
  }

  // Clean up the SVG first
  let formatted = svgString.trim();

  // Preserve xml:space="preserve" content
  const preservedContent = new Map();
  if (preserveWhitespace) {
    formatted = formatted.replace(
      /(<[^>]*xml:space="preserve"[^>]*>)([\s\S]*?)(<\/[^>]*>)/g,
      (match, openTag, content, closeTag, offset) => {
        const key = `__PRESERVE_${offset}__`;
        preservedContent.set(key, content);
        return openTag + key + closeTag;
      }
    );
  }

  // Format the XML structure
  const PADDING = ' '.repeat(indentSize);
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;

  formatted = formatted.replace(reg, '$1\n$2$3');

  const lines = formatted.split('\n').map((node) => {
    let indent = 0;
    
    // Handle closing tags - decrease indent before applying
    if (node.match(/^<\/\w/) && pad > 0) {
      pad -= 1;
    }
    
    // Apply current indentation
    const result = PADDING.repeat(pad) + node;
    
    // Handle opening tags that are not self-closing and don't have closing tag on same line
    if (node.match(/^<\w[^>]*>$/) && !node.match(/\/>$/) && !node.match(/.+<\/\w[^>]*>$/)) {
      pad += 1;
    }
    
    return result;
  });

  formatted = lines.join('\n');
  
  // Fix empty tags formatting
  if (formatted === '<svg>\n</svg>') {
    formatted = '<svg></svg>';
  }

  // Restore preserved content
  if (preserveWhitespace) {
    preservedContent.forEach((content, key) => {
      formatted = formatted.replace(key, content);
    });
  }

  return formatted;
}