import {
  MaskNameOptions,
  MaskNameResult,
  MaskNameResultWithoutOriginal,
  ScriptType,
} from "./types.js";
import { detectScript } from "./utils/detectScript.js";
import { maskSegment } from "./utils/maskSegment.js";

type ResolvedSeparatorMode = "whitespace" | "name";

const NAME_SEPARATOR_PATTERN = /([\s.'’·・-]+)/;

function isSeparator(part: string, separatorMode: ResolvedSeparatorMode): boolean {
  return separatorMode === "name"
    ? /^[\s.'’·・-]+$/.test(part)
    : /^\s+$/.test(part);
}

function maskSplitName(
  name: string,
  options: {
    char: string;
    visibleStart: number;
    visibleEnd: number;
    isCJK: boolean;
    separatorMode: ResolvedSeparatorMode;
  }
): string {
  const { char, visibleStart, visibleEnd, isCJK, separatorMode } = options;
  const splitPattern =
    separatorMode === "name" ? NAME_SEPARATOR_PATTERN : /(\s+)/;

  return name
    .split(splitPattern)
    .map((part) =>
      part === "" || isSeparator(part, separatorMode)
        ? part
        : maskSegment(part, { char, visibleStart, visibleEnd, isCJK })
    )
    .join("");
}

/**
 * Masks a name string with configurable options.
 *
 * @example
 * maskName("Eka Prasetia")
 * // -> { masked: "E*a P*****ia", script: "latin", original: "Eka Prasetia" }
 */
export function maskName(
  name: string,
  options: MaskNameOptions & { includeOriginal: false }
): MaskNameResultWithoutOriginal;
export function maskName(
  name: string,
  options?: MaskNameOptions
): MaskNameResult;
export function maskName(
  name: string,
  options: MaskNameOptions = {}
): MaskNameResult | MaskNameResultWithoutOriginal {
  if (!name || typeof name !== "string") {
    throw new TypeError("maskName: expected a non-empty string");
  }

  const {
    char = "*",
    visibleStart = 1,
    visibleEnd = 2,
    locale = "auto",
    preserveSpacing = true,
    separatorMode = "whitespace",
    includeOriginal = true,
  } = options;

  if (char.length !== 1) {
    throw new TypeError("maskName: 'char' option must be a single character");
  }

  const script: ScriptType =
    locale === "zh" || locale === "ja"
      ? "cjk"
      : locale === "en"
        ? "latin"
        : detectScript(name);

  let masked: string;

  if (script === "cjk") {
    const separatorPattern =
      separatorMode === "name" ? NAME_SEPARATOR_PATTERN : /\s/;

    if (separatorPattern.test(name)) {
      masked = maskSplitName(name, {
        char,
        visibleStart,
        visibleEnd,
        isCJK: true,
        separatorMode,
      });
    } else {
      masked = maskSegment(name, { char, visibleStart, visibleEnd, isCJK: true });
    }
  } else if (separatorMode === "name" || preserveSpacing) {
    masked = maskSplitName(name, {
      char,
      visibleStart,
      visibleEnd,
      isCJK: false,
      separatorMode,
    });
  } else {
    masked = name
      .trim()
      .split(/\s+/)
      .map((word) =>
        maskSegment(word, { char, visibleStart, visibleEnd, isCJK: false })
      )
      .join(" ");
  }

  const result = { masked, script };

  return includeOriginal === false ? result : { ...result, original: name };
}

export function maskNameValue(
  name: string,
  options: MaskNameOptions = {}
): string {
  return maskName(name, options).masked;
}

export function maskNames(
  names: readonly string[],
  options: MaskNameOptions & { includeOriginal: false }
): MaskNameResultWithoutOriginal[];
export function maskNames(
  names: readonly string[],
  options?: MaskNameOptions
): MaskNameResult[];
export function maskNames(
  names: readonly string[],
  options: MaskNameOptions = {}
): Array<MaskNameResult | MaskNameResultWithoutOriginal> {
  return names.map((name) => maskName(name, options));
}
