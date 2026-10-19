/* ==========================================================
   app.js — lógica da interface, prompts e chamadas às APIs de IA
   ========================================================== */

const $ = (id) => document.getElementById(id);
const els = {
  canvas: $("canvas"), placeholder: $("placeholder"), loader: $("loader"), loaderText: $("loaderText"),
  preview: $("preview"), generate: $("generateBtn"), download: $("downloadBtn"), whatsapp: $("whatsappBtn"),
  counter: $("counter"), today: $("todayLabel"), theme: $("themeBtn"),
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
  // Erros ficam mais tempo na tela para dar tempo de ler no celular.
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, type === "error" ? 9000 : 3200);
}

/* ---------- erros nunca ficam silenciosos (importante no celular) ---------- */
window.addEventListener("error", (e) => toast(`Erro: ${e.message || "falha inesperada"}`, "error"));
window.addEventListener("unhandledrejection", (e) =>
  toast(`Erro: ${e.reason?.message || "falha inesperada"}`, "error"));

/** Converte um Blob em imagem. Usa createImageBitmap e, se o navegador falhar, cai para <img>. */
async function blobToImage(blob) {
  try {
    return await createImageBitmap(blob);
  } catch (err) {
    console.warn("createImageBitmap falhou, usando <img>:", err);
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }
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

/* ---------- prompt da IMAGEM ---------- */
function buildPrompt(day, elements, religious, artStyle) {
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
    `Emotional tone: ${DAY_MOODS[day.index]}.`,
    `Art style: ${artStyle}.`,
    `Composition: balanced and centered, rule of thirds, strong depth of field with layered foreground, midground and background, soft bokeh, floating glowing sparkles, and calm natural open space in the upper third and the lower third so a text overlay stays readable.`,
    `Quality: ultra detailed, 8k, sharp focus, intricate textures, professional color grading, award-winning composition.`,
    `Avoid: any text, letters, words, captions, watermark, logo, signature, frame, border, deformed shapes, blurry or distorted objects, extra limbs.`,
  ].filter(Boolean).join(" ");
}

/* ---------- prompt da MENSAGEM (texto gerado por IA) ---------- */
function messageRequest(day, elements, religious) {
  const tone = religious ? "religioso, falando de Deus, fé ou bênçãos" : pick(MSG_TONES);
  const themes = pickMany(MSG_THEMES, 2).join(" e ");
  const seen = elements.map((e) => e.pt).concat(religious ? [religious.pt] : []).join(", ");
  return {
    system:
      "Você escreve mensagens curtas de bom dia no estilo carinhoso das mensagens que tias e tios brasileiros " +
      "compartilham no WhatsApp. Responda SOMENTE com a frase final, em português do Brasil, em uma única linha, " +
      "sem aspas, sem emojis, sem hashtags e sem explicações.",
    user:
      `Escreva uma frase de bom dia inédita e criativa, com 60 a 120 caracteres, para ${day.name}. ` +
      `Tom: ${tone}. Temas: ${themes}. Inspire-se nestes elementos da imagem: ${seen}. ` +
      `Mencione o dia da semana de forma natural.`,
  };
}

