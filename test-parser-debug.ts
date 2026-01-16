import { create, all } from 'mathjs';
const math = create(all);

function internalIntegrate(fExpr: any, a: number, b: number, steps: number = 1000) {
  return 42; // mock
}

math.import({
  integrate: internalIntegrate,
  arcsin: math.asin,
  asin: math.asin,
  abs: math.abs,
}, { override: true });

console.log("math.abs type:", typeof math.abs);

try {
  const res = math.evaluate('abs(-25)');
  console.log("abs(-25) =", res);
} catch (e: any) {
  console.log("Error with abs(-25):", e.message);
}

try {
  const res = math.evaluate('asin(0.5)');
  console.log("asin(0.5) =", res);
} catch (e: any) {
  console.log("Error with asin(0.5):", e.message);
}

try {
  const res = math.evaluate('sin(pi/2)');
  console.log("sin(pi/2) =", res);
} catch (e: any) {
  console.log("Error with sin(pi/2):", e.message);
}
