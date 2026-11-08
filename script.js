'use strict';

/* =========================================================
   Taman Lily Kita 🌸
   ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- State & penyimpanan ---------- */
const KEY = 'lilyLoveV1';
const DEFAULTS = {
  nameA: '', nameB: '', since: '',
  reasons: [
    'Senyum kamu bikin hariku cerah ☀️',
    'Kamu selalu dengerin ceritaku 🥹',
    'Tawa kamu lucu banget 😆',
    'Kamu bikin aku jadi versi terbaik diriku 🌷',
    'Pelukan kamu rasanya kayak pulang 🏡',
    'Kamu sabar banget sama aku 💞'
  ],
  lilies: [], memories: [], letter: '', sound: true
};

function loadState() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { /* abaikan */ }
  return { ...structuredClone(DEFAULTS), ...saved };
}
let S = loadState();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ } }

/* ---------- Suara (WebAudio, tanpa file) ---------- */
let ac;
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
function tone(i = 0, type = 'sine', vol = 0.12) {
  if (!S.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type;
    o.frequency.value = SCALE[Math.floor(i) % SCALE.length];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + 0.65);
  } catch (e) { /* abaikan */ }
}

/* ---------- Canvas efek ---------- */
const cv = $('#fx'), cx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W = 0, H = 0;
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize);
resize();

const PET_COL = ['#ffb3d1', '#ff9ec7', '#ffd6e7', '#ffffff', '#e5d4ff', '#ffe3c2'];
const HEART_COL = ['#ff6fa9', '#ff9ec7', '#ff8fb1', '#ffb3d1'];
const SPARK_COL = ['#fff3a8', '#ffffff', '#ffd1e6', '#e5d4ff'];

const ambient = [];
const parts = [];

function newAmbient(randomY) {
  return {
    x: rnd(0, W), y: randomY ? rnd(0, H) : rnd(-60, -10),
    s: rnd(6, 14), vx: rnd(-0.3, 0.3), vy: rnd(0.4, 1.1),
    r: rnd(0, 6.28), vr: rnd(-0.03, 0.03), sw: rnd(0, 6.28),
    c: pick(PET_COL), a: rnd(0.5, 0.9)
  };
}
for (let i = 0; i < (reduce ? 8 : 26); i++) ambient.push(newAmbient(true));

function drawPetal(x, y, s, r, c, a) {
  cx.save(); cx.translate(x, y); cx.rotate(r); cx.globalAlpha = a; cx.fillStyle = c;
  cx.beginPath();
  cx.moveTo(0, -s);
  cx.bezierCurveTo(s * 0.8, -s * 0.4, s * 0.6, s * 0.7, 0, s);
  cx.bezierCurveTo(-s * 0.6, s * 0.7, -s * 0.8, -s * 0.4, 0, -s);
  cx.fill();
  cx.lineWidth = 1; cx.strokeStyle = 'rgba(107,58,85,.35)'; cx.stroke();
  cx.restore();
}
function drawHeart(x, y, s, r, c, a) {
  cx.save(); cx.translate(x, y); cx.rotate(r); cx.globalAlpha = a; cx.fillStyle = c;
  cx.beginPath();
  cx.moveTo(0, s * 0.35);
  cx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.4);
  cx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.35);
  cx.fill();
  cx.restore();
}
function drawSpark(x, y, s, r, c, a) {
  cx.save(); cx.translate(x, y); cx.rotate(r); cx.globalAlpha = a; cx.fillStyle = c;
  cx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 ? s * 0.35 : s;
    const ang = (Math.PI / 4) * i;
    cx[i ? 'lineTo' : 'moveTo'](Math.sin(ang) * rad, -Math.cos(ang) * rad);
  }
  cx.closePath(); cx.fill();
  cx.restore();
}
const DRAW = { petal: drawPetal, heart: drawHeart, spark: drawSpark };

function addPart(x, y, o) {
  parts.push({
    x, y, vx: 0, vy: 0, g: 0.12, s: 8, r: rnd(0, 6.28), vr: rnd(-0.15, 0.15),
    life: 1, decay: 0.012, kind: 'petal', c: '#ffb3d1', ...o
  });
}

