import { ScriptType } from "../types.js";

/**
 * Unicode ranges used to identify CJK characters.
 * Each entry is a [start, end] code point range (inclusive).
 */
export const CJK_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x4e00, 0x9fff],  // CJK Unified Ideographs — core Han (Chinese/Japanese Kanji)
  [0x3040, 0x309f],  // Hiragana
  [0x30a0, 0x30ff],  // Katakana
  [0x3400, 0x4dbf],  // CJK Unified Ideographs Extension A
  [0xf900, 0xfaff],  // CJK Compatibility Ideographs
  [0x20000, 0x2a6df], // CJK Unified Ideographs Extension B (rare, but worth covering)
];

/**
 * Returns true if a single character falls within any CJK Unicode range.
 */
export function isCJKCharacter(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return CJK_RANGES.some(([start, end]) => code >= start && code <= end);
}

/**
 * Detects the dominant script type of a name string.
 *
 * Strategy: scan each character — if ANY character is CJK, treat the
 * whole string as CJK. This handles mixed-script names like "田中Kenji"
 * by defaulting to CJK-level (character-by-character) processing.
 *
 * @example
 * detectScript("Eka Prasetia") // → "latin"
 * detectScript("张伟")          // → "cjk"
 * detectScript("田中さくら")     // → "cjk"
 * detectScript("John 田中")     // → "cjk"
 */
export function detectScript(name: string): ScriptType {
  for (const char of name) {
    if (isCJKCharacter(char)) return "cjk";
  }
  return "latin";
}