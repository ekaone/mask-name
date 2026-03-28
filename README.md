# @ekaone/mask-name

> A lightweight, zero-dependency utility to mask personal names for privacy protection. Supports **Latin**, **Chinese**, and **Japanese** scripts with fully customizable options.

Part of the [mask-suite](#related-packages) family alongside `mask-email`, `mask-phone`, `mask-card` and `mask-token`.

[![npm version](https://img.shields.io/npm/v/@ekaone/mask-name.svg)](https://www.npmjs.com/package/@ekaone/mask-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)


---

## Installation

```bash
pnpm add @ekaone/mask-name
# or
npm install @ekaone/mask-name
# or
yarn add @ekaone/mask-name
# or
bun add @ekaone/mask-name
```

---

## Quick Start

```ts
import { maskName } from "@ekaone/mask-name";

maskName("Eka Prasetia");
// → { masked: "E*a P*****ia", script: "latin", original: "Eka Prasetia" }

maskName("张伟", { locale: "zh" });
// → { masked: "张*", script: "cjk", original: "张伟" }

maskName("田中さくら", { locale: "ja" });
// → { masked: "田**くら", script: "cjk", original: "田中さくら" }
```

---

## API

### `maskName(name, options?)`

| Parameter | Type             | Required | Description              |
|-----------|------------------|----------|--------------------------|
| `name`    | `string`         | ✅       | The name string to mask  |
| `options` | `MaskNameOptions`| ❌       | Configuration (see below)|

**Returns** a `MaskNameResult` object:

```ts
{
  masked: string;    // The masked name
  script: "latin" | "cjk"; // Detected or forced script
  original: string;  // Original input, untouched
}
```

---

## Options

| Option           | Type              | Default  | Description                                                  |
|------------------|-------------------|----------|--------------------------------------------------------------|
| `char`           | `string`          | `"*"`    | Single character used for masking                            |
| `visibleStart`   | `number`          | `1`      | Number of characters to reveal at the start of each segment |
| `visibleEnd`     | `number`          | `2`      | Number of characters to reveal at the end of each segment   |
| `locale`         | `SupportedLocale` | `"auto"` | Script hint: `"auto"` `"en"` `"zh"` `"ja"`                  |
| `preserveSpacing`| `boolean`         | `true`   | Preserve original whitespace between name segments          |

---

## Examples

### Custom mask character

```ts
maskName("Eka Prasetia", { char: "#" });
// → { masked: "E## ######ia", ... }

maskName("Eka Prasetia", { char: "-" });
// → { masked: "E-- ------ia", ... }
```

### Custom visible range

```ts
// Show 2 chars at start, none at end
maskName("Prasetia", { visibleStart: 2, visibleEnd: 0 });
// → { masked: "Pr******", ... }

// Show none at start, 3 chars at end
maskName("Prasetia", { visibleStart: 0, visibleEnd: 3 });
// → { masked: "*****tia", ... }
```

### Three-word names

```ts
maskName("Juan Carlos Rivera");
// → { masked: "J**n C****s R****ra", ... }
```

### Single-word name (mononym)

```ts
maskName("Madonna");
// → { masked: "M****na", ... }
```

### Chinese names

```ts
// 2-character name (surname + given)
maskName("张伟", { locale: "zh", visibleStart: 1, visibleEnd: 0 });
// → { masked: "张*", ... }

// 3-character name
maskName("李小龙", { locale: "zh", visibleStart: 1, visibleEnd: 1 });
// → { masked: "李*龙", ... }

// Auto-detection — no locale needed
maskName("张伟");
// → { masked: "张*", script: "cjk", ... }
```

### Japanese names

```ts
// Kanji + Hiragana
maskName("田中さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
// → { masked: "田***ら", ... }

// Pure Hiragana
maskName("さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
// → { masked: "さ*ら", ... }

// Pure Katakana
maskName("サクラ", { locale: "ja", visibleStart: 1, visibleEnd: 0 });
// → { masked: "サ**", ... }

// Spaced Japanese name (surname + given with space)
maskName("田中 さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
// → { masked: "田* さ**ら", ... }
```

### Mixed Latin + CJK

```ts
// Auto-detection kicks in — resolves to CJK mode
maskName("John 田中");
// → { masked: "J**n 田*", script: "cjk", ... }
```

### Accented / special Latin characters

```ts
maskName("José García");
// → { masked: "J**é G***ía", script: "latin", ... }
```

---

## Utility Exports

The internal utilities are also exported for power users who need granular access:

```ts
import { detectScript, isCJKCharacter, maskSegment } from "@ekaone/mask-name";

detectScript("田中さくら");   // → "cjk"
detectScript("Eka Prasetia"); // → "latin"

isCJKCharacter("田"); // → true
isCJKCharacter("A");  // → false

maskSegment("Prasetia", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false });
// → "P*****ia"
```

---

## Behavior Notes

**Short segments** — for segments of 1 character, the character is always revealed regardless of `visibleStart`/`visibleEnd`. For 2-character segments, at least 1 character is always shown.

**CJK auto-detection** — if any character in the input is CJK (Kanji, Hiragana, Katakana, or CJK Unified Ideographs), the entire string is processed in CJK mode (character-level splitting). This handles mixed-script names like `"John 田中"` gracefully.

**`preserveSpacing: false`** — strips leading/trailing whitespace and collapses multiple spaces between segments to a single space.

**CJK + spaces** — some East Asian names include a space between surname and given name (e.g. `"田中 さくら"`). `maskName` handles this correctly by masking each segment independently while preserving the space.

---

## TypeScript

Full TypeScript support is included. No `@types` package needed.

```ts
import type { MaskNameOptions, MaskNameResult, ScriptType, SupportedLocale } from "@ekaone/mask-name";
```

---

## License

MIT © Eka Prasetia

## Links

- [NPM Package](https://www.npmjs.com/package/@ekaone/mask-name)
- [GitHub Repository](https://github.com/ekaone/mask-name)
- [Issue Tracker](https://github.com/ekaone/mask-name/issues)

## Related Packages

- [Credit card masking library](https://github.com/ekaone/mask-card)
- [Token masking library](https://github.com/ekaone/mask-token)
- [Phone masking library](https://github.com/ekaone/mask-phone)
- [Email masking library](https://github.com/ekaone/mask-email)

---

⭐ If this library helps you, please consider giving it a star on GitHub!