/** Limpa a resposta da IA: uma linha, sem emojis/aspas/links, tamanho seguro. Retorna null se inválida. */
function cleanMessage(raw) {
  if (!raw || typeof raw !== "string") return null;
  let t = raw.split(/\r?\n/).map((s) => s.trim()).find((s) => s.length >= 15 && !s.endsWith(":")) || "";
  t = t.replace(/\p{Extended_Pictographic}|️|‍/gu, "")
       .replace(/#\w+/g, "")
       .replace(/^["'“”‘’«»\s]+|["'“”‘’«»\s]+$/g, "")
       .replace(/\s+/g, " ")
       .trim();
  if (t.length < 15 || t.length > 180) return null;
  if (/pollinations|https?:|[{}]/i.test(t)) return null; // lixo/propaganda/JSON de erro
  if (!/[.!?…]$/.test(t)) t += ".";
  return t;
}

/* ---------- Pollinations: fila gratuita compartilhada (imagem e texto) ----------
   Limite anônimo: 1 requisição a cada ~15s. O app espera a vez, tem timeout
   e tenta de novo com configurações mais leves para evitar "Failed to fetch". */
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

/** Milissegundos que faltam até poder fazer outra requisição gratuita. */
const polliWaitMs = () => Math.max(0, lastPolliAt + POLLI_GAP_MS - Date.now());

function markPolliRequest() {
  lastPolliAt = Date.now();
  store.set("bd-last-req", String(lastPolliAt));
}

async function waitForSlot(onStatus) {
  while (polliWaitMs() > 0) {
    onStatus(`Aguardando a fila gratuita da IA… ${Math.ceil(polliWaitMs() / 1000)}s`);
    await sleep(500);
  }
}

/** Imagem: Flux via Pollinations (gratuito, sem chave). */
async function generateWithPollinations(prompt, onStatus) {
  for (let i = 0; i < POLLI_ATTEMPTS.length; i++) {
    const a = POLLI_ATTEMPTS[i];
    await waitForSlot(onStatus);
    markPolliRequest();
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
      return await blobToImage(await res.blob());
    } catch (err) {
      console.warn(`Tentativa ${i + 1} falhou:`, err);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("O serviço gratuito de imagens está ocupado agora. Aguarde um minuto e tente de novo.");
}

/** Texto: modelo de linguagem do Pollinations (gratuito, sem chave). */
async function textWithPollinations({ system, user }, onStatus) {
  await waitForSlot(onStatus);
  markPolliRequest();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const url =
      `https://text.pollinations.ai/${encodeURIComponent(user)}` +
      `?model=openai&seed=${Math.floor(Math.random() * 1e9)}&system=${encodeURIComponent(system)}` +
      `&referrer=bom-dia-generator`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
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

/* ---------- OpenAI (opcional, requer chave) ---------- */
/** Imagem: gpt-image-1, tamanho 1024x1536 (recortado depois no canvas). */
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
  return blobToImage(blob);
}

/** Texto: gpt-4o-mini (barato e rápido). */
async function textWithOpenAI({ system, user }, key) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini", temperature: 1, max_tokens: 100,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI respondeu ${res.status}`);
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Gera a frase de bom dia por IA. Se a IA de texto falhar, usa uma frase de reserva
 * (data.js) para nunca perder a imagem já gerada.
 */
async function generateMessage(day, elements, religious, provider, onStatus) {
  const req = messageRequest(day, elements, religious);
  try {
    const raw = provider === "openai"
      ? await textWithOpenAI(req, store.get("bd-openai-key", ""))
      : await textWithPollinations(req, onStatus);
    const text = cleanMessage(raw);
    if (text) return { text, ai: true };
    console.warn("Resposta de texto inválida:", raw);
  } catch (err) {
    console.warn("Mensagem por IA falhou, usando frase de reserva:", err);
  }
  return { text: pick(MESSAGES[day.index]), ai: false };
}

/* ---------- geração ---------- */
let busy = false;
let lastBlob = null;   // JPG pronto para baixar/compartilhar
let lastName = "";

const canvasToJpeg = () =>
  new Promise((resolve) => els.canvas.toBlob(resolve, "image/jpeg", 0.9));

async function generate() {
  if (busy) return;
  busy = true;
  els.generate.disabled = true;
  els.generate.textContent = "Gerando…";
  els.loader.hidden = false;
  // No celular a prévia fica abaixo dos botões: leva a tela até ela para o progresso ficar visível.
  els.preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  const status = (t) => (els.loaderText.textContent = t);
  status("Sorteando elementos…");

  try {
    // 1) sorteios
    const day = todayInfo();
    const elements = pickMany(ELEMENTS, 3 + Math.floor(Math.random() * 3));
    const religious = Math.random() < RELIGIOUS_CHANCE ? pick(RELIGIOUS) : null;
    const style = pick(TEXT_STYLES);
    const prompt = buildPrompt(day, elements, religious, pick(ART_STYLES));
    const provider = store.get("bd-provider", "pollinations");

    // 2) imagem por IA
    status("A IA está pintando sua imagem… (pode levar alguns segundos)");
    const bg = provider === "openai"
      ? await generateWithOpenAI(prompt, store.get("bd-openai-key", ""))
      : await generateWithPollinations(prompt, status);

    // 3) frase por IA (depois da imagem, assim a fila gratuita já liberou)
    status("A IA está escrevendo a mensagem de bom dia…");
    const msg = await generateMessage(day, elements, religious, provider, status);
    if (!msg.ai) toast("A IA de texto estava ocupada, usei uma frase de reserva.");

    // 4) texto + assinatura desenhados sobre a imagem
    status("Finalizando a imagem…");
    await composeImage(els.canvas, bg, {
      message: msg.text, dayName: day.name, greeting: pick(GREETINGS), style, signature: SIGNATURE,
    });

    // 5) JPG pronto (leve) para baixar e compartilhar
    lastBlob = await canvasToJpeg();
    if (!lastBlob) throw new Error("Não foi possível preparar a imagem.");
    lastName = `bom-dia-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}.jpg`;

    els.canvas.hidden = false;
    els.placeholder.hidden = true;
    els.preview.classList.add("has-image");
    els.download.disabled = false;
    els.whatsapp.disabled = false;
    $("elementsLabel").textContent = elements.map((e) => e.pt).concat(religious ? [religious.pt] : []).join(", ");

    count += 1;
    store.set("bd-count", String(count));
    els.counter.textContent = count;
    toast("Imagem gerada com sucesso! 🌸");
  } catch (err) {
    console.error(err);
    // O Brave bloqueia pedidos a outros sites com os "Shields"; avisa como resolver.
    const hint = navigator.brave
      ? " Dica: toque no ícone do leão (Shields) ao lado do endereço e desative para este site."
      : "";
    toast(`Não foi possível gerar: ${err.message}${hint}`, "error");
  } finally {
    els.loader.hidden = true;
    busy = false;
    startCooldownUI();
  }
}

/* ---------- download em JPG ---------- */
function saveBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function download() {
  if (!lastBlob) return toast("Gere uma imagem primeiro.", "error");
  saveBlob(lastBlob, lastName);
  toast("Download iniciado! 📥");
}

/* ---------- enviar para o WhatsApp ----------
   Celular: abre o compartilhamento do sistema já com a foto anexada (escolha o WhatsApp).
   Computador/sem suporte: baixa a foto e abre o WhatsApp para você anexá-la. */
async function shareWhatsApp() {
  if (!lastBlob) return toast("Gere uma imagem primeiro.", "error");
  const file = new File([lastBlob], lastName, { type: "image/jpeg" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err.name === "AbortError") return; // a pessoa cancelou
      console.warn("Compartilhamento falhou, usando alternativa:", err);
    }
  }

  saveBlob(lastBlob, lastName);
  window.open("https://wa.me/?text=" + encodeURIComponent("Bom dia! 🌞"), "_blank", "noopener");
  toast("Foto baixada! Anexe-a na conversa do WhatsApp que abriu. 📎");
}

els.generate.addEventListener("click", generate);
els.download.addEventListener("click", download);
els.whatsapp.addEventListener("click", shareWhatsApp);

/* Ao abrir a página, respeita a fila gratuita caso o último pedido tenha sido há pouco. */
if (polliWaitMs() > 0) startCooldownUI();
