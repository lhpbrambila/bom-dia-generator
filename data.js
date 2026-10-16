/* ==========================================================
   app.js — lógica da interface, prompt e chamada às APIs de IA
   ========================================================== */

const $ = (id) => document.getElementById(id);
const els = {
  canvas: $("canvas"), placeholder: $("placeholder"), loader: $("loader"), loaderText: $("loaderText"),
  preview: $("preview"), generate: $("generateBtn"), download: $("downloadBtn"),
  counter: $("counter"), today: $("todayLabel"), theme: $("themeBtn"),
  promptCard: $("promptCard"), promptText: $("promptText"),
  settingsBtn: $("settingsBtn"), dialog: $("settingsDialog"),
  provider: $("providerSelect"), keyField: $("keyField"), apiKey: $("apiKeyInput"),
};

const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

/* ---------- utilitários ---------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function pickMany(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function toast(msg, type = "ok") {
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  $("toasts").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
}

/* ---------- tema ---------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  els.theme.textContent = theme === "dark" ? "☀️" : "🌙";
  store.set("bd-theme", theme);
}
applyTheme(store.get("bd-theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
els.theme.addEventListener("click", () =>
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

/* ---------- contador ---------- */
let count = parseInt(store.get("bd-count", "0"), 10) || 0;
els.counter.textContent = count;

/* ---------- dia atual ---------- */
function todayInfo() {
  const d = new Date().getDay();
  return { index: d, name: DAYS[d] };
}
els.today.textContent = todayInfo().name;

/* ---------- configurações ---------- */
els.provider.value = store.get("bd-provider", "pollinations");
els.apiKey.value = store.get("bd-openai-key", "");
const syncKeyField = () => (els.keyField.hidden = els.provider.value !== "openai");
syncKeyField();
els.provider.addEventListener("change", syncKeyField);
els.settingsBtn.addEventListener("click", () => els.dialog.showModal());
els.dialog.addEventListener("close", () => {
  if (els.dialog.returnValue === "save") {
    store.set("bd-provider", els.provider.value);
    store.set("bd-openai-key", els.apiKey.value.trim());
    toast("Configurações salvas ✅");
  } else {
    els.provider.value = store.get("bd-provider", "pollinations");
    els.apiKey.value = store.get("bd-openai-key", "");
    syncKeyField();
  }
});

/* ---------- montagem do prompt ---------- */
function buildPrompt(day, message, elements, religious, artStyle) {
  // Prompt em camadas: primeiro plano, plano médio e fundo, mais cenário,
  // luz, paleta, humor do dia, estilo e qualidade.
  const d = (e) => ELEMENT_DETAIL[e.pt] || e.en;
  const dr = (e) => RELIGIOUS_DETAIL[e.pt] || e.en;
  const [hero, mid, ...rest] = elements;

  return [
    `Masterpiece vertical 9:16 "good morning" greeting card illustration for ${day.name}, in the beloved Brazilian WhatsApp bom dia style: joyful, emotional, heartwarming and inspiring.`,
    `FOREGROUND, the main hero of the image: ${d(hero)}.`,
    `MIDGROUND: ${d(mid)}.`,
    rest.length ? `BACKGROUND and ambient details: ${rest.map(d).join("; ")}.` : "",
    religious ? `A spiritual focal element placed gracefully in the upper center of the scene: ${dr(religious)}.` : "",
    `Setting: ${pick(SCENES)}.`,
    `Lighting: ${pick(LIGHTING)}.`,
    `Color palette: ${pick(PALETTES)}, extremely vivid and saturated.`,
    `Emotional tone: ${DAY_MOODS[day.index]}; the feeling of a warm message like "${message}".`,
    `Art style: ${artStyle}.`,
    `Composition: balanced and centered, rule of thirds, strong depth of field with layered foreground, midground and background, soft bokeh, floating glowing sparkles, and calm natural open space in the upper third and the lower third so a text overlay stays readable.`,
    `Quality: ultra detailed, 8k, sharp focus, intricate textures, professional color grading, award-winning composition.`,
    `Avoid: any text, letters, words, captions, watermark, logo, signature, frame, border, deformed shapes, blurry or distorted objects, extra limbs.`,
  ].filter(Boolean).join(" ");
}

/* ---------- provedores de IA ---------- */
/* ---- Pollinations (Flux): gratuito, sem chave ----
   Limite anônimo: 1 requisição a cada ~15s. Para evitar erros ("Failed to fetch"),
   o app espera a vez, tem timeout e tenta de novo com configurações mais leves. */
