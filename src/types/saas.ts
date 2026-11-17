export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

export type BillingInterval = 'monthly' | 'annual';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface PlanLimits {
  clips_per_month: number; // -1 for unlimited
  max_resolution: '1080p' | '4k';
  priority_queue: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_interval: BillingInterval;
  features: string[];
  limits: PlanLimits;
  is_active: boolean;
  highlighted: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_admin?: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: 'mercadopago' | 'stripe' | 'pix' | 'simulator';
  provider_customer_id?: string;
  provider_subscription_id?: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  subscription_id?: string;
  provider_payment_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  payment_method: 'pix' | 'credit_card' | 'boleto';
  paid_at?: string;
  receipt_url?: string;
  created_at: string;
}

export interface UserSession {
  user: UserProfile;
  subscription: Subscription | null;
  plan: Plan | null;
  hasAccess: boolean; // true if subscription?.status === 'active' || 'trialing' AND not expired
}

export interface WebhookEventRecord {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: any;
  duplicate: boolean;
  processed_at: string;
  created_at: string;
}

export interface AdminUserListItem {
  user: UserProfile;
  subscription: Subscription | null;
  plan: Plan | null;
  paymentsCount: number;
  totalSpentCents: number;
  lastPaymentDate?: string;
}

export interface AdminSaaSMetrics {
  mrrCents: number;
  arrCents: number;
  totalRevenueCents: number;
  totalUsersCount: number;
  activeSubscribersCount: number;
  canceledCount: number;
  pastDueCount: number;
  conversionRate: number; // percentage
  churnRate: number; // percentage
  pixVolumeCents: number;
  cardVolumeCents: number;
  revenueChart: { date: string; mrr: number; newRevenue: number; subscribers: number }[];
  planDistribution: { name: string; count: number; value: number }[];
  recentPayments: PaymentRecord[];
  recentEvents: WebhookEventRecord[];
}


// ==============================================================================
// AI CLIPPER JOBS, SEGMENTS & EXPORTS (SaaS AI Engine)
// ==============================================================================

export type ClipJobStatus =
  | 'pending'
  | 'downloading'
  | 'extracting_audio'
  | 'transcribing'
  | 'analyzing_context'
  | 'detecting_moments'
  | 'scoring'
  | 'completed'
  | 'failed'
  | 'canceled';

export type ClipSourceType = 'url' | 'file' | 'live' | 'sample';

export type ClipExportStatus = 'queued' | 'rendering' | 'reframing' | 'ready' | 'failed';

export interface ViralScoreBreakdown {
  hook: number;        // Max 25 pontos
  retention: number;   // Max 20 pontos
  emotion: number;     // Max 20 pontos
  clarity: number;     // Max 20 pontos
  shareability: number;// Max 15 pontos
}

export interface SpeechCue {
  start: number;
  end: number;
  text: string;
}

export interface ClipJob {
  id: string;
  user_id: string;
  source_video_url: string;
  source_type: ClipSourceType;
  platform: 'youtube' | 'twitch' | 'kick' | 'direct_upload' | string;
  is_live: boolean;
  status: ClipJobStatus;
  progress: number;
  duration: number;
  target_duration?: '15-30' | '30-45' | '45-60' | '60-90' | 'auto';
  current_stage: string;
  error_message?: string;
  metadata?: {
    title?: string;
    author?: string;
    fps?: number;
    width?: number;
    height?: number;
    codec?: string;
    thumbnail?: string;
  };
  processing_started_at?: string;
  processing_finished_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClipSegment {
  id: string;
  job_id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  duration: number;
  transcript: string;
  category: string;
  viral_score: number;
  score_breakdown: ViralScoreBreakdown;
  score_explanation: string;
  suggested_caption?: string;
  tags: string[];
  cues?: SpeechCue[];
  status: 'detected' | 'selected' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface ClipExport {
  id: string;
  segment_id?: string;
  job_id: string;
  user_id: string;
  output_url: string;
  storage_path?: string;
  resolution: '720p' | '1080p' | '4k';
  aspect_ratio: '9:16' | '16:9';
  framing_mode: 'cover' | 'black-bars' | 'blur' | 'smart_track';
  subtitle_style: 'viral_classic' | 'podcast_premium' | 'neon_pink' | 'minimalist' | 'dynamic';
  subtitle_position: 'bottom' | 'middle' | 'top';
  file_size_bytes?: number;
  status: ClipExportStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
