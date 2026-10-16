# 🌞 Bom Dia Generator

Gera imagens de "Bom Dia" no estilo clássico do WhatsApp (960 × 1720), criadas por IA a cada clique, com a mensagem do dia da semana escrita sobre a imagem.

## Como usar

É HTML/CSS/JS puro, sem build. Basta servir a pasta:

```bash
cd bomdia
python3 -m http.server 8000
# abra http://localhost:8000
```

(Também funciona abrindo `index.html` direto, mas um servidor local é mais confiável.)

## Como funciona

1. Detecta o dia da semana atual.
2. Sorteia uma mensagem para esse dia, 3–5 elementos visuais e, em ~30% das vezes, um elemento religioso.
3. Monta um prompt rico e pede a imagem à IA (sem texto na imagem).
4. Desenha o cumprimento, o dia e a mensagem sobre a imagem num canvas 960×1720, com fontes e cores variadas.
5. "Baixar Foto Gerada" exporta o canvas em PNG.

## Provedores de IA (⚙️ no topo)

- **Flux via Pollinations** (padrão): gratuito, sem chave de API.
- **OpenAI Images API** (`gpt-image-1`): informe sua chave nas configurações. A chave fica só no `localStorage` do navegador. Para publicar o app, use um proxy no servidor para não expor a chave.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página e diálogo de configurações |
| `styles.css` | Visual, tema claro/escuro, animações, responsividade |
| `data.js` | Mensagens por dia, elementos visuais e religiosos, estilos de fonte |
| `render.js` | Composição do texto sobre a imagem no canvas |
| `app.js` | Prompt, chamadas às APIs, contador, toasts, download |

## Personalizar

- Mensagens: edite `MESSAGES` em `data.js`.
- Frequência de elementos religiosos: `RELIGIOUS_CHANCE` em `data.js`.
- Fontes e cores do texto: `TEXT_STYLES` em `data.js`.
