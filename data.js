/* ==========================================================
   data.js — dados do app

   PERIODS reúne tudo que muda entre "bom dia", "boa tarde" e "boa noite":
   cumprimento, paisagens, luz, clima, cores, câmera e ingredientes da frase.
   ========================================================== */

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/* Assinatura desenhada no rodapé de toda imagem. */
const SIGNATURE = "@lhpbrambila";

/* Cada paisagem é UMA cena completa e coerente (pt = nome exibido, en = descrição para a IA).
   Só paisagens naturais: sem pessoas, animais, construções ou objetos soltos. */
const PERIODS = {
  /* ------------------------------ BOM DIA ------------------------------ */
  manha: {
    id: "manha", file: "bom-dia", label: "Bom dia", greeting: "Bom Dia!", emoji: "☀️", wa: "🌞",
    button: "Gerar Foto de Bom Dia",
    when: "a manhã, o começo do dia",
    fill: "#fff3b0", stroke: "rgba(120,40,0,.85)",
    // regex em ASCII (aplicado ao texto sem acentos): rejeita frases que falem de outro período
    avoid: /\b(boa tarde|boa noite|noite|tarde|dormir|durma|anoitecer|entardecer)\b/,
    scenes: [
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
    ],
    atmospheres: [
      "Soft morning mist hangs gently in the air",
      "Fluffy white clouds drift across a vivid sky",
      "Fresh dew sparkles in the foreground",
      "Warm sun rays break through the clouds",
      "A clear sky with delicate pink and golden clouds",
      "A fresh, peaceful and hopeful morning atmosphere",
    ],
    lighting: [
      "warm golden-hour sunlight with a gentle glow",
      "soft diffused morning light with subtle sun rays",
      "radiant sunrise with warm orange and pink highlights",
      "bright cheerful morning light with a light golden haze",
    ],
    palettes: [
      "golden yellow, sky blue and fresh green",
      "warm orange, soft pink and deep blue",
      "emerald green, turquoise and gold",
      "lavender, rose and soft gold",
    ],
    cameras: [
      "shot on a full-frame camera with a 24mm wide-angle lens, f/8, deep focus",
      "shot on a full-frame camera with a 35mm lens, f/11, crisp detail from foreground to horizon",
      "shot on a full-frame camera with a 16mm ultra-wide lens, f/9, dramatic depth",
    ],
    tones: ["motivacional e esperançoso", "carinhoso e familiar", "leve e alegre", "grato e sereno", "acolhedor, como um abraço"],
    themes: ["gratidão", "fé em Deus", "paz", "esperança", "família", "saúde", "alegria", "amor", "recomeço", "força", "sorriso", "bênçãos", "coisas boas", "um café quentinho"],
    examples: [
      "Que o seu dia seja leve e cheio de coisas boas.",
      "Que Deus abençoe cada passo seu hoje.",
      "Comece o dia com gratidão e o coração tranquilo.",
      "Que a sua sexta-feira traga paz e alegria.",
      "Um café quentinho e fé para recomeçar com força.",
    ],
  },

  /* ------------------------------ BOA TARDE ------------------------------ */
  tarde: {
    id: "tarde", file: "boa-tarde", label: "Boa tarde", greeting: "Boa Tarde!", emoji: "🌤️", wa: "🌤️",
    button: "Gerar Foto de Boa Tarde",
    when: "a tarde, o meio do dia",
    fill: "#fffbd6", stroke: "rgba(0,60,110,.85)",
    avoid: /\b(bom dia|boa noite|noite|dormir|durma|amanhecer|manha|madrugada)\b/,
    scenes: [
      { pt: "Vale verde sob o sol", en: "a green countryside valley in bright afternoon sunshine with a vivid blue sky, fluffy white clouds and rolling hills" },
      { pt: "Praia ensolarada", en: "a sunny tropical beach in the afternoon with bright turquoise water, white sand, swaying palm trees and a blue sky with soft clouds" },
      { pt: "Cachoeira ensolarada", en: "a waterfall in a sunlit tropical rainforest in the afternoon, a faint rainbow in the mist and a clear emerald pool" },
      { pt: "Girassóis ao sol", en: "a field of tall sunflowers under a bright blue afternoon sky with fluffy white clouds" },
      { pt: "Lago tranquilo", en: "a calm clear lake in the afternoon surrounded by green mountains, the blue sky reflected on the water" },
      { pt: "Estrada entre árvores", en: "a quiet country road lined with tall green trees, golden afternoon light filtering through the leaves" },
      { pt: "Montanhas e céu azul", en: "majestic green mountains under a bright blue sky with dramatic white clouds in the afternoon sun" },
      { pt: "Campo florido", en: "a meadow full of colorful wildflowers in warm afternoon sunlight with gentle green hills" },
      { pt: "Rio e pedras", en: "a clear river flowing over smooth stones in a sunlit green forest in the afternoon" },
      { pt: "Chapada à tarde", en: "a vast sandstone plateau landscape in warm afternoon light under a clear blue sky, like Chapada dos Veadeiros in Brazil" },
      { pt: "Fim de tarde nas colinas", en: "rolling hills in late afternoon golden light with long soft shadows and a warm glow over the grass" },
      { pt: "Ipês ao sol da tarde", en: "blooming pink and yellow ipe trees in full flower on a grassy hillside under a bright blue afternoon sky" },
    ],
    atmospheres: [
      "Fluffy white clouds drift across a vivid blue sky",
      "Warm sun rays break through the clouds",
      "A bright, cheerful and peaceful afternoon atmosphere",
      "A gentle breeze moves the grass and leaves",
    ],
    lighting: [
      "bright warm afternoon sunlight with soft shadows",
      "golden late-afternoon light with a gentle glow",
      "clear bright daylight with a vivid blue sky",
      "warm sunlight with subtle sun rays",
    ],
    palettes: [
      "sky blue, fresh green and warm gold",
      "turquoise, white and soft yellow",
      "vivid blue, emerald and sunflower yellow",
      "warm amber, soft blue and green",
    ],
    cameras: [
      "shot on a full-frame camera with a 24mm wide-angle lens, f/8, deep focus",
      "shot on a full-frame camera with a 35mm lens, f/11, crisp detail from foreground to horizon",
      "shot on a full-frame camera with a 16mm ultra-wide lens, f/9, dramatic depth",
    ],
    tones: ["motivacional e de ânimo", "carinhoso e acolhedor", "leve e alegre", "grato e sereno"],
    themes: ["força para continuar", "energia", "gratidão", "fé em Deus", "paz", "alegria", "um cafezinho da tarde", "bênçãos", "coisas boas", "coragem"],
    examples: [
      "Que a sua tarde seja leve e cheia de boas energias.",
      "Que Deus abençoe o resto do seu dia.",
      "Siga em frente com fé, o melhor ainda está por vir.",
      "Que a sua tarde traga calma e muita alegria.",
      "Uma pausa, um café e gratidão no coração.",
    ],
  },

  /* ------------------------------ BOA NOITE ------------------------------ */
  noite: {
    id: "noite", file: "boa-noite", label: "Boa noite", greeting: "Boa Noite!", emoji: "🌙", wa: "🌙",
    button: "Gerar Foto de Boa Noite",
    when: "a noite, o fim do dia e a hora de descansar",
    fill: "#eaf0ff", stroke: "rgba(10,15,70,.9)",
    avoid: /\b(bom dia|boa tarde|amanhecer|nascer do sol|manha)\b/,
    scenes: [
      { pt: "Pôr do sol no mar", en: "a spectacular sunset over a calm sea with a deep orange, pink and purple sky reflected on the water" },
      { pt: "Céu estrelado nas montanhas", en: "a breathtaking starry night sky with the Milky Way over silhouetted mountains" },
      { pt: "Lua cheia sobre o lago", en: "a bright full moon reflected in a calm lake at night, with silhouetted trees and a deep blue sky" },
      { pt: "Praia sob as estrelas", en: "a quiet tropical beach under a starry night sky with a glowing moon and gentle waves" },
      { pt: "Campo sob a lua", en: "a peaceful meadow under a starry sky with a luminous crescent moon and soft blue light on the grass" },
      { pt: "Crepúsculo nas montanhas", en: "mountains at twilight with a sky gradient from deep blue to pink and purple and a few early stars" },
      { pt: "Lua sobre as nuvens", en: "a luminous moon above soft clouds in a deep blue night sky full of stars" },
      { pt: "Floresta ao luar", en: "a serene forest at night with moonlight streaming through the trees and soft blue mist" },
      { pt: "Pôr do sol na praia", en: "a golden sunset on a beach with calm waves and warm reflections on the wet sand" },
      { pt: "Aurora sobre o lago", en: "northern lights glowing green and purple over a calm lake and snowy mountains under a starry sky" },
      { pt: "Dunas sob as estrelas", en: "white sand dunes under a starry night sky with a bright moon, like Lencois Maranhenses in Brazil" },
    ],
    atmospheres: [
      "A calm, peaceful and dreamy night atmosphere",
      "Soft glowing starlight fills the sky",
      "A tranquil, quiet night with a gentle glow",
      "Delicate clouds catch the last light of the sky",
    ],
    lighting: [
      "soft silvery moonlight with a deep blue glow",
      "twilight afterglow with deep blue and purple tones",
      "starlight and moonlight, long exposure night photography",
      "warm last light of sunset fading into a deep blue sky",
    ],
    palettes: [
      "deep blue, silver and soft purple",
      "midnight blue, gold stars and soft turquoise",
      "indigo, magenta and warm orange glow",
      "navy blue, moonlight white and gentle teal",
    ],
    cameras: [
      "shot on a full-frame camera with a 14mm ultra-wide lens, f/2.8, 20 second exposure on a tripod, crisp stars",
      "shot on a full-frame camera with a 24mm lens, f/4, long exposure on a tripod, smooth water and sharp details",
      "shot on a full-frame camera with a 35mm lens, f/2.8, blue hour long exposure, low noise",
    ],
    tones: ["sereno e tranquilo", "carinhoso, como um abraço de boa noite", "grato pelo dia que passou", "acolhedor e reconfortante"],
    themes: ["descanso", "sono tranquilo", "gratidão pelo dia", "paz", "fé em Deus", "sonhos bons", "proteção de Deus", "tranquilidade", "renovar as forças", "carinho"],
    examples: [
      "Que a sua noite seja de paz e descanso.",
      "Que Deus proteja o seu sono e a sua família.",
      "Agradeça pelo dia de hoje e durma em paz.",
      "Que a noite traga calma ao coração e sonhos bons.",
      "Descanse, amanhã é um novo dia cheio de bênçãos.",
    ],
  },
};

