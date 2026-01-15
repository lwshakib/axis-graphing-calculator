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

/**
 * Evaluates a mathematical expression using math.js.
 */
export function evaluateMath(expression: string, scope?: Record<string, any>) {
  if (!expression || expression.trim() === '') return 0;

  try {
    // Normalize expression
    const normalized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi');

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

    const node = math.compile(normalized);
    return (scope?: Record<string, any>) => node.evaluate(scope || variableScope);
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

// Numerical Integration (Definite): integrate(f(x), a, b)
export function integrate(expression: string, a: number, b: number, steps: number = 1000) {
  const f = compileMath(expression);
  const h = (b - a) / steps;
  let sum = f({ x: a }) + f({ x: b });

  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    sum += f({ x }) * (i % 2 === 0 ? 2 : 4);
  }

  return (h / 3) * sum;
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
