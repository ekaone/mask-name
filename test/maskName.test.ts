import { describe, it, expect } from "vitest";
import { maskName } from "../src/maskName";
import { detectScript, isCJKCharacter } from "../src/utils/detectScript";
import { maskSegment } from "../src/utils/maskSegment";

// ---------------------------------------------------------------------------
// detectScript
// ---------------------------------------------------------------------------

describe("detectScript()", () => {
  describe("Latin detection", () => {
    it("detects a plain English name", () => {
      expect(detectScript("John")).toBe("latin");
    });

    it("detects a multi-word English name", () => {
      expect(detectScript("Eka Prasetia")).toBe("latin");
    });

    it("detects accented Latin characters as latin", () => {
      expect(detectScript("José García")).toBe("latin");
    });

    it("detects Arabic-script name as latin (no CJK)", () => {
      // Arabic is not CJK — falls through as "latin" in our current implementation
      expect(detectScript("محمد")).toBe("latin");
    });
  });

  describe("CJK detection", () => {
    it("detects Chinese characters", () => {
      expect(detectScript("张伟")).toBe("cjk");
    });

    it("detects Japanese Kanji", () => {
      expect(detectScript("田中")).toBe("cjk");
    });

    it("detects Japanese Hiragana", () => {
      expect(detectScript("さくら")).toBe("cjk");
    });

    it("detects Japanese Katakana", () => {
      expect(detectScript("サクラ")).toBe("cjk");
    });

    it("detects mixed Kanji + Hiragana", () => {
      expect(detectScript("田中さくら")).toBe("cjk");
    });

    it("detects mixed Latin + CJK as cjk", () => {
      expect(detectScript("John 田中")).toBe("cjk");
    });
  });
});

// ---------------------------------------------------------------------------
// isCJKCharacter
// ---------------------------------------------------------------------------

