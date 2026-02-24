import { create, all } from "mathjs";

const math = create(all);

/**
 * A powerful mathematical expression parser backed by math.js.
 * Supports matrices, calculus, vectors, and advanced algebra.
 */

// Store for matrix variables and other user-defined variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let variableScope: Record<string, any> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setVariable(name: string, value: any) {
  variableScope[name] = value;
}

export function getScope() {
  return variableScope;
}

export function clearScope() {
  variableScope = {};
}

// Custom Numerical Integration (Definite): integrate(f(x), a, b)
function internalIntegrate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fExpr: any,
  a: number,
  b: number,
  steps: number = 1000,
) {
  // If fExpr is a function (passed by mathjs), use it directly
  const f =
    typeof fExpr === "function"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scope: any) => fExpr(scope.x)
      : compileMath(fExpr.toString());

  const h = (b - a) / steps;
  let sum = f({ x: a }) + f({ x: b });

  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    sum += f({ x }) * (i % 2 === 0 ? 2 : 4);
  }

  return (h / 3) * sum;
}

// Register custom functions and aliases to mathjs
math.import(
  {
    integrate: internalIntegrate,
    // Add common aliases for inverse trig functions used by MathLive/LaTeX
    arcsin: math.asin,
    arccos: math.acos,
    arctan: math.atan,
    arccot: math.acot,
    arcsec: math.asec,
    arccsc: math.acsc,
    asin: math.asin,
    acos: math.acos,
    atan: math.atan,
    abs: math.abs,
  },
  { override: true },
);

