/* ==========================================================
   data.js — dados: mensagens por dia, elementos visuais,
   elementos religiosos e estilos de tipografia
   ========================================================== */

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* Mensagens por dia da semana (índice igual a Date.getDay()). */
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
const GREETINGS = ["Bom Dia!", "Bom Dia!", "Bom Dia!", "Bom Dia, Amor!", "Bom Dia, Gente Linda!"];

/* Estilos artísticos para variar o visual. */
const ART_STYLES = [
  "vibrant digital painting, ultra detailed, saturated colors",
  "hyper realistic photography, cinematic lighting, vivid colors",
  "dreamy fantasy illustration, glowing magical atmosphere, rich colors",
  "lush watercolor-inspired illustration with golden light",
];
