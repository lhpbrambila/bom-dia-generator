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
  const list = elements.map((e) => e.en).join(", ");
  const rel = religious ? `, and also ${religious.en}` : "";
  return (
    `A hyper detailed, beautiful "good morning" greeting card background for ${day.name}, ` +
    `featuring ${list}${rel}. ${artStyle}. Inspirational, warm, affectionate atmosphere, ` +
    `classic Brazilian WhatsApp good morning message style. ` +
    `Mood of the message: "${message}". ` +
    `Vertical composition, leave calm open space at the top and at the bottom for text. ` +
    `IMPORTANT: absolutely no text, no letters, no words, no watermark in the image.`
  );
}

/* ---------- provedores de IA ---------- */
/** Flux via Pollinations: gratuito, sem chave. Retorna um ImageBitmap. */
async function generateWithPollinations(prompt) {
  const seed = Math.floor(Math.random() * 1e9);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=960&height=1720&model=flux&nologo=true&enhance=true&seed=${seed}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations respondeu ${res.status}`);
  return createImageBitmap(await res.blob());
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
    els.loaderText.textContent = "A IA está pintando sua imagem… (pode levar alguns segundos)";
    const provider = store.get("bd-provider", "pollinations");
    const bg = provider === "openai"
      ? await generateWithOpenAI(prompt, store.get("bd-openai-key", ""))
      : await generateWithPollinations(prompt);

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
    els.generate.disabled = false;
    busy = false;
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
