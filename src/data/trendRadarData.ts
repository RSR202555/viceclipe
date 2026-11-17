export type TrendPeriod = '24h' | '7dias' | '30dias';

export type TrendCategory =
  | 'Todos'
  | 'Gameplay'
  | 'Humor'
  | 'Notícias'
  | 'Easter Eggs'
  | 'Mods'
  | 'Teorias'
  | 'Momentos épicos';

export interface TrendRankingItem {
  id: string;
  rank: number;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  category: Exclude<TrendCategory, 'Todos'>;
  views: string;
  viewsNum: number;
  growth: string;
  growthNum: number;
  publishedAt: string;
  period: TrendPeriod[];
}

export interface RisingContentItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  creatorName: string;
  creatorAvatar: string;
  views: string;
  growth: string;
  category: string;
}

export interface FeaturedCreatorTrend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  category: string;
  totalViews: string;
  clipsCount: number;
  growth: string;
}

export const TREND_INDICATORS = [
  {
    id: 'videos-monitored',
    label: 'Vídeos Monitorados',
    value: '1.480',
    unit: 'fontes ativas',
    change: '+14% hoje',
    iconName: 'Film',
    glowColor: 'cyan',
    tooltip: 'Total de vídeos e streams de GTA 6 sendo analisados pelo radar',
  },
  {
    id: 'trends-identified',
    label: 'Tendências Identificadas',
    value: '84',
    unit: 'tópicos quentes',
    change: '+8 nas últimas horas',
    iconName: 'Flame',
    glowColor: 'orange',
    tooltip: 'Padrões de engajamento acelerado detectados nos canais',
  },
  {
    id: 'featured-creators',
    label: 'Criadores em Destaque',
    value: '245',
    unit: 'criadores ativos',
    change: '+32 novos este mês',
    iconName: 'Trophy',
    glowColor: 'amber',
    tooltip: 'Canais com maior taxa de compartilhamento na comunidade',
  },
  {
    id: 'growing-content',
    label: 'Conteúdos em Crescimento',
    value: '+342%',
    unit: 'média de aceleração',
    change: 'Pico em Leonida',
    iconName: 'TrendingUp',
    glowColor: 'magenta',
    tooltip: 'Taxa média de crescimento dos conteúdos ranqueados no Top 10',
  },
];

