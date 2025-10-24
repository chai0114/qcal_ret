import { fmt, computeMM1, computeMMC } from "./math.js";

const form = document.getElementById("calc-form");
const errorBox = document.getElementById("error");
const results = document.getElementById("results");
const serversRow = document.getElementById("servers-row");
const repoLink = document.getElementById("repo-link");

// 결과 필드
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

// 모델 라디오 토글 시 서버 입력 표시
document.getElementById("model-mm1").addEventListener("change", onModelToggle);
document.getElementById("model-mmc").addEventListener("change", onModelToggle);
function onModelToggle() {
  const model = getModel();
  serversRow.hidden = model !== "mmc";
}
onModelToggle();

// 레포 링크 자동 설정 (선택)
try {
  const path = window.location.pathname.replace(/^\//, "");
  const repoGuess = path.split("/")[0] || "queue-calculator";
  const userGuess = window.location.hostname.split(".")[0];
  repoLink.href = `https://github.com/${userGuess}/${repoGuess}`;
} catch { /* noop */ }

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

  // 기본 검증
  if (!isFinite(lambda) || !isFinite(mu)) {
    return showError("λ, μ에 숫자를 입력해 주세요.");
  }
  if (mu <= 0 || lambda < 0) {
    return showError("λ ≥ 0, μ > 0 이어야 합니다.");
  }
  if (model === "mmc" && (!Number.isInteger(c) || c < 1)) {
    return showError("서버 수 c는 1 이상의 정수여야 합니다.");
  }

  // 계산
  const res = model === "mmc" ? computeMMC(lambda, mu, c) : computeMM1(lambda, mu);
  if (!res.ok) return showError(res.reason);

  // 출력
  out.model.textContent = res.model;
  out.c.textContent     = res.c;
  out.rho.textContent   = fmt(res.rho);
  out.L.textContent     = fmt(res.L);
  out.Lq.textContent    = fmt(res.Lq);
  out.W.textContent     = fmt(res.W) + timeUnit(units);
  out.Wq.textContent    = fmt(res.Wq) + timeUnit(units);
  out.P0.textContent    = fmt(res.P0);
  out.Pw.textContent    = fmt(res.Pw);

  // 공식 섹션
  formulae.innerHTML = model === "mmc"
    ? mmcFormulaeHTML()
    : mm1FormulaeHTML();

  show(results);
});

// ------- helpers -------
function getModel(){
  return document.querySelector('input[name="model"]:checked').value;
}
function showError(msg){
  errorBox.textContent = msg;
  show(errorBox);
}
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }
function timeUnit(sel){
  switch(sel){
    case "per_hour": return " 시간";
    case "per_min":  return " 분";
    case "per_sec":  return " 초";
    default: return "";
  }
}

// 공식 HTML
function mm1FormulaeHTML(){
  return `
  <ul>
    <li>안정 조건: <code>λ &lt; μ</code></li>
    <li>이용률: <code>ρ = λ / μ</code></li>
    <li>유휴 확률: <code>P₀ = 1 − ρ</code></li>
    <li>대기 발생 확률: <code>P_w = ρ</code></li>
    <li>평균 대기시간: <code>W_q = P_w / (μ − λ) = ρ / (μ − λ)</code></li>
    <li>평균 시스템시간: <code>W = W_q + 1/μ</code></li>
    <li>평균 대기열 길이: <code>L_q = λ · W_q</code></li>
    <li>평균 시스템 내 수: <code>L = λ · W</code></li>
  </ul>`;
}

function mmcFormulaeHTML(){
  return `
  <ul>
    <li>안정 조건: <code>λ &lt; c·μ</code> (즉 <code>ρ = λ/(cμ) &lt; 1</code>)</li>
    <li>제로상태 확률:
      <div><code>P₀ = \[ \sum_{n=0}^{c-1} \frac{a^n}{n!} + \frac{a^c}{c!(1-ρ)} \]^{-1}</code>, 
      <small>여기서 <code>a = λ/μ</code>, <code>ρ = a/c</code></small></div>
    </li>
    <li>Erlang C (대기 발생 확률):
      <div><code>P_w = \frac{a^c}{c!(1-ρ)} · P₀</code></div>
    </li>
    <li>평균 대기시간: <code>W_q = P_w / (cμ − λ)</code></li>
    <li>평균 시스템시간: <code>W = W_q + 1/μ</code></li>
    <li>평균 대기열 길이: <code>L_q = λ · W_q</code></li>
    <li>평균 시스템 내 수: <code>L = λ · W</code></li>
  </ul>`;
}
