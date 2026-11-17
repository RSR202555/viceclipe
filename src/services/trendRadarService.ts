import {
  TrendRankingItem,
  TrendPeriod,
  TrendCategory,
  MOCK_RANKING_DATA,
  TREND_INDICATORS,
  RISING_CONTENTS,
  FEATURED_TREND_CREATORS,
  TREND_CHART_TIMELINE,
} from '@/data/trendRadarData';

export interface TrendFilterParams {
  period?: TrendPeriod;
  category?: TrendCategory;
  search?: string;
  sortBy?: 'views' | 'growth' | 'rank';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TrendRadarResponse {
  items: TrendRankingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Service preparado para consultas do Trend Radar.
 * Atualmente opera sobre dados mockados com filtros reais no cliente.
 * Futuras integrações com YouTube Data API, Twitch API ou Supabase PostgreSQL
 * serão conectadas aqui de forma transparente.
 */
export const trendRadarService = {
  /**
   * Retorna os indicadores resumidos do topo
   */
  async getIndicators() {
    return TREND_INDICATORS;
  },

  /**
   * Retorna a lista de rankings filtrada e paginada
   */
  async getRankings(params: TrendFilterParams = {}): Promise<TrendRadarResponse> {
    const {
      period = '24h',
      category = 'Todos',
      search = '',
      sortBy = 'rank',
      sortOrder = 'asc',
      page = 1,
      pageSize = 5,
    } = params;

    // Filtra período
    let filtered = MOCK_RANKING_DATA.filter((item) =>
      period === '30dias' ? true : item.period.includes(period)
    );

    // Filtra categoria
    if (category && category !== 'Todos') {
      filtered = filtered.filter((item) => item.category === category);
    }

    // Filtra busca
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.creator.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let valA: number;
      let valB: number;

      if (sortBy === 'views') {
        valA = a.viewsNum;
        valB = b.viewsNum;
      } else if (sortBy === 'growth') {
        valA = a.growthNum;
        valB = b.growthNum;
      } else {
        valA = a.rank;
        valB = b.rank;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Retorna os dados do gráfico para o período selecionado
   */
  async getChartData(period: TrendPeriod = '24h') {
    return TREND_CHART_TIMELINE[period] || TREND_CHART_TIMELINE['24h'];
  },

  /**
   * Retorna os conteúdos em ascensão rápida
   */
  async getRisingContents() {
    return RISING_CONTENTS;
  },

  /**
   * Retorna os criadores em destaque
   */
  async getFeaturedCreators() {
    return FEATURED_TREND_CREATORS;
  },
};
