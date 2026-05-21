'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, RefreshCw, MapPin, Camera, Maximize2 } from 'lucide-react';

interface CameraViewerProps {
  camera: any | null;
  onClose: () => void;
  onLocate?: (lat: number, lng: number) => void;
}

type PlaybackMode = 'hls' | 'iframe' | 'jpg' | 'external';

export interface ResolvedPlayback {
  mode: PlaybackMode;
  url: string | null;
}

function isRtspMeEmbed(url: string): boolean {
  return /rtsp\.me\/embed/i.test(url);
}

function isWindyEmbed(url: string): boolean {
  return /windy\.com\/webcams\/\d+\/embed/i.test(url);
}

function isBlcStreamProxy(url: string): boolean {
  return /\/api\/cctv\/blc-stream/i.test(url);
}

function isBalticLiveCamHls(url: string): boolean {
  return /balticlivecam\.com\/blc\/.+\.m3u8/i.test(url);
}

async function resolveBlcStreamUrl(proxyUrl: string): Promise<string | null> {
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.stream_url === 'string' ? data.stream_url : null;
  } catch {
    return null;
  }
}

function resolvePlayback(camera: any): ResolvedPlayback {
  if (!camera) return { mode: 'external', url: null };

  const streamUrl = camera.stream_url as string | undefined;
  const streamType = camera.stream_type as string | undefined;

  if (streamUrl) {
    if (streamType === 'iframe' || /youtube\.com\/embed|youtube-nocookie\.com\/embed|rtsp\.me\/embed|ipcamlive\.com\/player|click2stream\.com|windy\.com\/webcams\/\d+\/embed/i.test(streamUrl)) {
      return { mode: 'iframe', url: streamUrl.replace(/&amp;/g, '&') };
    }
    if (streamType === 'hls' || /\.m3u8(\?|$)/i.test(streamUrl)) {
      return { mode: 'hls', url: streamUrl };
    }
  }

  if (camera.feed_url) {
    return { mode: 'jpg', url: camera.feed_url };
  }

  const external = camera.external_url as string | undefined;
  if (external) {
    const normalized = external.replace(/&amp;/g, '&');
    if (/youtube\.com\/embed|youtube-nocookie\.com\/embed|rtsp\.me\/embed|click2stream\.com|windy\.com\/webcams\/\d+\/embed/i.test(normalized)) {
      return { mode: 'iframe', url: normalized };
    }
    if (/ipcamlive\.com\/player/i.test(normalized)) {
      return { mode: 'iframe', url: normalized };
    }
    if (/\.m3u8(\?|$)/i.test(normalized)) {
      return { mode: 'hls', url: normalized };
    }
    return { mode: 'external', url: normalized };
  }

  return { mode: 'external', url: null };
}

async function probeStreamStatus(streamUrl: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/cctv/stream-status?url=${encodeURIComponent(streamUrl)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.blocked === true || data.available === false) return false;
    if (data.available === true) return true;
    return null;
  } catch {
    return null;
  }
}

async function probeRtspMe(streamUrl: string): Promise<boolean | null> {
  return probeStreamStatus(streamUrl);
}

async function probeWindy(streamUrl: string): Promise<boolean | null> {
  return probeStreamStatus(streamUrl);
}