/**
 * Evaluates a mathematical expression using math.js.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function evaluateMath(expression: string, scope?: Record<string, any>) {
  if (!expression || expression.trim() === "") return 0;

  try {
    // 1. Pre-Normalization: Clean up MathLive/AsciiMath quirks
    let normalized = expression;

    // Handle LaTeX Matrices \begin{pmatrix} ... \end{pmatrix} -> [[...]]
    // Also handle \begin{array} ... \end{array}
    // Do this BEFORE removing backslashes
    normalized = normalized.replace(
      /\\begin\{([a-z]*matrix|array)\}(?:\{.*?\})?([\s\S]*?)\\end\{\1\}/g,
      (_, type, contents) => {
        const rows = contents
          .trim()
          .split("\\\\")
          .filter((r: string) => r.trim())
          .map((row: string) => {
            const cols = row.split("&").map((col: string) => col.trim());
            return `[${cols.join(", ")}]`;
          });
        return `[${rows.join(", ")}]`;
      },
    );

    // Handle AsciiMath Matrices ((a,b,c),(d,e,f)) -> [[a,b,c],[d,e,f]]
    // Only replace if they look like actual matrices (contain more parens or nested structure)
    // and aren't immediately preceded by a function name
    if (normalized.includes("((") && normalized.includes("))")) {
      normalized = normalized.replace(
        /([^a-z0-9]|^)\(\s*\(([\s\S]*?)\)\s*\)/gi,
        (match, prefix, inner) => {
          // If it looks like a function call like sin((x)), prefix will be 'n' (last char of sin)
          // We only want to replace if prefix is NOT a letter or if it's the start
          if (prefix && /[a-z]/i.test(prefix)) return match;

          // If it's a single row like ((1,2,3)) -> inner is "1,2,3"
          if (
            !inner.includes("),") &&
            !inner.includes(") ,") &&
            !inner.includes("(")
          ) {
            return `${prefix}[[${inner.replace(/^\(|\)$/g, "")}]]`;
          }
          // If it's multiple rows like ((1,2),(3,4)) -> inner is "(1,2),(3,4)"
          if (inner.includes("(")) {
            const rows = inner.split(/\)\s*,\s*\(/).map((row: string) => {
              return `[${row.replace(/^\(|\)$/g, "")}]`;
            });
            return `${prefix}[${rows.join(",")}]`;
          }
          return match;
        },
      );
    }

    // Handle fractions \frac{a}{b} -> (a)/(b) if they somehow persist
    normalized = normalized.replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "(($1)/($2))");

    // Handle common LaTeX operators and text wrappers BEFORE removing backslashes
    normalized = normalized.replace(
      /\\(text|operatorname|mathrm|math[a-z]+)\{(.*?)\}/g,
      "$2",
    );
    normalized = normalized.replace(
      /\\(text|operatorname|mathrm|math[a-z]+)\s+/g,
      " ",
    );

    normalized = normalized
      .replace(/\\cdot/g, "*")
      .replace(/\\times/g, "*")
      .replace(/\\left\(/g, "(")
      .replace(/\\right\)/g, ")")
      .replace(/\\left\[/g, "[")
      .replace(/\\right\]/g, "]")
      .replace(/\\left\|/g, "abs(")
      .replace(/\\right\|/g, ")")
      .replace(/\\lvert/g, "abs(")
      .replace(/\\rvert/g, ")")
      // Basic pipe handling for direct input like |x|
      // This is a bit risky but needed for manual keyboard input "Shit+\"
      .replace(/\|([^|]+)\|/g, "abs($1)")
      .replace(/\\/g, "") // Remove remaining backslashes (safe after command handling)
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi");

    // 2. Handle specific derivative/integration patterns
    // Pattern: (d)/(d x)(expr) or (d)/(dx)(expr)
    normalized = normalized.replace(
      /\(d\)\/\(d\s*([a-z])\)\s*\((.*?)\)/gi,
      (match, v, expr) => {
        return `derivative('${expr}', '${v}')`;
      },
    );

    // Pattern: d/dx(expr)
    normalized = normalized.replace(
      /d\/d([a-z])\s*\((.*?)\)/gi,
      (match, v, expr) => {
        return `derivative('${expr}', '${v}')`;
      },
    );

    // Pattern: d/dx expr
    normalized = normalized.replace(
      /d\/d([a-z])\s+([a-z0-9^]+)/gi,
      (match, v, expr) => {
        return `derivative('${expr}', '${v}')`;
      },
    );

    // 3. Handle Integration patterns
    normalized = normalized.replace(
      /int\s*_\{?(.*?)\}?\^\{?(.*?)\}?\s*\((.*?)\)\s*d\s*[a-z]/gi,
      (match, a, b, expr) => {
        return `integrate('${expr}', ${a}, ${b})`;
      },
    );

    normalized = normalized.replace(
      /int\s*_([-?0-9.]+)\^([-?0-9.]+)\s*\((.*?)\)\s*d\s*[a-z]/gi,
      (match, a, b, expr) => {
        return `integrate('${expr}', ${a}, ${b})`;
      },
    );

    // Additional cleaning for words that might have been part of LaTeX commands
    // and ensuring common functions are lowercase
    const funcMap: Record<string, string> = {
      ABS: "abs",
      Abs: "abs",
      SIN: "sin",
      Sin: "sin",
      COS: "cos",
      Cos: "cos",
      TAN: "tan",
      Tan: "tan",
      LOG: "log",
      Log: "log",
      LN: "ln",
      Ln: "ln",
      SQRT: "sqrt",
      Sqrt: "sqrt",
    };

    Object.entries(funcMap).forEach(([upper, lower]) => {
      normalized = normalized.replace(new RegExp(`\\b${upper}\\b`, "g"), lower);
    });

    // Handle the case where someone might have typed text{abs} but backslash was gone
    normalized = normalized.replace(/text\{(.*?)\}/g, "$1");
    normalized = normalized.replace(/operatorname\{(.*?)\}/g, "$1");

    console.log("Final Normalized Expression:", normalized);
    return math.evaluate(normalized, scope || variableScope);
  } catch (error) {
    console.error("Math evaluation error:", error, "Original:", expression);
    throw error;
  }
}

/**
 * Compiles a mathematical expression into a reusable function.
 */
export function compileMath(expression: string) {
  if (!expression || expression.trim() === "") return () => 0;

  try {
    const normalized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi");

    const node = math.parse(normalized);
    const code = node.compile();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (scope?: Record<string, any>) =>
      code.evaluate(scope || variableScope);
  } catch (error) {
    console.error("Compile error:", error);
    return () => 0;
  }
}

/**
 * Specialized functions for Advanced Calculator features
 */

// Derivative: diff(expression, variable)
export function derivative(expression: string, variable: string = "x") {
  return math.derivative(expression, variable).toString();
}

// Simplify: simplify(expression)
export function simplify(expression: string) {
  return math.simplify(expression).toString();
}

// Export the integrate function as well
export function integrate(
  expression: string,
  a: number,
  b: number,
  steps: number = 1000,
) {
  return internalIntegrate(expression, a, b, steps);
}

/**
 * Formats a mathjs result for display.
 * Handles numbers, matrices, and units.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatResult(result: any): string {
  if (result === undefined || result === null) return "0";

  if (typeof result === "number") {
    return math.format(result, { precision: 14 });
  }

  if (result.isMatrix || Array.isArray(result)) {
    return math.format(result);
  }

  return result.toString();
}
