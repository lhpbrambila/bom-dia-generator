/* ==========================================================
   render.js — composição final no canvas 960x1720:
   fundo gerado por IA + vinheta + mensagem renderizada sobre a imagem
   ========================================================== */

const W = 960, H = 1720;

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

/** Texto com contorno + sombra para garantir leitura sobre qualquer fundo. */
function strokedText(ctx, text, x, y, fill, stroke, lineWidth) {
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.45)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 5;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

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
 * @param {{message:string, dayName:string, greeting:string, style:object}} opts
 */
async function composeImage(canvas, bg, opts) {
  const ctx = canvas.getContext("2d");
  const { message, dayName, greeting, style } = opts;
  await ensureFonts(style);

  canvas.width = W; canvas.height = H;
  drawCover(ctx, bg);

  // Vinhetas suaves em cima e embaixo para dar legibilidade ao texto
  const top = ctx.createLinearGradient(0, 0, 0, 520);
  top.addColorStop(0, "rgba(0,0,0,.40)"); top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top; ctx.fillRect(0, 0, W, 520);

  const bottom = ctx.createLinearGradient(0, H - 760, 0, H);
  bottom.addColorStop(0, "rgba(0,0,0,0)"); bottom.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = bottom; ctx.fillRect(0, H - 760, W, 760);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Cumprimento grande no topo
  let size = 170;
  ctx.font = `${size}px "${style.greeting}"`;
  while (ctx.measureText(greeting).width > W - 140 && size > 70) {
    size -= 6; ctx.font = `${size}px "${style.greeting}"`;
  }
  strokedText(ctx, greeting, W / 2, 260, "#fff3b0", "rgba(120,40,0,.85)", 14);

  // Dia da semana
  ctx.font = `800 54px "Poppins"`;
  ctx.letterSpacing = "6px";
  strokedText(ctx, dayName.toUpperCase(), W / 2, 350, "#ffffff", "rgba(0,0,0,.6)", 8);
  ctx.letterSpacing = "0px";

  // Mensagem principal, ajustando o tamanho da fonte até caber
  const maxW = W - 150, maxH = 560;
  let fs = 84, lines;
  while (true) {
    ctx.font = `${style.style} ${fs}px "${style.font}"`;
    lines = wrapLines(ctx, message, maxW);
    if (lines.length * fs * 1.22 <= maxH || fs <= 44) break;
    fs -= 4;
  }
  const lh = fs * 1.22;
  const blockH = lines.length * lh;
  let y = H - 150 - blockH + fs * 0.9;
  lines.forEach((ln, i) => strokedText(ctx, ln, W / 2, y + i * lh, style.color, style.stroke, Math.max(8, fs / 7)));

  // Pequeno brilho decorativo ao lado do texto
  drawSparkle(ctx, 110, H - 150 - blockH - 40, 26);
  drawSparkle(ctx, W - 110, H - 100, 20);

  // Assinatura no rodapé
  if (opts.signature) {
    ctx.font = `600 38px "Poppins", sans-serif`;
    ctx.letterSpacing = "2px";
    strokedText(ctx, opts.signature, W / 2, H - 62, "#ffffff", "rgba(0,0,0,.55)", 7);
    ctx.letterSpacing = "0px";
  }
}

/** Estrela de 4 pontas. */
function drawSparkle(ctx, x, y, r) {
  ctx.save();
  ctx.shadowColor = "rgba(255,255,200,.9)"; ctx.shadowBlur = 20;
  ctx.fillStyle = "#fffbe0";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI / 4) * i;
    const rad = i % 2 === 0 ? r : r * 0.28;
    ctx.lineTo(x + Math.cos(ang - Math.PI / 2) * rad, y + Math.sin(ang - Math.PI / 2) * rad);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