/* Frases de RESERVA, curtas, por período e dia da semana (índice = Date.getDay()).
   Só são usadas se a IA de texto falhar ou devolver algo fora do padrão. */
const MESSAGES = {
  manha: {
    0: ["Que o seu domingo seja de paz e muito amor.", "Domingo é dia de agradecer e descansar com fé.", "Que Deus abençoe você e sua família neste domingo.", "Um domingo leve, com café quentinho e gratidão.", "Que a paz do Senhor acompanhe o seu domingo."],
    1: ["Que sua segunda-feira comece com fé e coração leve.", "Nova semana, novas bênçãos. Boa segunda-feira!", "Que Deus abençoe cada passo seu nesta segunda.", "Comece a semana com gratidão e um sorriso no rosto.", "Que a segunda-feira traga paz, saúde e alegria."],
    2: ["Que a sua terça-feira seja cheia de paz e alegria.", "Terça abençoada, com fé e força para seguir em frente.", "Que Deus guie os seus passos nesta terça-feira.", "Hoje é dia de gratidão. Tenha uma linda terça!", "Que a terça traga boas notícias e muita luz."],
    3: ["Que a sua quarta-feira seja leve e abençoada.", "No meio da semana, siga com fé. Deus está com você.", "Quarta-feira de paz, saúde e coisas boas.", "Que a esperança não falte no seu caminho hoje.", "Respire fundo: a quarta-feira vai ser linda."],
    4: ["Que a sua quinta-feira seja cheia de bênçãos.", "Falta pouco para o fim de semana. Siga com fé!", "Quinta abençoada, com paz no coração e sol no rosto.", "Que Deus ilumine o seu dia nesta quinta-feira.", "Tenha uma quinta-feira leve e cheia de sorrisos."],
    5: ["Feliz sexta-feira! Que Deus abençoe o seu dia.", "Sextou! Que a paz acompanhe você hoje.", "Que a sua sexta-feira seja leve e cheia de alegria.", "Sexta abençoada, com gratidão pela semana que passou.", "Que Deus multiplique as suas bênçãos nesta sexta."],
    6: ["Que o seu sábado seja de paz, descanso e amor.", "Sábado abençoado para você e sua família!", "Que Deus encha o seu sábado de alegria e luz.", "Aproveite o sábado com quem você ama.", "Que o seu sábado tenha sol, calma e um bom café."],
  },
  tarde: {
    0: ["Que o seu domingo continue leve, cheio de paz e amor.", "Aproveite a tarde de domingo com quem você ama.", "Que Deus abençoe a sua tarde de domingo.", "Uma tarde de domingo calma, com café e gratidão."],
    1: ["Que a sua segunda-feira siga leve e abençoada.", "Força! A tarde de segunda também é de Deus.", "Respire fundo, a segunda está passando e você está indo bem.", "Que a sua tarde seja de paz e boas notícias."],
    2: ["Que a sua terça-feira siga cheia de bênçãos.", "Tenha uma tarde de terça tranquila e produtiva.", "Siga com fé, a sua terça ainda guarda coisas boas.", "Que Deus renove as suas forças nesta tarde."],
    3: ["Que o resto da sua quarta-feira seja leve e abençoado.", "Metade da semana já foi. Siga firme e com fé!", "Uma pausa, um café e gratidão pela sua quarta.", "Que a sua tarde de quarta traga calma e alegria."],
    4: ["Que a sua quinta-feira continue cheia de paz.", "Falta pouco! Siga com fé e ânimo nesta tarde.", "Que Deus abençoe o resto da sua quinta-feira.", "Tenha uma tarde de quinta leve e cheia de sorrisos."],
    5: ["Que a sua sexta-feira termine leve e abençoada.", "Quase lá! Siga com fé, o fim de semana está chegando.", "Que a tarde de sexta traga paz e muita alegria.", "Sextou com gratidão pela semana que passou."],
    6: ["Que a sua tarde de sábado seja de paz e descanso.", "Aproveite o sábado com quem você ama.", "Que Deus abençoe a sua tarde de sábado.", "Um sábado de tarde calma e coração tranquilo."],
  },
  noite: {
    0: ["Que a sua noite de domingo seja de paz e descanso.", "Agradeça pelo domingo e durma em paz.", "Que Deus proteja o seu sono e a sua família.", "Descanse, uma nova semana de bênçãos vem aí."],
    1: ["Que a sua noite de segunda seja tranquila e de bom descanso.", "Você venceu a segunda-feira. Descanse em paz.", "Que Deus guarde o seu sono nesta noite.", "Agradeça pelo dia e durma em paz."],
    2: ["Que a sua terça-feira termine em paz.", "Descanse, o dia de hoje já foi vencido.", "Que Deus abençoe o seu sono e renove as suas forças.", "Termine a terça com gratidão e o coração tranquilo."],
    3: ["Que a sua quarta-feira termine com paz no coração.", "Agradeça pelo dia de hoje e descanse sem pressa.", "Que Deus cuide do seu sono nesta noite.", "Que a noite traga calma e sonhos bons."],
    4: ["Que a sua quinta-feira termine leve e abençoada.", "Descanse, falta pouco para o fim de semana.", "Que Deus proteja o seu sono e a sua casa.", "Termine o dia com gratidão e durma em paz."],
    5: ["Que a sua sexta-feira termine em paz e alegria.", "Você merece descansar depois desta semana.", "Que Deus abençoe o seu sono nesta sexta-feira.", "Agradeça pela semana e durma em paz."],
    6: ["Que a sua noite de sábado seja de paz e carinho.", "Descanse e agradeça por mais um dia de bênçãos.", "Que Deus proteja o seu sono e o de quem você ama.", "Que a noite traga calma ao coração e sonhos bons."],
  },
};

/* ---------- TIPOGRAFIA ---------- */
/* Fontes (carregadas do Google Fonts) e paletas de texto. */
const TEXT_STYLES = [
  { name: "elegante", font: "Playfair Display", style: "italic 700", color: "#ffffff", stroke: "rgba(60,20,0,.75)", greeting: "Great Vibes" },
  { name: "cursivo", font: "Dancing Script", style: "700", color: "#fff6c9", stroke: "rgba(90,30,0,.8)", greeting: "Pacifico" },
  { name: "motivacional", font: "Poppins", style: "800", color: "#ffffff", stroke: "rgba(20,30,70,.8)", greeting: "Pacifico" },
  { name: "religioso", font: "Cormorant Garamond", style: "italic 700", color: "#fffbe6", stroke: "rgba(40,20,60,.8)", greeting: "Cinzel" },
];
