/* ==========================================================
   data.js — dados: mensagens por dia, elementos visuais,
   elementos religiosos e estilos de tipografia
   ========================================================== */

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* Mensagens de RESERVA por dia da semana (índice = Date.getDay()).
   Só são usadas se a IA de texto falhar; normalmente a frase é gerada por IA. */
const MESSAGES = {
  0: [
    "Bom domingo! Que o Senhor abençoe sua família.",
    "Feliz domingo! Que a paz e o amor tomem conta do seu lar.",
    "Domingo é dia de descansar o corpo e agradecer a Deus.",
    "Que seu domingo seja leve, com café coado e abraço apertado.",
    "Bom domingo! Que Deus renove suas forças para a nova semana.",
  ],
  1: [
    "Que sua segunda-feira seja cheia de paz, saúde e café quentinho.",
    "Boa segunda-feira! Comece a semana com fé e o coração leve.",
    "Segunda-feira chegou! Que Deus abençoe cada passo seu.",
    "Nova semana, novas bênçãos. Tenha uma linda segunda-feira!",
    "Que a segunda-feira traga alegria e motivos para sorrir.",
  ],
  2: [
    "Feliz terça-feira! Que Deus guie seus passos com carinho.",
    "Boa terça! Que a gratidão floresça em seu coração.",
    "Terça-feira abençoada! Fé, força e muita luz para você.",
    "Que sua terça seja doce como o primeiro gole de café.",
    "Bom dia! Que a terça-feira traga paz e boas notícias.",
  ],
  3: [
    "Feliz quarta-feira! Estamos no meio da semana, com Deus no comando.",
    "Boa quarta! Que a esperança nunca falte no seu caminho.",
    "Quarta-feira de bênçãos, saúde e muita alegria!",
    "Que sua quarta-feira seja leve, colorida e cheia de graça.",
    "Bom dia! Que Deus renove suas energias nesta quarta.",
  ],
  4: [
    "Feliz quinta-feira! Que a fé te mantenha de pé.",
    "Boa quinta! Falta pouco, e Deus está contigo em cada instante.",
    "Quinta-feira abençoada, com paz no coração e sol no rosto.",
    "Que sua quinta seja repleta de sorrisos e coisas boas.",
    "Bom dia! Que o amor de Deus ilumine sua quinta-feira.",
  ],
  5: [
    "Feliz sexta-feira! Que Deus ilumine seu dia e multiplique suas bênçãos.",
    "Sextou! Que a paz acompanhe você neste dia lindo.",
    "Sexta-feira abençoada! Agradeça pela semana e descanse com fé.",
    "Que sua sexta seja florida, com café quentinho e gratidão.",
    "Bom dia! Que a sexta-feira traga alegria para você e sua família.",
  ],
  6: [
    "Feliz sábado! Que seja um dia de paz, descanso e muito amor.",
    "Sábado abençoado! Aproveite quem você ama.",
    "Bom sábado! Que Deus encha seu dia de alegria e luz.",
    "Que seu sábado tenha sol, flores e um café especial.",
    "Sábado chegou! Respire fundo e agradeça por mais um dia.",
  ],
};

/* Elementos visuais: rótulo em PT e descrição em inglês (melhor para modelos de imagem). */
const ELEMENTS = [
  { pt: "flores", en: "a bouquet of colorful flowers" },
  { pt: "rosas", en: "blooming red and pink roses with dew drops" },
  { pt: "girassóis", en: "bright yellow sunflowers" },
  { pt: "orquídeas", en: "elegant purple and white orchids" },
  { pt: "borboletas", en: "colorful butterflies in flight" },
  { pt: "pássaros", en: "cheerful little birds on a branch" },
  { pt: "beija-flores", en: "a hummingbird sipping nectar from a flower" },
  { pt: "céu azul", en: "a vivid blue sky with soft white clouds" },
  { pt: "nascer do sol", en: "a golden sunrise on the horizon" },
  { pt: "xícara de café", en: "a steaming cup of coffee on a saucer" },
  { pt: "bule de café", en: "a vintage coffee pot with steam and coffee beans" },
  { pt: "livros", en: "a stack of old books with a rose on top" },
  { pt: "jardim", en: "a lush flower garden with a wooden bench" },
  { pt: "cachoeira", en: "a beautiful waterfall in a green forest" },
  { pt: "campo florido", en: "a meadow full of wildflowers" },
  { pt: "velas", en: "softly glowing candles" },
  { pt: "pombas", en: "white doves flying" },
  { pt: "corações", en: "floating hearts" },
  { pt: "brilhos", en: "magical sparkles and bokeh lights" },
  { pt: "raios de luz", en: "warm rays of sunlight streaming through" },
];