/** Semburan partikel di posisi layar (x, y) */
function burst(x, y, n = 10, kind = 'mix', color) {
  for (let i = 0; i < n; i++) {
    const k = kind === 'mix' ? pick(['petal', 'petal', 'heart', 'spark']) : kind;
    const ang = rnd(0, Math.PI * 2), sp = rnd(1.5, 5.5);
    addPart(x, y, {
      kind: k, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
      s: k === 'spark' ? rnd(4, 8) : rnd(6, 12),
      c: color || (k === 'heart' ? pick(HEART_COL) : k === 'spark' ? pick(SPARK_COL) : pick(PET_COL)),
      decay: rnd(0.008, 0.016)
    });
  }
}

/** Hujan konfeti kelopak dari atas layar */
function confetti() {
  if (reduce) { burst(W / 2, H / 3, 20); return; }
  for (let i = 0; i < 90; i++) {
    const k = pick(['petal', 'petal', 'heart', 'spark']);
    addPart(rnd(0, W), rnd(-H * 0.4, -10), {
      kind: k, vx: rnd(-1, 1), vy: rnd(1, 3.5), g: 0.02,
      s: k === 'spark' ? rnd(4, 8) : rnd(7, 13),
      c: k === 'heart' ? pick(HEART_COL) : k === 'spark' ? pick(SPARK_COL) : pick(PET_COL),
      decay: 0.004
    });
  }
}

