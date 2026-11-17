'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Input,
  Select,
  Pagination,
  Tag,
  Tooltip,
  Empty,
  Skeleton,
  message,
} from 'antd';
import {
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  Play,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Flame,
  Film,
  Trophy,
  Users,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendPeriod,
  TrendCategory,
  TrendRankingItem,
  RisingContentItem,
  FeaturedCreatorTrend,
} from '@/data/trendRadarData';
import { trendRadarService } from '@/services/trendRadarService';
import { useApp } from '@/context/AppContext';
import { RankingBadge } from '@/components/ui/RankingBadge';
import { VideoClip } from '@/types';

export default function TrendRadarPage() {
  const { openVideoModal } = useApp();

  // Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>('24h');
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'views' | 'growth'>('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Data State
  const [indicators, setIndicators] = useState<any[]>([]);
  const [rankingData, setRankingData] = useState<TrendRankingItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [risingContents, setRisingContents] = useState<RisingContentItem[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreatorTrend[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: TrendCategory[] = [
    'Todos',
    'Gameplay',
    'Humor',
    'Notícias',
    'Easter Eggs',
    'Mods',
    'Teorias',
    'Momentos épicos',
  ];

  const periods: { id: TrendPeriod; label: string }[] = [
    { id: '24h', label: 'Últimas 24 horas' },
    { id: '7dias', label: 'Últimos 7 dias' },
    { id: '30dias', label: 'Últimos 30 dias' },
  ];

  // Load initial data and indicators
  useEffect(() => {
    trendRadarService.getIndicators().then(setIndicators);
    trendRadarService.getRisingContents().then(setRisingContents);
    trendRadarService.getFeaturedCreators().then(setFeaturedCreators);
  }, []);

  // Load chart data on period change
  useEffect(() => {
    trendRadarService.getChartData(selectedPeriod).then(setChartData);
  }, [selectedPeriod]);

  // Load rankings on filter change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      trendRadarService
        .getRankings({
          period: selectedPeriod,
          category: selectedCategory,
          search: searchQuery,
          sortBy,
          sortOrder: sortBy === 'rank' ? 'asc' : 'desc',
          page: currentPage,
          pageSize,
        })
        .then((res) => {
          setRankingData(res.items);
          setTotalItems(res.total);
          setLoading(false);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedPeriod, selectedCategory, searchQuery, sortBy, currentPage]);

  const handleOpenVideoFromItem = (item: TrendRankingItem | RisingContentItem) => {
    const video: VideoClip = {
      id: item.id,
      title: item.title,
      duration: item.duration,
      views: 'views' in item ? item.views : '320K',
      timeAgo: 'publishedAt' in item ? item.publishedAt : 'Recente',
      ranking: 'rank' in item ? item.rank : undefined,
      thumbnail: item.thumbnail,
      creator: {
        id: 'creator-' + item.id,
        name: 'creator' in item ? item.creator.name : item.creatorName,
        handle: 'creator' in item ? item.creator.handle : '@criador',
        avatar: 'creator' in item ? item.creator.avatar : item.creatorAvatar,
        verified: true,
      },
      likes: '45.2K',
      comments: '1.8K',
      shares: '3.4K',
      tags: ['#GTA6', '#TrendRadar', '#' + item.category],
      description: item.title + ' — Conteúdo em destaque no Trend Radar de Leonida.',
    };
    openVideoModal(video);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Gameplay':
        return 'purple';
      case 'Notícias':
        return 'magenta';
      case 'Easter Eggs':
        return 'cyan';
      case 'Humor':
        return 'orange';
      case 'Mods':
        return 'blue';
      case 'Teorias':
        return 'gold';
      default:
        return 'pink';
    }
  };

  const getIndicatorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film':
        return <Film className="w-6 h-6 text-vice-blue" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-amber-400" />;
      default:
        return <TrendingUp className="w-6 h-6 text-vice-pink" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[rgba(139,46,255,0.2)] gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-vice-pink text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-vice-blue" />
            <span>Leonida Trend Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black italic tracking-wide text-white uppercase font-display flex items-center gap-3">
            <span>TREND RADAR</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </h1>

          <p className="text-sm text-vice-textMuted max-w-2xl mt-1">
            Descubra o que está em alta, acompanhe conteúdos em crescimento e encontre oportunidades para criar novos clipes de GTA 6.
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center bg-[#100B1D] border border-purple-500/30 p-1.5 rounded-2xl gap-1 self-start lg:self-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPeriod(p.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                  : 'text-vice-textMuted hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-vice-pink" />
          <span>Categorias:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-vice-pink text-white shadow-[0_0_12px_rgba(255,20,147,0.5)]'
                : 'bg-[#151027] text-vice-textMuted border border-purple-500/20 hover:text-white hover:border-vice-pink/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. Indicators (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((item) => (
          <Tooltip key={item.id} title={item.tooltip} placement="top">
            <div className="rounded-2xl bg-[#151027] border border-[rgba(139,46,255,0.2)] p-5 flex items-center gap-4 hover:border-vice-pink/40 transition-all hover:-translate-y-1 shadow-[0_8px_25px_rgba(0,0,0,0.4)] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                {getIndicatorIcon(item.iconName)}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-vice-textMuted uppercase truncate">
                  {item.label}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5">
                  {item.value}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-zinc-400">{item.unit}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* 3. Trend Evolution Multi-Category Chart (Recharts) */}
      <div className="rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.25)] p-6 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.5)] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/15 gap-3">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <span>Evolução do Engajamento por Categoria</span>
              <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-vice-blue">
                {selectedPeriod === '24h'
                  ? 'Por Hora'
                  : selectedPeriod === '7dias'
                  ? 'Por Dia'
                  : 'Por Semana'}
              </span>
            </h3>
            <p className="text-xs text-vice-textMuted">
              Volume acumulado de interações e visualizações comparadas em tempo real
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D9FF]" />
              <span className="text-zinc-300">Gameplay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF1493]" />
              <span className="text-zinc-300">Notícias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B2EFF]" />
              <span className="text-zinc-300">Easter Eggs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]" />
              <span className="text-zinc-300">Humor</span>
            </div>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGameplay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNoticias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1493" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF1493" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorEaster" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B2EFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B2EFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#7E7694"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(139, 46, 255, 0.2)' }}
              />
              <YAxis
                stroke="#7E7694"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(139, 46, 255, 0.2)' }}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1C1438] border border-purple-500/40 p-3 rounded-xl shadow-xl text-xs flex flex-col gap-1">
                        <p className="text-white font-bold mb-1 border-b border-white/10 pb-1">
                          Período: {label}
                        </p>
                        {payload.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <span style={{ color: entry.color }} className="font-semibold">
                              {entry.name}:
                            </span>
                            <span className="text-white font-mono font-bold">
                              {entry.value}K
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="gameplay"
                name="Gameplay"
                stroke="#00D9FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorGameplay)"
              />
              <Area
                type="monotone"
                dataKey="noticias"
                name="Notícias"
                stroke="#FF1493"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorNoticias)"
              />
              <Area
                type="monotone"
                dataKey="easterEggs"
                name="Easter Eggs"
                stroke="#8B2EFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEaster)"
              />
              <Area
                type="monotone"
                dataKey="humor"
                name="Humor"
                stroke="#FFB800"
                strokeWidth={2}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Ranking de Tendências Table & Controls */}
      <div className="rounded-3xl bg-[#151027] border border-[rgba(139,46,255,0.25)] p-6 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.5)] flex flex-col gap-6">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white font-display">
              Ranking Oficial de Tendências
            </h3>
            <span className="text-xs text-vice-blue bg-vice-blue/10 border border-vice-blue/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {totalItems} conteúdos
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="w-64">
              <Input
                placeholder="Buscar por título ou criador..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                prefix={<Search className="w-4 h-4 text-vice-textMuted mr-1.5" />}
                allowClear
                size="middle"
                className="rounded-full bg-[#100B1D] border-purple-500/25"
              />
            </div>

            {/* Sort Select */}
            <Select
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              className="w-44"
              options={[
                { value: 'rank', label: 'Ordem Oficial' },
                { value: 'views', label: 'Mais Visualizados' },
                { value: 'growth', label: 'Maior Crescimento' },
              ]}
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-12">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : rankingData.length === 0 ? (
          <div className="py-12">
            <Empty
              description={
                <span className="text-vice-textMuted">
                  Nenhum conteúdo encontrado para os filtros selecionados.
                </span>
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Table Header Row (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5">
              <span className="col-span-1 text-center">Posição</span>
              <span className="col-span-6">Conteúdo / Criador</span>
              <span className="col-span-2">Categoria</span>
              <span className="col-span-2 text-right">Visualizações</span>
              <span className="col-span-1 text-right">Ação</span>
            </div>

            {/* Rows */}
            {rankingData.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenVideoFromItem(item)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-[#100B1D]/80 hover:bg-[#1C1338] border border-purple-500/15 hover:border-vice-pink/40 transition-all flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
              >
                {/* Pos */}
                <div className="md:col-span-1 flex items-center justify-between md:justify-center w-full md:w-auto">
                  <RankingBadge rank={item.rank} />
                  <div className="md:hidden flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{item.growth}</span>
                  </div>
                </div>

                {/* Content & Creator */}
                <div className="md:col-span-6 flex items-center gap-3.5 min-w-0 w-full">
                  <div className="relative w-24 h-14 sm:w-28 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/50 border border-white/10">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-zinc-300">
                      {item.duration}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-vice-pink transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-4 h-4 rounded-full overflow-hidden border border-purple-400 flex-shrink-0">
                        <Image
                          src={item.creator.avatar}
                          alt={item.creator.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-300 truncate">
                        {item.creator.name}
                      </span>
                      {item.creator.verified && (
                        <CheckCircle2 className="w-3 h-3 text-vice-blue flex-shrink-0" />
                      )}
                      <span className="text-zinc-600 text-xs hidden sm:inline">•</span>
                      <span className="text-[11px] text-zinc-500 hidden sm:inline">
                        {item.publishedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <Tag
                    color={getCategoryColor(item.category)}
                    className="rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border-0"
                  >
                    {item.category}
                  </Tag>
                </div>

                {/* Views & Growth */}
                <div className="md:col-span-2 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto">
                  <span className="text-sm font-black text-white font-display">
                    {item.views}
                  </span>
                  <div className="hidden md:flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{item.growth}</span>
                  </div>
                </div>

                {/* Play action */}
                <div className="md:col-span-1 flex justify-end w-full md:w-auto">
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-vice-pink text-white flex items-center justify-center transition-all group-hover:shadow-[0_0_12px_rgba(255,20,147,0.6)]">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="flex justify-center pt-4 border-t border-purple-500/15">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* 5. Conteúdos em Ascensão */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-wide text-white uppercase font-display">
                Conteúdos em Ascensão Rápida
              </h3>
              <p className="text-xs text-vice-textMuted">
                Vídeos acelerando rapidamente nas últimas 6 horas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {risingContents.map((clip) => (
            <div
              key={clip.id}
              onClick={() => handleOpenVideoFromItem(clip)}
              className="group rounded-2xl bg-[#151027] border border-purple-500/20 hover:border-vice-pink/40 p-3.5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(139,46,255,0.2)] cursor-pointer"
            >
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/40">
                  <Image
                    src={clip.thumbnail}
                    alt={clip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.2 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                    {clip.duration}
                  </span>

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{clip.growth}</span>
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-vice-pink transition-colors">
                  {clip.title}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-purple-500/15">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-purple-400 flex-shrink-0">
                    <Image
                      src={clip.creatorAvatar}
                      alt={clip.creatorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-300 truncate">
                    {clip.creatorName}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-vice-blue font-bold">
                  {clip.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Criadores em Destaque */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-wide text-white uppercase font-display">
              Criadores em Ascensão no Radar
            </h3>
            <p className="text-xs text-vice-textMuted">
              Canais que mais geraram engajamento nos últimos períodos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className="p-5 rounded-2xl bg-[#151027] border border-purple-500/20 hover:border-amber-400/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] flex-shrink-0">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {creator.name}
                    </span>
                    {creator.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-vice-blue flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-vice-textMuted">
                    {creator.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#100B1D] border border-purple-500/15 text-center">
                <div>
                  <span className="text-xs font-black text-white font-display">
                    {creator.totalViews}
                  </span>
                  <p className="text-[9px] text-zinc-400 uppercase">Visualizações</p>
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-400 font-display">
                    {creator.growth}
                  </span>
                  <p className="text-[9px] text-zinc-400 uppercase">Aceleração</p>
                </div>
              </div>

              <Link
                href="/app/criadores"
                className="w-full py-2 rounded-full text-xs font-bold text-center text-white bg-white/5 hover:bg-gradient-to-r hover:from-vice-pink hover:to-vice-purple transition-all border border-white/10"
              >
                Acessar Perfil
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
