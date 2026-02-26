import { MaskNameOptions, MaskNameResult, ScriptType } from "./types";
import { detectScript } from "./utils/detectScript";
import { maskSegment } from "./utils/maskSegment";

/**
 * Masks a name string with configurable options.
 *
 * @example
 * maskName("Eka Prasetia")
 * // → { masked: "E** ******ia", script: "latin", original: "Eka Prasetia" }
 *
 * maskName("张伟", { locale: "zh" })
 * // → { masked: "张*", script: "cjk", original: "张伟" }
 *
 * maskName("田中さくら", { locale: "ja", visibleEnd: 1 })
 * // → { masked: "田***ら", script: "cjk", original: "田中さくら" }
 */
export function maskName(
  name: string,
  options: MaskNameOptions = {}
): MaskNameResult {
  if (!name || typeof name !== "string") {
    throw new TypeError("maskName: expected a non-empty string");
  }

  const {
    char = "*",
    visibleStart = 1,
    visibleEnd = 2,
    locale = "auto",
    preserveSpacing = true,
  } = options;

  if (char.length !== 1) {
    throw new TypeError("maskName: 'char' option must be a single character");
  }

  // Determine script
  const script: ScriptType =
    locale === "zh" || locale === "ja"
      ? "cjk"
      : locale === "en"
      ? "latin"
      : detectScript(name);

  let masked: string;

  if (script === "cjk") {
    // For CJK: split on spaces if present (some Chinese names include a space
    // between surname and given name), otherwise treat as a single segment
    const hasSeparator = /\s/.test(name);

    if (hasSeparator) {
      // Split preserving the separators
      const parts = name.split(/(\s+)/);
      masked = parts
        .map((part) =>
          /^\s+$/.test(part)
            ? part
            : maskSegment(part, { char, visibleStart, visibleEnd, isCJK: true })
        )
        .join("");
    } else {
      masked = maskSegment(name, { char, visibleStart, visibleEnd, isCJK: true });
    }
  } else {
    // For Latin: split by whitespace, preserving the original separators
    if (preserveSpacing) {
      const parts = name.split(/(\s+)/);
      masked = parts
        .map((part) =>
          /^\s+$/.test(part)
            ? part
            : maskSegment(part, { char, visibleStart, visibleEnd, isCJK: false })
        )
        .join("");
    } else {
      masked = name
        .trim()
        .split(/\s+/)
        .map((word) => maskSegment(word, { char, visibleStart, visibleEnd, isCJK: false }))
        .join(" ");
    }
  }

  return {
    masked,
    script,
    original: name,
  };
}