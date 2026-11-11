/* ==========================================================
   data.js — dados: dias da semana, paisagens, ingredientes do
   prompt da imagem, ingredientes do prompt da frase, estilos de texto
   ========================================================== */

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* Assinatura desenhada no rodapé de toda imagem. */
const SIGNATURE = "@lhpbrambila";

/* ---------- PAISAGENS ----------
   Cada item é UMA cena completa e coerente (pt = nome exibido, en = descrição para a IA).
   Só paisagens naturais: sem pessoas, animais, construções ou objetos soltos. */
const SCENES = [
  { pt: "Montanhas ao nascer do sol", en: "a majestic mountain range at sunrise, golden sunlight spilling over the peaks above a sea of low clouds filling the valley" },
  { pt: "Campo de girassóis", en: "a vast field of blooming sunflowers at sunrise stretching toward rolling green hills under a glowing sky" },
  { pt: "Praia tropical", en: "a pristine tropical beach at sunrise with turquoise water, gentle waves, white sand and coconut palm trees" },
  { pt: "Cachoeira na floresta", en: "a beautiful waterfall cascading into a clear emerald pool inside a lush green tropical forest, soft rays of light through the trees" },
  { pt: "Lago ao amanhecer", en: "a perfectly calm lake at dawn reflecting the mountains and a pink and golden sky like a mirror" },
  { pt: "Campo de lavanda", en: "rows of blooming purple lavender leading toward the horizon at golden hour, with soft distant hills" },
  { pt: "Colinas com neblina", en: "rolling green countryside hills covered in soft morning mist, with a winding dirt road and a single large tree" },
  { pt: "Cafezal ao amanhecer", en: "a Brazilian coffee plantation on rolling hills at sunrise, with morning mist between the green rows of coffee plants" },
  { pt: "Campo florido", en: "a meadow full of colorful wildflowers in spring, green hills and a bright blue sky with soft white clouds" },
  { pt: "Chapada ao amanhecer", en: "a dramatic sandstone plateau landscape at sunrise with a river valley below and warm orange light, like Chapada Diamantina in Brazil" },
  { pt: "Dunas e lagoas", en: "white sand dunes with turquoise freshwater lagoons at sunrise, like Lencois Maranhenses in Brazil" },
  { pt: "Floresta com raios de sol", en: "a peaceful green forest at dawn with golden sun rays streaming through tall trees and soft mist" },
  { pt: "Rio sereno", en: "a calm winding river flowing through a lush green valley at sunrise under a soft golden sky" },
  { pt: "Ipês floridos", en: "blooming golden yellow ipe trees in full flower on a grassy hillside under a clear blue sky" },
  { pt: "Falésias e mar", en: "coastal cliffs above a calm blue sea at sunrise with golden light on the water and a few soft clouds" },
  { pt: "Campo de trigo dourado", en: "a golden wheat field swaying under a glowing sunrise sky with soft clouds and gentle hills" },
  { pt: "Lago alpino", en: "a snow-capped mountain reflected in a clear alpine lake with colorful wildflowers in the foreground" },
];

/* Ingredientes que variam o visual sem quebrar a coerência da cena. */
const ATMOSPHERES = [
  "Soft morning mist hangs gently in the air",
  "Fluffy white clouds drift across a vivid sky",
  "Fresh dew sparkles in the foreground",
  "Warm sun rays break through the clouds",
  "A clear sky with delicate pink and golden clouds",
  "A fresh, peaceful and hopeful morning atmosphere",
];
const LIGHTING = [
  "warm golden-hour sunlight with a gentle glow",
  "soft diffused morning light with subtle sun rays",
  "radiant sunrise with warm orange and pink highlights",
  "bright cheerful morning light with a light golden haze",
];
const PALETTES = [
  "golden yellow, sky blue and fresh green",
  "warm orange, soft pink and deep blue",
  "emerald green, turquoise and gold",
  "lavender, rose and soft gold",
];
const CAMERAS = [
  "shot on a full-frame camera with a 24mm wide-angle lens, f/8, deep focus",
  "shot on a full-frame camera with a 35mm lens, f/11, crisp detail from foreground to horizon",
  "shot on a full-frame camera with a 16mm ultra-wide lens, f/9, dramatic depth",
];