export const MOCK_RANKING_DATA: TrendRankingItem[] = [
  {
    id: 'tr-1',
    rank: 1,
    title: 'GTA 6: Vazamento de gameplay choca a internet com nova física de água',
    thumbnail: '/images/thumb-1.png',
    duration: '00:45',
    creator: {
      name: 'Rockstar News BR',
      handle: '@rockstarnewsbr',
      avatar: '/avatars/avatar-1.png',
      verified: true,
    },
    category: 'Notícias',
    views: '1.240.000',
    viewsNum: 1240000,
    growth: '+342%',
    growthNum: 342,
    publishedAt: 'Há 2 dias',
    period: ['24h', '7dias', '30dias'],
  },
  {
    id: 'tr-2',
    rank: 2,
    title: 'Vice City está de volta! Comparativo 2002 vs 2026 em 4K HDR',
    thumbnail: '/images/thumb-2.png',
    duration: '01:20',
    creator: {
      name: 'Gameplay Zone',
      handle: '@gameplayzone',
      avatar: '/avatars/avatar-2.png',
      verified: true,
    },
    category: 'Gameplay',
    views: '985.000',
    viewsNum: 985000,
    growth: '+278%',
    growthNum: 278,
    publishedAt: 'Há 3 dias',
    period: ['24h', '7dias', '30dias'],
  },
  {
    id: 'tr-3',
    rank: 3,
    title: '15 Detalhes ocultos que você não viu na praia de Vice Beach',
    thumbnail: '/images/thumb-3.png',
    duration: '00:52',
    creator: {
      name: 'GameExplosão',
      handle: '@gameexplosao',
      avatar: '/avatars/avatar-3.png',
      verified: true,
    },
    category: 'Easter Eggs',
    views: '756.000',
    viewsNum: 756000,
    growth: '+215%',
    growthNum: 215,
    publishedAt: 'Há 4 dias',
    period: ['24h', '7dias', '30dias'],
  },
  {
    id: 'tr-4',
    rank: 4,
    title: 'Gráfico insano de ray tracing no asfalto molhado de Ocean Drive',
    thumbnail: '/images/thumb-4.png',
    duration: '01:15',
    creator: {
      name: 'Canal Do Joga',
      handle: '@canaldojoga',
      avatar: '/avatars/avatar-4.png',
      verified: true,
    },
    category: 'Momentos épicos',
    views: '689.000',
    viewsNum: 689000,
    growth: '+189%',
    growthNum: 189,
    publishedAt: 'Há 5 dias',
    period: ['24h', '7dias', '30dias'],
  },
  {
    id: 'tr-5',
    rank: 5,
    title: 'Polícia de Leonida: Inteligência artificial dos bloqueios de rua',
    thumbnail: '/images/studio-thumb-1.png',
    duration: '00:38',
    creator: {
      name: 'GamerBR',
      handle: '@gamerbr_oficial',
      avatar: '/images/gamerbr-avatar.png',
      verified: true,
    },
    category: 'Gameplay',
    views: '540.000',
    viewsNum: 540000,
    growth: '+176%',
    growthNum: 176,
    publishedAt: 'Há 6 dias',
    period: ['7dias', '30dias'],
  },
  {
    id: 'tr-6',
    rank: 6,
    title: 'O NPC mais engraçado encontrado nas ruas de Vice City até agora',
    thumbnail: '/images/studio-thumb-2.png',
    duration: '00:29',
    creator: {
      name: 'Leonida Memes',
      handle: '@leonidamemes',
      avatar: '/avatars/avatar-2.png',
      verified: false,
    },
    category: 'Humor',
    views: '492.000',
    viewsNum: 492000,
    growth: '+164%',
    growthNum: 164,
    publishedAt: 'Há 1 dia',
    period: ['24h', '7dias'],
  },
  {
    id: 'tr-7',
    rank: 7,
    title: 'Teoria sobre o passado de Jason e Lucia que faz todo sentido',
    thumbnail: '/images/hero-art.png',
    duration: '01:45',
    creator: {
      name: 'Lore Hunters GTA',
      handle: '@lorehunters',
      avatar: '/avatars/avatar-3.png',
      verified: true,
    },
    category: 'Teorias',
    views: '410.000',
    viewsNum: 410000,
    growth: '+142%',
    growthNum: 142,
    publishedAt: 'Há 3 dias',
    period: ['7dias', '30dias'],
  },
  {
    id: 'tr-8',
    rank: 8,
    title: 'Recriando o mapa do clássico Vice City na nova engine RAGE',
    thumbnail: '/images/thumb-vice-night.png',
    duration: '02:10',
    creator: {
      name: 'Modding Brasil',
      handle: '@moddingbr',
      avatar: '/avatars/avatar-4.png',
      verified: true,
    },
    category: 'Mods',
    views: '385.000',
    viewsNum: 385000,
    growth: '+128%',
    growthNum: 128,
    publishedAt: 'Há 7 dias',
    period: ['30dias'],
  },
];

export const RISING_CONTENTS: RisingContentItem[] = [
  {
    id: 'rising-1',
    title: 'Fuga com helicóptero pela ponte interestadual de Leonida',
    thumbnail: '/images/thumb-helicopter.png',
    duration: '00:42',
    creatorName: 'Rockstar News BR',
    creatorAvatar: '/avatars/avatar-1.png',
    views: '320K',
    growth: '+412%',
    category: 'Gameplay',
  },
  {
    id: 'rising-2',
    title: 'Easter egg do clássico Tommy Vercetti escondido em Ocean Beach',
    thumbnail: '/images/thumb-vice-night.png',
    duration: '01:10',
    creatorName: 'GameExplosão',
    creatorAvatar: '/avatars/avatar-3.png',
    views: '280K',
    growth: '+380%',
    category: 'Easter Eggs',
  },
  {
    id: 'rising-3',
    title: 'Drift com esportivo em alta velocidade na chuva de neon',
    thumbnail: '/images/thumb-sports-car.png',
    duration: '00:35',
    creatorName: 'GamerBR',
    creatorAvatar: '/images/gamerbr-avatar.png',
    views: '445K',
    growth: '+355%',
    category: 'Momentos épicos',
  },
  {
    id: 'rising-4',
    title: 'NPC reagindo ao roubo do iate no porto de Vice Point',
    thumbnail: '/images/studio-thumb-3.png',
    duration: '00:25',
    creatorName: 'Canal Do Joga',
    creatorAvatar: '/avatars/avatar-4.png',
    views: '210K',
    growth: '+290%',
    category: 'Humor',
  },
];

