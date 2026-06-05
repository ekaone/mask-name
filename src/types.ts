export type SupportedLocale = "auto" | "en" | "zh" | "ja";

export type ScriptType = "latin" | "cjk";

export type SeparatorMode = "whitespace" | "name";

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

  /**
   * Controls how name segments are split before masking.
   * - "whitespace" keeps the original behavior and splits only on whitespace
   * - "name" also splits on common name separators like hyphens, apostrophes,
   *   periods, middle dots, and Japanese interpuncts
   * @default "whitespace"
   */
  separatorMode?: SeparatorMode;

  /**
   * Include the original input in the returned object.
   * Set to false when callers should avoid carrying raw personal data forward.
   * @default true
   */
  includeOriginal?: boolean;
}

export interface MaskNameResult {
  /** The masked name string */
  masked: string;

  /** Detected or forced script type used for masking */
  script: ScriptType;

  /** Original input name */
  original: string;
}

export interface MaskNameResultWithoutOriginal {
  /** The masked name string */
  masked: string;

  /** Detected or forced script type used for masking */
  script: ScriptType;
}
