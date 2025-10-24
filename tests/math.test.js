import { computeMM1, computeMMC } from "../src/math.js";

test("M/M/1 sanity", () => {
  const r = computeMM1(2, 3); // ρ = 2/3
  expect(r.ok).toBe(true);
  expect(r.model).toBe("M/M/1");
  expect(r.c).toBe(1);
  expect(r.rho).toBeCloseTo(2/3);
  // Known identities
  expect(r.L).toBeCloseTo((2/3)/(1-2/3)); // = 2
  expect(r.Wq).toBeCloseTo((2/3)/(3-2));  // = 2/3
});

test("M/M/c sanity (c=2)", () => {
  const λ=2, μ=2; // a=1, c=2, ρ=0.5
  const r = computeMMC(λ, μ, 2);
  expect(r.ok).toBe(true);
  expect(r.model).toBe("M/M/c");
  expect(r.c).toBe(2);
  expect(r.rho).toBeCloseTo(0.5);
  // Basic bounds
  expect(r.P0).toBeGreaterThan(0);
  expect(r.P0).toBeLessThan(1);
  expect(r.Pw).toBeGreaterThanOrEqual(0);
  expect(r.Pw).toBeLessThan(1);
});
