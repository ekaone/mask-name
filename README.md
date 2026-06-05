# @ekaone/mask-name

> A lightweight, zero-dependency TypeScript utility to mask personal names for privacy protection. Supports Latin, Chinese, and Japanese scripts with customizable masking options.

Part of the [mask-suite](#related-packages) family alongside `mask-email`, `mask-phone`, `mask-card`, and `mask-token`.

[![npm version](https://img.shields.io/npm/v/@ekaone/mask-name.svg)](https://www.npmjs.com/package/@ekaone/mask-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

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

## Quick Start

```ts
import { maskName, maskNameValue, maskNames } from "@ekaone/mask-name";

maskName("Eka Prasetia");
// -> { masked: "E*a P*****ia", script: "latin", original: "Eka Prasetia" }

maskName("张伟", { locale: "zh" });
// -> { masked: "张*", script: "cjk", original: "张伟" }

maskName("田中さくら", { locale: "ja" });
// -> { masked: "田**くら", script: "cjk", original: "田中さくら" }

maskNameValue("Eka Prasetia");
// -> "E*a P*****ia"

maskNames(["Eka Prasetia", "Madonna"]);
// -> [{ masked: "E*a P*****ia", ... }, { masked: "M****na", ... }]
```

## API

### `maskName(name, options?)`

Masks one name and returns metadata about the masking operation.

```ts
maskName("Eka Prasetia");
// -> { masked: "E*a P*****ia", script: "latin", original: "Eka Prasetia" }
```

### `maskNameValue(name, options?)`

Returns only the masked string.

```ts
maskNameValue("Eka Prasetia");
// -> "E*a P*****ia"
```

### `maskNames(names, options?)`

Masks multiple names with the same options and preserves input order.

```ts
maskNames(["Eka Prasetia", "Madonna"], { includeOriginal: false });
// -> [{ masked: "E*a P*****ia", script: "latin" }, { masked: "M****na", script: "latin" }]
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `char` | `string` | `"*"` | Single character used for masking |
| `visibleStart` | `number` | `1` | Number of characters to reveal at the start of each segment |
| `visibleEnd` | `number` | `2` | Number of characters to reveal at the end of each segment |
| `locale` | `"auto" \| "en" \| "zh" \| "ja"` | `"auto"` | Script hint for detection or forced processing |
| `preserveSpacing` | `boolean` | `true` | Preserve original whitespace between name segments |
| `separatorMode` | `"whitespace" \| "name"` | `"whitespace"` | Split only on whitespace, or also split on common name separators |
| `includeOriginal` | `boolean` | `true` | Include the raw input name in the result |

## Privacy-Safe Output

Use `includeOriginal: false` when downstream code should avoid carrying raw personal data.

```ts
maskName("Eka Prasetia", { includeOriginal: false });
// -> { masked: "E*a P*****ia", script: "latin" }
```

## Separator Modes

The default `separatorMode: "whitespace"` preserves the existing behavior.

```ts
maskName("Jean-Claude");
// -> { masked: "J********de", ... }
```

Use `separatorMode: "name"` to preserve and split around common name separators such as hyphens, apostrophes, periods, middle dots, and Japanese interpuncts.

```ts
maskName("Jean-Claude", { separatorMode: "name" });
// -> { masked: "J*an-C***de", ... }

maskName("O'Connor", { separatorMode: "name" });
// -> { masked: "O'C***or", ... }

maskName("J. R. R. Tolkien", { separatorMode: "name" });
// -> { masked: "J. R. R. T****en", ... }

maskName("山田・太郎", { separatorMode: "name" });
// -> { masked: "山*・太*", script: "cjk", ... }
```

## Script Examples

```ts
maskName("Prasetia", { visibleStart: 2, visibleEnd: 0 });
// -> { masked: "Pr******", ... }

maskName("李小龙", { locale: "zh", visibleStart: 1, visibleEnd: 1 });
// -> { masked: "李*龙", ... }

maskName("さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
// -> { masked: "さ*ら", ... }

maskName("John 田中", { visibleStart: 1, visibleEnd: 1 });
// -> { masked: "J**n 田*", script: "cjk", ... }
```

## Utility Exports

```ts
import {
  CJK_RANGES,
  detectScript,
  isCJKCharacter,
  maskSegment,
} from "@ekaone/mask-name";

detectScript("田中さくら"); // -> "cjk"
detectScript("Eka Prasetia"); // -> "latin"
isCJKCharacter("田"); // -> true

maskSegment("Prasetia", {
  char: "*",
  visibleStart: 1,
  visibleEnd: 2,
  isCJK: false,
});
// -> "P*****ia"
```

## TypeScript

Full TypeScript support is included. No `@types` package is needed.

```ts
import type {
  MaskNameOptions,
  MaskNameResult,
  MaskNameResultWithoutOriginal,
  ScriptType,
  SeparatorMode,
  SupportedLocale,
} from "@ekaone/mask-name";
```

## Behavior Notes

Short segments of 1 character are always revealed. For 2-character segments, at least 1 character is always shown.

CJK auto-detection treats the string as CJK when any CJK character is present. This handles mixed-script names like `"John 田中"`.

When `preserveSpacing: false` is used with the default whitespace separator mode, leading/trailing whitespace is trimmed and multiple spaces collapse to one space.

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
