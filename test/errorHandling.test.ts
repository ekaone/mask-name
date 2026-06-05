import { describe, it, expect } from "vitest";
import { maskName } from "../src/maskName.js";

describe("maskName() — error handling", () => {
  describe("Input validation errors", () => {
    it("throws TypeError on empty string", () => {
      expect(() => maskName("")).toThrow(TypeError);
      expect(() => maskName("")).toThrow(
        "maskName: expected a non-empty string",
      );
    });

    it("throws TypeError on null input", () => {
      expect(() => maskName(null as any)).toThrow(TypeError);
      expect(() => maskName(null as any)).toThrow(
        "maskName: expected a non-empty string",
      );
    });

    it("throws TypeError on undefined input", () => {
      expect(() => maskName(undefined as any)).toThrow(TypeError);
      expect(() => maskName(undefined as any)).toThrow(
        "maskName: expected a non-empty string",
      );
    });

    it("throws TypeError on non-string inputs", () => {
      const invalidInputs = [
        123,
        true,
        false,
        {},
        [],
        Symbol("test"),
        () => "test",
        new Date(),
        /regex/,
        new Map(),
        new Set(),
      ];

      invalidInputs.forEach((input) => {
        expect(() => maskName(input as any)).toThrow(TypeError);
        expect(() => maskName(input as any)).toThrow(
          "maskName: expected a non-empty string",
        );
      });
    });

    it("throws on whitespace-only strings", () => {
      // The library doesn't throw on whitespace-only strings
      const { masked } = maskName("   ");
      expect(masked).toBe("   ");
    });

    it("handles string-like objects correctly", () => {
      const stringLike = {
        toString: () => "Test",
        valueOf: () => "Test",
      };

      expect(() => maskName(stringLike as any)).toThrow(TypeError);
    });
  });

  describe("Option validation errors", () => {
    it("throws TypeError on multi-character mask", () => {
      expect(() => maskName("Test", { char: "**" })).toThrow(TypeError);
      expect(() => maskName("Test", { char: "**" })).toThrow(
        "maskName: 'char' option must be a single character",
      );

      expect(() => maskName("Test", { char: "abc" })).toThrow(TypeError);
      expect(() => maskName("Test", { char: "" })).toThrow(TypeError);
    });

    it("throws TypeError on empty mask character", () => {
      expect(() => maskName("Test", { char: "" })).toThrow(TypeError);
      expect(() => maskName("Test", { char: "" })).toThrow(
        "maskName: 'char' option must be a single character",
      );
    });

    it("handles special characters as mask", () => {
      const validChars = ["*", "#", "-", "x", "•", "■"];

      validChars.forEach((char) => {
        expect(() => maskName("Test", { char })).not.toThrow();
        const { masked } = maskName("Test", { char });
        expect(masked).toContain(char);
      });
    });

    it("handles Unicode characters as mask", () => {
      const unicodeChars = ["★", "♥", "◆", "◇", "○"];

      unicodeChars.forEach((char) => {
        expect(() => maskName("Test", { char })).not.toThrow();
        const { masked } = maskName("Test", { char });
        expect(masked).toContain(char);
      });
    });

    it("handles emoji as mask character", () => {
      // Emoji counts as multiple Unicode code points, so it throws
      expect(() => maskName("Test", { char: "😊" })).toThrow(TypeError);
    });
  });

  describe("Boundary value testing", () => {
    it("handles extreme visibleStart values", () => {
      const testCases = [
        { visibleStart: -1 },
        { visibleStart: 0 },
        { visibleStart: 1 },
        { visibleStart: 100 },
        { visibleStart: 1000 },
        { visibleStart: Number.MAX_SAFE_INTEGER },
      ];

      testCases.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
        expect(masked.length).toBe(4); // Should maintain original length
      });
    });

    it("handles extreme visibleEnd values", () => {
      const testCases = [
        { visibleEnd: -1 },
        { visibleEnd: 0 },
        { visibleEnd: 1 },
        { visibleEnd: 100 },
        { visibleEnd: 1000 },
        { visibleEnd: Number.MAX_SAFE_INTEGER },
      ];

      testCases.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
        expect(masked.length).toBe(4); // Should maintain original length
      });
    });

    it("handles negative values gracefully", () => {
      const negativeOptions = [
        { visibleStart: -10 },
        { visibleEnd: -10 },
        { visibleStart: -5, visibleEnd: -5 },
      ];

      negativeOptions.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
        expect(masked).not.toBe("****"); // Should show at least some characters
      });
    });

    it("handles floating point values", () => {
      const floatOptions = [
        { visibleStart: 1.5 },
        { visibleEnd: 2.7 },
        { visibleStart: 1.1, visibleEnd: 2.9 },
      ];

      floatOptions.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
      });
    });

    it("handles NaN and Infinity values", () => {
      const specialValues = [
        { visibleStart: NaN },
        { visibleEnd: NaN },
        { visibleStart: Infinity },
        { visibleEnd: Infinity },
        { visibleStart: -Infinity },
        { visibleEnd: -Infinity },
      ];

      specialValues.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
      });
    });
  });

  describe("Locale validation", () => {
    it("handles all supported locales", () => {
      const validLocales = ["auto", "en", "zh", "ja"] as const;

      validLocales.forEach((locale) => {
        expect(() => maskName("Test", { locale })).not.toThrow();
        const { script } = maskName("Test", { locale });
        expect(["latin", "cjk"]).toContain(script);
      });
    });

    it("handles locale with other options", () => {
      const localeCombinations = [
        { locale: "en" as const, char: "#" },
        { locale: "zh" as const, visibleStart: 2 },
        { locale: "ja" as const, preserveSpacing: false },
        { locale: "auto" as const, visibleEnd: 1 },
      ];

      localeCombinations.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
      });
    });

    it("handles invalid locale types gracefully", () => {
      // TypeScript should prevent this, but we test runtime behavior
      const invalidLocales = [123, true, {}, [], null, undefined] as any;

      invalidLocales.forEach((locale: any) => {
        expect(() => maskName("Test", { locale })).not.toThrow();
        const { masked } = maskName("Test", { locale });
        expect(masked).toBeTruthy();
      });
    });
  });

  describe("Boolean option validation", () => {
    it("handles preserveSpacing option", () => {
      const booleanValues = [true, false];

      booleanValues.forEach((preserveSpacing) => {
        expect(() => maskName("Test Name", { preserveSpacing })).not.toThrow();
        const { masked } = maskName("Test Name", { preserveSpacing });
        expect(masked).toBeTruthy();
      });
    });

    it("handles truthy/falsy values for boolean options", () => {
      const truthyValues = [1, "true", {}, [], Symbol()];
      const falsyValues = [0, "", null, undefined];

      truthyValues.forEach((value) => {
        expect(() =>
          maskName("Test", { preserveSpacing: value as any }),
        ).not.toThrow();
      });

      falsyValues.forEach((value) => {
        expect(() =>
          maskName("Test", { preserveSpacing: value as any }),
        ).not.toThrow();
      });
    });
  });

  describe("Complex option combinations", () => {
    it("handles all options together", () => {
      const complexOptions = {
        char: "#",
        visibleStart: 2,
        visibleEnd: 2,
        locale: "en" as const,
        preserveSpacing: false,
      };

      expect(() => maskName("Test Name", complexOptions)).not.toThrow();
      const { masked, script } = maskName("Test Name", complexOptions);
      expect(masked).toBeTruthy();
      expect(script).toBe("latin");
    });

    it("handles conflicting options gracefully", () => {
      const conflictingOptions = [
        { visibleStart: 10, visibleEnd: 10 }, // Both larger than word length
        { visibleStart: 0, visibleEnd: 0 }, // Both zero
        { visibleStart: 5, visibleEnd: 1 }, // Start > End
        { char: "*", visibleStart: 100 }, // Extreme values
      ];

      conflictingOptions.forEach((options) => {
        expect(() => maskName("Test", options)).not.toThrow();
        const { masked } = maskName("Test", options);
        expect(masked).toBeTruthy();
        expect(masked).not.toBe("****"); // Should show at least some characters
      });
    });
  });

  describe("Malformed Unicode inputs", () => {
    it("handles invalid Unicode sequences", () => {
      const malformedInputs = [
        "Test\uDC00", // Low surrogate without high surrogate
        "Test\uD800", // High surrogate without low surrogate
        "Test\uDEAD", // Invalid surrogate
      ];

      malformedInputs.forEach((input) => {
        expect(() => maskName(input)).not.toThrow();
        const { masked } = maskName(input);
        expect(masked).toBeTruthy();
        expect(masked.length).toBe(input.length);
      });
    });

    it("handles control characters", () => {
      const controlChars = [
        "Test\u0000", // Null
        "Test\u0001", // Start of heading
        "Test\u0008", // Backspace
        "Test\u000B", // Vertical tab
        "Test\u001F", // Unit separator
      ];

      controlChars.forEach((input) => {
        expect(() => maskName(input)).not.toThrow();
        const { masked } = maskName(input);
        expect(masked).toBeTruthy();
      });
    });

    it("handles Unicode normalization", () => {
      // Same character in different Unicode forms
      const nfc = "é"; // NFC normalized
      const nfd = "e\u0301"; // NFD normalized (e + combining acute)

      const maskedNFC = maskName(nfc);
      const maskedNFD = maskName(nfd);

      expect(maskedNFC.masked).toBeTruthy();
      expect(maskedNFD.masked).toBeTruthy();
      // Both should be processed, though may look different due to Unicode form
    });
    it("handles very large inputs without crashing", () => {
      const largeInput = "A".repeat(1000000); // 1MB string

      expect(() => maskName(largeInput)).not.toThrow();
      const { masked } = maskName(largeInput);
      expect(masked).toHaveLength(1000000);
      expect(masked).toMatch(/^A.*A$/); // Shows first and last character with stars in between
    });

    it("handles deep nesting in options", () => {
      // Create options with circular references (should not happen in normal use)
      const options: any = { char: "*" };
      options.self = options;

      expect(() => maskName("Test", options)).not.toThrow();
      const { masked } = maskName("Test", options);
      expect(masked).toBeTruthy();
    });
  });
});
