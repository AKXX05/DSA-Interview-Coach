/**
 * Utility to format mathematical & LaTeX strings (e.g. constraints, complexities)
 * into clean, readable plain text with proper unicode math symbols and superscripts.
 */

export function formatMathText(text: string): string {
  if (!text) return "";

  let formatted = text;

  // Dictionary of characters for superscript replacement
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'N': 'ᴺ'
  };

  // Convert exponent notation (e.g. 10^5 -> 10⁵, 10^{9} -> 10⁹, 2^31 -> 2³¹)
  formatted = formatted.replace(/\^([0-9+\-nN]+|\{[0-9+\-nN]+\})/g, (_, p1) => {
    const cleanP1 = p1.replace(/[{}]/g, '');
    return cleanP1.split('').map((char: string) => superscripts[char] || char).join('');
  });

  // Replace standard LaTeX comparison & math operators
  formatted = formatted
    .replace(/\\le\b|\\leq\b/g, "≤")
    .replace(/\\ge\b|\\geq\b/g, "≥")
    .replace(/\\neq\b/g, "≠")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\times\b/g, "×")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\log\b/g, "log")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sqrt\b/g, "√");

  // Remove LaTeX math inline dollar delimiters (e.g. $1 \le k \le 10^5$ -> 1 ≤ k ≤ 10⁵)
  formatted = formatted.replace(/\$([^$]+)\$/g, '$1');

  // Strip leftover standalone dollar signs and unescape backslashes
  formatted = formatted.replace(/\$/g, '').replace(/\\\\/g, '\\');

  return formatted.trim();
}