/* ---------- FRASE DO DIA (gerada por IA) ---------- */
/* Tom e tema sorteados (apenas UM de cada, para a frase ficar coerente). */
const MSG_TONES = [
  "motivacional e esperançoso",
  "carinhoso e familiar",
  "leve e alegre",
  "grato e sereno",
  "acolhedor, como um abraço",
];
const MSG_THEMES = [
  "gratidão", "fé em Deus", "paz", "esperança", "família", "saúde", "alegria", "amor",
  "recomeço", "força", "sorriso", "bênçãos", "coisas boas", "um café quentinho",
];

/* Frases de RESERVA, curtas e por dia da semana (índice = Date.getDay()).
   Só são usadas se a IA de texto falhar ou devolver algo fora do padrão. */
const MESSAGES = {
  0: [
    "Que o seu domingo seja de paz e muito amor.",
    "Domingo é dia de agradecer e descansar com fé.",
    "Que Deus abençoe você e sua família neste domingo.",
    "Um domingo leve, com café quentinho e gratidão.",
    "Que a paz do Senhor acompanhe o seu domingo.",
  ],
  1: [
    "Que sua segunda-feira comece com fé e coração leve.",
    "Nova semana, novas bênçãos. Boa segunda-feira!",
    "Que Deus abençoe cada passo seu nesta segunda.",
    "Comece a semana com gratidão e um sorriso no rosto.",
    "Que a segunda-feira traga paz, saúde e alegria.",
  ],
  2: [
    "Que a sua terça-feira seja cheia de paz e alegria.",
    "Terça abençoada, com fé e força para seguir em frente.",
    "Que Deus guie os seus passos nesta terça-feira.",
    "Hoje é dia de gratidão. Tenha uma linda terça!",
    "Que a terça traga boas notícias e muita luz.",
  ],
  3: [
    "Que a sua quarta-feira seja leve e abençoada.",
    "No meio da semana, siga com fé. Deus está com você.",
    "Quarta-feira de paz, saúde e coisas boas.",
    "Que a esperança não falte no seu caminho hoje.",
    "Respire fundo: a quarta-feira vai ser linda.",
  ],
  4: [
    "Que a sua quinta-feira seja cheia de bênçãos.",
    "Falta pouco para o fim de semana. Siga com fé!",
    "Quinta abençoada, com paz no coração e sol no rosto.",
    "Que Deus ilumine o seu dia nesta quinta-feira.",
    "Tenha uma quinta-feira leve e cheia de sorrisos.",
  ],
  5: [
    "Feliz sexta-feira! Que Deus abençoe o seu dia.",
    "Sextou! Que a paz acompanhe você hoje.",
    "Que a sua sexta-feira seja leve e cheia de alegria.",
    "Sexta abençoada, com gratidão pela semana que passou.",
    "Que Deus multiplique as suas bênçãos nesta sexta.",
  ],
  6: [
    "Que o seu sábado seja de paz, descanso e amor.",
    "Sábado abençoado para você e sua família!",
    "Que Deus encha o seu sábado de alegria e luz.",
    "Aproveite o sábado com quem você ama.",
    "Que o seu sábado tenha sol, calma e um bom café.",
  ],
};

/* ---------- TIPOGRAFIA ---------- */
/* Fontes (carregadas do Google Fonts) e paletas de texto. */
const TEXT_STYLES = [
  { name: "elegante", font: "Playfair Display", style: "italic 700", color: "#ffffff", stroke: "rgba(60,20,0,.75)", greeting: "Great Vibes" },
  { name: "cursivo", font: "Dancing Script", style: "700", color: "#fff6c9", stroke: "rgba(90,30,0,.8)", greeting: "Pacifico" },
  { name: "motivacional", font: "Poppins", style: "800", color: "#ffffff", stroke: "rgba(20,30,70,.8)", greeting: "Pacifico" },
  { name: "religioso", font: "Cormorant Garamond", style: "italic 700", color: "#fffbe6", stroke: "rgba(40,20,60,.8)", greeting: "Cinzel" },
];

/* Cumprimento grande no topo. */
const GREETINGS = ["Bom Dia!"];
