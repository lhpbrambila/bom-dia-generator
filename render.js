/* ==========================================================
   render.js — composição final no canvas 960x1720:
   fundo gerado por IA + vinhetas + texto desenhado sobre a imagem.

   O texto (cumprimento, dia da semana, frase e assinatura) é posicionado por
   um LAYOUT. Há 9 layouts diferentes em LAYOUTS; o app sorteia um a cada imagem.
   Para criar um novo layout: escreva uma função layoutXxx(ctx, d) e registre-a em LAYOUTS.
   ========================================================== */

const W = 960, H = 1720;

/* ---------------------------------------------------------- */
/* Utilitários de desenho                                     */
/* ---------------------------------------------------------- */

/** Desenha a imagem preenchendo todo o canvas (comportamento "cover"). */
function drawCover(ctx, img) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const scale = Math.max(W / iw, H / ih);
  const dw = iw * scale, dh = ih * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

/** Quebra o texto em linhas que caibam em maxWidth. */
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Texto com contorno + sombra para garantir leitura sobre qualquer fundo (lineWidth 0 = sem contorno). */
function strokedText(ctx, text, x, y, fill, stroke, lineWidth) {
  ctx.lineJoin = "round";
  if (lineWidth > 0) {
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 5;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, x, y);
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/** Caminho de retângulo arredondado (funciona em qualquer navegador). */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Escurecimento suave em degradê no topo ou no rodapé, para dar legibilidade ao texto. */
function vignette(ctx, edge, size, alpha) {
  const y0 = edge === "top" ? 0 : H - size;
  const g = ctx.createLinearGradient(0, y0, 0, y0 + size);
  const a = `rgba(0,0,0,${alpha})`, z = "rgba(0,0,0,0)";
  g.addColorStop(0, edge === "top" ? a : z);
  g.addColorStop(1, edge === "top" ? z : a);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, W, size);
}

/** Estrela de 4 pontas. */
function drawSparkle(ctx, x, y, r, color = "#fffbe0") {
  ctx.save();
  ctx.shadowColor = "rgba(255,255,200,.9)"; ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI / 4) * i;
    const rad = i % 2 === 0 ? r : r * 0.28;
    ctx.lineTo(x + Math.cos(ang - Math.PI / 2) * rad, y + Math.sin(ang - Math.PI / 2) * rad);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Linha decorativa com estrela no meio. */
function drawDivider(ctx, cx, y, half) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(cx - half, y); ctx.lineTo(cx - 34, y);
  ctx.moveTo(cx + 34, y); ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.restore();
  drawSparkle(ctx, cx, y, 16);
}

/* ---------------------------------------------------------- */
/* Blocos de texto reutilizados pelos layouts                 */
/* ---------------------------------------------------------- */

/** Cumprimento grande ("Bom Dia!"), reduzido até caber em maxW. Retorna o tamanho usado. */
function drawGreeting(ctx, d, x, baseline, maxW, startSize = 170, align = "center") {
  let size = startSize;
  ctx.font = `${size}px "${d.style.greeting}"`;
  while (ctx.measureText(d.greeting).width > maxW && size > 70) {
    size -= 6; ctx.font = `${size}px "${d.style.greeting}"`;
  }
  ctx.textAlign = align;
  strokedText(ctx, d.greeting, x, baseline, d.fill, d.stroke, Math.max(8, size / 12));
  return size;
}

/** Dia da semana em maiúsculas com espaçamento entre letras. */
function drawWeekday(ctx, text, x, baseline, size = 54, align = "center", spacing = 6) {
  ctx.font = `800 ${size}px "Poppins"`;
  ctx.letterSpacing = `${spacing}px`;
  ctx.textAlign = align;
  strokedText(ctx, text.toUpperCase(), x, baseline, "#ffffff", "rgba(0,0,0,.6)", Math.max(6, size / 7));
  ctx.letterSpacing = "0px";
}

/** Assinatura (ex.: @lhpbrambila). */
function drawSignature(ctx, d, x, baseline, align = "center") {
  if (!d.signature) return;
  ctx.font = `600 38px "Poppins", sans-serif`;
  ctx.letterSpacing = "2px";
  ctx.textAlign = align;
  strokedText(ctx, d.signature, x, baseline, "#ffffff", "rgba(0,0,0,.55)", 7);
  ctx.letterSpacing = "0px";
}

