# Changelog

## Unreleased

### Added

- Added `includeOriginal: false` to omit raw personal data from `maskName()` results.
- Added `MaskNameResultWithoutOriginal` and `SeparatorMode` exports.
- Added `maskNameValue()` for callers that only need the masked string.
- Added `maskNames()` for batch masking with shared options.
- Added `separatorMode: "name"` to split and preserve common name separators such as hyphens, apostrophes, periods, middle dots, and Japanese interpuncts.

### Changed

- Rewrote README examples with readable UTF-8 CJK samples and documentation for the new privacy and separator options.
