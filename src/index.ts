export { maskName, maskNameValue, maskNames } from "./maskName.js";
export type {
  MaskNameOptions,
  MaskNameResult,
  MaskNameResultWithoutOriginal,
  ScriptType,
  SeparatorMode,
  SupportedLocale,
} from "./types.js";

// Utils — exported for consumers who want granular access
export { detectScript, isCJKCharacter, CJK_RANGES } from "./utils/detectScript.js";
export { maskSegment } from "./utils/maskSegment.js";
export type { MaskSegmentOptions } from "./utils/maskSegment.js";
