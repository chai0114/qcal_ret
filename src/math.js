// Pure functions for M/M/1 metrics
export function utilization(lambda, mu) {
  return lambda / mu;
}

export function stable(lambda, mu) {
  return mu > 0 && lambda >= 0 && lambda < mu;
}

export function L(lambda, mu) {
  const rho = utilization(lambda, mu);
  return rho / (1 - rho);
}

export function Lq(lambda, mu) {
  const rho = utilization(lambda, mu);
  return (rho * rho) / (1 - rho);
}

export function W(lambda, mu) {
  return 1 / (mu - lambda);
}

export function Wq(lambda, mu) {
  const rho = utilization(lambda, mu);
  return rho / (mu - lambda);
}

export function P0(lambda, mu) {
  return 1 - utilization(lambda, mu);
}

// helper for safe rounding
export function fmt(x, digits = 6) {
  if (!isFinite(x)) return "—";
  return Number(x.toFixed(digits)).toString();
}
