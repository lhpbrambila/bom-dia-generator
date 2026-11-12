/* ==========================================================
   app.js — lógica da interface, prompts e chamadas às APIs de IA
   ========================================================== */

const $ = (id) => document.getElementById(id);
const els = {
  canvas: $("canvas"), placeholder: $("placeholder"), loader: $("loader"), loaderText: $("loaderText"),
  preview: $("preview"), generate: $("generateBtn"), download: $("downloadBtn"), whatsapp: $("whatsappBtn"),
  counter: $("counter"), today: $("todayLabel"), theme: $("themeBtn"),
  settingsBtn: $("settingsBtn"), dialog: $("settingsDialog"), periodPicker: $("periodPicker"),
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

/* ---------- período do dia (bom dia / boa tarde / boa noite) ---------- */
function periodByClock() {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? "manha" : h >= 12 && h < 18 ? "tarde" : "noite";
}
let currentPeriod = periodByClock();

function setPeriod(id) {
  currentPeriod = id;
  els.periodPicker.querySelectorAll(".period-btn").forEach((b) => {
    const on = b.dataset.period === id;
    b.classList.toggle("active", on);
    b.setAttribute("aria-checked", String(on));
  });
  // Só troca o texto do botão se ele não estiver ocupado ou em contagem regressiva.
  if (!els.generate.disabled) els.generate.textContent = PERIODS[id].button;
}
els.periodPicker.addEventListener("click", (e) => {
  const btn = e.target.closest(".period-btn");
  if (btn) setPeriod(btn.dataset.period);
});

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

/* ---------- prompt da IMAGEM (somente paisagens fotográficas) ----------
   Uma única cena coerente por imagem, com luz e clima do período escolhido. */
function buildPrompt(scene, period) {
  return [
    `Professional landscape photograph: ${scene.en}.`,
    `${pick(period.atmospheres)}.`,
    `Lighting: ${pick(period.lighting)}.`,
    `Colors: ${pick(period.palettes)}, vivid but natural.`,
    `Camera: ${pick(period.cameras)}.`,
    `Composition: vertical 9:16 frame, strong depth with an interesting foreground, a clear midground and a distant background, with a calm uncluttered sky in the upper third and a simple soft foreground in the lower third so a text overlay stays readable.`,
    `Quality: photorealistic, ultra detailed, sharp focus, natural colors, high dynamic range, low noise, award-winning nature photography.`,
    `Uninhabited natural scene, no people, no animals, no buildings, no text, no letters, no watermark, no frame.`,
  ].join(" ");
}

/* ---------- prompt da FRASE (texto gerado por IA) ----------
   Regras claras + exemplos do período + temperatura baixa = frases curtas e com sentido. */
function messageRequest(day, period) {
  const mention = Math.random() < 0.5 ? `Cite ${day.name} de forma natural.` : "Não cite o dia da semana.";
  return {
    system:
      `Você escreve frases curtas de ${period.label.toLowerCase()}, no estilo das mensagens carinhosas que brasileiros compartilham no WhatsApp.\n` +
      `Este cartão é de ${period.label.toUpperCase()}: a frase deve combinar com ${period.when}.\n` +
      "Regras:\n" +
      "- Uma única frase completa, com 40 a 90 caracteres.\n" +
      "- Português do Brasil correto, simples e com sentido claro. Uma só ideia, sem metáforas confusas.\n" +
      "- Não comece com \"Bom dia\", \"Boa tarde\" ou \"Boa noite\" (o cartão já tem esse título).\n" +
      "- Não fale de outro período do dia além deste.\n" +
      "- Sem emojis, aspas, hashtags ou explicações.\n" +
      "- Responda somente com a frase.\n" +
      "Exemplos de estilo (não copie, crie uma frase nova):\n" +
      period.examples.join("\n"),
    user: `Escreva 1 frase. Tom: ${pick(period.tones)}. Tema: ${pick(period.themes)}. ${mention}`,
  };
}

/** Limpa a resposta da IA e valida. Retorna null se ficar fora do padrão (aí usamos a frase de reserva). */
function cleanMessage(raw, day, period) {
  if (!raw || typeof raw !== "string") return null;
  const norm = (x) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let t = raw.split(/\r?\n/).map((s) => s.trim()).find((s) => s.length >= 15 && !s.endsWith(":")) || "";
  t = t.replace(/\p{Extended_Pictographic}|️|‍/gu, "")
       .replace(/#\w+/g, "")
       .replace(/^["'“”‘’«»\s]+|["'“”‘’«»\s]+$/g, "")
       .replace(/\s+/g, " ")
       .trim()
       ;
  // O cartão já tem o cumprimento: remove "Boa noite!" do começo. Se a saudação vier colada na frase
  // ("Bom dia com muita fé..."), remover deixaria uma frase quebrada, então descarta.
  if (/^(bom dia|boa tarde|boa noite)\b/i.test(t)) {
    if (!/^(bom dia|boa tarde|boa noite)\s*[!,.:–-]/i.test(t)) return null;
    t = t.replace(/^(bom dia|boa tarde|boa noite)[\s,!.:–-]*/i, "");
  }
  if (t) t = t[0].toUpperCase() + t.slice(1);
  if (t.length < 20 || t.length > 110) return null;                   // curta e legível
  if (/pollinations|https?:|[{}]/i.test(t)) return null;              // propaganda / JSON de erro

  const n = norm(t);
  if (period.avoid.test(n)) return null;                              // fala de outro período do dia

  // Rejeita se citar outro dia da semana (a imagem mostra o dia de hoje).
  const today = norm(day.name.split("-")[0]);
  const cited = n.match(/\b(segunda|terca|quarta|quinta|sexta|sabado|domingo)\b/g) || [];
  if (cited.some((d) => d !== today)) return null;

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
      `?model=openai&temperature=0.8&seed=${Math.floor(Math.random() * 1e9)}&system=${encodeURIComponent(system)}` +
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
  const tick = () => {
    const usingFree = store.get("bd-provider", "pollinations") === "pollinations";
    const ms = usingFree ? polliWaitMs() : 0;
    if (busy) return;
    if (ms > 0) {
      els.generate.disabled = true;
      els.generate.textContent = `Aguarde ${Math.ceil(ms / 1000)}s…`;
    } else {
      els.generate.disabled = false;
      els.generate.textContent = PERIODS[currentPeriod].button;
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
      model: "gpt-4o-mini", temperature: 0.8, max_tokens: 60,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI respondeu ${res.status}`);
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Gera a frase do período (bom dia, boa tarde ou boa noite) por IA. Se a IA de texto falhar, usa uma frase de reserva
 * (data.js) para nunca perder a imagem já gerada.
 */
async function generateMessage(day, period, provider, onStatus) {
  const req = messageRequest(day, period);
  try {
    const raw = provider === "openai"
      ? await textWithOpenAI(req, store.get("bd-openai-key", ""))
      : await textWithPollinations(req, onStatus);
    const text = cleanMessage(raw, day, period);
    if (text) return { text, ai: true };
    console.warn("Resposta de texto inválida:", raw);
  } catch (err) {
    console.warn("Mensagem por IA falhou, usando frase de reserva:", err);
  }
  return { text: pick(MESSAGES[period.id][day.index]), ai: false };
}

/* ---------- geração ---------- */
let busy = false;
let lastBlob = null;   // JPG pronto para baixar/compartilhar
let lastName = "";
let lastGreeting = "Bom Dia! 🌞";  // texto enviado junto ao abrir o WhatsApp no computador
let lastScene = null;  // última paisagem usada

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
  status("Escolhendo a paisagem…");

  try {
    // 1) sorteios
    const day = todayInfo();
    const period = PERIODS[currentPeriod];   // período escolhido agora
    let scene = pick(period.scenes);
    if (scene === lastScene) scene = pick(period.scenes);   // evita repetir a mesma paisagem em seguida
    lastScene = scene;
    const style = pick(TEXT_STYLES);
    const prompt = buildPrompt(scene, period);
    const provider = store.get("bd-provider", "pollinations");

    // 2) imagem por IA
    status("A IA está pintando sua imagem… (pode levar alguns segundos)");
    const bg = provider === "openai"
      ? await generateWithOpenAI(prompt, store.get("bd-openai-key", ""))
      : await generateWithPollinations(prompt, status);

    // 3) frase por IA (depois da imagem, assim a fila gratuita já liberou)
    status(`A IA está escrevendo a mensagem de ${period.label.toLowerCase()}…`);
    const msg = await generateMessage(day, period, provider, status);
    if (!msg.ai) toast("A IA de texto estava ocupada, usei uma frase de reserva.");

    // 4) texto + assinatura desenhados sobre a imagem
    status("Finalizando a imagem…");
    await composeImage(els.canvas, bg, {
      message: msg.text, dayName: day.name, greeting: period.greeting,
      greetingFill: period.fill, greetingStroke: period.stroke, style, signature: SIGNATURE,
    });

    // 5) JPG pronto (leve) para baixar e compartilhar
    lastBlob = await canvasToJpeg();
    if (!lastBlob) throw new Error("Não foi possível preparar a imagem.");
    lastName = `${period.file}-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}.jpg`;

    lastGreeting = `${period.greeting} ${period.wa}`;
    els.canvas.hidden = false;
    els.placeholder.hidden = true;
    els.preview.classList.add("has-image");
    els.download.disabled = false;
    els.whatsapp.disabled = false;
    $("elementsLabel").textContent = scene.pt;

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
  window.open("https://wa.me/?text=" + encodeURIComponent(lastGreeting), "_blank", "noopener");
  toast("Foto baixada! Anexe-a na conversa do WhatsApp que abriu. 📎");
}

els.generate.addEventListener("click", generate);
els.download.addEventListener("click", download);
els.whatsapp.addEventListener("click", shareWhatsApp);

setPeriod(currentPeriod);

/* Ao abrir a página, respeita a fila gratuita caso o último pedido tenha sido há pouco. */
if (polliWaitMs() > 0) startCooldownUI();
