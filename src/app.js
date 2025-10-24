import { fmt, computeMM1, computeMMC } from "./math.js";

const form = document.getElementById("calc-form");
const errorBox = document.getElementById("error");
const results = document.getElementById("results");
const serversRow = document.getElementById("servers-row");
const repoLink = document.getElementById("repo-link");

const out = {
  model: document.getElementById("out-model"),
  c: document.getElementById("out-c"),
  rho: document.getElementById("rho"),
  L: document.getElementById("L"),
  Lq: document.getElementById("Lq"),
  W: document.getElementById("W"),
  Wq: document.getElementById("Wq"),
  P0: document.getElementById("P0"),
  Pw: document.getElementById("Pw"),
};

const formulae = document.getElementById("formulae-content");

// Toggle server input for M/M/c
document.getElementById("model-mm1").addEventListener("change", onModelToggle);
document.getElementById("model-mmc").addEventListener("change", onModelToggle);
function onModelToggle() {
  const model = getModel();
  serversRow.hidden = model !== "mmc";
}
onModelToggle();

// Auto-set repo link
try {
  const path = window.location.pathname.replace(/^\//, "");
  const repoGuess = path.split("/")[0] || "queue-calculator";
  const userGuess = window.location.hostname.split(".")[0];
  repoLink.href = `https://github.com/${userGuess}/${repoGuess}`;
} catch { /* ignore */ }

form.addEventListener("submit", (e) => {
  e.preventDefault();
  hide(errorBox);
  hide(results);

  const lambda = parseFloat(document.getElementById("lambda").value);
  const mu     = parseFloat(document.getElementById("mu").value);
  const units  = document.getElementById("units").value;
  const model  = getModel();
  const cVal   = document.getElementById("servers").value;
  const c      = cVal ? parseInt(cVal, 10) : 1;

  if (!isFinite(lambda) || !isFinite(mu)) {
    return showError("Please enter numeric values for λ and μ.");
  }
  if (mu <= 0 || lambda < 0) {
    return showError("Require λ ≥ 0 and μ > 0.");
  }
  if (model === "mmc" && (!Number.isInteger(c) || c < 1)) {
    return showError("Number of servers c must be an integer ≥ 1.");
  }

  const res = model === "mmc" ? computeMMC(lambda, mu, c) : computeMM1(lambda, mu);
  if (!res.ok) return showError(res.reason);

  out.model.textContent = res.model;
  out.c.textContent     = res.c;
  out.rho.textContent   = fmt(res.rho);
  out.L.textContent     = fmt(res.L);
  out.Lq.textContent    = fmt(res.Lq);
  out.W.textContent     = fmt(res.W) + timeUnit(units);
  out.Wq.textContent    = fmt(res.Wq) + timeUnit(units);
  out.P0.textContent    = fmt(res.P0);
  out.Pw.textContent    = fmt(res.Pw);

  formulae.innerHTML = model === "mmc"
    ? mmcFormulaeHTML()
    : mm1FormulaeHTML();

  show(results);
});

function getModel() {
  return document.querySelector('input[name="model"]:checked').value;
}
function showError(msg) {
  errorBox.textContent = msg;
  show(errorBox);
}
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }
function timeUnit(sel) {
  switch (sel) {
    case "per_hour": return " hours";
    case "per_min":  return " minutes";
    case "per_sec":  return " seconds";
    default: return "";
  }
}

// ---------- Formulas (English) ----------
function mm1FormulaeHTML() {
  return `
  <ul>
    <li>Stability: <code>λ &lt; μ</code></li>
    <li>Utilization: <code>ρ = λ / μ</code></li>
    <li>Idle probability: <code>P₀ = 1 − ρ</code></li>
    <li>Waiting probability: <code>P_w = ρ</code></li>
    <li>Average waiting time: <code>W_q = P_w / (μ − λ) = ρ / (μ − λ)</code></li>
    <li>Average system time: <code>W = W_q + 1/μ</code></li>
    <li>Average queue length: <code>L_q = λ · W_q</code></li>
    <li>Average system size: <code>L = λ · W</code></li>
  </ul>`;
}

function mmcFormulaeHTML() {
  return `
  <ul>
    <li>Stability: <code>λ &lt; c·μ</code> (i.e. <code>ρ = λ / (cμ) &lt; 1</code>)</li>
    <li>Zero-state probability:
      <div><code>P₀ = \[ Σₙ₌₀^{c−1} (aⁿ / n!) + (aᶜ / [c!(1−ρ)]) \]⁻¹</code>,
      where <code>a = λ/μ</code>, <code>ρ = a / c</code></div>
    </li>
    <li>Erlang C (waiting probability):
      <div><code>P_w = (aᶜ / [c!(1−ρ)]) · P₀</code></div>
    </li>
    <li>Average waiting time: <code>W_q = P_w / (cμ − λ)</code></li>
    <li>Average system time: <code>W = W_q + 1/μ</code></li>
    <li>Average queue length: <code>L_q = λ · W_q</code></li>
    <li>Average system size: <code>L = λ · W</code></li>
  </ul>`;
}
