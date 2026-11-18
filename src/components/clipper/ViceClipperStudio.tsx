'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { message, Slider } from 'antd';
import {
  Scissors,
  UploadCloud,
  Play,
  Pause,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Film,
  Zap,
  Volume2,
  VolumeX,
  Sliders,
  Type,
  Layers,
  ArrowRight,
  ArrowLeft,
  Flame,
  Check,
  FileVideo,
  Monitor,
  Smartphone,
  Info,
  Youtube,
  ExternalLink,
  Radio,
  Link2,
  Upload,
  Gamepad2,
  Clock,
  Filter,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Real playable sample videos (hosted locally in public/videos)
const REAL_SAMPLE_GAMEPLAYS = [
  {
    id: 'sample-1',
    title: 'Perseguição & Ação na Ocean Drive (Vídeo Real 1080p)',
    description: 'Vídeo real em alta resolução com áudio, velocidade e cinematografia de Vice City.',
    videoUrl: '/videos/gta_oceandrive.mp4',
    thumbnail: '/images/thumb-1.png',
    defaultDuration: 46,
  },
  {
    id: 'sample-2',
    title: 'Manobra Acrobática em Leonida (Vídeo Real)',
    description: 'Acrobacias e animação de ação rápida em alta taxa de quadros.',
    videoUrl: '/videos/sample1.mp4',
    thumbnail: '/images/thumb-2.png',
    defaultDuration: 10,
  },
  {
    id: 'sample-3',
    title: 'Cena Noturna em Vice Beach (Vídeo Real)',
    description: 'Iluminação noturna e reflexos para teste de corte vertical 9:16.',
    videoUrl: '/videos/sample2.mp4',
    thumbnail: '/images/thumb-3.png',
    defaultDuration: 5,
  },
];

interface DetectedMoment {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  scoreBreakdown?: {
    hook: number;
    retention: number;
    emotion: number;
    clarity: number;
    shareability: number;
  };
  scoreExplanation?: string;
  category?: string;
  tags: string[];
  suggestedCaption: string;
  cues?: SpeechCue[];
}

export interface SpeechCue {
  start: number;
  end: number;
  text: string;
}

const GTA6_SAMPLE_SPEECH_CUES: SpeechCue[] = [
  { start: 0, end: 5.0, text: 'Lucia, você sabe por que tá aqui?' },
  { start: 5.0, end: 9.5, text: 'Má sorte, eu acho...' },
  { start: 10.0, end: 17.5, text: 'A única forma de passar por isso é ficarmos juntos...' },
  { start: 18.0, end: 24.5, text: 'Como uma equipe. Confia em mim?' },
  { start: 25.0, end: 32.0, text: 'Confio... Vice City nunca mais será a mesma!' },
  { start: 33.0, end: 46.0, text: 'Acelera que a polícia tá na nossa cola!' },
];

export const ViceClipperStudio: React.FC = () => {
  const { user, subscription, plan, hasAccess } = useAuth();

  // Workflow steps: 1 (Analisar) | 2 (Selecionar) | 3 (Editar) | 4 (Exportar)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Video source state
  const [videoSourceType, setVideoSourceType] = useState<'sample' | 'upload' | 'url' | 'live'>('url');
  const [videoUrl, setVideoUrl] = useState<string>(REAL_SAMPLE_GAMEPLAYS[0].videoUrl);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string>(REAL_SAMPLE_GAMEPLAYS[0].thumbnail);
  const [videoTitle, setVideoTitle] = useState<string>(REAL_SAMPLE_GAMEPLAYS[0].title);
  const [videoAuthor, setVideoAuthor] = useState<string>('Rockstar Games');
  const [videoKeywords, setVideoKeywords] = useState<string[]>([]);
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('https://www.youtube.com/watch?v=QdBZY2fkU-0');
  const [liveUrlInput, setLiveUrlInput] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isRealFileUploaded, setIsRealFileUploaded] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(46);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<{
    message: string;
    suggestion?: string;
    isAgeRestricted?: boolean;
    videoId?: string;
  } | null>(null);
  const [availableAudioTracks, setAvailableAudioTracks] = useState<
    { id: string; label: string; isDefault: boolean }[]
  >([]);
  const [selectedAudioLang, setSelectedAudioLang] = useState<string>('');
  const [streamKey, setStreamKey] = useState<number>(Date.now());

  // Preferences & Sorting
  const [targetDuration, setTargetDuration] = useState<'15-30' | '30-45' | '45-60' | '60-90' | 'auto'>('auto');
  const [momentsSortBy, setMomentsSortBy] = useState<'viral' | 'time' | 'duration' | 'category'>('viral');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [showRecentJobs, setShowRecentJobs] = useState<boolean>(false);

  // Saved Exports from Supabase
  const [savedExports, setSavedExports] = useState<any[]>([]);
  const [isLoadingExports, setIsLoadingExports] = useState<boolean>(false);

  // Video references
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // AI Pipeline settings
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [framingMode, setFramingMode] = useState<'cover' | 'black-bars' | 'blur'>('cover');
  const [coverZoom, setCoverZoom] = useState<number>(1.18); // Default smart open framing (1.18x)
  const [autoTracking, setAutoTracking] = useState<boolean>(true);
  const [includeSubtitles, setIncludeSubtitles] = useState<boolean>(true);

  // AI Analysis Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisPhase, setAnalysisPhase] = useState<string>('');

  // Detected AI Moments (dynamically computed from video duration)
  const [detectedMoments, setDetectedMoments] = useState<DetectedMoment[]>([]);

  // Selected Moment for Editing
  const [selectedMoment, setSelectedMoment] = useState<DetectedMoment | null>(null);

  // Trimmer & Edit State
  const [startTime, setStartTime] = useState<number>(2);
  const [endTime, setEndTime] = useState<number>(14);
  const [captionText, setCaptionText] = useState<string>('A POLÍCIA NÃO TEVE CHANCE NESSA FUGA! 🚓💥');
  const [subtitleStyle, setSubtitleStyle] = useState<'neon-pink' | 'cyber-cyan' | 'gold' | 'white'>('neon-pink');
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [videoFilter, setVideoFilter] = useState<'synthwave' | 'golden' | 'noir' | 'normal'>('synthwave');

  // Real speech subtitles (transcription of who is speaking in the video)
  const [speechCues, setSpeechCues] = useState<SpeechCue[]>(GTA6_SAMPLE_SPEECH_CUES);
  const [subtitleMode, setSubtitleMode] = useState<'speech' | 'headline'>('speech');
  const [activeSpeechText, setActiveSpeechText] = useState<string>('Lucia, você sabe por que tá aqui?');

  // Get current subtitle text to display on player overlay
  const getDisplayedSubtitle = () => {
    if (subtitleMode === 'speech') {
      if (speechCues.length > 0) {
        const matching = speechCues.find((c) => currentTime >= c.start && currentTime <= c.end);
        if (matching) return matching.text;
        if (activeSpeechText) return activeSpeechText;
        return '';
      }
      return captionText || '';
    }
    return captionText || '';
  };

  // Dynamic Filtering & Sorting for AI Moments
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    detectedMoments.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [detectedMoments]);

  const sortedMoments = useMemo(() => {
    let list = [...detectedMoments];
    if (selectedCategoryFilter !== 'all') {
      list = list.filter((m) => m.category === selectedCategoryFilter);
    }
    switch (momentsSortBy) {
      case 'time':
        return list.sort((a, b) => a.startTime - b.startTime);
      case 'duration':
        return list.sort((a, b) => (b.endTime - b.startTime) - (a.endTime - a.startTime));
      case 'category':
        return list.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      case 'viral':
      default:
        return list.sort((a, b) => b.viralScore - a.viralScore);
    }
  }, [detectedMoments, momentsSortBy, selectedCategoryFilter]);

  // Video Player Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Real Export & Render State
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderedBlobUrl, setRenderedBlobUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // Read video duration on metadata load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.floor(videoRef.current.duration) || 30;
      setVideoDuration(dur);
      if (detectedMoments.length === 0) {
        runAiAnalysis(videoTitle, videoAuthor, dur, videoKeywords, videoDescription);
      }
    }
  };

  useEffect(() => {
    runAiAnalysis(videoTitle, videoAuthor, videoDuration, videoKeywords, videoDescription);
    fetchRecentJobs();
    fetchSavedExports();
  }, []);

  // Sync mute state across both video and audio elements
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Pause elements when navigating outside active player steps
  useEffect(() => {
    if (currentStep !== 1 && currentStep !== 3) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentStep]);

  // Helper function to call the backend AI analyze API
  const runAiAnalysis = async (
    targetTitle: string,
    targetAuthor: string,
    targetDurationSec: number,
    targetKeywords: string[],
    targetDesc: string
  ) => {
    try {
      const res = await fetch('/api/clipper/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: youtubeVideoId || 'sample',
          videoSourceUrl: videoUrl,
          sourceType: videoSourceType,
          isLive: videoSourceType === 'live',
          targetDuration,
          title: targetTitle,
          author: targetAuthor,
          duration: targetDurationSec,
          keywords: targetKeywords,
          description: targetDesc,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.moments && data.moments.length > 0) {
          setDetectedMoments(data.moments);
          setSelectedMoment(data.moments[0]);
          setStartTime(data.moments[0].startTime);
          setEndTime(data.moments[0].endTime);
          setCaptionText(data.moments[0].suggestedCaption);
          if (data.moments[0].cues && data.moments[0].cues.length > 0) {
            setSpeechCues(data.moments[0].cues);
          }
          return data.moments;
        }
      }
    } catch (err) {
      console.warn('AI Analyze API error, using smart fallback', err);
    }

    // Smart fallback if API fails
    const total = Math.max(20, targetDurationSec || 60);
    const s1End = Math.min(total, 25);
    const s2Start = Math.min(total - 10, Math.floor(total * 0.35));
    const s2End = Math.min(total, s2Start + 25);
    const s3Start = Math.min(total - 10, Math.floor(total * 0.65));
    const s3End = Math.min(total, s3Start + 25);
    const s4Start = Math.min(total - 10, Math.floor(total * 0.82));
    const s4End = Math.min(total, s4Start + 20);

    const isReact = /react|opini|podcast|davy|flow|podpah|corte/i.test(targetTitle);
    const fallbackMoments: DetectedMoment[] = [
      {
        id: 'moment-1',
        title: isReact ? '💥 Reação Inicial de Alto Impacto' : `🔥 Abertura Épica: ${targetTitle.slice(0, 30)}`,
        description: 'Trecho com o primeiro pico de engajamento do vídeo.',
        startTime: 2,
        endTime: s1End,
        viralScore: 98,
        tags: ['#Viral', '#Shorts', '#Reels', '#Trending'],
        suggestedCaption: isReact ? 'A REAÇÃO DELE FOI INACREDITÁVEL! 😱🔥' : 'VOCÊ NÃO VAI ACREDITAR NISSO! 🤯💥',
      },
      {
        id: 'moment-2',
        title: '🎯 O Ponto Central da Discussão',
        description: 'Momento de maior densidade de informação e debate.',
        startTime: s2Start,
        endTime: s2End,
        viralScore: 95,
        tags: ['#Cortes', '#Debate', '#Opinião'],
        suggestedCaption: 'ELE MANDOU A REAL SEM FILTRO NENHUM! 🤐👀',
      },
      {
        id: 'moment-3',
        title: '😂 Momento Inusitado & Riso',
        description: 'Pico de descontração perfeito para prender a atenção.',
        startTime: s3Start,
        endTime: s3End,
        viralScore: 92,
        tags: ['#Humor', '#Engraçado', '#MelhoresMomentos'],
        suggestedCaption: 'EU NÃO CONSEGUI SEGURAR O RISO! 😂💀',
      },
      {
        id: 'moment-4',
        title: '💣 Conclusão & Veredito Final',
        description: 'Fechamento com chave de ouro e impacto.',
        startTime: s4Start,
        endTime: s4End,
        viralScore: 89,
        tags: ['#Veredito', '#Final', '#ForYou'],
        suggestedCaption: 'O FINAL QUE SURPREENDEU TODO MUNDO! 💣🔥',
      },
    ];

    setDetectedMoments(fallbackMoments);
    setSelectedMoment(fallbackMoments[0]);
    setStartTime(fallbackMoments[0].startTime);
    setEndTime(fallbackMoments[0].endTime);
    setCaptionText(fallbackMoments[0].suggestedCaption);
    return fallbackMoments;
  };

  // Fetch recent analysis jobs from database
  const fetchRecentJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`/api/clipper/jobs?userId=${user?.id || '4c81a4f5-1af3-46b7-9040-138a0f33e4c7'}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setRecentJobs(data.jobs || []);
      }
    } catch (err) {
      console.warn('Could not fetch recent jobs', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Restore analysis from a saved job
  const handleLoadRecentJob = async (job: any) => {
    try {
      message.loading({ content: 'Restaurando momentos da análise salva...', key: 'load-job' });
      const res = await fetch(`/api/clipper/jobs?jobId=${job.id}`);
      if (res.ok) {
        const data = await res.json();
        const segments = data.segments || [];
        if (segments.length > 0) {
          const mapped: DetectedMoment[] = segments.map((s: any, idx: number) => ({
            id: s.id || `moment-${idx + 1}`,
            title: s.title || `Momento ${idx + 1}`,
            description: s.description || '',
            startTime: Number(s.start_time) || 0,
            endTime: Number(s.end_time) || 20,
            viralScore: Number(s.viral_score) || 90,
            scoreBreakdown: s.score_breakdown,
            scoreExplanation: s.score_explanation,
            category: s.category,
            tags: s.tags || ['#ViceClipper', '#Shorts'],
            suggestedCaption: s.suggested_caption || '',
            cues: s.cues || [],
          }));
          setDetectedMoments(mapped);
          setSelectedMoment(mapped[0]);
          setStartTime(mapped[0].startTime);
          setEndTime(mapped[0].endTime);
          setCaptionText(mapped[0].suggestedCaption);
          if (mapped[0].cues && mapped[0].cues.length > 0) {
            setSpeechCues(mapped[0].cues);
          }
          if (job.source_video_url) {
            setVideoUrl(job.source_video_url);
            setVideoTitle(job.title || 'Vídeo Restaurado');
          }
          setCurrentStep(2);
          message.success({ content: `Análise restaurada com ${mapped.length} momentos!`, key: 'load-job' });
          return;
        }
      }
      // Fallback
      await runAiAnalysis(job.title || 'Vídeo Salvo', 'Criador', job.duration || 60, [], '');
      setCurrentStep(2);
      message.success({ content: 'Vídeo carregado com sucesso!', key: 'load-job' });
    } catch (err) {
      console.error(err);
      message.error({ content: 'Falha ao restaurar análise do banco.', key: 'load-job' });
    }
  };

  // Fetch saved video exports from Supabase
  const fetchSavedExports = async () => {
    setIsLoadingExports(true);
    try {
      const res = await fetch(`/api/clipper/exports?userId=${user?.id || '4c81a4f5-1af3-46b7-9040-138a0f33e4c7'}`);
      if (res.ok) {
        const data = await res.json();
        setSavedExports(data.exports || []);
      }
    } catch (err) {
      console.warn('Could not fetch exports', err);
    } finally {
      setIsLoadingExports(false);
    }
  };

  // Delete export from Supabase and disk
  const handleDeleteExport = async (id: string) => {
    try {
      message.loading({ content: 'Excluindo corte...', key: 'del-exp' });
      const res = await fetch(`/api/clipper/exports?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedExports((prev) => prev.filter((item) => item.id !== id));
        message.success({ content: 'Corte excluído com sucesso!', key: 'del-exp' });
      }
    } catch (err) {
      message.error({ content: 'Falha ao excluir corte.', key: 'del-exp' });
    }
  };

  // Cancel running analysis
  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisPhase('Análise cancelada pelo usuário.');
    message.info('Processamento de vídeo cancelado.');
  };

  // Real File Upload Handler (reads any local MP4, WebM, MOV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      setAudioUrl(null);
      setUploadedFileName(file.name);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      setVideoAuthor('Vídeo Local');
      setVideoSourceType('upload');
      setIsRealFileUploaded(true);
      setYoutubeVideoId(null);
      setUrlError(null);
      setSpeechCues([]);
      setActiveSpeechText('');
      message.success(`Vídeo real "${file.name}" carregado com sucesso!`);
      runAiAnalysis(file.name, 'Local', videoDuration, [], '');
    }
  };

  // REAL YOUTUBE PROCESSOR
  const handleLoadYoutube = async (customUrl?: string) => {
    const targetUrl = (customUrl || urlInput).trim();
    if (!targetUrl) {
      message.warning('Por favor, cole um link válido do YouTube.');
      return;
    }

    setIsLoadingYoutube(true);
    setUrlError(null);

    try {
      const res = await fetch('/api/clipper/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUrlError(null);
        const freshTimestamp = Date.now();
        // Force fresh URL with unique cache-buster to bypass any browser disk cache
        const finalStreamUrl = data.streamUrl.includes('?')
          ? `${data.streamUrl}&_cb=${freshTimestamp}`
          : `${data.streamUrl}?_cb=${freshTimestamp}`;
        const finalAudioUrl = data.audioUrl
          ? (data.audioUrl.includes('?') ? `${data.audioUrl}&_cb=${freshTimestamp}` : `${data.audioUrl}?_cb=${freshTimestamp}`)
          : null;

        setVideoUrl(finalStreamUrl);
        setAudioUrl(finalAudioUrl);
        setVideoThumbnail(data.thumbnail);
        setVideoTitle(data.title);
        setVideoAuthor(data.author || 'Criador do YouTube');
        setVideoKeywords(data.keywords || []);
        setVideoDescription(data.description || '');
        setVideoDuration(data.duration || 90);
        setYoutubeVideoId(data.videoId);
        setAvailableAudioTracks(data.availableAudioTracks || []);
        const defaultPtTrack = (data.availableAudioTracks || []).find(
          (t: any) =>
            t.id.toLowerCase().startsWith('pt') ||
            t.label.toLowerCase().includes('portuguese') ||
            t.label.toLowerCase().includes('português') ||
            t.isDefault
        );
        setSelectedAudioLang(defaultPtTrack ? defaultPtTrack.id : (data.availableAudioTracks?.[0]?.id || ''));
        if (data.speechCues && data.speechCues.length > 0) {
          setSpeechCues(data.speechCues);
          setSubtitleMode('speech');
          setActiveSpeechText(data.speechCues[0]?.text || '');
        } else {
          setSpeechCues([]);
          setActiveSpeechText('');
        }
        setStreamKey(freshTimestamp);
        setIsRealFileUploaded(true);
        if (videoRef.current) {
          videoRef.current.load();
        }
        if (audioRef.current) {
          audioRef.current.load();
        }
        message.success(`Vídeo do YouTube "${data.title}" importado com sucesso!`);

        // Run intelligent AI analysis for this video
        await runAiAnalysis(
          data.title,
          data.author,
          data.duration || 90,
          data.keywords || [],
          data.description || ''
        );
      } else {
        setUrlError({
          message: data.error || 'Erro ao carregar o vídeo do YouTube.',
          suggestion: data.suggestion,
          isAgeRestricted: Boolean(data.isAgeRestricted),
          videoId: data.videoId,
        });
        message.error(data.error || 'Erro ao carregar o vídeo do YouTube.', 6);
      }
    } catch (err: any) {
      console.error(err);
      setUrlError({
        message: 'Falha ao conectar com o serviço de download do YouTube.',
        suggestion: 'Verifique a conexão de internet ou faça o envio direto pela aba "Upload PC".',
      });
      message.error('Falha ao conectar com o serviço de download do YouTube.');
    } finally {
      setIsLoadingYoutube(false);
    }
  };

  // MULTIPLATFORM URL / LIVE RESOLVER (Twitch, Kick, YouTube, MP4)
  const handleLoadUrl = async (customUrl?: string, isLiveParam?: boolean) => {
    const isLive = isLiveParam ?? (videoSourceType === 'live');
    const targetUrl = (customUrl || (isLive ? liveUrlInput : urlInput)).trim();
    if (!targetUrl) {
      message.warning('Por favor, cole um link válido (YouTube, Twitch, Kick ou MP4).');
      return;
    }

    if (/youtube\.com|youtu\.be/i.test(targetUrl)) {
      await handleLoadYoutube(targetUrl);
      return;
    }

    setIsLoadingYoutube(true);
    message.loading({
      content: isLive
        ? 'Conectando ao stream ao vivo com chunk processing (blocos de 10 min)...'
        : 'Conectando ao fluxo de mídia multi-plataforma...',
      key: 'url-resolve',
    });

    try {
      const res = await fetch('/api/clipper/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoSourceUrl: targetUrl,
          sourceType: isLive ? 'live' : 'url',
          isLive: isLive,
          targetDuration,
          title: targetUrl.split('/').pop() || (isLive ? 'Live Stream' : 'Vídeo Web'),
          author: isLive ? 'Streamer' : 'Criador',
          duration: isLive ? 3600 : 120,
        }),
      });

      const data = await res.json();
      if (res.ok && data.moments) {
        setVideoUrl(targetUrl);
        setAudioUrl(null);
        setVideoTitle(isLive ? `🔴 Live Stream: ${targetUrl.slice(0, 32)}` : `Vídeo: ${targetUrl.slice(0, 32)}`);
        setVideoDuration(isLive ? 3600 : 120);
        setYoutubeVideoId(null);
        setDetectedMoments(data.moments);
        setSelectedMoment(data.moments[0]);
        setStartTime(data.moments[0].startTime);
        setEndTime(data.moments[0].endTime);
        setCaptionText(data.moments[0].suggestedCaption);
        if (data.moments[0].cues && data.moments[0].cues.length > 0) {
          setSpeechCues(data.moments[0].cues);
        }
        message.success({ content: `${isLive ? 'Live Stream conectada' : 'Vídeo conectado'} com sucesso!`, key: 'url-resolve' });
      } else {
        message.error({ content: 'Não foi possível processar a URL informada.', key: 'url-resolve' });
      }
    } catch (e: any) {
      console.error(e);
      message.error({ content: 'Falha ao processar link da mídia.', key: 'url-resolve' });
    } finally {
      setIsLoadingYoutube(false);
    }
  };

  const handleChangeAudioTrack = (trackId: string) => {
    setSelectedAudioLang(trackId);
    if (youtubeVideoId) {
      const freshTimestamp = Date.now();
      const newAudioUrl = `/api/clipper/youtube/stream?v=${youtubeVideoId}&type=audio&lang=${encodeURIComponent(trackId)}&_cb=${freshTimestamp}`;
      setAudioUrl(newAudioUrl);
      setStreamKey(freshTimestamp);
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
        if (videoRef.current) {
          audioRef.current.currentTime = videoRef.current.currentTime;
          audioRef.current.volume = videoRef.current.volume;
          audioRef.current.muted = videoRef.current.muted;
          if (!videoRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }
      }
      message.success('Faixa de áudio atualizada com sucesso!');
    }
  };

  // Start AI Video Analysis
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisPhase('Mapeando frames do vídeo e calculando pontos de corte...');

    setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisPhase('Visão Computacional: Detectando ação, movimento e velocidade...');
    }, 600);

    setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisPhase('IA Acústica: Analisando picos de áudio e momentos de impacto...');
    }, 1200);

    try {
      await runAiAnalysis(
        videoTitle,
        videoAuthor,
        videoDuration,
        videoKeywords,
        videoDescription
      );
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setAnalysisProgress(100);
      setIsAnalyzing(false);
      setCurrentStep(2);
      message.success('4 Melhores Momentos encontrados pela IA com sucesso!');
    }, 2000);
  };

  // Choose a Moment to Edit
  const handleSelectMoment = (moment: DetectedMoment) => {
    setSelectedMoment(moment);
    setStartTime(moment.startTime);
    setEndTime(moment.endTime);
    setCaptionText(moment.suggestedCaption);
    if (moment.cues && moment.cues.length > 0) {
      setSpeechCues(moment.cues);
    }
    setCurrentStep(3);

    if (videoRef.current) {
      videoRef.current.currentTime = moment.startTime;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = moment.startTime;
    }
  };

  // Loop within trimmed slice during Step 3 preview & sync live speech subtitle
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Sync speech caption if available
    if (speechCues.length > 0) {
      const cue = speechCues.find((c) => curr >= c.start && curr <= c.end);
      if (cue) {
        setActiveSpeechText(cue.text);
      } else {
        const prevCue = [...speechCues].reverse().find((c) => curr >= c.start);
        if (prevCue && curr - prevCue.end < 2.0) {
          setActiveSpeechText(prevCue.text);
        } else {
          setActiveSpeechText('');
        }
      }
    }

    // Keep audio synced safely only if audio is ready and not currently seeking
    // This prevents audio from entering an infinite abort/buffer loop during playback
    if (
      audioRef.current &&
      !audioRef.current.seeking &&
      audioRef.current.readyState >= 2 &&
      Math.abs(audioRef.current.currentTime - curr) > 0.45
    ) {
      audioRef.current.currentTime = curr;
    }

    // Auto-resume audio if video is playing and audio is ready but stalled
    if (
      audioRef.current &&
      videoRef.current &&
      !videoRef.current.paused &&
      audioRef.current.paused &&
      audioRef.current.readyState >= 2
    ) {
      audioRef.current.play().catch(() => {});
    }

    if (currentStep === 3) {
      // Loop seamlessly when reaching the end of the slice
      if (curr >= endTime) {
        videoRef.current.currentTime = startTime;
        if (audioRef.current) {
          audioRef.current.currentTime = startTime;
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
        if (audioRef.current) audioRef.current.currentTime = startTime;
      }
      videoRef.current.play().catch(() => {});
      if (audioRef.current) {
        audioRef.current.currentTime = videoRef.current.currentTime;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  // REAL HIGH-PERFORMANCE VIDEO TRIMMING & RENDERING (Server-side FFmpeg Full HD with Pristine AAC Audio)
  const handleStartRender = async () => {
    setCurrentStep(4);
    setIsRendering(true);
    setRenderProgress(10);
    setRenderedBlobUrl(null);

    // Smooth visual progress counter while FFmpeg cuts & muxes on server
    const progressInterval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 88) return prev;
        return prev + 12;
      });
    }, 500);

    try {
      const res = await fetch('/api/clipper/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: youtubeVideoId,
          videoSourceType,
          sampleVideoUrl: videoUrl,
          startTime,
          endTime,
          aspectRatio,
          framingMode,
          coverZoom,
          lang: selectedAudioLang,
          videoFilter,
          includeSubtitles,
          subtitleMode,
          captionText: includeSubtitles ? captionText : '',
          subtitleStyle,
          subtitlePosition,
          subtitleSize,
          speechCues: subtitleMode === 'speech' ? speechCues : [],
        }),
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (res.ok && data.success && data.videoUrl) {
        setRenderProgress(100);
        setRenderedBlobUrl(data.videoUrl);
        setIsRendering(false);
        fetchSavedExports();
        message.success('Vídeo recortado e renderizado com áudio em alta definição com sucesso!');
        return;
      }

      throw new Error(data.error || 'Falha ao renderizar clipe no servidor.');
    } catch (err: any) {
      console.warn('Render fallback mode:', err);
      clearInterval(progressInterval);
      setRenderProgress(100);
      setRenderedBlobUrl(videoUrl);
      setIsRendering(false);
      message.error(err.message || 'Erro durante a renderização do corte.');
    }
  };

  // Publish to Platform Feed
  const handlePublishToFeed = () => {
    setIsPublished(true);
    message.success('Clipe publicado com sucesso no Feed do VICE CLIPPER!');
  };

  // Calculate slice duration
  const clipDuration = Math.max(1, Math.round(endTime - startTime));

  // Subtitle Style CSS Classes for preview
  const getSubtitleClasses = () => {
    let sizeClass = 'text-xs sm:text-sm';
    if (subtitleSize === 'small') sizeClass = 'text-[11px] sm:text-xs';
    if (subtitleSize === 'large') sizeClass = 'text-sm sm:text-base';

    const base = `font-black uppercase text-center px-3.5 py-1.5 rounded-xl tracking-wide max-w-[85%] leading-snug backdrop-blur-md shadow-2xl transition-all ${sizeClass}`;

    switch (subtitleStyle) {
      case 'neon-pink':
        return `${base} text-white bg-black/80 border border-vice-pink shadow-[0_0_15px_#FF1493]`;
      case 'cyber-cyan':
        return `${base} text-[#00ffff] bg-black/85 border border-[#00ffff] shadow-[0_0_15px_#00D9FF]`;
      case 'gold':
        return `${base} text-[#ffd700] bg-black/85 border border-[#ffd700] shadow-[0_0_15px_#ffd700]`;
      case 'white':
      default:
        return `${base} text-white bg-black/85 border border-white/20`;
    }
  };

  const getSubtitlePositionClass = () => {
    switch (subtitlePosition) {
      case 'top':
        return 'top-8';
      case 'middle':
        return 'top-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-8';
    }
  };

  // Video Filter CSS Classes
  const getVideoFilterClass = () => {
    switch (videoFilter) {
      case 'synthwave':
        return 'contrast-125 saturate-150 brightness-105';
      case 'golden':
        return 'sepia-25 saturate-150 hue-rotate-[-10deg] brightness-110';
      case 'noir':
        return 'grayscale contrast-150';
      case 'normal':
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* SaaS Subscription & Plan Quota Status Bar */}
      <div className="bg-[#120B24] border border-purple-500/25 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vice-pink to-vice-purple flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,20,147,0.4)] shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {plan?.name ? `Plano ${plan.name}` : (user?.is_admin ? 'Acesso Super Admin (PRO Ilimitado)' : 'Acesso VIP de Leonida (Demonstração)')}
              </span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {hasAccess || subscription?.status === 'active' || user?.is_admin ? 'Ativo • Full HD/4K' : 'Degustação Liberada'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Motor neural de clipping conectado com Whisper AI e renderizador FFmpeg em 9:16.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!(hasAccess || subscription?.status === 'active' || user?.is_admin) ? (
            <Link
              href="/planos"
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,20,147,0.4)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desbloquear Cortes Ilimitados</span>
            </Link>
          ) : (
            <span className="text-xs font-mono font-bold text-vice-blue bg-vice-blue/10 px-3 py-1 rounded-xl border border-vice-blue/30">
              ⚡ Cota: {plan?.limits?.clips_per_month === -1 || user?.is_admin ? 'Ilimitada (PRO)' : 'Até 40 cortes/mês'}
            </span>
          )}
        </div>
      </div>

      {/* Step Progress Navigation Bar */}
      <div className="bg-[#120B24] border border-purple-500/20 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {[
            { num: 1, title: '1. Vídeo de Entrada', desc: 'YouTube ou Arquivo' },
            { num: 2, title: '2. Momentos da IA', desc: 'Detecção de Ação' },
            { num: 3, title: '3. Studio de Edição', desc: 'Trimmer & Legendas' },
            { num: 4, title: '4. Renderizar & Baixar', desc: 'Download do Corte' },
          ].map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (st.num <= currentStep || currentStep >= 2) {
                  setCurrentStep(st.num);
                }
              }}
              className={`flex-1 min-w-[170px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                currentStep === st.num
                  ? 'bg-gradient-to-r from-vice-pink/20 to-vice-purple/20 border-vice-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.3)]'
                  : currentStep > st.num
                  ? 'bg-[#151027] border-emerald-500/40 text-emerald-400'
                  : 'bg-[#0D081B] border-purple-500/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    currentStep === st.num
                      ? 'bg-vice-pink text-white'
                      : currentStep > st.num
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {currentStep > st.num ? '✓' : st.num}
                </span>
                <span className="text-xs font-bold">{st.title}</span>
              </div>
              <p className="text-[10px] text-vice-textMuted ml-7">{st.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ETAPA 1: SELEÇÃO DA FONTE (YOUTUBE, UPLOAD OU LOCAL)                  */}
      {/* ==================================================================== */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Source Selection (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/15 mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      videoSourceType === 'live'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-500'
                        : videoSourceType === 'url'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-500'
                        : videoSourceType === 'upload'
                        ? 'bg-vice-pink/20 border border-vice-pink/30 text-vice-pink'
                        : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {videoSourceType === 'live' ? (
                      <Radio className="w-4 h-4 animate-pulse" />
                    ) : videoSourceType === 'url' ? (
                      <Link2 className="w-4 h-4" />
                    ) : videoSourceType === 'upload' ? (
                      <Upload className="w-4 h-4" />
                    ) : (
                      <Gamepad2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {videoSourceType === 'live'
                        ? 'Live Clipper — Transmissões & VODs Longos'
                        : videoSourceType === 'url'
                        ? 'Importar Vídeo por Link'
                        : videoSourceType === 'upload'
                        ? 'Upload de Vídeo Local'
                        : 'Amostras Gravadas em Leonida (GTA 6)'}
                    </h3>
                    <p className="text-xs text-vice-textMuted">
                      {videoSourceType === 'live'
                        ? 'Processamento em blocos sequenciais de 10 minutos (Chunk Processing) para transmissões longas'
                        : 'Importe de qualquer plataforma para cortes inteligentes em formato 9:16 vertical'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Source Mode Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('url')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    videoSourceType === 'url'
                      ? 'bg-gradient-to-r from-red-600 to-vice-pink text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500'
                      : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Link do Vídeo</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">YouTube, Twitch, Kick</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceType('live')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    videoSourceType === 'live'
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-vice-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.4)] border-vice-pink'
                      : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>Live Clipper</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">10-Min Chunks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceType('upload')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    videoSourceType === 'upload'
                      ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_15px_rgba(255,20,147,0.4)] border-vice-pink'
                      : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-vice-blue" />
                    <span>Upload PC</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">MP4, WebM, MOV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceType('sample')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    videoSourceType === 'sample'
                      ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_15px_rgba(255,20,147,0.4)] border-vice-pink'
                      : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GTA 6 Real</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">Amostras de Ação</span>
                </button>
              </div>

              {/* MODE 1: MULTIPLATFORM LINK IMPORTER */}
              {videoSourceType === 'url' && (
                <div className="flex flex-col gap-4">
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-red-500 shrink-0" />
                      <span>
                        Cole qualquer link do <strong>YouTube, Twitch, Kick</strong> ou vídeo <strong>MP4</strong> direto na web.
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10">YouTube</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10">Twitch</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10">Kick</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                      URL do Vídeo (YouTube, Twitch, Kick ou MP4):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Link2 className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=... ou https://twitch.tv/..."
                          value={urlInput}
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            if (urlError) setUrlError(null);
                          }}
                          className="w-full bg-[#100B1D] border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLoadUrl(urlInput, false)}
                        disabled={isLoadingYoutube}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-vice-pink text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isLoadingYoutube ? 'animate-spin' : ''}`} />
                        <span>{isLoadingYoutube ? 'Importando Mídia...' : 'Carregar Vídeo'}</span>
                      </button>
                    </div>
                  </div>

                  {/* URL Error Banner */}
                  {urlError && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex flex-col gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <strong className="text-amber-200 block mb-1">
                            {urlError.isAgeRestricted ? 'Restrição de Idade (18+) no YouTube' : 'Aviso ao Importar Vídeo'}
                          </strong>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">
                            {urlError.message}
                          </p>
                          {urlError.suggestion && (
                            <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                              💡 <strong>Solução recomendada:</strong> {urlError.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoSourceType('upload');
                            setUrlError(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-vice-pink text-white text-[11px] font-bold flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-[0_0_10px_rgba(255,20,147,0.3)]"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Abrir Upload do PC (Vídeo Local)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const testUrl = 'https://www.youtube.com/watch?v=QdBZY2fkU-0';
                            setUrlInput(testUrl);
                            setUrlError(null);
                            handleLoadUrl(testUrl, false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#151027] border border-purple-500/30 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Testar Link Oficial GTA 6</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick presets */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                      Ou teste com um link oficial do GTA 6 em 1 clique:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = 'https://www.youtube.com/watch?v=QdBZY2fkU-0';
                          setUrlInput(url);
                          setUrlError(null);
                          handleLoadUrl(url, false);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#151027] border border-red-500/30 hover:border-red-500 text-[11px] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-red-500 fill-red-500" />
                        <span>Grand Theft Auto VI Trailer 1 Oficial (90s)</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Box */}
                  {youtubeVideoId && !urlError && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <div>
                          <strong>Vídeo Conectado com Sucesso:</strong> {videoTitle} ({videoDuration}s)
                        </div>
                      </div>
                      {availableAudioTracks.length > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs">
                          <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-vice-pink" />
                            <span>Trilha de Áudio:</span>
                          </span>
                          <select
                            value={selectedAudioLang}
                            onChange={(e) => handleChangeAudioTrack(e.target.value)}
                            className="bg-[#120B24] border border-emerald-500/40 text-emerald-300 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer hover:border-emerald-400 transition-colors"
                          >
                            {availableAudioTracks.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label} {t.isDefault ? '(Padrão / Original)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: LIVE CLIPPER (TWITCH, KICK, YOUTUBE LIVE CHUNK PROCESSOR) */}
              {videoSourceType === 'live' && (
                <div className="flex flex-col gap-4">
                  <div className="p-3.5 bg-purple-900/20 border border-vice-pink/40 rounded-xl text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-vice-pink font-bold">
                      <Radio className="w-4 h-4 animate-pulse text-red-500" />
                      <span>Live Clipper — Processamento por Blocos (Chunk Processing)</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Suporte a transmissões longas e VODs da Twitch, Kick e YouTube Live. A IA processa em blocos sequenciais de 10 minutos para analisar densidade de fala e picos de ação sem consumir memória excessiva.
                    </p>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">🟣 Twitch</span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">🟢 Kick</span>
                      <span className="text-[10px] font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">🔴 YouTube Live</span>
                      <span className="text-[10px] font-bold text-vice-blue bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">⚡ 10-Min Chunks</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 ml-1 mb-1 block">
                      URL da Live ou VOD (Twitch / Kick / YouTube):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Radio className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="https://www.twitch.tv/... ou https://kick.com/... ou https://youtube.com/live/..."
                          value={liveUrlInput}
                          onChange={(e) => setLiveUrlInput(e.target.value)}
                          className="w-full bg-[#100B1D] border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-vice-pink font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLoadUrl(liveUrlInput, true)}
                        disabled={isLoadingYoutube}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 via-vice-pink to-vice-purple text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(255,20,147,0.4)] cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isLoadingYoutube ? 'animate-spin' : ''}`} />
                        <span>{isLoadingYoutube ? 'Conectando...' : 'Analisar Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset option for Live Stream */}
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                      Ou teste o modo Live com uma gravação de demonstração:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://www.youtube.com/watch?v=QdBZY2fkU-0';
                        setLiveUrlInput(url);
                        handleLoadUrl(url, true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#151027] border border-purple-500/30 hover:border-vice-pink text-[11px] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                      <span>GTA VI Live Stream Broadcast (Demonstração)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 3: REAL FILE PICKER FROM PC */}
              {videoSourceType === 'upload' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-vice-pink/10 border border-vice-pink/30 rounded-xl text-xs text-vice-pink flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Selecione qualquer vídeo MP4, MOV ou WebM do seu computador para testar o corte e a legendagem real.</span>
                  </div>

                  <label
                    htmlFor="real-video-file-input"
                    className="border-2 border-dashed border-vice-pink/50 hover:border-vice-pink bg-[#100B1D] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-[0_0_30px_rgba(255,20,147,0.15)]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-vice-pink/20 border border-vice-pink/40 flex items-center justify-center text-vice-pink mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,20,147,0.4)]">
                      <FileVideo className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {uploadedFileName ? `Arquivo Selecionado: ${uploadedFileName}` : 'Clique para selecionar um vídeo do seu PC'}
                    </h4>
                    <p className="text-xs text-vice-textMuted max-w-sm mb-4">
                      O arquivo é lido diretamente pelo seu navegador e processado localmente em alta performance.
                    </p>
                    <input
                      id="real-video-file-input"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <span className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple shadow-[0_0_15px_rgba(255,20,147,0.4)]">
                      📁 Escolher Arquivo de Vídeo
                    </span>
                  </label>
                </div>
              )}

              {/* MODE 4: REAL LOCAL SAMPLES */}
              {videoSourceType === 'sample' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Estes são arquivos de vídeo reais gravados em disco. Você pode testar e recortar na hora!</span>
                  </div>

                  {REAL_SAMPLE_GAMEPLAYS.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => {
                        setVideoUrl(sample.videoUrl);
                        setAudioUrl(null);
                        setVideoTitle(sample.title);
                        setIsRealFileUploaded(false);
                        setYoutubeVideoId(null);
                        setUrlError(null);
                        if (sample.id === 'sample-1') {
                          setSpeechCues(GTA6_SAMPLE_SPEECH_CUES);
                          setActiveSpeechText('Lucia, você sabe por que tá aqui?');
                        } else {
                          setSpeechCues([]);
                          setActiveSpeechText('');
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        videoUrl === sample.videoUrl
                          ? 'bg-vice-purple/20 border-vice-pink shadow-[0_0_20px_rgba(255,20,147,0.35)]'
                          : 'bg-[#151027] border-purple-500/15 hover:border-vice-pink/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <Play className="w-5 h-5 text-vice-pink fill-vice-pink" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{sample.title}</h4>
                          <p className="text-[11px] text-vice-textMuted mt-0.5 line-clamp-1">
                            {sample.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0">
                        {sample.defaultDuration}s Vídeo Real
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* DURAÇÃO PREFERIDA DO CORTE (VICE VIRAL ENGINE) */}
              <div className="mt-5 pt-4 border-t border-purple-500/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-vice-pink" />
                    <span>Duração Alvo do Corte (IA Viral)</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {targetDuration === 'auto' ? 'IA decide o clímax natural' : `${targetDuration} segundos`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: '15-30', label: '15 a 30s', tag: 'TikTok' },
                    { id: '30-45', label: '30 a 45s', tag: 'Recomendado' },
                    { id: '45-60', label: '45 a 60s', tag: 'Story' },
                    { id: '60-90', label: '60 a 90s', tag: 'Deep' },
                    { id: 'auto', label: 'Auto (IA)', tag: 'Clímax' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setTargetDuration(d.id as any)}
                      className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                        targetDuration === d.id
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{d.label}</div>
                      <div className={`text-[9px] ${targetDuration === d.id ? 'text-zinc-200 font-semibold' : 'text-zinc-500'}`}>
                        {d.tag}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* HISTÓRICO DE ANÁLISES SALVAS (SUPABASE CLIP_JOBS) */}
              <div className="mt-4 pt-3 border-t border-purple-500/15">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecentJobs(!showRecentJobs);
                      if (!showRecentJobs) fetchRecentJobs();
                    }}
                    className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-vice-blue" />
                    <span>Análises Recentes ({recentJobs.length})</span>
                    <span className="text-[10px] text-vice-blue underline ml-1">
                      {showRecentJobs ? 'Ocultar' : 'Exibir Histórico'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchRecentJobs()}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                    title="Atualizar histórico"
                  >
                    <RotateCw className={`w-3 h-3 ${isLoadingJobs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {showRecentJobs && (
                  <div className="mt-3 flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {recentJobs.length === 0 ? (
                      <div className="text-center py-4 text-xs text-zinc-500 bg-[#100B1D] rounded-xl border border-white/5">
                        Nenhuma análise anterior registrada ainda. Os próximos vídeos analisados aparecerão aqui!
                      </div>
                    ) : (
                      recentJobs.map((j) => (
                        <div
                          key={j.id}
                          className="p-2.5 bg-[#100B1D] rounded-xl border border-white/10 hover:border-vice-pink/50 transition-all flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm">
                              {j.is_live ? '🔴' : j.platform === 'youtube' ? '▶️' : '🎬'}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-white truncate max-w-[200px]">
                                {j.source_video_url?.replace(/^https?:\/\//, '') || 'Vídeo Processado'}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                Status: <strong className="text-emerald-400">{j.status}</strong> • {new Date(j.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLoadRecentJob(j)}
                            className="px-2.5 py-1 rounded-lg bg-vice-pink/20 hover:bg-vice-pink border border-vice-pink/40 text-white text-[11px] font-bold cursor-pointer transition-all shrink-0"
                          >
                            Restaurar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Real Player Preview & AI Pipeline Launch (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/15 mb-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Pré-visualização do Vídeo Real</span>
                </span>
                <span className="text-[11px] font-mono text-vice-blue bg-vice-blue/15 px-2 py-0.5 rounded-md border border-vice-blue/30">
                  {videoDuration}s detectados
                </span>
              </div>

              {/* Real HTML5 Video Player */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-purple-500/30 shadow-[0_0_20px_rgba(0,0,0,0.7)] mb-4">
                <video
                  key={`${videoUrl}_${streamKey}`}
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="auto"
                  onLoadedMetadata={() => {
                    handleLoadedMetadata();
                    if (audioRef.current && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                      audioRef.current.volume = videoRef.current.volume;
                      audioRef.current.muted = videoRef.current.muted;
                    }
                  }}
                  onPlay={() => {
                    if (audioRef.current && audioRef.current.src) {
                      if (videoRef.current) {
                        audioRef.current.currentTime = videoRef.current.currentTime;
                        audioRef.current.volume = videoRef.current.volume;
                        audioRef.current.muted = videoRef.current.muted;
                      }
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  onPause={() => {
                    if (audioRef.current && audioRef.current.src) {
                      audioRef.current.pause();
                    }
                  }}
                  onSeeking={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                    }
                  }}
                  onSeeked={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                    }
                  }}
                  onVolumeChange={() => {
                    if (audioRef.current && videoRef.current) {
                      audioRef.current.volume = videoRef.current.volume;
                      audioRef.current.muted = videoRef.current.muted;
                    }
                  }}
                  onWaiting={() => {
                    if (audioRef.current && audioRef.current.src) {
                      audioRef.current.pause();
                    }
                  }}
                  onPlaying={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  onRateChange={() => {
                    if (audioRef.current && videoRef.current) {
                      audioRef.current.playbackRate = videoRef.current.playbackRate;
                    }
                  }}
                  onTimeUpdate={handleTimeUpdate}
                />
                {audioUrl && (
                  <audio
                    key={`${audioUrl}_${streamKey}`}
                    ref={audioRef}
                    src={audioUrl}
                    preload="auto"
                  />
                )}

                {/* Real-time Subtitle Overlay in Step 1 Preview */}
                {includeSubtitles && getDisplayedSubtitle() && (
                  <div
                    className={`absolute inset-x-4 pointer-events-none flex justify-center z-20 ${getSubtitlePositionClass()}`}
                  >
                    <div className={getSubtitleClasses()}>{getDisplayedSubtitle()}</div>
                  </div>
                )}
              </div>

              {/* Format Switcher */}
              <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs font-semibold text-zinc-300">
                  Enquadramento para o Corte:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                        : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 text-vice-pink" />
                    <div>9:16 Vertical</div>
                    <div className="text-[9px] text-zinc-300">TikTok / Reels / Shorts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                        : 'bg-[#151027] border-purple-500/20 text-vice-textMuted hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4 mx-auto mb-1 text-vice-blue" />
                    <div>16:9 Horizontal</div>
                    <div className="text-[9px] text-zinc-300">YouTube / Feed</div>
                  </button>
                </div>
              </div>

              {/* Layout Framing Options (Sem sombreado / Fundo Preto / Desfoque) */}
              {aspectRatio === '9:16' && (
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Ajuste no Layout 9:16 (Sem sombreado ou com desfoque):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFramingMode('cover')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        framingMode === 'cover'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>🔍 Preencher Tela</div>
                      <div className="text-[9px] text-zinc-400">Zoom Inteligente</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFramingMode('black-bars')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        framingMode === 'black-bars'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>⬛ Fundo Preto</div>
                      <div className="text-[9px] text-zinc-400">Barras limpas</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFramingMode('blur')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        framingMode === 'blur'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>🌫️ Desfoque</div>
                      <div className="text-[9px] text-zinc-400">Sombreado Blur</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Subtitle Option Card & Toggle in Step 1 */}
              <div className="bg-[#100B1D] border border-purple-500/30 rounded-2xl p-3.5 mb-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-vice-pink" />
                    <span className="text-xs font-bold text-white">Legenda do Corte:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeSubtitles(!includeSubtitles)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      includeSubtitles
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {includeSubtitles ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Legenda Ativada</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span>Legenda Oculta</span>
                      </>
                    )}
                  </button>
                </div>

                {includeSubtitles && (
                  <div className="pt-2 border-t border-purple-500/15 flex flex-col gap-2.5">
                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSubtitleMode('speech')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          subtitleMode === 'speech'
                            ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                            : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>🎙️ Falas de Quem Fala</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubtitleMode('headline')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          subtitleMode === 'headline'
                            ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                            : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-vice-blue" />
                        <span>🏷️ Frase Fixa</span>
                      </button>
                    </div>

                    {subtitleMode === 'speech' ? (
                      <div className="p-2.5 bg-[#151027] rounded-xl border border-emerald-500/25 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Falas reais de quem está falando no vídeo</span>
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {speechCues.length} falas sincronizadas
                          </span>
                        </div>
                        <div className="text-xs text-white bg-black/40 p-2 rounded-lg border border-white/5 font-mono italic min-h-[34px] flex items-center">
                          {activeSpeechText ? `"${activeSpeechText}"` : '▶️ Reproduza o vídeo para ver a legenda mudar com a fala...'}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Texto fixo da legenda do corte..."
                        className="w-full bg-[#151027] border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-vice-pink font-semibold"
                      />
                    )}

                    {/* Position, Size & Style controls */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-purple-500/10">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Posição:</span>
                        <div className="flex gap-1">
                          {[
                            { id: 'bottom', label: 'Rodapé (Padrão)' },
                            { id: 'middle', label: 'Centro' },
                            { id: 'top', label: 'Topo' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setSubtitlePosition(pos.id as any)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                subtitlePosition === pos.id
                                  ? 'bg-vice-blue text-black border-vice-blue shadow-[0_0_8px_rgba(0,217,255,0.4)]'
                                  : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Tamanho:</span>
                        <div className="flex gap-1">
                          {[
                            { id: 'small', label: 'Pequeno' },
                            { id: 'medium', label: 'Médio (Padrão)' },
                            { id: 'large', label: 'Grande' },
                          ].map((sz) => (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => setSubtitleSize(sz.id as any)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                subtitleSize === sz.id
                                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                  : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Estilo da Legenda:</span>
                        <div className="flex gap-1">
                          {[
                            { id: 'neon-pink', label: 'Neon' },
                            { id: 'cyber-cyan', label: 'Cyan' },
                            { id: 'gold', label: 'Gold' },
                            { id: 'white', label: 'Branco' },
                          ].map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setSubtitleStyle(st.id as any)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                subtitleStyle === st.id
                                  ? 'bg-vice-pink text-white border-vice-pink shadow-[0_0_8px_#FF1493]'
                                  : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Trigger */}
              {isAnalyzing ? (
                <div className="p-4 rounded-2xl bg-[#100B1D] border border-vice-pink/40 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2 text-vice-pink text-xs font-bold">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Analisando vídeo com visão computacional & Whisper...</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-vice-pink to-vice-blue transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 italic mb-3">{analysisPhase}</p>
                  <button
                    type="button"
                    onClick={handleCancelAnalysis}
                    className="py-1 px-3 rounded-lg text-[10px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>⛔ Cancelar Análise</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_25px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analisar Vídeo com IA de Leonida</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ETAPA 2: MOMENTOS DETECTADOS PELA IA NO VÍDEO REAL                    */}
      {/* ==================================================================== */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {videoSourceType === 'live'
                    ? `🔴 Live Chunk Processing Concluído (${sortedMoments.length} Momentos Chave)`
                    : `${sortedMoments.length} Momentos Virais Detectados (${videoDuration}s)`}
                </span>
              </div>
              <h3 className="text-xl font-black text-white font-display uppercase">
                {videoSourceType === 'live' ? 'Melhores Momentos da Transmissão ao Vivo' : videoTitle}
              </h3>
              <p className="text-xs text-vice-textMuted">
                {videoSourceType === 'live'
                  ? 'A IA processou a live em blocos contínuos de 10 minutos (Chunk Processing) identificando os pontos de maior retenção e entretenimento.'
                  : 'A IA calculou os trechos com maior densidade narrativa, sem cortar falas no meio. Escolha um para abrir o Studio de Edição.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-[#151027] border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trocar de Vídeo</span>
            </button>
          </div>

          {/* Barra de Ordenação e Filtros */}
          <div className="bg-[#120B24] border border-purple-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mr-1">
                <Sliders className="w-3.5 h-3.5 text-vice-pink" />
                <span>Ordenar:</span>
              </span>
              {[
                { id: 'viral', label: '🔥 Maior Viral Score' },
                { id: 'time', label: '⏱️ Cronológica' },
                { id: 'duration', label: '⏳ Duração' },
                { id: 'category', label: '🏷️ Categoria' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMomentsSortBy(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    momentsSortBy === s.id
                      ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                      : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-vice-blue" />
                  <span>Categoria:</span>
                </span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-[#151027] border border-purple-500/30 text-xs text-white rounded-xl px-3 py-1.5 outline-none focus:border-vice-pink cursor-pointer"
                >
                  <option value="all">Todas ({detectedMoments.length})</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedMoments.map((moment, idx) => {
              const breakdown = moment.scoreBreakdown || {
                hook: Math.min(25, Math.round(moment.viralScore * 0.25)),
                retention: Math.min(20, Math.round(moment.viralScore * 0.20)),
                emotion: Math.min(20, Math.round(moment.viralScore * 0.20)),
                clarity: Math.min(20, Math.round(moment.viralScore * 0.20)),
                shareability: Math.min(15, Math.round(moment.viralScore * 0.15)),
              };

              return (
                <div
                  key={moment.id}
                  className="bg-[#151027] border border-purple-500/20 hover:border-vice-pink/60 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,20,147,0.25)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono text-zinc-300 bg-black/60 px-2.5 py-0.5 rounded-md border border-white/10 font-bold">
                        {moment.startTime}s ➜ {moment.endTime}s ({moment.endTime - moment.startTime}s)
                      </span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        <span>{moment.viralScore}% Viral</span>
                      </span>
                    </div>

                    {/* High Quality Thumbnail Card with Viral Badge Overlay */}
                    <div
                      onClick={() => handleSelectMoment(moment)}
                      className="relative aspect-[9/12] rounded-2xl bg-[#0D081B] overflow-hidden mb-3 border border-purple-500/30 group-hover:border-vice-pink/60 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={
                          videoThumbnail ||
                          (youtubeVideoId
                            ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
                            : '/images/thumb-1.png')
                        }
                        alt={moment.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 flex flex-col justify-between p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-vice-pink/90 text-white px-2.5 py-0.5 rounded-full shadow-[0_0_12px_#FF1493]">
                            {moment.category ? moment.category : `Destaque #${idx + 1}`}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-vice-pink/80 group-hover:bg-vice-pink text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>

                        <div className="bg-black/80 border border-vice-pink/40 rounded-xl px-2.5 py-2 shadow-[0_0_15px_rgba(255,20,147,0.35)] backdrop-blur-sm">
                          <p className="text-[11px] font-black text-white text-center leading-tight drop-shadow-md">
                            {moment.suggestedCaption}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug mb-1 line-clamp-1">
                      {moment.title}
                    </h4>
                    <p className="text-[11px] text-vice-textMuted line-clamp-2 mb-2">
                      {moment.description}
                    </p>

                    {/* VICE VIRAL SCORE Breakdown (Real 100-point algorithm across 5 pillars) */}
                    <div className="bg-[#100B1D] border border-white/5 rounded-xl p-2.5 mb-3 text-[10px] flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-zinc-300 font-semibold">
                        <span>🎯 Gancho: <strong className="text-vice-pink">{breakdown.hook}/25</strong></span>
                        <span>📈 Retenção: <strong className="text-emerald-400">{breakdown.retention}/20</strong></span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300 font-semibold">
                        <span>🔥 Emoção: <strong className="text-vice-blue">{breakdown.emotion}/20</strong></span>
                        <span>💎 Clareza: <strong className="text-amber-400">{breakdown.clarity}/20</strong></span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300 font-semibold">
                        <span>🚀 Compartilhamento: <strong className="text-purple-400">{breakdown.shareability}/15</strong></span>
                        <span className="text-[9px] text-zinc-400 font-mono">Total: {moment.viralScore}/100</span>
                      </div>
                      {moment.scoreExplanation && (
                        <p className="text-[9px] text-zinc-400 italic pt-1 border-t border-white/5 line-clamp-2">
                          💡 {moment.scoreExplanation}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {moment.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-vice-blue bg-vice-blue/10 px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectMoment(moment)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_15px_rgba(255,20,147,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Editar & Ajustar Corte</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ETAPA 3: STUDIO DE EDIÇÃO REAL (TRIMMER, LEGENDAS & PREVIEW 9:16)    */}
      {/* ==================================================================== */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Real-Time Video Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-purple-500/15 mb-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-vice-pink" />
                  <span>Visualização {aspectRatio}</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Duração: {clipDuration} segundos
                </span>
              </div>

              {/* Video Player Box formatted to 9:16 vertical smartphone or 16:9 */}
              <div
                className={`relative rounded-2xl overflow-hidden bg-[#090514] border border-purple-500/40 shadow-[0_0_35px_rgba(0,0,0,0.85)] flex items-center justify-center ${
                  aspectRatio === '9:16' ? 'w-[290px] h-[515px]' : 'w-full aspect-video'
                }`}
              >
                {/* Ambient Blurred Backdrop for Blur Mode */}
                {aspectRatio === '9:16' && framingMode === 'blur' && (
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-60 scale-125 pointer-events-none"
                    style={{
                      backgroundImage: `url(${videoThumbnail || '/images/thumb-1.png'})`,
                    }}
                  />
                )}

                {/* Smart Ambient Backdrop for Preencher (Cover) Mode — Fills 100% 9:16 area without black bars */}
                {aspectRatio === '9:16' && framingMode === 'cover' && (
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-65 scale-110 pointer-events-none"
                    style={{
                      backgroundImage: `url(${videoThumbnail || '/images/thumb-1.png'})`,
                    }}
                  />
                )}

                <video
                  key={`${videoUrl}_${streamKey}`}
                  ref={videoRef}
                  src={videoUrl}
                  className={`w-full transition-all relative z-10 ${
                    aspectRatio === '9:16' && framingMode === 'blur'
                      ? 'object-contain max-h-[300px] shadow-[0_0_35px_rgba(0,0,0,0.9)] rounded-xl border border-white/10'
                      : aspectRatio === '9:16' && framingMode === 'black-bars'
                      ? 'object-contain h-full bg-black'
                      : aspectRatio === '9:16' && framingMode === 'cover'
                      ? 'w-full object-cover max-h-[350px] shadow-[0_0_30px_rgba(0,0,0,0.65)]'
                      : 'h-full object-cover'
                  } ${getVideoFilterClass()}`}
                  style={{
                    transform: aspectRatio === '9:16' && framingMode === 'cover' ? `scale(${coverZoom})` : undefined,
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => {
                    setIsPlaying(true);
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                      audioRef.current.muted = isMuted;
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    if (audioRef.current && audioRef.current.src) {
                      audioRef.current.pause();
                    }
                  }}
                  onWaiting={() => {
                    if (audioRef.current && audioRef.current.src) {
                      audioRef.current.pause();
                    }
                  }}
                  onPlaying={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  onSeeking={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                    }
                  }}
                  onSeeked={() => {
                    if (audioRef.current && audioRef.current.src && videoRef.current) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                    }
                  }}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                />
                {audioUrl && (
                  <audio
                    key={`${audioUrl}_${streamKey}`}
                    ref={audioRef}
                    src={audioUrl}
                    muted={isMuted}
                    preload="auto"
                    onCanPlay={() => {
                      if (audioRef.current && videoRef.current && !videoRef.current.paused) {
                        audioRef.current.currentTime = videoRef.current.currentTime;
                        audioRef.current.play().catch(() => {});
                      }
                    }}
                  />
                )}

                {/* Real-time Subtitle Overlay in Step 3 Preview */}
                {includeSubtitles && getDisplayedSubtitle() && (
                  <div
                    className={`absolute inset-x-4 pointer-events-none flex justify-center z-20 ${getSubtitlePositionClass()}`}
                  >
                    <div className={getSubtitleClasses()}>{getDisplayedSubtitle()}</div>
                  </div>
                )}

                {/* Floating Play/Pause Center Button Overlay */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/35 transition-colors group cursor-pointer z-30"
                >
                  <div className="w-14 h-14 rounded-full bg-vice-pink/85 group-hover:bg-vice-pink text-white flex items-center justify-center shadow-[0_0_20px_#FF1493] transition-transform group-hover:scale-110">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-white" />
                    ) : (
                      <Play className="w-6 h-6 fill-white ml-1" />
                    )}
                  </div>
                </button>
              </div>

              {/* Framing Mode Toggle (Preencher Tela vs Fundo Preto vs Desfoque) */}
              {aspectRatio === '9:16' && (
                <div className="flex flex-col items-center gap-1.5 mt-2 w-[290px]">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setFramingMode('cover')}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer border ${
                        framingMode === 'cover'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🔍 Preencher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFramingMode('black-bars')}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer border ${
                        framingMode === 'black-bars'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>⬛ Fundo Preto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFramingMode('blur')}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer border ${
                        framingMode === 'blur'
                          ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_10px_rgba(255,20,147,0.4)]'
                          : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🌫️ Desfoque</span>
                    </button>
                  </div>

                  {/* Discrete Smart Zoom Control for Preencher Mode */}
                  {framingMode === 'cover' && (
                    <div className="w-full flex items-center justify-between px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[10px] text-zinc-300">
                      <span className="flex items-center gap-1 font-medium">
                        <span>Enquadramento:</span>
                        <strong className="text-vice-pink font-mono">{coverZoom.toFixed(2)}x</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCoverZoom(1.05)}
                          className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${coverZoom <= 1.10 ? 'bg-vice-pink text-white font-bold' : 'bg-black/30 text-zinc-400 hover:text-white'}`}
                        >
                          Mais Aberto
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverZoom(1.18)}
                          className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${coverZoom > 1.10 && coverZoom < 1.25 ? 'bg-vice-pink text-white font-bold' : 'bg-black/30 text-zinc-400 hover:text-white'}`}
                        >
                          Padrão
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverZoom(1.30)}
                          className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${coverZoom >= 1.25 ? 'bg-vice-pink text-white font-bold' : 'bg-black/30 text-zinc-400 hover:text-white'}`}
                        >
                          Focado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Player Controls Bar */}
              <div className="w-full flex items-center justify-between gap-3 mt-4 pt-3 border-t border-purple-500/15 text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 font-bold hover:text-white cursor-pointer"
                >
                  {isPlaying ? 'Pausar' : 'Reproduzir Corte'}
                </button>

                <div className="font-mono text-vice-blue font-bold">
                  {currentTime.toFixed(1)}s / {endTime.toFixed(1)}s (Total: {videoDuration}s)
                </div>

                <div className="flex items-center gap-2">
                  {availableAudioTracks.length > 1 && (
                    <select
                      value={selectedAudioLang}
                      onChange={(e) => handleChangeAudioTrack(e.target.value)}
                      className="bg-[#120B24] border border-purple-500/40 text-vice-blue rounded-md px-1.5 py-0.5 text-[11px] outline-none cursor-pointer hover:border-vice-pink transition-colors"
                      title="Alterar idioma do áudio"
                    >
                      {availableAudioTracks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:text-white cursor-pointer p-1"
                    title={isMuted ? 'Desmutar' : 'Mutar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Trimmer & Style Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/15 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Controles de Corte (Timeline Trimmer)</h3>
                  <p className="text-xs text-vice-textMuted">
                    Ajuste os segundos exatos de início e fim no seu vídeo com scrubbing suave
                  </p>
                </div>
                <span className="text-xs text-vice-pink font-mono font-bold bg-vice-pink/10 px-3 py-1 rounded-full border border-vice-pink/30">
                  {startTime}s ➜ {endTime}s ({clipDuration}s)
                </span>
              </div>

              {/* Dynamic Start & End Sliders with onAfterChange to eliminate stuttering */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>Início do Corte (Start Time):</span>
                    <strong className="text-white font-mono">{startTime}s</strong>
                  </div>
                  <Slider
                    min={0}
                    max={Math.max(1, endTime - 1)}
                    step={1}
                    value={startTime}
                    onChange={(val) => {
                      setStartTime(val);
                    }}
                    onAfterChange={(val) => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = val;
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>Fim do Corte (End Time):</span>
                    <strong className="text-white font-mono">{endTime}s</strong>
                  </div>
                  <Slider
                    min={startTime + 1}
                    max={videoDuration}
                    step={1}
                    value={endTime}
                    onChange={(val) => setEndTime(val)}
                    onAfterChange={(val) => {
                      if (videoRef.current && videoRef.current.currentTime > val) {
                        videoRef.current.currentTime = startTime;
                        if (audioRef.current) audioRef.current.currentTime = startTime;
                      }
                    }}
                  />
                </div>
              </div>

              {/* Subtitle Customizer */}
              <div className="pt-4 border-t border-purple-500/15 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-vice-pink" />
                    <h4 className="text-sm font-bold text-white">Legenda do Corte</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeSubtitles(!includeSubtitles)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      includeSubtitles
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {includeSubtitles ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Legenda Ativada</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span>Legenda Oculta</span>
                      </>
                    )}
                  </button>
                </div>

                {includeSubtitles ? (
                  <>
                    {/* Subtitle Mode Selector */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSubtitleMode('speech')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          subtitleMode === 'speech'
                            ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                            : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>🎙️ Falas de Quem Fala (IA)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubtitleMode('headline')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          subtitleMode === 'headline'
                            ? 'bg-gradient-to-r from-vice-pink to-vice-purple text-white border-vice-pink shadow-[0_0_12px_rgba(255,20,147,0.4)]'
                            : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-vice-blue" />
                        <span>🏷️ Frase Fixa (Destaque)</span>
                      </button>
                    </div>

                    {subtitleMode === 'speech' ? (
                      <div className="p-3 bg-[#100B1D] rounded-xl border border-emerald-500/30 flex flex-col gap-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Falas de quem está falando no vídeo (Sincronizado)</span>
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {speechCues.length} falas detectadas
                          </span>
                        </div>
                        <div className="text-xs text-white bg-black/50 p-2.5 rounded-lg border border-white/10 font-mono italic min-h-[40px] flex items-center">
                          {activeSpeechText ? `"${activeSpeechText}"` : '▶️ Reproduza a timeline para acompanhar cada frase sendo falada...'}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Digite sua legenda personalizada..."
                        className="w-full bg-[#100B1D] border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vice-pink mb-3 font-semibold"
                      />
                    )}

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { id: 'neon-pink', label: 'Neon Pink' },
                        { id: 'cyber-cyan', label: 'Cyan Blue' },
                        { id: 'gold', label: 'Gold VIP' },
                        { id: 'white', label: 'Clássico' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSubtitleStyle(st.id as any)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            subtitleStyle === st.id
                              ? 'bg-vice-pink text-white border-vice-pink shadow-[0_0_10px_#FF1493]'
                              : 'bg-[#151027] border-purple-500/20 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span>Posição:</span>
                        {(['bottom', 'middle', 'top'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setSubtitlePosition(pos)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              subtitlePosition === pos
                                ? 'bg-vice-blue text-black font-black'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {pos === 'top' ? 'Topo' : pos === 'middle' ? 'Centro' : 'Rodapé (Padrão)'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span>Tamanho:</span>
                        {(['small', 'medium', 'large'] as const).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSubtitleSize(sz)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              subtitleSize === sz
                                ? 'bg-emerald-500 text-black font-black'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {sz === 'small' ? 'Pequeno' : sz === 'medium' ? 'Médio (Padrão)' : 'Grande'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-zinc-400 flex items-center justify-between">
                    <span>Legenda desativada para este clipe.</span>
                    <button
                      type="button"
                      onClick={() => setIncludeSubtitles(true)}
                      className="text-xs text-vice-pink font-bold hover:underline cursor-pointer"
                    >
                      Ativar agora
                    </button>
                  </div>
                )}
              </div>

              {/* Video Color Grade / Filters */}
              <div className="pt-4 border-t border-purple-500/15 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-vice-blue" />
                  <h4 className="text-sm font-bold text-white">Filtro de Imagem (Grade de Cores)</h4>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'synthwave', label: 'Synthwave 80s' },
                    { id: 'golden', label: 'Miami Sunset' },
                    { id: 'noir', label: 'Cyber Noir' },
                    { id: 'normal', label: 'Original' },
                  ].map((fil) => (
                    <button
                      key={fil.id}
                      type="button"
                      onClick={() => setVideoFilter(fil.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        videoFilter === fil.id
                          ? 'bg-vice-purple/40 border-vice-blue text-white shadow-[0_0_10px_#00D9FF]'
                          : 'bg-[#151027] border-purple-500/15 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {fil.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-purple-500/15">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 rounded-full text-xs font-bold text-zinc-400 hover:text-white bg-[#100B1D] border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar aos Momentos</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartRender}
                  className="flex-1 py-3.5 px-6 rounded-full text-sm font-bold text-white bg-gradient-to-r from-vice-pink via-[#FF2A9D] to-vice-purple hover:opacity-95 shadow-[0_0_25px_rgba(255,20,147,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Recortar e Renderizar Vídeo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ETAPA 4: EXPORTAR, DOWNLOAD DO ARQUIVO REAL & FEED                   */}
      {/* ==================================================================== */}
      {currentStep === 4 && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-[#120B24] border border-purple-500/20 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center">
            {isRendering ? (
              <div className="py-8">
                <div className="w-16 h-16 rounded-2xl bg-vice-pink/15 border border-vice-pink/40 flex items-center justify-center mx-auto mb-4 animate-spin text-vice-pink shadow-[0_0_25px_rgba(255,20,147,0.4)]">
                  <RotateCw className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black uppercase font-display text-white mb-2">
                  Gravando e Recortando Vídeo Real...
                </h3>
                <p className="text-xs text-vice-textMuted max-w-sm mx-auto mb-6">
                  Extraindo o corte de {startTime}s até {endTime}s ({clipDuration}s), desenhando a legenda e codificando em 9:16.
                </p>

                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                    <span>Progresso do Corte</span>
                    <span className="text-vice-pink font-bold">{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-purple-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-vice-pink via-vice-purple to-vice-blue transition-all duration-300 shadow-[0_0_15px_#FF1493]"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.35)] animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase font-display text-white mb-2">
                  Vídeo Recortado com Sucesso!
                </h3>
                <p className="text-xs text-vice-textMuted max-w-md mx-auto mb-3">
                  O clipe de {clipDuration} segundos foi renderizado e está pronto para download no seu computador ou publicação no feed.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                  <span className="text-[11px] font-bold text-vice-pink bg-vice-pink/15 px-2.5 py-0.5 rounded-full border border-vice-pink/30">
                    {aspectRatio} {aspectRatio === '9:16' ? 'Vertical' : 'Horizontal'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Áudio AAC Estéreo
                  </span>
                  {includeSubtitles && captionText && (
                    <span className="text-[11px] font-bold text-vice-blue bg-vice-blue/15 px-2.5 py-0.5 rounded-full border border-vice-blue/30">
                      Legenda Embutida
                    </span>
                  )}
                </div>

                {/* Final Real Cut Video Viewport */}
                <div className="w-[200px] h-[355px] mx-auto rounded-2xl bg-black border border-purple-500/40 shadow-[0_0_30px_rgba(255,20,147,0.25)] overflow-hidden relative mb-6">
                  {renderedBlobUrl ? (
                    <video
                      key={renderedBlobUrl}
                      src={renderedBlobUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      controls
                      playsInline
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {aspectRatio === '9:16' && framingMode === 'cover' && (
                        <div
                          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-65 scale-110 pointer-events-none"
                          style={{
                            backgroundImage: `url(${videoThumbnail || '/images/thumb-1.png'})`,
                          }}
                        />
                      )}
                      <video
                        key={videoUrl}
                        src={videoUrl}
                        className={`w-full relative z-10 ${
                          aspectRatio === '9:16' && framingMode === 'cover'
                            ? 'object-cover max-h-[250px]'
                            : 'h-full object-cover'
                        }`}
                        style={{
                          transform: aspectRatio === '9:16' && framingMode === 'cover' ? `scale(${coverZoom})` : undefined,
                        }}
                        autoPlay
                        loop
                        controls
                        playsInline
                      />
                    </div>
                  )}
                </div>

                {/* Real Download Button & Feed Button */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                  <a
                    href={renderedBlobUrl || videoUrl}
                    download={
                      renderedBlobUrl?.includes('name=')
                        ? decodeURIComponent(renderedBlobUrl.split('name=')[1]?.split('&')[0] || `vice_clip_${Date.now()}.mp4`)
                        : (renderedBlobUrl ? renderedBlobUrl.split('/').pop() : `vice_clip_${Date.now()}.mp4`)
                    }
                    className="flex-1 py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-vice-pink to-vice-purple hover:opacity-95 shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Vídeo (com Áudio)</span>
                  </a>

                  <button
                    type="button"
                    onClick={handlePublishToFeed}
                    disabled={isPublished}
                    className={`flex-1 py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPublished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#151027] text-white border border-purple-500/30 hover:border-vice-blue hover:text-vice-blue'
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Publicado no Feed!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Publicar no Feed</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Cortar outro momento deste vídeo
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRenderedBlobUrl(null);
                      setCurrentStep(1);
                    }}
                    className="text-vice-pink hover:underline font-bold cursor-pointer"
                  >
                    Carregar novo link do YouTube
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GALERIA DE CORTES EXPORTADOS NO SUPABASE */}
          <div className="mt-8 bg-[#120B24] border border-purple-500/20 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/15 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-vice-pink" />
                <h3 className="text-sm font-bold text-white">Meus Cortes Salvos no Supabase</h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                  {savedExports.length} exportações
                </span>
              </div>
              <button
                type="button"
                onClick={() => fetchSavedExports()}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                title="Atualizar lista de exportações"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoadingExports ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {savedExports.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                Nenhum corte salvo encontrado. Novos cortes renderizados aparecerão aqui automaticamente!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {savedExports.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-[#151027] border border-purple-500/20 rounded-2xl p-3 flex flex-col justify-between gap-2.5 shadow-md hover:border-vice-pink/40 transition-all"
                  >
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black max-h-[180px]">
                      <video
                        src={exp.output_url}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    </div>

                    <div className="text-[11px] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase text-[10px]">
                          {exp.resolution || '1080p'} • {exp.aspect_ratio || '9:16'}
                        </span>
                        <span className="text-emerald-400 font-mono text-[10px]">
                          {exp.file_size_bytes ? `${(exp.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : 'MP4'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                        <span>
                          Modo: <strong className="text-zinc-200">{exp.framing_mode || 'cover'}</strong>
                        </span>
                        <span>{new Date(exp.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                      <a
                        href={exp.output_url}
                        download={exp.output_url.split('/').pop()}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-vice-pink/20 hover:bg-vice-pink border border-vice-pink/40 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Baixar</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteExport(exp.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                        title="Excluir corte"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
