import { utilization, L, Lq, W, Wq, P0, stable } from "../src/math.js";

test("stability and utilization", () => {
  expect(stable(2, 3)).toBe(true);
  expect(stable(3, 3)).toBe(false);
  expect(utilization(2, 4)).toBeCloseTo(0.5);
});

test("M/M/1 core metrics", () => {
  const λ = 2, μ = 3; // ρ = 2/3
  expect(L(λ, μ)).toBeCloseTo((2/3)/(1-2/3)); // 2
  expect(Lq(λ, μ)).toBeCloseTo((4/9)/(1-2/3)); // 4/3
  expect(W(λ, μ)).toBeCloseTo(1/(1));
  expect(Wq(λ, μ)).toBeCloseTo((2/3)/(1));
  expect(P0(λ, μ)).toBeCloseTo(1 - 2/3);
});
