export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  followers?: string;
  totalViews?: string;
  likes?: string;
  role?: string;
}

export interface VideoClip {
  id: string;
  title: string;
  duration: string;
  views: string;
  viewsNumber?: number;
  timeAgo: string;
  ranking?: number;
  thumbnail: string;
  videoUrl?: string;
  creator: Creator;
  likes: string;
  comments: string;
  shares: string;
  bookmarks?: string;
  tags: string[];
  description: string;
  category?: 'Gameplay' | 'Trailer' | 'Easter Eggs' | 'Rumores' | 'Highlights';
}

export interface StatMetric {
  id: string;
  title: string;
  value: string;
  unit: string;
  badge?: {
    text: string;
    type: 'success' | 'info' | 'warning' | 'live';
  };
  iconName: 'Flame' | 'Eye' | 'Radio' | 'Trophy';
  glowColor: 'orange' | 'cyan' | 'magenta' | 'amber';
  tooltip?: string;
}

export interface TrendTopic {
  rank: number;
  topic: string;
  growth: string;
  growthNumber: number;
  category: string;
}

export interface ChartDataPoint {
  label: string;
  views: number;
  growth: number;
}

export type TimeFilter = '24h' | '7dias' | '30dias' | 'todos';

export interface ClipperJob {
  sourceUrl: string;
  status: 'idle' | 'uploading' | 'analyzing' | 'ready';
  progress: number;
  currentTask: string;
  detectedClipsCount: number;
}
