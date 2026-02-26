/**
 * Options for masking a single name segment.
 */
export interface MaskSegmentOptions {
  /** Character used for masking. Must be exactly 1 character. */
  char: string;

  /** Number of characters to reveal at the start. */
  visibleStart: number;

  /** Number of characters to reveal at the end. */
  visibleEnd: number;

  /**
   * Whether to process the segment as CJK (character-level splitting).
   * If false, the segment is treated as a Latin word.
   */
  isCJK: boolean;
}

/**
 * Clamps visibleStart and visibleEnd so they never overlap or exceed
 * the segment length. Always guarantees at least 1 visible character.
 *
 * Rules:
 * - visibleStart is clamped to at most half the segment length (floor)
 * - visibleEnd is clamped so start + end never exceeds total length
 * - For segments of length 1, the single character is always revealed
 */
function clampVisible(
  len: number,
  visibleStart: number,
  visibleEnd: number
): { start: number; end: number } {
  if (len <= 1) return { start: 1, end: 0 };

  // Always reserve at least 1 character in the middle for masking.
  // So the maximum combined reveal is len - 1.
  let start = Math.max(0, Math.min(visibleStart, Math.floor(len / 2)));
  let end = Math.max(0, Math.min(visibleEnd, len - start - 1));

  // If start alone already fills the budget, pull it back and zero end
  if (start >= len - 1) {
    start = len - 1;
    end = 0;
  }

  // If both are 0 somehow, reveal at least the first character
  if (start === 0 && end === 0) return { start: 1, end: 0 };

  return { start, end };
}

/**
 * Masks a single name segment by revealing the first N and last M characters
 * and replacing the rest with the mask character.
 *
 * Uses `[...segment]` spread to correctly handle multi-byte Unicode characters
 * (e.g. CJK codepoints, emoji) as single units rather than UTF-16 code units.
 *
 * @example
 * // Latin
 * maskSegment("Prasetia", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false })
 * // → "P*****ia"
 *
 * // Latin — short word
 * maskSegment("Eka", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false })
 * // → "E**"
 *
 * // CJK
 * maskSegment("田中さくら", { char: "*", visibleStart: 1, visibleEnd: 1, isCJK: true })
 * // → "田***ら"
 *
 * // CJK — 2-char name
 * maskSegment("张伟", { char: "*", visibleStart: 1, visibleEnd: 0, isCJK: true })
 * // → "张*"
 */
export function maskSegment(
  segment: string,
  options: MaskSegmentOptions
): string {
  const { char, visibleStart, visibleEnd, isCJK } = options;

  // Spread into array to handle multi-byte chars correctly
  const chars = [...segment];
  const len = chars.length;

  if (len === 0) return "";

  const { start, end } = clampVisible(len, visibleStart, visibleEnd);

  return chars
    .map((c, i) => {
      if (i < start) return c;           // reveal start
      if (end > 0 && i >= len - end) return c; // reveal end
      return char;                        // mask middle
    })
    .join("");
}