/* Elementos religiosos: sorteados em apenas ~30% das gerações. */
const RELIGIOUS = [
  { pt: "Nossa Senhora Aparecida", en: "Our Lady of Aparecida, serene and glowing" },
  { pt: "cruz iluminada", en: "a glowing luminous cross with golden light" },
  { pt: "Bíblia aberta", en: "an open Bible with a ray of light on it" },
  { pt: "Jesus Cristo", en: "a gentle, reverent depiction of Jesus Christ with soft light" },
  { pt: "anjos", en: "sweet angels with soft wings" },
  { pt: "mãos em oração", en: "hands folded in prayer with a soft halo of light" },
];
const RELIGIOUS_CHANCE = 0.3;

/* Fontes (carregadas do Google Fonts) e paletas de texto. */
const TEXT_STYLES = [
  { name: "elegante", font: "Playfair Display", style: "italic 700", color: "#ffffff", stroke: "rgba(60,20,0,.75)", greeting: "Great Vibes" },
  { name: "cursivo", font: "Dancing Script", style: "700", color: "#fff6c9", stroke: "rgba(90,30,0,.8)", greeting: "Pacifico" },
  { name: "motivacional", font: "Poppins", style: "800", color: "#ffffff", stroke: "rgba(20,30,70,.8)", greeting: "Pacifico" },
  { name: "religioso", font: "Cormorant Garamond", style: "italic 700", color: "#fffbe6", stroke: "rgba(40,20,60,.8)", greeting: "Cinzel" },
];

/* Cumprimento grande no topo (varia por horário). */
const GREETINGS = ["Bom Dia!"];

/* Assinatura desenhada no rodapé de toda imagem. */
const SIGNATURE = "@lhpbrambila";

/* Ingredientes para a IA escrever a frase do dia (variam a cada geração). */
const MSG_TONES = [
  "motivacional e esperançoso",
  "carinhoso e familiar",
  "leve, doce e com um toque de humor",
  "grato e poético",
  "acolhedor, como um abraço de bom dia",
];
const MSG_THEMES = [
  "gratidão", "fé", "paz", "esperança", "família", "saúde", "alegria", "amor",
  "recomeço", "café quentinho", "força", "sorriso", "bênçãos", "novas oportunidades",
];

/* Estilos artísticos para variar o visual. */
const ART_STYLES = [
  "hyper realistic macro photography, shot on a full-frame camera with an 85mm f/1.4 lens, creamy bokeh, cinematic color grading",
  "vibrant digital painting by a master illustrator, lush brushwork, luminous glowing colors, storybook fantasy atmosphere",
  "dreamy fantasy illustration, magical glowing atmosphere, soft ethereal light, intricate detail, enchanted and romantic",
  "luminous oil painting with rich impasto texture, golden-hour glow, warm and emotional, classical yet vivid",
  "ultra detailed 3D rendered scene, Pixar-quality soft global illumination, vivid saturated colors, charming and cozy",
];

/* ---- Ingredientes extras para prompts mais ricos (em inglês, melhor para o modelo) ---- */