/** Escolhe o maior tamanho de fonte em que a frase cabe em maxW x maxH. */
function fitMessage(ctx, text, style, maxW, maxH, startFs = 84, minFs = 44) {
  let fs = startFs, lines;
  while (true) {
    ctx.font = `${style.style} ${fs}px "${style.font}"`;
    lines = wrapLines(ctx, text, maxW);
    if (lines.length * fs * 1.22 <= maxH || fs <= minFs) break;
    fs -= 4;
  }
  const lh = fs * 1.22;
  return { fs, lines, lh, blockH: lines.length * lh };
}

/** Desenha a frase já medida; "top" é o topo do bloco. */
function drawMessage(ctx, m, style, x, top, o = {}) {
  ctx.textAlign = o.align || "center";
  ctx.font = `${style.style} ${m.fs}px "${style.font}"`;
  m.lines.forEach((ln, i) =>
    strokedText(ctx, ln, x, top + m.fs * 0.9 + i * m.lh, o.color || style.color, style.stroke,
      o.noStroke ? 0 : Math.max(8, m.fs / 7)));
}

/* ---------------------------------------------------------- */
/* LAYOUTS — cada um recebe (ctx, d)                           */
/* d = { message, dayName, greeting, style, signature,         */
/*       fill, stroke (cor do cumprimento), accent[2], ink }   */
/* ---------------------------------------------------------- */

/** 1) Clássico: cumprimento no topo, frase no rodapé. */
function layoutClassico(ctx, d) {
  vignette(ctx, "top", 520, 0.40);
  vignette(ctx, "bottom", 760, 0.55);
  drawGreeting(ctx, d, W / 2, 260, W - 140);
  drawWeekday(ctx, d.dayName, W / 2, 350);
  const m = fitMessage(ctx, d.message, d.style, W - 150, 560);
  const top = H - 150 - m.blockH;
  drawMessage(ctx, m, d.style, W / 2, top);
  drawSparkle(ctx, 110, top - 40, 26);
  drawSparkle(ctx, W - 110, H - 100, 20);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** 2) Faixa central: frase num painel translúcido no meio da imagem. */
function layoutFaixa(ctx, d) {
  vignette(ctx, "top", 520, 0.35);
  vignette(ctx, "bottom", 420, 0.50);
  drawGreeting(ctx, d, W / 2, 250, W - 140, 160);
  drawWeekday(ctx, d.dayName, W / 2, 338, 50);
  const m = fitMessage(ctx, d.message, d.style, W - 260, 520, 80);
  const padY = 64, px = 60, pw = W - 120, ph = m.blockH + padY * 2;
  const py = H * 0.56 - ph / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 40;
  rr(ctx, px, py, pw, ph, 40); ctx.fillStyle = "rgba(10,10,25,.42)"; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, px, py, pw, ph, 40); ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  drawMessage(ctx, m, d.style, W / 2, py + padY);
  drawSparkle(ctx, px + 10, py - 6, 22);
  drawSparkle(ctx, px + pw - 10, py + ph + 6, 22);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** 3) Tudo embaixo: cumprimento, dia e frase empilhados no rodapé; o céu fica livre. */
function layoutEmbaixo(ctx, d) {
  vignette(ctx, "bottom", 1000, 0.75);
  vignette(ctx, "top", 300, 0.18);
  const m = fitMessage(ctx, d.message, d.style, W - 150, 470);
  const top = H - 150 - m.blockH;
  const weekdayBase = top - 55;
  drawGreeting(ctx, d, W / 2, weekdayBase - 85, W - 140, 150);
  drawWeekday(ctx, d.dayName, W / 2, weekdayBase, 48);
  drawMessage(ctx, m, d.style, W / 2, top);
  drawSparkle(ctx, 110, top - 20, 24);
  drawSparkle(ctx, W - 110, H - 100, 20);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** 4) Tudo no topo: cumprimento, dia e frase em cima; o rodapé fica livre. */
function layoutTopo(ctx, d) {
  vignette(ctx, "top", 950, 0.66);
  vignette(ctx, "bottom", 320, 0.50);
  drawGreeting(ctx, d, W / 2, 250, W - 140);
  drawWeekday(ctx, d.dayName, W / 2, 340);
  drawDivider(ctx, W / 2, 405, 230);
  const m = fitMessage(ctx, d.message, d.style, W - 150, 520);
  drawMessage(ctx, m, d.style, W / 2, 470);
  drawSparkle(ctx, W - 110, H - 130, 20);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** 5) Cartão: frase em texto escuro sobre um cartão claro, com borda na cor do período. */
