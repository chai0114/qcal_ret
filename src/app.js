import { utilization, stable, L, Lq, W, Wq, P0, fmt } from "./math.js";

const form = document.getElementById("calc-form");
const errorBox = document.getElementById("error");
const results = document.getElementById("results");

const fields = {
  rho: document.getElementById("rho"),
  L: document.getElementById("L"),
  Lq: document.getElementById("Lq"),
  W: document.getElementById("W"),
  Wq: document.getElementById("Wq"),
  P0: document.getElementById("P0"),
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");
  results.classList.add("hidden");

  const lambda = parseFloat(document.getElementById("lambda").value);
  const mu = parseFloat(document.getElementById("mu").value);

  if (Number.isNaN(lambda) || Number.isNaN(mu)) {
    return showError("Please enter numeric values for λ and μ.");
  }
  if (mu <= 0) {
    return showError("Service rate μ must be > 0.");
  }
  if (!stable(lambda, mu)) {
    return showError("System must be stable: require λ < μ (so ρ < 1).");
  }

  const rho = utilization(lambda, mu);
  fields.rho.textContent = fmt(rho, 6);
  fields.L.textContent = fmt(L(lambda, mu), 6);
  fields.Lq.textContent = fmt(Lq(lambda, mu), 6);
  fields.W.textContent = fmt(W(lambda, mu), 6);
  fields.Wq.textContent = fmt(Wq(lambda, mu), 6);
  fields.P0.textContent = fmt(P0(lambda, mu), 6);

  results.classList.remove("hidden");
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}