export default function CameraViewer({ camera, onClose, onLocate }: CameraViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [playback, setPlayback] = useState<ResolvedPlayback>({ mode: 'external', url: null });
  const [rtspFallback, setRtspFallback] = useState(false);
  const [probingRtsp, setProbingRtsp] = useState(false);
  const [windyFallback, setWindyFallback] = useState(false);
  const [forceLive, setForceLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    setForceLive(false);
  }, [camera?.id]);

  // Pick iframe/HLS/JPG; probe rtsp.me and fall back to JPG snapshot when quota-blocked
  useEffect(() => {
    if (!camera) return;

    let cancelled = false;
    const primary = resolvePlayback(camera);
    const streamUrl = (camera.stream_url as string | undefined)?.replace(/&amp;/g, '&');
    const feedUrl = camera.feed_url as string | undefined;

    setError(false);

    const useJpgFallback = () => {
      if (!feedUrl) return false;
      setPlayback({ mode: 'jpg', url: feedUrl });
      setRtspFallback(true);
      return true;
    };

    if (forceLive && primary.mode === 'iframe' && streamUrl && isRtspMeEmbed(streamUrl)) {
      setProbingRtsp(false);
      setRtspFallback(false);
      setWindyFallback(false);
      setPlayback(primary);
      setLoading(false);
      return () => { cancelled = true; };
    }

    setRtspFallback(false);
    setWindyFallback(false);

    if (
      !forceLive
      && primary.mode === 'iframe'
      && streamUrl
      && isRtspMeEmbed(streamUrl)
      && feedUrl
    ) {
      setProbingRtsp(true);
      setLoading(true);

      probeRtspMe(streamUrl).then((available) => {
        if (cancelled) return;
        setProbingRtsp(false);
        if (available === true) {
          setPlayback(primary);
          setRtspFallback(false);
          setLoading(false);
        } else {
          useJpgFallback();
        }
      });

      return () => { cancelled = true; };
    }

    if (
      !forceLive
      && primary.mode === 'iframe'
      && streamUrl
      && isWindyEmbed(streamUrl)
      && feedUrl
    ) {
      setProbingRtsp(true);
      setLoading(true);

      probeWindy(streamUrl).then((available) => {
        if (cancelled) return;
        setProbingRtsp(false);
        // Windy sets frame-ancestors: self *.windy.com — embed breaks in Osiris iframe.
        // JPG snapshot works; live video opens on windy.com via SOURCE / TRY LIVE.
        if (available !== false) {
          setPlayback({ mode: 'jpg', url: feedUrl });
          setWindyFallback(true);
          setLoading(false);
        } else if (useJpgFallback()) {
          setWindyFallback(true);
          setLoading(false);
        } else {
          setPlayback({ mode: 'external', url: camera.external_url || streamUrl.replace(/\/embed\/?$/, '') });
          setError(true);
          setLoading(false);
        }
      });

      return () => { cancelled = true; };
    }

    setProbingRtsp(false);
    setPlayback(primary);
    if (primary.mode === 'iframe' || primary.mode === 'external') {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [camera, forceLive]);

  const externalLink = camera?.external_url || camera?.stream_url || camera?.feed_url;

  // ── JPG snapshot refresh (every 5s) ──
  useEffect(() => {
    if (!camera || playback.mode !== 'jpg' || !playback.url) return;

    setLoading(true);
    setError(false);

    const bust = (url: string) =>
      url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;

    setImageUrl(bust(playback.url));
    const iv = setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => clearInterval(iv);
  }, [camera, playback.mode, playback.url]);

  useEffect(() => {
    if (playback.mode !== 'jpg' || !playback.url) return;
    const bust = playback.url.includes('?')
      ? `${playback.url}&_t=${Date.now()}`
      : `${playback.url}?_t=${Date.now()}`;
    setImageUrl(bust);
  }, [refreshKey, playback.mode, playback.url]);

  // ── HLS live stream ──
  useEffect(() => {
    if (!camera || playback.mode !== 'hls' || !playback.url) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    const setup = async () => {
      const video = videoRef.current;
      if (!video) return;

      hlsRef.current?.destroy();
      hlsRef.current = null;

      let sourceUrl = playback.url!;
      if (isBlcStreamProxy(sourceUrl)) {
        const resolved = await resolveBlcStreamUrl(sourceUrl);
        if (cancelled) return;
        if (!resolved) {
          if (camera.feed_url) {
            setPlayback({ mode: 'jpg', url: camera.feed_url });
            setLoading(false);
            return;
          }
          setLoading(false);
          setError(true);
          return;
        }
        sourceUrl = resolved;
      }

      try {
        const { default: Hls } = await import('hls.js');

        if (cancelled) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: (xhr, url) => {
              if (isBalticLiveCamHls(url)) xhr.withCredentials = true;
            },
          });
          hlsRef.current = hls;
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!cancelled) {
              video.play().catch(() => {});
              setLoading(false);
            }
          });
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal && !cancelled) {
              if (camera.feed_url && isBlcStreamProxy(playback.url!)) {
                setPlayback({ mode: 'jpg', url: camera.feed_url });
                setLoading(false);
                setError(false);
                return;
              }
              setLoading(false);
              setError(true);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playback.url!;
          video.addEventListener('loadeddata', () => {
            if (!cancelled) setLoading(false);
          }, { once: true });
          video.play().catch(() => {});
        } else {
          setLoading(false);
          setError(true);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError(true);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [camera, playback.mode, playback.url]);

  // ── iframe reset (non-rtsp or forced live) ──
  useEffect(() => {
    if (!camera) return;
    if (playback.mode === 'iframe' && !probingRtsp) {
      setLoading(false);
      setError(false);
    } else if (playback.mode === 'external') {
      setLoading(false);
      setError(false);
    }
  }, [camera, playback.mode, probingRtsp]);

  if (!camera) return null;

  const isLiveVideo = playback.mode === 'hls' || (playback.mode === 'iframe' && !rtspFallback && !windyFallback);

  const tryLiveStream = () => {
    if (!camera?.stream_url) return;
    const streamUrl = (camera.stream_url as string).replace(/&amp;/g, '&');
    if (isWindyEmbed(streamUrl)) {
      const windyPage = (camera.external_url as string) || streamUrl.replace(/\/embed\/?$/, '');
      window.open(windyPage, '_blank', 'noopener,noreferrer');
      return;
    }
    setForceLive(true);
    setLoading(true);
    setError(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`fixed z-[500] ${
          fullscreen
            ? 'inset-2 md:inset-4'
            : 'bottom-[70px] left-2 right-2 md:bottom-6 md:right-6 md:left-auto md:w-[420px]'
        }`}
      >
        <div className="glass-panel osiris-glow overflow-hidden h-full flex flex-col" style={{ borderColor: 'rgba(57, 255, 20, 0.3)' }}>
          <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-osiris-pulse flex-shrink-0" />
              <Camera className="w-3.5 h-3.5 text-[#39FF14] flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-[10px] md:text-[11px] font-mono font-bold text-[#39FF14] tracking-wider truncate">{camera.name}</h3>
                <p className="text-[6px] md:text-[7px] font-mono text-[var(--text-muted)]">
                  {camera.city}, {camera.country} · {camera.source}
                  {rtspFallback && ' · snapshot (rtsp.me limit)'}
                  {windyFallback && ' · snapshot (Windy)'}
                  {playback.mode === 'jpg' && !rtspFallback && !windyFallback && ' · snapshot'}
                  {playback.mode === 'hls' && ' · HLS'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {playback.mode === 'jpg' && (
                <button onClick={() => setRefreshKey((k) => k + 1)} className="p-1.5 rounded hover:bg-[var(--hover-accent)] transition-colors" title="Refresh feed">
                  <RefreshCw className="w-3 h-3 text-[var(--text-muted)] hover:text-[#39FF14]" />
                </button>
              )}
              {camera.lat && camera.lng && (
                <button onClick={() => onLocate?.(camera.lat, camera.lng)} className="p-1.5 rounded hover:bg-[var(--hover-accent)] transition-colors" title="Fly to location">
                  <MapPin className="w-3 h-3 text-[var(--text-muted)] hover:text-[var(--gold-primary)]" />
                </button>
              )}
              <button onClick={() => setFullscreen(!fullscreen)} className="hidden md:block p-1.5 rounded hover:bg-[var(--hover-accent)] transition-colors" title="Toggle fullscreen">
                <Maximize2 className="w-3 h-3 text-[var(--text-muted)]" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded hover:bg-red-900/30 transition-colors">
                <X className="w-4 h-4 md:w-3 md:h-3 text-[var(--text-muted)] hover:text-red-400" />
              </button>
            </div>
          </div>

          <div className={`relative bg-black ${fullscreen ? 'flex-1' : 'aspect-video max-h-[35vh] md:max-h-none'}`}>
            {loading && !error && playback.mode !== 'external' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-[8px] font-mono text-[#39FF14] tracking-widest">
                    {probingRtsp ? 'CHECKING FEED...' : 'CONNECTING TO FEED...'}
                  </span>
                </div>
              </div>
            )}

            {playback.mode === 'external' && !error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center px-6">
                  <div className="w-8 h-8 rounded-full bg-[#39FF14]/15 flex items-center justify-center mx-auto mb-2"><ExternalLink className="w-4 h-4 text-[#39FF14]" /></div>
                  <span className="text-[9px] font-mono text-[#39FF14] tracking-widest block mb-1">EXTERNAL FEED</span>
                  <span className="text-[7px] font-mono text-[var(--text-muted)]">Opens in source viewer</span>
                  {playback.url && (
                    <a href={playback.url} target="_blank" rel="noopener noreferrer" className="block mx-auto mt-3 px-3 py-1 text-[8px] font-mono text-[#39FF14] border border-[#39FF14]/30 rounded hover:bg-[#39FF14]/10 transition-colors tracking-wider">
                      OPEN FEED
                    </a>
                  )}
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-2 mx-auto"><Camera className="w-4 h-4 text-red-400" /></div>
                  <span className="text-[9px] font-mono text-red-400 tracking-widest block mb-1">FEED UNAVAILABLE</span>
                  <span className="text-[7px] font-mono text-[var(--text-muted)]">Stream may be offline or blocked</span>
                  <button onClick={() => { setError(false); setRefreshKey((k) => k + 1); }} className="block mx-auto mt-3 px-3 py-1 text-[8px] font-mono text-[#39FF14] border border-[#39FF14]/30 rounded hover:bg-[#39FF14]/10 transition-colors tracking-wider">
                    RETRY
                  </button>
                </div>
              </div>
            ) : playback.mode === 'hls' ? (
              <video
                ref={videoRef}
                className={`w-full ${fullscreen ? 'h-full object-contain' : 'h-full object-cover'}`}
                autoPlay
                muted
                playsInline
                controls
              />
            ) : playback.mode === 'iframe' && playback.url ? (
              <iframe
                src={playback.url}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={camera.name}
                onError={() => {
                  if (camera.feed_url) {
                    setPlayback({ mode: 'jpg', url: camera.feed_url });
                    setWindyFallback(isWindyEmbed(playback.url || ''));
                    setError(false);
                  }
                }}
              />
            ) : playback.mode === 'jpg' && imageUrl ? (
              <img
                key={refreshKey}
                src={imageUrl}
                alt={camera.name}
                className={`w-full ${fullscreen ? 'h-full object-contain' : 'h-full object-cover'}`}
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setError(true); }}
              />
            ) : null}

            {!error && !loading && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-osiris-pulse" />
                <span className="text-[7px] font-mono text-white tracking-widest">
                  {isLiveVideo ? 'LIVE' : 'REFRESH'}
                </span>
              </div>
            )}
          </div>

          <div className="px-3 md:px-4 py-2 border-t border-[var(--border-secondary)] flex items-center justify-between">
            <div className="text-[7px] md:text-[8px] font-mono text-[var(--text-muted)]">
              {camera.lat?.toFixed(4)}, {camera.lng?.toFixed(4)}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {(rtspFallback || windyFallback) && camera.stream_url && (
                <button
                  type="button"
                  onClick={tryLiveStream}
                  className="flex items-center gap-1 text-[7px] font-mono text-[var(--gold-primary)] hover:underline tracking-wider"
                >
                  {windyFallback ? 'OPEN LIVE' : 'TRY LIVE'}
                </button>
              )}
              {externalLink && (
                <a href={externalLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[7px] font-mono text-[#39FF14] hover:underline tracking-wider">
                  <ExternalLink className="w-2.5 h-2.5" /> SOURCE
                </a>
              )}
              <a href={`https://www.google.com/maps/@${camera.lat},${camera.lng},17z`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[7px] font-mono text-[var(--cyan-primary)] hover:underline tracking-wider">
                <MapPin className="w-2.5 h-2.5" /> MAP
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
