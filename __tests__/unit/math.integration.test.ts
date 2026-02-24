import {
  evaluateMath,
  setVariable,
  clearScope,
  formatResult,
} from "../../lib/math-parser";

describe("Math Parser Integration", () => {
  beforeEach(() => {
    clearScope();
  });

  it("should evaluate expressions with user-defined variables", () => {
    setVariable("a", 10);
    setVariable("b", 20);

    const result = evaluateMath("a + b");
    expect(result).toBe(30);
  });

  it("should handle complex expressions and formatting", () => {
    setVariable("x", 5);
    const rawResult = evaluateMath("x^2 + sin(pi/2) + sqrt(16)");
    const formatted = formatResult(rawResult);

    // 5^2 + sin(pi/2) + sqrt(16) = 25 + 1 + 4 = 30
    expect(Number(formatted)).toBe(30);
  });

  it("should perform derivatives and then evaluate them", () => {
    // This is more of a logic integration test
    const expr = "x^3";
    // derivative of x^3 is 3x^2
    const derivativeExpr = evaluateMath(
      `derivative('${expr}', 'x')`,
    ).toString();

    // Now evaluate 3x^2 at x=2
    const finalResult = evaluateMath(derivativeExpr, { x: 2 });
    // 3 * (2^2) = 3 * 4 = 12
    expect(finalResult).toBe(12);
  });

  it("should handle matrix operations integration", () => {
    const matrixA = "[[1, 2], [3, 4]]";
    const matrixB = "[[5, 6], [7, 8]]";

    const result = evaluateMath(`${matrixA} + ${matrixB}`);
    const formatted = formatResult(result);

    expect(formatted).toBe("[[6, 8], [10, 12]]");
  });
});
