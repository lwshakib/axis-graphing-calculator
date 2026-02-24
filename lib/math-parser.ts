import { create, all } from "mathjs";

// Initialize mathjs instance with all available functionality
const math = create(all);

/**
 * A powerful mathematical expression parser backed by math.js.
 * Supports matrices, calculus, vectors, and advanced algebra.
 * This library acts as the bridge between LaTeX/AsciiMath inputs
 * and the numerical engine.
 */

// Store for matrix variables and other user-defined variables
// This scope is shared across evaluations unless cleared.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let variableScope: Record<string, any> = {};

/**
 * Sets a variable in the global evaluation scope.
 * @param name Variable name (e.g., 'x', 'A')
 * @param value Value to assign (number, matrix, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setVariable(name: string, value: any) {
  variableScope[name] = value;
}

/**
 * Retrieves the current variable scope.
 * @returns The global scope object
 */
export function getScope() {
  return variableScope;
}

/**
 * Resets the variable scope to an empty state.
 */
export function clearScope() {
  variableScope = {};
}

/**
 * Custom Numerical Integration using Simpson's Rule (Definite): integrate(f(x), a, b)
 * Implements a standard numerical approximation for functions that may not
 * have elementary antiderivatives.
 *
 * @param fExpr The function expression or function object to integrate
 * @param a Lower bound of integration
 * @param b Upper bound of integration
 * @param variable The integration variable (default 'x')
 * @param steps Number of sub-intervals (default 1000 for high precision)
 */
function internalIntegrate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fExpr: any,
  a: number,
  b: number,
  variable: string = "x",
  steps: number = 1000,
) {
  // If steps was passed as the 4th argument instead of variable (old API support)
  if (typeof variable === "number") {
    steps = variable;
    variable = "x";
  }

  const compiled =
    typeof fExpr === "function" ? null : compileMath(fExpr.toString());
  const f = (val: number) => {
    if (typeof fExpr === "function") {
      return fExpr(val);
    }
    return compiled!({ [variable]: val });
  };

  // Width of each sub-interval
  const h = (b - a) / steps;
  // Initialize sum with boundary points f(a) and f(b)
  let sum = f(a) + f(b);

  /**
   * Apply Simpson's Rule formula:
   * (h/3) * [f(x0) + 4f(x1) + 2f(x2) + 4f(x3) + ... + f(xn)]
   * Weight 4 for odd intervals, weight 2 for even.
   */
  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    sum += f(x) * (i % 2 === 0 ? 2 : 4);
  }

  return (h / 3) * sum;
}

// Register custom functions and aliases to the mathjs instance for global availability.
math.import(
  {
    integrate: internalIntegrate,
    // Add common aliases for inverse trig functions used by MathLive/LaTeX
    arcsin: math.asin,
    arccos: math.acos,
    arctan: math.atan,
    arccot: math.acot,
    arcsec: math.asec,
    arcccsc: math.acsc,
    asin: math.asin,
    acos: math.acos,
    atan: math.atan,
    abs: math.abs,
  },
  { override: true },
);

