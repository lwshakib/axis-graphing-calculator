import { create, all } from 'mathjs';

const math = create(all);

/**
 * A powerful mathematical expression parser backed by math.js.
 * Supports matrices, calculus, vectors, and advanced algebra.
 */

// Store for matrix variables and other user-defined variables
let variableScope: Record<string, any> = {};

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
function internalIntegrate(fExpr: any, a: number, b: number, steps: number = 1000) {
  // mathjs might pass a function if we use it in evaluate
  const f = typeof fExpr === 'function' 
    ? (scope: any) => fExpr(scope.x)
    : compileMath(fExpr.toString());

  const h = (b - a) / steps;
  let sum = f({ x: a }) + f({ x: b });

  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    sum += f({ x }) * (i % 2 === 0 ? 2 : 4);
  }

  return (h / 3) * sum;
}

// Register custom functions to mathjs
math.import({
  integrate: internalIntegrate,
}, { override: true });

/**
 * Evaluates a mathematical expression using math.js.
 */
export function evaluateMath(expression: string, scope?: Record<string, any>) {
  if (!expression || expression.trim() === '') return 0;

  try {
    // Normalize expression
    let normalized = expression
      .replace(/\\cdot/g, '*')
      .replace(/\\times/g, '*')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi');

    // Handle d/dx notation from ascii-math: d/dx(f(x)) -> derivative('f(x)', 'x')
    normalized = normalized.replace(/d\/d([a-z])\s*\((.*)\)/g, (match, v, expr) => {
      return `derivative('${expr}', '${v}')`;
    });

    // Handle integral notation from ascii-math: int_a^b (f(x)) dx -> integrate('f(x)', a, b)
    normalized = normalized.replace(/int_([-?0-9.]+)\^([-?0-9.]+)\s*\((.*)\)\s*d[a-z]/g, (match, a, b, expr) => {
      return `integrate('${expr}', ${a}, ${b})`;
    });

    return math.evaluate(normalized, scope || variableScope);
  } catch (error) {
    throw error;
  }
}

/**
 * Compiles a mathematical expression into a reusable function.
 */
export function compileMath(expression: string) {
  if (!expression || expression.trim() === '') return () => 0;

  try {
    const normalized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi');

    const node = math.parse(normalized);
    const code = node.compile();
    return (scope?: Record<string, any>) => code.evaluate(scope || variableScope);
  } catch (error) {
    console.error('Compile error:', error);
    return () => 0;
  }
}

/**
 * Specialized functions for Advanced Calculator features
 */

// Derivative: diff(expression, variable)
export function derivative(expression: string, variable: string = 'x') {
  return math.derivative(expression, variable).toString();
}

// Simplify: simplify(expression)
export function simplify(expression: string) {
  return math.simplify(expression).toString();
}

// Export the integrate function as well
export function integrate(expression: string, a: number, b: number, steps: number = 1000) {
  return internalIntegrate(expression, a, b, steps);
}

/**
 * Formats a mathjs result for display.
 * Handles numbers, matrices, and units.
 */
export function formatResult(result: any): string {
  if (result === undefined || result === null) return '0';
  
  if (typeof result === 'number') {
    return math.format(result, { precision: 14 });
  }

  if (result.isMatrix || Array.isArray(result)) {
    return math.format(result);
  }

  return result.toString();
}
