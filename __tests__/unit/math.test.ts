import {
  evaluateMath,
  setVariable,
  clearScope,
  formatResult,
  derivative,
  simplify,
  integrate,
} from "../../lib/math-parser";

describe("Math Parser Unit Tests", () => {
  beforeEach(() => {
    clearScope();
  });

  describe("Basic Arithmetic", () => {
    it("should handle basic additions", () => {
      expect(evaluateMath("2 + 3")).toBe(5);
    });

    it("should handle subtraction", () => {
      expect(evaluateMath("10 - 7")).toBe(3);
    });

    it("should handle multiplication", () => {
      expect(evaluateMath("4 * 5")).toBe(20);
      expect(evaluateMath("4 \u00d7 5")).toBe(20); // ×
    });

    it("should handle division", () => {
      expect(evaluateMath("20 / 4")).toBe(5);
      expect(evaluateMath("20 \u00f7 4")).toBe(5); // ÷
    });

    it("should handle powers", () => {
      expect(evaluateMath("2^3")).toBe(8);
    });

    it("should handle fractions (LaTeX style)", () => {
      expect(evaluateMath("\\frac{1}{2} + \\frac{1}{4}")).toBe(0.75);
    });
  });

  describe("Trigonometry", () => {
    it("should handle basic trig functions", () => {
      expect(evaluateMath("sin(0)")).toBe(0);
      expect(evaluateMath("cos(0)")).toBe(1);
      expect(evaluateMath("tan(0)")).toBe(0);
    });

    it("should handle pi and constants", () => {
      expect(evaluateMath("sin(pi/2)")).toBe(1);
      expect(evaluateMath("cos(\u03c0)")).toBe(-1); // π
    });

    it("should handle inverse trig functions", () => {
      expect(evaluateMath("asin(1)")).toBeCloseTo(Math.PI / 2);
      expect(evaluateMath("arcsin(1)")).toBeCloseTo(Math.PI / 2);
    });
  });

  describe("Calculus", () => {
    it("should calculate derivatives correctly", () => {
      expect(derivative("x^2", "x")).toBe("2 * x");
      expect(derivative("sin(x)", "x")).toBe("cos(x)");
    });

    it("should handle derivative notation in evaluateMath", () => {
      expect(evaluateMath("d/dx(x^3)", { x: 2 })).toBe(12);
      expect(evaluateMath("(d)/(dx)(x^2)", { x: 5 })).toBe(10);
    });

    it("should perform numerical integration", () => {
      // integrate x from 0 to 1 = 0.5
      expect(integrate("x", 0, 1)).toBeCloseTo(0.5);
      // integrate sin(x) from 0 to pi = 2
      expect(integrate("sin(x)", 0, Math.PI)).toBeCloseTo(2);
    });

    it("should handle integration notation in evaluateMath", () => {
      // integral of x^2 from 0 to 3 is 3^3/3 = 9
      const result = evaluateMath("int_{0}^{3} (x^2) dx");
      expect(result).toBeCloseTo(9);
    });
  });

  describe("Matrices", () => {
    it("should handle matrix addition", () => {
      const result = evaluateMath("[[1, 2], [3, 4]] + [[5, 6], [7, 8]]");
      expect(formatResult(result)).toBe("[[6, 8], [10, 12]]");
    });

    it("should handle matrix multiplication", () => {
      const result = evaluateMath("[[1, 2], [3, 4]] * [[2, 0], [1, 2]]");
      expect(formatResult(result)).toBe("[[4, 4], [10, 8]]");
    });

    it("should handle LaTeX matrix notation", () => {
      const latex = "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}";
      const result = evaluateMath(latex);
      expect(formatResult(result)).toBe("[[1, 2], [3, 4]]");
    });

    it("should handle AsciiMath matrix notation", () => {
      const ascii = "((1,2),(3,4))";
      const result = evaluateMath(ascii);
      expect(formatResult(result)).toBe("[[1, 2], [3, 4]]");
    });
  });

  describe("Variables and Scope", () => {
    it("should respect user-defined variables", () => {
      setVariable("myVar", 42);
      expect(evaluateMath("myVar + 8")).toBe(50);
    });

    it("should handle expressions passed as scope", () => {
      expect(evaluateMath("x^2 + y", { x: 3, y: 1 })).toBe(10);
    });

    it("should simplify expressions", () => {
      expect(simplify("2x + 3x")).toBe("5 * x");
      expect(simplify("x * x")).toBe("x ^ 2");
    });
  });

  describe("Edge Cases and Errors", () => {
    it("should return 0 for empty expressions", () => {
      expect(evaluateMath("")).toBe(0);
      expect(evaluateMath("  ")).toBe(0);
    });

    it("should throw error for invalid expressions", () => {
      expect(() => evaluateMath("invalid + expression")).toThrow();
    });
  });
});