export const FEATURED_TREND_CREATORS: FeaturedCreatorTrend[] = [
  {
    id: 'cr-1',
    name: 'GamerBR',
    handle: '@gamerbr_oficial',
    avatar: '/images/gamerbr-avatar.png',
    verified: true,
    category: 'Gameplay & Testes',
    totalViews: '1.2M',
    clipsCount: 38,
    growth: '+320%',
  },
  {
    id: 'cr-2',
    name: 'Rockstar News BR',
    handle: '@rockstarnewsbr',
    avatar: '/avatars/avatar-1.png',
    verified: true,
    category: 'Notícias & Fatos',
    totalViews: '2.4M',
    clipsCount: 52,
    growth: '+295%',
  },
  {
    id: 'cr-3',
    name: 'GameExplosão',
    handle: '@gameexplosao',
    avatar: '/avatars/avatar-3.png',
    verified: true,
    category: 'Easter Eggs & Segredos',
    totalViews: '890K',
    clipsCount: 29,
    growth: '+240%',
  },
  {
    id: 'cr-4',
    name: 'Canal Do Joga',
    handle: '@canaldojoga',
    avatar: '/avatars/avatar-4.png',
    verified: true,
    category: 'Momentos Épicos',
    totalViews: '760K',
    clipsCount: 24,
    growth: '+198%',
  },
];

export const TREND_CHART_TIMELINE = {
  '24h': [
    { label: '00h', gameplay: 110, noticias: 90, easterEggs: 60, humor: 40 },
    { label: '04h', gameplay: 130, noticias: 85, easterEggs: 70, humor: 50 },
    { label: '08h', gameplay: 210, noticias: 150, easterEggs: 110, humor: 80 },
    { label: '12h', gameplay: 320, noticias: 230, easterEggs: 160, humor: 120 },
    { label: '16h', gameplay: 410, noticias: 310, easterEggs: 210, humor: 160 },
    { label: '20h', gameplay: 520, noticias: 390, easterEggs: 260, humor: 195 },
  ],
  '7dias': [
    { label: 'Seg', gameplay: 1400, noticias: 1100, easterEggs: 800, humor: 600 },
    { label: 'Ter', gameplay: 1800, noticias: 1350, easterEggs: 950, humor: 750 },
    { label: 'Qua', gameplay: 2200, noticias: 1600, easterEggs: 1200, humor: 900 },
    { label: 'Qui', gameplay: 2750, noticias: 1950, easterEggs: 1450, humor: 1100 },
    { label: 'Sex', gameplay: 3500, noticias: 2400, easterEggs: 1800, humor: 1400 },
    { label: 'Sáb', gameplay: 4300, noticias: 2900, easterEggs: 2200, humor: 1750 },
    { label: 'Dom', gameplay: 4900, noticias: 3400, easterEggs: 2600, humor: 2100 },
  ],
  '30dias': [
    { label: 'Sem 1', gameplay: 8500, noticias: 6200, easterEggs: 4500, humor: 3200 },
    { label: 'Sem 2', gameplay: 15200, noticias: 10800, easterEggs: 7900, humor: 5800 },
    { label: 'Sem 3', gameplay: 23400, noticias: 16500, easterEggs: 12100, humor: 8900 },
    { label: 'Sem 4', gameplay: 32500, noticias: 22400, easterEggs: 16800, humor: 12400 },
  ],
};