/**
 * Evaluates a mathematical expression using math.js.
 * Includes heavy pre-processing to handle LaTeX and AsciiMath syntax.
 *
 * @param expression The expression string to evaluate
 * @param scope Optional local scope for this specific evaluation
 * @returns The resulting math value (number, matrix, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function evaluateMath(expression: string, scope?: Record<string, any>) {
  // Safeguard against empty input
  if (!expression || expression.trim() === "") return 0;

  try {
    // 1. Pre-Normalization: Clean up MathLive/AsciiMath quirks to make them mathjs-compatible
    let normalized = expression;

    // Handle LaTeX Matrices \begin{pmatrix} ... \end{pmatrix} -> [[...]]
    // This regex converts LaTeX matrix/array blocks into JSON-like nested array syntax
    normalized = normalized.replace(
      /\\begin\{([a-z]*matrix|array)\}(?:\{.*?\})?([\s\S]*?)\\end\{\1\}/g,
      (_, type, contents) => {
        // Split contents by '\\' for rows and '&' for columns
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

    // Handle AsciiMath Matrices formatted as ((a,b,c),(d,e,f)) -> [[a,b,c],[d,e,f]]
    // This is common in some visual math editors.
    if (normalized.includes("((") && normalized.includes("))")) {
      normalized = normalized.replace(
        /([^a-z0-9]|^)\(\s*\(([\s\S]*?)\)\s*\)/gi,
        (match, prefix, inner) => {
          // If it looks like a function call like sin((x)), prefix will be 'n' (last char of sin)
          // We only want to replace if prefix is NOT a letter or if it's at the start of the string
          if (prefix && /[a-z]/i.test(prefix)) return match;

          // If it's a single row matrix like ((1,2,3)) -> inner is "1,2,3"
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

    // Convert LaTeX fractions \frac{a}{b} -> ((a)/(b))
    normalized = normalized.replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "(($1)/($2))");

    // Remove LaTeX text wrappers like \text{...} or \operatorname{...} but keep contents
    normalized = normalized.replace(
      /\\(text|operatorname|mathrm|math[a-z]+)\{(.*?)\}/g,
      "$2",
    );
    // Remove space-separated LaTeX text commands like \text someText
    normalized = normalized.replace(
      /\\(text|operatorname|mathrm|math[a-z]+)\s+/g,
      " ",
    );

    // Replace LaTeX symbols with mathjs operators
    normalized = normalized
      .replace(/\\cdot/g, "*") // Multiplier dot
      .replace(/\\times/g, "*") // Multiplication cross
      .replace(/\\left\(/g, "(") // Left parenthesis
      .replace(/\\right\)/g, ")") // Right parenthesis
      .replace(/\\left\[/g, "[") // Left bracket
      .replace(/\\right\]/g, "]") // Right bracket
      .replace(/\\left\|/g, "abs(") // Left absolute value bar
      .replace(/\\right\|/g, ")") // Right absolute value bar
      .replace(/\\lvert/g, "abs(") // Alternative absolute value command
      .replace(/\\rvert/g, ")") // Alternative absolute value command
      .replace(/\\/g, "") // Strip remaining backslashes
      .replace(/×/g, "*") // Unicode multiplication
      .replace(/÷/g, "/") // Unicode division
      .replace(/π/g, "pi"); // Unicode pi symbol

    // Handle LaTeX/MathLive derivative and integration notation
    // Pattern: (d/dx)(expr) or d/dx(expr) or \frac{d}{dx}(expr)
    normalized = normalized.replace(
      /(?:\(?d\)?)\/(?:\(?d([a-z])\)?)\s*\((.*?)\)/gi,
      (match, v, expr) => `derivative('${expr}', '${v}')`,
    );

    // Pattern: int_{a}^{b} (expr) dx
    normalized = normalized.replace(
      /int_\{?([^}^ ]*)\}?\^\{?([^}^ ]*)\}?\s*(?:\((.*?)\)|([a-z0-9^*/+-]+))\s*d([a-z])/gi,
      (match, a, b, expr1, expr2, v) =>
        `integrate('${expr1 || expr2}', ${a}, ${b}, '${v}')`,
    );

    // Implicit multiplication (e.g., 2x -> 2*x)
    normalized = normalized.replace(/(\d)([a-zA-Z(])/g, "$1*$2");

    // Perform final evaluation with the prepared scope
    const result = math.evaluate(normalized, scope || variableScope);

    // If the result is a mathjs Node (symbolic representation), evaluate it
    if (result && typeof result === "object" && result.isNode) {
      try {
        return result.evaluate(scope || variableScope);
      } catch {
        return result;
      }
    }

    return result;
  } catch (error) {
    // Suppress noisy error logs during tests for expected failures
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "Evaluation Error in math-parser:",
        error,
        "Expression:",
        expression,
      );
    }
    throw error;
  }
}

/**
 * Compiles a mathematical expression into a reusable function for performance.
 * Best for graphing where the same expression is evaluated for many 'x' values.
 *
 * @param expression The expression string to compile
 * @returns A function that takes a scope and returns the evaluation result
 */
export function compileMath(expression: string) {
  // Empty input returns a function that always returns 0
  if (!expression || expression.trim() === "") return () => 0;

  try {
    // Basic symbol normalization for compiled functions
    const normalized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/\\cdot/g, "*")
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)");

    // Parse the expression into an Abstract Syntax Tree (AST)
    const node = math.parse(normalized);
    // Compile the AST into JavaScript code
    const code = node.compile();

    // Return a wrapped function that uses the provided scope or global scope
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (scope?: Record<string, any>) =>
      code.evaluate(scope || variableScope);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Compile error:", error);
    }
    return () => 0;
  }
}

/**
 * Calculates symbolic derivative.
 */
export function derivative(expression: string, variable: string = "x") {
  return math.derivative(expression, variable).toString();
}

/**
 * Simplified a math expression symbolically.
 */
export function simplify(expression: string) {
  return math.simplify(expression).toString();
}

/**
 * Export the internal integration function for external use.
 */
export function integrate(
  expression: string,
  a: number,
  b: number,
  variable: string = "x",
  steps: number = 1000,
) {
  return internalIntegrate(expression, a, b, variable, steps);
}

/**
 * Formats a mathjs result for display.
 * Handles numbers (with precision), matrices, and other complex types.
 *
 * @param result The value to format
 * @returns A user-friendly string representation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatResult(result: any): string {
  if (result === undefined || result === null) return "0";

  // Format numbers to a fixed precision to avoid floating point artifacts
  if (typeof result === "number") {
    return math.format(result, { precision: 14 });
  }

  // Handle mathjs matrices or native arrays
  if (result.isMatrix || Array.isArray(result)) {
    return math.format(result);
  }

  // Fallback to generic string conversion
  return result.toString();
}
