import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { maskName } from "../src/maskName";

describe("maskName() — performance", () => {
  describe("Single name processing", () => {
    it("handles very long names efficiently", () => {
      const longName = "A".repeat(10000);
      const start = performance.now();
      const { masked } = maskName(longName);
      const end = performance.now();

      expect(masked).toHaveLength(10000);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it("handles complex CJK names efficiently", () => {
      const complexName = "张伟田中さくら".repeat(100);
      const start = performance.now();
      const { masked } = maskName(complexName, { locale: "zh" });
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });

    it("handles mixed script names efficiently", () => {
      const mixedName = "John 张伟 José García 田中さくら".repeat(50);
      const start = performance.now();
      const { masked } = maskName(mixedName);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe("Batch processing", () => {
    it("processes multiple names efficiently", () => {
      const names = [
        "John Doe",
        "张伟",
        "田中さくら",
        "José García",
        "Jean-Claude Van Damme",
        "Maria Silva",
        "李小龙",
        "山田太郎",
      ];

      const start = performance.now();
      const results = names.map((name) => maskName(name));
      const end = performance.now();

      expect(results).toHaveLength(8);
      expect(end - start).toBeLessThan(20); // Should complete in under 20ms
    });

    it("processes large batch of names efficiently", () => {
      const names = Array(1000)
        .fill(null)
        .map((_, i) => `Name${i} Surname${i}`);

      const start = performance.now();
      const results = names.map((name) => maskName(name));
      const end = performance.now();

      expect(results).toHaveLength(1000);
      expect(end - start).toBeLessThan(200); // Should complete in under 200ms
    });

    it("processes diverse name batch efficiently", () => {
      const names = [
        ...Array(250)
          .fill(null)
          .map((_, i) => `EnglishName${i}`),
        ...Array(250)
          .fill(null)
          .map((_, i) => `张伟${i}`),
        ...Array(250)
          .fill(null)
          .map((_, i) => `田中さくら${i}`),
        ...Array(250)
          .fill(null)
          .map((_, i) => `José García${i}`),
      ];

      const start = performance.now();
      const results = names.map((name) => maskName(name));
      const end = performance.now();

      expect(results).toHaveLength(1000);
      expect(end - start).toBeLessThan(300); // Should complete in under 300ms
    });
  });

  describe("Memory usage", () => {
    it("doesn't leak memory with repeated processing", () => {
      const name = "VeryLongNameThatConsumesMemory".repeat(100);

      // Process the same name many times to check for memory leaks
      for (let i = 0; i < 1000; i++) {
        const { masked } = maskName(name);
        expect(masked).toBeTruthy();
      }

      // If we reach here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it("handles memory efficiently with large batches", () => {
      const names = Array(100)
        .fill(null)
        .map(
          () => "ExtremelyLongName".repeat(100) + " 张伟田中さくら".repeat(50),
        );

      const start = performance.now();
      const results = names.map((name) => maskName(name));
      const end = performance.now();

      expect(results).toHaveLength(100);
      expect(end - start).toBeLessThan(500); // Should complete in under 500ms
    });
  });

  describe("Performance regression detection", () => {
    it("maintains performance with different options", () => {
      const name = "Test Name Performance";
      const options = [
        { char: "*" },
        { char: "#" },
        { visibleStart: 2 },
        { visibleEnd: 3 },
        { preserveSpacing: false },
        { locale: "en" as const },
        { locale: "zh" as const },
        { locale: "ja" as const },
      ];

      options.forEach((option) => {
        const start = performance.now();
        const { masked } = maskName(name, option);
        const end = performance.now();

        expect(masked).toBeTruthy();
        expect(end - start).toBeLessThan(10); // Each option should be fast
      });
    });

    it("maintains performance with complex option combinations", () => {
      const name = "Complex Test Name 张伟";
      const complexOptions = {
        char: "#",
        visibleStart: 2,
        visibleEnd: 2,
        preserveSpacing: false,
        locale: "auto" as const,
      } as const;

      const start = performance.now();
      const { masked } = maskName(name, complexOptions);
      const end = performance.now();

      expect(masked).toBeTruthy();
      expect(end - start).toBeLessThan(15); // Should still be fast with complex options
    });
  });

  describe("Stress testing", () => {
    it("handles extreme name lengths", () => {
      const extremeName = "A".repeat(100000);

      const start = performance.now();
      const { masked } = maskName(extremeName);
      const end = performance.now();

      expect(masked).toHaveLength(100000);
      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("handles rapid successive processing", () => {
      const names = ["John", "张伟", "田中", "José"];

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const name = names[i % names.length];
        maskName(name);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should complete 10k operations in under 1 second
    });
  });
});