function layoutCartao(ctx, d) {
  vignette(ctx, "top", 520, 0.40);
  vignette(ctx, "bottom", 360, 0.45);
  drawGreeting(ctx, d, W / 2, 260, W - 140);
  drawWeekday(ctx, d.dayName, W / 2, 350);
  const m = fitMessage(ctx, d.message, d.style, W - 260, 480, 78);
  const px = 70, pw = W - 140, ph = m.blockH + 130;
  const bottom = H - 175, py = bottom - ph;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
  rr(ctx, px, py, pw, ph, 44); ctx.fillStyle = "rgba(255,252,244,.93)"; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, px + 14, py + 14, pw - 28, ph - 28, 34);
  ctx.strokeStyle = d.accent[0]; ctx.globalAlpha = 0.85; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  drawMessage(ctx, m, d.style, W / 2, py + 65, { color: d.ink, noStroke: true });
  drawSparkle(ctx, W / 2, py, 24, "#ffd45e");
  drawSignature(ctx, d, W / 2, H - 80);
}

/** 6) Moldura: borda dupla elegante, tudo centralizado com divisórias. */
function layoutMoldura(ctx, d) {
  ctx.fillStyle = "rgba(0,0,0,.16)"; ctx.fillRect(0, 0, W, H);
  vignette(ctx, "top", 560, 0.38);
  vignette(ctx, "bottom", 700, 0.50);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 10;
  rr(ctx, 40, 40, W - 80, H - 80, 28); ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.lineWidth = 5; ctx.stroke();
  rr(ctx, 62, 62, W - 124, H - 124, 18); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  [[62, 62], [W - 62, 62], [62, H - 62], [W - 62, H - 62]].forEach(([x, y]) => drawSparkle(ctx, x, y, 18));
  drawGreeting(ctx, d, W / 2, 330, W - 260, 150);
  drawWeekday(ctx, d.dayName, W / 2, 418, 46);
  drawDivider(ctx, W / 2, 478, 210);
  const m = fitMessage(ctx, d.message, d.style, W - 260, 560, 76);
  drawMessage(ctx, m, d.style, W / 2, 1020 - m.blockH / 2);
  drawDivider(ctx, W / 2, H - 215, 210);
  drawSignature(ctx, d, W / 2, H - 118);
}

/** 7) Alinhado à esquerda: texto à esquerda com barra de destaque na cor do período. */
function layoutEsquerda(ctx, d) {
  const g = ctx.createLinearGradient(0, 0, W * 0.9, 0);
  g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  vignette(ctx, "top", 420, 0.30);
  vignette(ctx, "bottom", 700, 0.45);
  const x = 96;
  drawGreeting(ctx, d, x, 270, W - 190, 150, "left");
  drawWeekday(ctx, d.dayName, x, 355, 46, "left", 5);
  const mx = x + 38;
  const m = fitMessage(ctx, d.message, d.style, W - mx - 90, 560, 76);
  const top = H - 175 - m.blockH;
  const bar = ctx.createLinearGradient(0, top, 0, top + m.blockH);
  bar.addColorStop(0, d.accent[0]); bar.addColorStop(1, d.accent[1]);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 10;
  rr(ctx, x, top + 6, 9, m.blockH - 12, 5); ctx.fillStyle = bar; ctx.fill();
  ctx.restore();
  drawMessage(ctx, m, d.style, mx, top, { align: "left" });
  drawSignature(ctx, d, x, H - 80, "left");
}

/** 8) Centro total: cumprimento gigante no meio da imagem, frase logo abaixo. */
function layoutCentro(ctx, d) {
  const rg = ctx.createRadialGradient(W / 2, H * 0.5, 100, W / 2, H * 0.5, 950);
  rg.addColorStop(0, "rgba(0,0,0,.50)"); rg.addColorStop(1, "rgba(0,0,0,.08)");
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  vignette(ctx, "top", 300, 0.25);
  vignette(ctx, "bottom", 380, 0.40);
  drawWeekday(ctx, d.dayName, W / 2, 610, 48);
  drawGreeting(ctx, d, W / 2, 830, W - 120, 200);
  drawDivider(ctx, W / 2, 905, 240);
  const m = fitMessage(ctx, d.message, d.style, W - 200, 520, 78);
  drawMessage(ctx, m, d.style, W / 2, 965);
  drawSparkle(ctx, 110, 560, 22);
  drawSparkle(ctx, W - 110, 1500, 22);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** 9) Fita: cumprimento dentro de uma faixa colorida (cores do período). */
