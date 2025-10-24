// ---------- 공통 유틸 ----------
export function fmt(x, digits = 6) {
  if (typeof x !== "number" || !isFinite(x)) return "—";
  // trim trailing zeros for readability
  const s = x.toFixed(digits);
  return s.replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1');
}

function factorial(n) {
  if (n < 0) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ---------- 안정성 ----------
export function stableMM1(lambda, mu) {
  return mu > 0 && lambda >= 0 && lambda < mu;
}
export function stableMMC(lambda, mu, c) {
  return mu > 0 && lambda >= 0 && Number.isInteger(c) && c >= 1 && lambda < c * mu;
}

// ---------- Erlang C (M/M/c) ----------
function erlangC(lambda, mu, c) {
  const a = lambda / mu;             // offered load (erlangs)
  const rho = a / c;                 // utilization per server
  // P0
  let sum = 0;
  for (let n = 0; n <= c - 1; n++) {
    sum += Math.pow(a, n) / factorial(n);
  }
  const tail = Math.pow(a, c) / (factorial(c) * (1 - rho));
  const P0 = 1 / (sum + tail);

  // Pw (probability that an arrival waits)
  const Pw = (Math.pow(a, c) / (factorial(c) * (1 - rho))) * P0;

  return { a, rho, P0, Pw };
}

// ---------- 메인 계산기 ----------
export function computeMM1(lambda, mu) {
  if (!stableMM1(lambda, mu)) {
    return { ok: false, reason: "M/M/1 안정 조건 위반: λ < μ 여야 합니다." };
  }
  const c = 1;
  // Erlang C로 통일 (c=1일 때 식이 자연스럽게 M/M/1로 귀결)
  const { rho, P0, Pw } = erlangC(lambda, mu, c);

  const Wq = Pw / (c * mu - lambda); // = ρ / (μ - λ)
  const W  = Wq + 1 / mu;
  const Lq = lambda * Wq;
  const L  = lambda * W;

  return {
    ok: true, model: "M/M/1", c,
    rho, L, Lq, W, Wq, P0, Pw
  };
}

export function computeMMC(lambda, mu, c) {
  if (!stableMMC(lambda, mu, c)) {
    return { ok: false, reason: "M/M/c 안정 조건 위반: λ < c·μ 및 c ≥ 1 (정수) 이어야 합니다." };
  }
  const { rho, P0, Pw } = erlangC(lambda, mu, c);

  const Wq = Pw / (c * mu - lambda);
  const W  = Wq + 1 / mu;
  const Lq = lambda * Wq;
  const L  = lambda * W;

  return {
    ok: true, model: "M/M/c", c,
    rho, L, Lq, W, Wq, P0, Pw
  };
}