const POLLI_GAP_MS = 16000;
const POLLI_ATTEMPTS = [
  { model: "flux", w: 864, h: 1536 },
  { model: "flux", w: 768, h: 1376 },
  { model: "flux", w: 576, h: 1024 },
  { model: "turbo", w: 576, h: 1024 },
  { model: "turbo", w: 576, h: 1024 },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastPolliAt = parseInt(store.get("bd-last-req", "0"), 10) || 0;

/** Segundos que faltam até poder fazer outra requisição gratuita. */
const polliWaitMs = () => Math.max(0, lastPolliAt + POLLI_GAP_MS - Date.now());

async function waitForSlot(onStatus) {
  while (polliWaitMs() > 0) {
    onStatus(`Aguardando a fila gratuita da IA… ${Math.ceil(polliWaitMs() / 1000)}s`);
    await sleep(500);
  }
}

async function generateWithPollinations(prompt, onStatus) {
  for (let i = 0; i < POLLI_ATTEMPTS.length; i++) {
    const a = POLLI_ATTEMPTS[i];
    await waitForSlot(onStatus);
    lastPolliAt = Date.now();
    store.set("bd-last-req", String(lastPolliAt));
    onStatus(i === 0
      ? "A IA está pintando sua obra de arte em alta qualidade… (20 a 60s)"
      : `Servidor ocupado, tentando de novo (${i + 1}/${POLLI_ATTEMPTS.length})…`);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 150000);
    try {
      const seed = Math.floor(Math.random() * 1e9);
      const url =
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
        `?width=${a.w}&height=${a.h}&model=${a.model}&nologo=true&seed=${seed}&referrer=bom-dia-generator`;
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!(res.headers.get("content-type") || "").startsWith("image/")) {
        throw new Error("Resposta inválida do servidor");
      }
      return await createImageBitmap(await res.blob());
    } catch (err) {
      console.warn(`Tentativa ${i + 1} falhou:`, err);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("O serviço gratuito de imagens está ocupado agora. Aguarde um minuto e tente de novo.");
}

/** Mostra a contagem regressiva no botão enquanto a fila gratuita não libera. */
let cooldownTimer = null;
function startCooldownUI() {
  clearInterval(cooldownTimer);
  const label = "Gerar Foto de Bom Dia";
  const tick = () => {
    const usingFree = store.get("bd-provider", "pollinations") === "pollinations";
    const ms = usingFree ? polliWaitMs() : 0;
    if (busy) return;
    if (ms > 0) {
      els.generate.disabled = true;
      els.generate.textContent = `Aguarde ${Math.ceil(ms / 1000)}s…`;
    } else {
      els.generate.disabled = false;
      els.generate.textContent = label;
      clearInterval(cooldownTimer);
    }
  };
  tick();
  cooldownTimer = setInterval(tick, 500);
}

/** OpenAI Images API (gpt-image-1), tamanho 1024x1536, redimensionado depois no canvas. */
async function generateWithOpenAI(prompt, key) {
  if (!key) throw new Error("Informe sua chave da OpenAI nas configurações ⚙️");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", n: 1 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI respondeu ${res.status}`);
  const item = data.data[0];
  const src = item.b64_json ? `data:image/png;base64,${item.b64_json}` : item.url;
  const blob = await (await fetch(src)).blob();
  return createImageBitmap(blob);
}

/* ---------- geração ---------- */
let busy = false;

async function generate() {
  if (busy) return;
  busy = true;
  els.generate.disabled = true;
  els.generate.textContent = "Gerando…";
  els.loader.hidden = false;
  els.loaderText.textContent = "Sorteando mensagem e elementos…";

  try {
    // 1) dia + mensagem + elementos sorteados
    const day = todayInfo();
    const message = pick(MESSAGES[day.index]);
    const elements = pickMany(ELEMENTS, 3 + Math.floor(Math.random() * 3));
    const religious = Math.random() < RELIGIOUS_CHANCE ? pick(RELIGIOUS) : null;
    const style = pick(TEXT_STYLES);
    const prompt = buildPrompt(day, message, elements, religious, pick(ART_STYLES));

    // 2) imagem por IA
    const status = (t) => (els.loaderText.textContent = t);
    status("A IA está pintando sua imagem… (pode levar alguns segundos)");
    const provider = store.get("bd-provider", "pollinations");
    const bg = provider === "openai"
      ? await generateWithOpenAI(prompt, store.get("bd-openai-key", ""))
      : await generateWithPollinations(prompt, status);

    // 3) texto desenhado sobre a imagem
    els.loaderText.textContent = "Escrevendo a mensagem…";
    await composeImage(els.canvas, bg, {
      message, dayName: day.name, greeting: pick(GREETINGS), style,
    });

    els.canvas.hidden = false;
    els.placeholder.hidden = true;
    els.preview.classList.add("has-image");
    els.download.disabled = false;
    els.promptText.textContent = prompt;
    els.promptCard.hidden = false;
    $("elementsLabel").textContent = elements.map((e) => e.pt).concat(religious ? [religious.pt] : []).join(", ");

    count += 1;
    store.set("bd-count", String(count));
    els.counter.textContent = count;
    toast("Imagem gerada com sucesso! 🌸");
  } catch (err) {
    console.error(err);
    toast(`Não foi possível gerar: ${err.message}`, "error");
  } finally {
    els.loader.hidden = true;
    busy = false;
    startCooldownUI();
  }
}

/* ---------- download em PNG ---------- */
function download() {
  els.canvas.toBlob((blob) => {
    if (!blob) return toast("Falha ao exportar a imagem.", "error");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(blob);
    a.download = `bom-dia-${stamp}-${Date.now().toString(36)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Download iniciado! 📥");
  }, "image/png");
}

els.generate.addEventListener("click", generate);
els.download.addEventListener("click", download);

/* Ao abrir a página, respeita a fila gratuita caso o último pedido tenha sido há pouco. */
if (polliWaitMs() > 0) startCooldownUI();