function layoutFita(ctx, d) {
  vignette(ctx, "top", 520, 0.30);
  vignette(ctx, "bottom", 760, 0.55);
  const rx = 60, ry = 120, rw = W - 120, rh = 220;
  const g = ctx.createLinearGradient(rx, 0, rx + rw, 0);
  g.addColorStop(0, d.accent[0]); g.addColorStop(1, d.accent[1]);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  rr(ctx, rx, ry, rw, rh, 34); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, rx + 14, ry + 14, rw - 28, rh - 28, 24);
  ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.stroke();
  ctx.restore();
  drawGreeting(ctx, { ...d, fill: "#ffffff", stroke: "rgba(0,0,0,.28)" }, W / 2, ry + rh / 2 + 50, rw - 120, 150);
  drawWeekday(ctx, d.dayName, W / 2, ry + rh + 85, 52);
  const m = fitMessage(ctx, d.message, d.style, W - 150, 560);
  const top = H - 150 - m.blockH;
  drawMessage(ctx, m, d.style, W / 2, top);
  drawSparkle(ctx, 110, top - 40, 26);
  drawSparkle(ctx, W - 110, H - 100, 20);
  drawSignature(ctx, d, W / 2, H - 62);
}

/** Registro dos layouts (label = nome mostrado na tela). */
const LAYOUTS = {
  classico: { label: "Clássico", draw: layoutClassico },
  faixa:    { label: "Faixa central", draw: layoutFaixa },
  embaixo:  { label: "Texto embaixo", draw: layoutEmbaixo },
  topo:     { label: "Texto no topo", draw: layoutTopo },
  cartao:   { label: "Cartão", draw: layoutCartao },
  moldura:  { label: "Moldura", draw: layoutMoldura },
  esquerda: { label: "À esquerda", draw: layoutEsquerda },
  centro:   { label: "Centro total", draw: layoutCentro },
  fita:     { label: "Fita", draw: layoutFita },
};
const LAYOUT_KEYS = Object.keys(LAYOUTS);

/* ---------------------------------------------------------- */
/* Composição final                                           */
/* ---------------------------------------------------------- */

/** Garante que as fontes do Google Fonts estejam prontas antes de desenhar. */
async function ensureFonts(style) {
  const specs = [
    `${style.style} 60px "${style.font}"`,
    `60px "${style.greeting}"`,
    `800 40px "Poppins"`,
    `600 40px "Poppins"`,
  ];
  // Com limite de 5s: se as fontes demorarem (rede móvel), usa as de reserva em vez de travar.
  const load = Promise.all(specs.map((s) => document.fonts.load(s).catch(() => {})));
  await Promise.race([load, new Promise((r) => setTimeout(r, 5000))]);
}

/**
 * Compõe a imagem final.
 * @param {HTMLCanvasElement} canvas
 * @param {ImageBitmap|HTMLImageElement} bg  imagem gerada por IA
 * @param {{message:string, dayName:string, greeting:string, style:object, signature?:string,
 *          layout?:string, greetingFill?:string, greetingStroke?:string, accent?:string[], ink?:string}} opts
 */
async function composeImage(canvas, bg, opts) {
  const ctx = canvas.getContext("2d");
  await ensureFonts(opts.style);

  canvas.width = W; canvas.height = H;
  drawCover(ctx, bg);
  ctx.textBaseline = "alphabetic";

  const layout = LAYOUTS[opts.layout] || LAYOUTS.classico;
  layout.draw(ctx, {
    message: opts.message, dayName: opts.dayName, greeting: opts.greeting,
    style: opts.style, signature: opts.signature,
    fill: opts.greetingFill || "#fff3b0", stroke: opts.greetingStroke || "rgba(120,40,0,.85)",
    accent: opts.accent || ["#ff9a1f", "#ff4f81"], ink: opts.ink || "#3a2a14",
  });
}