describe("isCJKCharacter()", () => {
  it("returns true for a Kanji character", () => {
    expect(isCJKCharacter("田")).toBe(true);
  });

  it("returns true for a Hiragana character", () => {
    expect(isCJKCharacter("さ")).toBe(true);
  });

  it("returns true for a Katakana character", () => {
    expect(isCJKCharacter("サ")).toBe(true);
  });

  it("returns false for a Latin character", () => {
    expect(isCJKCharacter("A")).toBe(false);
  });

  it("returns false for a digit", () => {
    expect(isCJKCharacter("9")).toBe(false);
  });

  it("returns false for a space", () => {
    expect(isCJKCharacter(" ")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// maskSegment
// ---------------------------------------------------------------------------

describe("maskSegment()", () => {
  describe("Latin segments", () => {
    it("masks middle characters of a normal word", () => {
      expect(
        maskSegment("Prasetia", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false })
      ).toBe("P*****ia");
    });

    it("masks a short 3-char word", () => {
      expect(
        maskSegment("Eka", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false })
      ).toBe("E*a");
    });

    it("never hides all chars on a 2-char word", () => {
      expect(
        maskSegment("Li", { char: "*", visibleStart: 1, visibleEnd: 2, isCJK: false })
      ).toBe("L*");
    });

    it("returns the single char as-is for a 1-char segment", () => {
      expect(
        maskSegment("A", { char: "*", visibleStart: 1, visibleEnd: 1, isCJK: false })
      ).toBe("A");
    });

    it("uses a custom mask character", () => {
      expect(
        maskSegment("Prasetia", { char: "#", visibleStart: 1, visibleEnd: 2, isCJK: false })
      ).toBe("P#####ia");
    });

    it("uses dash as mask character", () => {
      expect(
        maskSegment("Prasetia", { char: "-", visibleStart: 1, visibleEnd: 2, isCJK: false })
      ).toBe("P-----ia");
    });

    it("masks with visibleEnd: 0", () => {
      expect(
        maskSegment("Prasetia", { char: "*", visibleStart: 1, visibleEnd: 0, isCJK: false })
      ).toBe("P*******");
    });

    it("masks with visibleStart: 0", () => {
      expect(
        maskSegment("Prasetia", { char: "*", visibleStart: 0, visibleEnd: 2, isCJK: false })
      ).toBe("******ia");
    });

    it("handles visibleStart + visibleEnd larger than the word length gracefully", () => {
      // "Eka" is 3 chars, start=2, end=2 — should clamp and not throw
      const result = maskSegment("Eka", { char: "*", visibleStart: 2, visibleEnd: 2, isCJK: false });
      expect(result).toHaveLength(3);
      expect(result).not.toBe("***"); // at least 1 char must be visible
    });
  });

  describe("CJK segments", () => {
    it("masks a 2-char Chinese name", () => {
      expect(
        maskSegment("张伟", { char: "*", visibleStart: 1, visibleEnd: 0, isCJK: true })
      ).toBe("张*");
    });

    it("masks a 3-char Chinese name", () => {
      expect(
        maskSegment("李小龙", { char: "*", visibleStart: 1, visibleEnd: 1, isCJK: true })
      ).toBe("李*龙");
    });

    it("masks a 5-char Japanese name", () => {
      expect(
        maskSegment("田中さくら", { char: "*", visibleStart: 1, visibleEnd: 1, isCJK: true })
      ).toBe("田***ら");
    });

    it("returns the single char as-is for a 1-char CJK segment", () => {
      expect(
        maskSegment("田", { char: "*", visibleStart: 1, visibleEnd: 0, isCJK: true })
      ).toBe("田");
    });

    it("uses a custom mask character for CJK", () => {
      expect(
        maskSegment("张伟", { char: "-", visibleStart: 1, visibleEnd: 0, isCJK: true })
      ).toBe("张-");
    });
  });
});

// ---------------------------------------------------------------------------
// maskName — Latin names
// ---------------------------------------------------------------------------

describe("maskName() — Latin", () => {
  it("masks a single word name with defaults", () => {
    const { masked } = maskName("Eka");
    expect(masked).toBe("E*a");
  });

  it("masks a two-word name with defaults", () => {
    const { masked } = maskName("Eka Prasetia");
    expect(masked).toBe("E*a P*****ia");
  });

  it("returns the correct script type", () => {
    const { script } = maskName("Eka Prasetia");
    expect(script).toBe("latin");
  });

  it("returns the original name untouched", () => {
    const { original } = maskName("Eka Prasetia");
    expect(original).toBe("Eka Prasetia");
  });

  it("masks a single-word name", () => {
    const { masked } = maskName("Madonna");
    expect(masked).toBe("M****na");
  });

  it("masks a three-word name", () => {
    const { masked } = maskName("Juan Carlos Rivera");
    expect(masked).toBe("J*an C***os R***ra");
  });

  it("preserves multiple spaces between words", () => {
    const { masked } = maskName("Eka  Prasetia"); // double space
    expect(masked).toBe("E*a  P*****ia");
  });

  it("uses a custom mask character", () => {
    const { masked } = maskName("Eka Prasetia", { char: "#" });
    expect(masked).toBe("E#a P#####ia");
  });

  it("uses dash as mask character", () => {
    const { masked } = maskName("Eka Prasetia", { char: "-" });
    expect(masked).toBe("E-a P-----ia");
  });

  it("respects custom visibleStart", () => {
    const { masked } = maskName("Prasetia", { visibleStart: 2, visibleEnd: 0 });
    expect(masked).toBe("Pr******");
  });

  it("respects custom visibleEnd", () => {
    const { masked } = maskName("Prasetia", { visibleStart: 0, visibleEnd: 3 });
    expect(masked).toBe("*****tia");
  });

  it("respects both custom visibleStart and visibleEnd", () => {
    const { masked } = maskName("Prasetia", { visibleStart: 2, visibleEnd: 3 });
    expect(masked).toBe("Pr***tia");
  });

  it("forces latin script with locale: 'en'", () => {
    const { script } = maskName("Eka Prasetia", { locale: "en" });
    expect(script).toBe("latin");
  });

  it("handles a name with only one character per word gracefully", () => {
    const { masked } = maskName("A B");
    expect(masked).toBe("A B"); // single chars are always shown
  });

  it("handles accented characters", () => {
    const { masked, script } = maskName("José García");
    expect(script).toBe("latin");
    expect(masked).toBe("J*sé G***ía");
  });

  it("throws on empty string input", () => {
    expect(() => maskName("")).toThrow(TypeError);
  });

  it("throws on non-string input", () => {
    // @ts-expect-error — intentional bad input for runtime guard test
    expect(() => maskName(null)).toThrow(TypeError);
  });

  it("throws when char option has more than 1 character", () => {
    expect(() => maskName("Eka", { char: "**" })).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// maskName — CJK names
// ---------------------------------------------------------------------------

describe("maskName() — CJK", () => {
  describe("Chinese names", () => {
    it("masks a 2-char Chinese name with locale: zh", () => {
      const { masked } = maskName("张伟", { locale: "zh", visibleStart: 1, visibleEnd: 0 });
      expect(masked).toBe("张*");
    });

    it("masks a 3-char Chinese name", () => {
      const { masked } = maskName("李小龙", { locale: "zh", visibleStart: 1, visibleEnd: 1 });
      expect(masked).toBe("李*龙");
    });

    it("returns script: cjk for Chinese input", () => {
      const { script } = maskName("张伟", { locale: "zh" });
      expect(script).toBe("cjk");
    });

    it("auto-detects Chinese without specifying locale", () => {
      const { script } = maskName("张伟");
      expect(script).toBe("cjk");
    });

    it("masks Chinese name with a custom char", () => {
      const { masked } = maskName("李小龙", { locale: "zh", char: "-", visibleStart: 1, visibleEnd: 1 });
      expect(masked).toBe("李-龙");
    });
    it("handles cjk zh", () => {
      const { masked, script } = maskName("张伟", { locale: "zh" });
      expect(script).toBe("cjk");
      expect(masked).toBe("张*");
    });
  });

  describe("Japanese names", () => {
    it("masks a Kanji + Hiragana name", () => {
      const { masked } = maskName("田中さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
      expect(masked).toBe("田***ら");
    });

    it("masks a pure Hiragana name", () => {
      const { masked } = maskName("さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
      expect(masked).toBe("さ*ら");
    });

    it("masks a pure Katakana name", () => {
      const { masked } = maskName("サクラ", { locale: "ja", visibleStart: 1, visibleEnd: 0 });
      expect(masked).toBe("サ**");
    });

    it("returns script: cjk for Japanese input", () => {
      const { script } = maskName("田中さくら", { locale: "ja" });
      expect(script).toBe("cjk");
    });

    it("auto-detects Japanese without specifying locale", () => {
      const { script } = maskName("田中さくら");
      expect(script).toBe("cjk");
    });

    it("handles a spaced Japanese name (surname + given)", () => {
      // Some Japanese names are written with a space: "田中 さくら"
      const { masked } = maskName("田中 さくら", { locale: "ja", visibleStart: 1, visibleEnd: 1 });
      expect(masked).toBe("田* さ*ら");
    });
     it("handles cjk ja", () => {
    const { masked, script, original } = maskName("田中さくら", { locale: "ja" });
    expect(script).toBe("cjk");
    expect(masked).toBe("田**くら");
    expect(original).toBe("田中さくら");
  });
  });
});

// ---------------------------------------------------------------------------
// maskName — mixed / edge cases
// ---------------------------------------------------------------------------

describe("maskName() — mixed & edge cases", () => {
  it("auto-detects CJK in a mixed Latin + CJK name", () => {
    const { script, masked } = maskName("John 田中", { visibleStart: 1, visibleEnd: 1 });
    expect(script).toBe("cjk");
    // Treated as single CJK segment split by space
    expect(masked).toBe("J**n 田*");
  });

  it("handles preserveSpacing: false by joining with single space", () => {
    const { masked } = maskName("Eka  Prasetia", { preserveSpacing: false });
    expect(masked).toBe("E*a P*****ia"); // double space collapsed to single
  });

  it("handles a name with leading/trailing whitespace gracefully", () => {
    const { masked } = maskName("  Eka Prasetia  ", { preserveSpacing: false });
    expect(masked).toBe("E*a P*****ia");
  });

  it("handles a very long name", () => {
    const { masked } = maskName("Hubert Blaine Wolfeschlegelsteinhausenbergerdorff");
    expect(masked).toContain("H***rt B***ne W********************************ff");
  });

  it("masks correctly with visibleStart: 0 and visibleEnd: 0 (falls back to 1 visible)", () => {
    const { masked } = maskName("Eka", { visibleStart: 0, visibleEnd: 0 });
    // clampVisible ensures at least 1 visible char
    expect(masked).not.toBe("***");
  });
});