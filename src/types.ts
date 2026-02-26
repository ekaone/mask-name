export type SupportedLocale = "auto" | "en" | "zh" | "ja";

export type ScriptType = "latin" | "cjk";

export interface MaskNameOptions {
  /**
   * Character used for masking.
   * @default "*"
   */
  char?: string;

  /**
   * Number of characters to reveal at the start of each name segment.
   * @default 1
   */
  visibleStart?: number;

  /**
   * Number of characters to reveal at the end of each name segment.
   * @default 2
   */
  visibleEnd?: number;

  /**
   * Locale hint for script detection.
   * - "auto" will detect based on Unicode ranges
   * - "en" forces Latin processing
   * - "zh" | "ja" forces CJK character-level processing
   * @default "auto"
   */
  locale?: SupportedLocale;

  /**
   * Preserve the original spacing/separator between name segments.
   * If false, segments are joined with a single space.
   * @default true
   */
  preserveSpacing?: boolean;
}

export interface MaskNameResult {
  /** The masked name string */
  masked: string;

  /** Detected or forced script type used for masking */
  script: ScriptType;

  /** Original input name */
  original: string;
}