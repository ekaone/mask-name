export { maskName } from "./maskName";
export type { MaskNameOptions, MaskNameResult, ScriptType, SupportedLocale } from "./types";

// Utils — exported for consumers who want granular access
export { detectScript, isCJKCharacter, CJK_RANGES } from "./utils/detectScript";
export { maskSegment } from "./utils/maskSegment";
export type { MaskSegmentOptions } from "./utils/maskSegment";