function tick() {
  cx.clearRect(0, 0, W, H);
  for (const p of ambient) {
    p.sw += 0.02;
    p.x += p.vx + Math.sin(p.sw) * 0.6;
    p.y += p.vy; p.r += p.vr;
    if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, newAmbient(false));
    drawPetal(p.x, p.y, p.s, p.r, p.c, p.a);
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= p.decay;
    p.vx *= 0.99;
    if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
    DRAW[p.kind](p.x, p.y, p.s, p.r, p.c, Math.min(1, p.life * 1.5));
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* Kilau mengikuti kursor / jari */
let lastMove = 0;
addEventListener('pointermove', e => {
  const t = performance.now();
  if (t - lastMove < 45 || reduce) return;
  lastMove = t;
  addPart(e.clientX, e.clientY, {
    kind: 'spark', s: rnd(3, 7), c: pick(SPARK_COL),
    vx: rnd(-0.4, 0.4), vy: rnd(0, 0.6), g: 0.01, decay: 0.035
  });
});

/* Klik di mana saja = kelopak kecil */
document.addEventListener('click', e => {
  if (e.target.closest('input,textarea')) return;
  burst(e.clientX, e.clientY, 5, 'petal');
});

/* ---------- Lily SVG ---------- */
const VARS = {
  pink: ['#ffc2dc', '#ff8fbd'],
  white: ['#ffffff', '#f0dce8'],
  peach: ['#ffd2b8', '#ffab8a'],
  lilac: ['#e6d6ff', '#bf9cf5'],
  coral: ['#ffb0b8', '#ff7f93']
};
const VAR_KEYS = Object.keys(VARS);
const INK = '#6b3a55';

function lilySVG(variant = 'pink', o = {}) {
  const { stem = true, animate = true, base = 0 } = o;
  const [p1, p2] = VARS[variant] || VARS.pink;
  const vb = stem ? '0 0 200 320' : '0 0 200 200';
  let s = `<svg class="lily${animate ? '' : ' static'}" viewBox="${vb}" style="--base:${base}s" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bunga lily lucu">`;

  if (stem) {
    s += `<g class="stem-g">
      <path d="M100 120C93 180 108 245 100 320" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M100 120C93 180 108 245 100 320" stroke="#6fcf97" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M99 238C62 232 40 205 36 178C72 180 95 202 99 238Z" fill="#7fcf9f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M99 238C80 215 60 198 44 186" stroke="#4fae7b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M103 272C140 268 162 242 166 216C130 218 107 238 103 272Z" fill="#8fdcab" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M103 272C122 250 142 234 158 224" stroke="#4fae7b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  const petal = (a, i, front) => `
    <g class="pg" transform="translate(100 100) rotate(${a})">
      <g class="pb" style="--d:${(i * 0.09).toFixed(2)}s">
        <g class="pf">
          <path d="M0 0C-27 -22 -25 -68 0 -93C25 -68 27 -22 0 0Z" fill="${front ? p1 : p2}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M0 -20L0 -64" stroke="${front ? p2 : p1}" stroke-width="3" stroke-linecap="round" opacity=".75"/>
          <circle cx="-7" cy="-42" r="2.3" fill="${front ? p2 : p1}"/>
          <circle cx="7" cy="-52" r="2" fill="${front ? p2 : p1}"/>
          <circle cx="-3" cy="-64" r="1.8" fill="${front ? p2 : p1}"/>
        </g>
      </g>
    </g>`;

  // kelopak belakang dulu, lalu depan
  [60, 180, 300].forEach((a, i) => { s += petal(a, i * 2 + 1, false); });
  [0, 120, 240].forEach((a, i) => { s += petal(a, i * 2, true); });

  // benang sari
  for (let k = 0; k < 6; k++) {
    s += `<g transform="translate(100 100) rotate(${30 + k * 60})">
      <path d="M0 0Q5 -26 0 -46" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-49" rx="4" ry="6" fill="#ffcf5c" stroke="${INK}" stroke-width="2"/>
    </g>`;
  }

  // wajah kawaii di tengah
  s += `
    <circle cx="100" cy="100" r="23" fill="#fff4c9" stroke="${INK}" stroke-width="3"/>
    <g class="eye"><ellipse cx="91" cy="98" rx="3" ry="4" fill="${INK}"/><circle cx="92" cy="96.5" r="1.1" fill="#fff"/></g>
    <g class="eye"><ellipse cx="109" cy="98" rx="3" ry="4" fill="${INK}"/><circle cx="110" cy="96.5" r="1.1" fill="#fff"/></g>
    <path d="M95 106Q100 112 105 106" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="83" cy="106" rx="4.5" ry="2.8" fill="#ff9ec7" opacity=".75"/>
    <ellipse cx="117" cy="106" rx="4.5" ry="2.8" fill="#ff9ec7" opacity=".75"/>
  </svg>`;
  return s;
}

/* ---------- Setup nama & tanggal ---------- */
const welcome = $('#welcome');
function showWelcome() {
  $('#setupLily').innerHTML = lilySVG('pink', { stem: false });
  $('#nameA').value = S.nameA;
  $('#nameB').value = S.nameB;
  $('#since').value = S.since || new Date().toISOString().slice(0, 10);
  welcome.hidden = false;
  setTimeout(() => $('#nameA').focus(), 100);
}
$('#editBtn').addEventListener('click', showWelcome);
$('#setupForm').addEventListener('submit', e => {
  e.preventDefault();
  S.nameA = $('#nameA').value.trim();
  S.nameB = $('#nameB').value.trim();
  S.since = $('#since').value;
  if (!S.lilies.length) {
    S.lilies = [
      { id: Date.now(), x: 22, size: 100, v: 'pink', wish: 'Semoga kita selalu bahagia 💕' },
      { id: Date.now() + 1, x: 50, size: 130, v: 'white', wish: 'Semoga kita makin sayang tiap hari 🌷' },
      { id: Date.now() + 2, x: 78, size: 110, v: 'lilac', wish: 'Semoga bisa jalan-jalan bareng terus ✨' }
    ];
    renderLilies();
  }
  save();
  welcome.hidden = true;
  applyNames();
  updateCounter();
  renderTimeline();
  fillLetterInput();
  confetti();
  tone(2); setTimeout(() => tone(4), 120); setTimeout(() => tone(5), 240);
});

function applyNames() {
  $('#logoNames').textContent = `${S.nameA} & ${S.nameB}`;
  $('#nameAText').textContent = S.nameA;
  $('#nameBText').textContent = S.nameB;
  document.title = `${S.nameA} & ${S.nameB} 🌸 Taman Lily`;
}

/* ---------- Hero ---------- */
const heroMsgs = [
  'Hehe, geli~ 🤭', 'Aku sayang kamu! 💗', 'Lagi apa hayo? 👀', 'Peluk dulu sini 🤗',
  'Kamu cantik/ganteng hari ini ✨', 'Tetap senyum ya 🌷', 'Cium jauh 😘', 'Kamu rumahku 🏡'
];
let heroIdx = 0;
$('#heroLily').addEventListener('click', e => {
  const el = e.currentTarget;
  el.classList.remove('jelly'); void el.offsetWidth; el.classList.add('jelly');
  $('#heroBubble').textContent = heroMsgs[heroIdx++ % heroMsgs.length];
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height * 0.3, 14, 'heart');
  tone(heroIdx);
});

/* ---------- Penghitung waktu ---------- */
function updateCounter() {
  if (!S.since) return;
  const start = new Date(S.since + 'T00:00:00');
  const now = new Date();
  let diff = now - start;
  const future = diff < 0;
  diff = Math.abs(diff);
  const d = Math.floor(diff / 864e5);
  $('#cDays').textContent = d.toLocaleString('id-ID');
  $('#cHours').textContent = Math.floor(diff / 36e5) % 24;
  $('#cMins').textContent = Math.floor(diff / 6e4) % 60;
  $('#cSecs').textContent = Math.floor(diff / 1e3) % 60;

  if (future) {
    $('#countNote').textContent = 'Menuju hari spesial kita 🎀';
    $('#countMonths').textContent = `${d} hari lagi!`;
    return;
  }
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months--;
  const nextMile = (Math.floor(d / 100) + 1) * 100;
  $('#countNote').textContent = `${S.nameA} & ${S.nameB}, makin hari makin sayang~`;
  $('#countMonths').textContent = `≈ ${months} bulan · ${nextMile - d} hari lagi menuju hari ke-${nextMile} 🎉`;
}
setInterval(updateCounter, 1000);

/* ---------- Taman ---------- */
const garden = $('#garden'), liliesEl = $('#lilies'), ground = $('#ground');
const gardenMsg = $('#gardenMsg');
const sweet = [
  'Lily ini nggak nulis apa-apa, tapi dia sayang kalian 🌷',
  'Tumbuhlah terus bareng cinta kita 💞',
  'Kamu itu bunga paling cantik di tamanku 🌸'
];
let pendingX = null, msgTimer, msgId = null;

function updateGardenCount() { $('#gardenCount').textContent = `${S.lilies.length} lily di taman kita`; }

function addLilyEl(l, animate) {
  const el = document.createElement('div');
  el.className = 'g-lily';
  el.dataset.id = l.id;
  el.style.cssText = `--x:${l.x}%;--w:${l.size}px;z-index:${Math.round(l.size)};--sd:${rnd(0, 2).toFixed(2)}s`;
  el.innerHTML = lilySVG(l.v, { animate, base: 0.5 });
  el.addEventListener('click', e => {
    e.stopPropagation();
    showWish(l.id);
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.28, 8, 'heart');
    tone(rnd(0, 6));
  });
  liliesEl.appendChild(el);
}
function renderLilies() {
  liliesEl.innerHTML = '';
  S.lilies.forEach(l => addLilyEl(l, false));
  updateGardenCount();
}
function showWish(id) {
  const l = S.lilies.find(x => x.id === id);
  if (!l) return;
  msgId = id;
  $('#gardenMsgText').textContent = '💬 ' + (l.wish || pick(sweet));
  gardenMsg.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => gardenMsg.classList.remove('show'), 5000);
}
$('#gardenMsgRm').addEventListener('click', e => {
  e.stopPropagation();
  if (msgId == null) return;
  S.lilies = S.lilies.filter(x => x.id !== msgId);
  const el = $(`.g-lily[data-id="${msgId}"]`);
  if (el) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 3, 10, 'petal'); el.remove(); }
  gardenMsg.classList.remove('show');
  msgId = null; save(); updateGardenCount();
});

const wishModal = $('#wishModal');
ground.addEventListener('click', e => {
  const r = garden.getBoundingClientRect();
  pendingX = Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100));
  $('#wishInput').value = '';
  wishModal.hidden = false;
  setTimeout(() => $('#wishInput').focus(), 80);
});
function plant(wish) {
  const l = {
    id: Date.now(), x: pendingX, size: Math.round(rnd(95, 145)),
    v: pick(VAR_KEYS), wish
  };
  S.lilies.push(l);
  addLilyEl(l, true);
  save(); updateGardenCount();
  wishModal.hidden = true;
  const r = garden.getBoundingClientRect();
  burst(r.left + (r.width * l.x) / 100, r.bottom - 70, 12, 'mix');
  tone(0); setTimeout(() => tone(3), 100); setTimeout(() => tone(5), 200);
}
$('#wishForm').addEventListener('submit', e => { e.preventDefault(); plant($('#wishInput').value.trim()); });
$('#wishSkip').addEventListener('click', () => plant(''));

$('#waterBtn').addEventListener('click', () => {
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('i');
    d.className = 'drop';
    d.style.left = rnd(2, 98) + '%';
    d.style.animationDelay = rnd(0, 0.7) + 's';
    garden.appendChild(d);
    setTimeout(() => d.remove(), 1900);
  }
  S.lilies.forEach(l => { l.size = Math.min(175, l.size + 6); });
  $$('.g-lily').forEach(el => {
    const l = S.lilies.find(x => String(x.id) === el.dataset.id);
    if (l) el.style.setProperty('--w', l.size + 'px');
  });
  save();
  [0, 2, 4].forEach((n, i) => setTimeout(() => tone(n, 'triangle', 0.08), i * 120));
});
$('#clearBtn').addEventListener('click', () => {
  if (!S.lilies.length || !confirm('Cabut semua lily dari taman?')) return;
  S.lilies = []; save(); renderLilies(); gardenMsg.classList.remove('show');
});

/* ---------- Alasan sayang (kartu balik) ---------- */
function renderReasons() {
  const box = $('#reasonCards');
  box.innerHTML = '';
  S.reasons.forEach((text, i) => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'flip';
    c.innerHTML = `<span class="flip-in">
      <span class="side front"><b>Alasan #${i + 1}</b>${lilySVG(VAR_KEYS[i % VAR_KEYS.length], { stem: false, animate: false })}<small>ketuk aku~</small></span>
      <span class="side back"><span class="txt"></span><i class="del" role="button" aria-label="Hapus alasan">✕</i></span>
    </span>`;
    $('.txt', c).textContent = text;
    c.addEventListener('click', e => {
      if (e.target.closest('.del')) {
        S.reasons.splice(i, 1); save(); renderReasons(); return;
      }
      c.classList.toggle('flipped');
      const r = c.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 7, 'heart');
      tone(i);
    });
    box.appendChild(c);
  });
}
$('#reasonForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#reasonInput').value.trim();
  if (!v) return;
  S.reasons.push(v); save(); renderReasons();
  $('#reasonInput').value = '';
  tone(4); burst(innerWidth / 2, innerHeight / 2, 12, 'heart');
});

/* ---------- Ramalan kelopak ---------- */
const oracleLines = ['Sayang~ 💗', 'Banget~ 💕', 'Cinta~ 🌷', 'Kangen~ 🥺', 'Peluk~ 🤗', 'SELAMANYA! 💖'];
let plucked = 0;
function buildOracle() {
  plucked = 0;
  const box = $('#oracle');
  box.innerHTML = lilySVG('pink', { stem: false });
  $('#oracleText').textContent = 'Cabut kelopaknya satu-satu~';
  $('#oracleReset').hidden = true;
  $$('.pg', box).forEach(g => {
    g.addEventListener('click', () => {
      if (g.classList.contains('gone')) return;
      g.classList.add('gone');
      const r = g.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 6, 'petal');
      tone(plucked, 'triangle');
      $('#oracleText').textContent = oracleLines[plucked];
      plucked++;
      if (plucked === 6) {
        confetti();
        $('#oracleReset').hidden = false;
        [0, 2, 4, 5].forEach((n, i) => setTimeout(() => tone(n), i * 140));
      }
    });
  });
}
$('#oracleReset').addEventListener('click', buildOracle);

/* ---------- Kenangan ---------- */
function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function renderTimeline() {
  const box = $('#timeline');
  box.innerHTML = '';
  if (!S.memories.length) {
    box.innerHTML = '<p class="empty">Belum ada kenangan… yuk tulis yang pertama 🌸</p>';
    return;
  }
  [...S.memories].sort((a, b) => a.date.localeCompare(b.date)).forEach(m => {
    const it = document.createElement('div');
    it.className = 'tl-item';
    it.innerHTML = '<span class="tl-date"></span><h3></h3><p></p><button class="tl-del" type="button" title="Hapus">✕</button>';
    $('.tl-date', it).textContent = fmtDate(m.date);
    $('h3', it).textContent = m.title;
    $('p', it).textContent = m.text;
    $('.tl-del', it).addEventListener('click', () => {
      S.memories = S.memories.filter(x => x.id !== m.id); save(); renderTimeline();
    });
    it.addEventListener('click', e => {
      if (e.target.closest('.tl-del')) return;
      const r = it.getBoundingClientRect();
      burst(r.left + 20, r.top + 20, 6, 'heart'); tone(3);
    });
    box.appendChild(it);
  });
}
$('#memForm').addEventListener('submit', e => {
  e.preventDefault();
  S.memories.push({
    id: Date.now(), date: $('#memDate').value,
    title: $('#memTitle').value.trim(), text: $('#memText').value.trim()
  });
  save(); renderTimeline();
  e.target.reset();
  $('#memDate').value = new Date().toISOString().slice(0, 10);
  tone(5); burst(innerWidth / 2, innerHeight / 2, 14, 'mix');
});

/* ---------- Surat cinta ---------- */
function defaultLetter() {
  return `Untuk ${S.nameB || 'kamu'},\n\nTerima kasih sudah jadi tempat paling nyaman buat pulang. Kamu itu seperti lily: lembut, wangi, dan selalu bikin hariku mekar.\n\nAku sayang kamu hari ini, besok, dan seterusnya. 🌷\n\nDengan seluruh cinta,\n${S.nameA || 'aku'} 💖`;
}
const envelope = $('#envelope');
let typer;
function typeLetter(text) {
  const el = $('#letterText');
  clearInterval(typer);
  el.textContent = '';
  const chars = [...text];
  let i = 0;
  typer = setInterval(() => {
    el.textContent = chars.slice(0, ++i).join('');
    if (i >= chars.length) clearInterval(typer);
  }, 32);
}
function toggleEnvelope() {
  const open = !envelope.classList.contains('open');
  envelope.classList.toggle('open', open);
  $('#letterCard').classList.toggle('show', open);
  $('#envHint').textContent = open ? 'Ketuk lagi untuk menutup~' : 'Ketuk amplopnya~';
  if (open) {
    const r = envelope.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 40, 18, 'mix');
    [0, 2, 4].forEach((n, i) => setTimeout(() => tone(n), i * 130));
    setTimeout(() => typeLetter(S.letter || defaultLetter()), 500);
  } else {
    clearInterval(typer);
    tone(1);
  }
}
envelope.addEventListener('click', toggleEnvelope);
envelope.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEnvelope(); }
});
function fillLetterInput() { $('#letterInput').value = S.letter || defaultLetter(); }
$('#saveLetter').addEventListener('click', () => {
  S.letter = $('#letterInput').value;
  save();
  if (envelope.classList.contains('open')) typeLetter(S.letter);
  burst(innerWidth / 2, innerHeight / 2, 12, 'heart'); tone(4);
});

/* ---------- Suara on/off ---------- */
function syncSound() { $('#soundBtn').textContent = S.sound ? '🔊' : '🔇'; }
$('#soundBtn').addEventListener('click', () => {
  S.sound = !S.sound; save(); syncSound();
  if (S.sound) tone(3);
});

/* ---------- Muncul saat scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Easter egg: ketik "lily" atau "love" ---------- */
let keyBuf = '';
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea')) return;
  if (e.key === 'Escape') { wishModal.hidden = true; }
  keyBuf = (keyBuf + e.key.toLowerCase()).slice(-4);
  if (keyBuf === 'lily' || keyBuf === 'love') {
    confetti();
    $('#heroBubble').textContent = 'Kamu nemu rahasia! 🤫💖';
    [0, 1, 2, 3, 4, 5].forEach((n, i) => setTimeout(() => tone(n, 'triangle'), i * 90));
  }
});
// Tutup dialog harapan kalau klik di luar kartu
wishModal.addEventListener('click', e => { if (e.target === wishModal) wishModal.hidden = true; });

/* ---------- Mulai ---------- */
function init() {
  $('#heroLily').innerHTML = lilySVG('pink', { base: 0.2 });
  $('#memDate').value = new Date().toISOString().slice(0, 10);
  syncSound();
  renderLilies();
  renderReasons();
  buildOracle();
  renderTimeline();
  fillLetterInput();
  if (!S.nameA || !S.nameB || !S.since) {
    showWelcome();
  } else {
    applyNames();
    updateCounter();
  }
}
init();