/* Descrições detalhadas por elemento (chave = rótulo em PT). Se faltar, usa o texto curto. */
const ELEMENT_DETAIL = {
  "flores": "a lush bouquet of mixed colorful flowers (daisies, tulips, peonies, lilies) with glistening morning dew drops on every petal",
  "rosas": "velvety red, pink and cream roses in full bloom, with water droplets and a few fallen petals",
  "girassóis": "tall golden sunflowers facing the sun, with detailed seeds at the center and bright yellow petals",
  "orquídeas": "graceful cascading orchids in violet, magenta and white, with delicate detailed petals",
  "borboletas": "several large colorful butterflies (blue morpho, monarch orange) with intricate wing patterns, fluttering around the flowers",
  "pássaros": "cheerful little songbirds (a bluebird and a yellow canary) perched on a blossoming branch, singing at dawn",
  "beija-flores": "a shimmering iridescent hummingbird hovering mid-air, wings blurred, drinking nectar from a bright flower",
  "céu azul": "a vast radiant blue sky with soft fluffy white clouds touched by pink and gold",
  "nascer do sol": "a glorious golden sunrise over the horizon with warm sunbeams breaking through the clouds",
  "xícara de café": "a beautiful porcelain cup and saucer of freshly brewed coffee with rising curls of steam, next to a few coffee beans and a small flower",
  "bule de café": "an elegant vintage enamel coffee pot pouring steaming coffee, with coffee beans and a freshly baked pastry on a rustic wooden table",
  "livros": "a small stack of vintage leather-bound books with a single rose and reading glasses resting on top",
  "jardim": "a charming romantic garden with a stone path, flowering bushes, an arbor covered in roses and a cozy wooden bench",
  "cachoeira": "a majestic waterfall cascading into a crystal clear pool inside a lush tropical forest, mist and rainbow in the air",
  "campo florido": "an endless meadow of wildflowers in every color rolling toward green hills",
  "velas": "several softly glowing candles with warm flames, surrounded by petals and golden light",
  "pombas": "a pair of pure white doves in graceful flight with spread wings, glowing in the sunlight",
  "corações": "gentle floating hearts made of light and rose petals drifting in the air",
  "brilhos": "magical golden sparkles, glittering light particles and soft bokeh orbs filling the air",
  "raios de luz": "dramatic divine rays of warm sunlight streaming diagonally through the scene (crepuscular rays)",
};
const RELIGIOUS_DETAIL = {
  "Nossa Senhora Aparecida": "a serene, reverent image of Our Lady of Aparecida wearing her blue mantle and golden crown, softly glowing with a gentle halo of light",
  "cruz iluminada": "a radiant luminous cross emitting soft golden light, with rays spreading across the sky",
  "Bíblia aberta": "an open Holy Bible resting on a wooden table, bathed in a warm ray of light from above, with a rose beside it",
  "Jesus Cristo": "a gentle, loving and respectful depiction of Jesus Christ with open arms, surrounded by soft divine light",
  "anjos": "two sweet angels with large feathery white wings, serene faces and glowing halos, floating among the clouds",
  "mãos em oração": "a pair of hands folded in prayer surrounded by a soft halo of golden light and a few flower petals",
};

/* Cenários gerais onde os elementos são combinados. */
const SCENES = [
  "a sunlit countryside morning with misty rolling hills in the distance",
  "a dreamy flower garden at the edge of a calm lake reflecting the sky",
  "a rustic wooden terrace overlooking a blooming valley at dawn",
  "an enchanted forest clearing with soft golden mist and glowing foliage",
  "a window sill opening onto a beautiful garden, with lace curtains moving in a gentle breeze",
  "a mountain meadow at sunrise with a clear stream and distant peaks",
  "a cozy cottage garden with a picket fence, climbing roses and a winding path",
];

/* Iluminação. */
const LIGHTING = [
  "warm golden-hour backlighting with glowing rim light and lens flare",
  "soft diffused morning sunlight with volumetric god rays",
  "radiant sunrise glow with warm orange and pink highlights",
  "bright cheerful daylight with a gentle golden haze",
];

/* Paletas de cores vibrantes. */
const PALETTES = [
  "golden yellow, sky blue and coral pink",
  "rich magenta, warm orange and emerald green",
  "radiant gold, soft lavender and fresh green",
  "vivid red, sunflower yellow and deep turquoise",
  "peach, rose pink and baby blue with golden accents",
];

/* Clima emocional por dia da semana (índice = Date.getDay()). */
const DAY_MOODS = {
  0: "peaceful Sunday rest, family warmth, blessing and gratitude",
  1: "a fresh start, renewed energy, hope and motivation for a new week",
  2: "gratitude, quiet strength and gentle encouragement",
  3: "midweek serenity, faith and encouragement to keep going",
  4: "optimism, perseverance and the joy of almost reaching the weekend",
  5: "celebration, lightness and gratitude for the week that passed",
  6: "relaxed, joyful and warm weekend happiness with loved ones",
};
