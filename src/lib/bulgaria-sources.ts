/**
 * Balkans-focused data sources for the Ito-69/osiris fork.
 * NIGGG-BAS (seismic), GDACS (EU civil protection), BG news feeds.
 */

export const BALKANS_BBOX = {
  minLat: 39.5,
  maxLat: 46.5,
  minLng: 19.5,
  maxLng: 30.5,
};

export const BULGARIA_BBOX = {
  minLat: 41.2,
  maxLat: 44.5,
  minLng: 22.0,
  maxLng: 29.0,
};

export const DEFAULT_MAP_CENTER: [number, number] = [25.484, 42.698]; // Sofia — Balkans startup view
export const DEFAULT_MAP_ZOOM = 6.5;

export function inBbox(
  lat: number,
  lng: number,
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number } = BALKANS_BBOX,
): boolean {
  return lat >= bbox.minLat && lat <= bbox.maxLat && lng >= bbox.minLng && lng <= bbox.maxLng;
}

export interface NigggEarthquake {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  magnitude: number;
  place: string;
  time: number;
  url: string;
  source: 'NIGGG-BAS';
}

export function parseNigggXml(xml: string): NigggEarthquake[] {
  const events: NigggEarthquake[] = [];
  const markerRegex = /<marker\b([^>]*)\/>/gi;
  let match: RegExpExecArray | null;

  while ((match = markerRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const get = (name: string) => {
      const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return m?.[1] ?? '';
    };

    const lat = parseFloat(get('lat'));
    const lng = parseFloat(get('lon'));
    const magnitude = parseFloat(get('mag'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(magnitude)) continue;

    const id = get('id') || `niggg-${lat}-${lng}-${get('time')}`;
    const label = get('label') || 'Balkans region';
    const timeStr = get('time');
    const time = timeStr ? Date.parse(timeStr.replace(' ', 'T') + 'Z') : Date.now();

    events.push({
      id: `niggg-${id}`,
      lat,
      lng,
      depth: parseFloat(get('depth')) || 0,
      magnitude,
      place: label,
      time,
      url: 'https://ndc.niggg.bas.bg/',
      source: 'NIGGG-BAS',
    });
  }

  return events;
}

export async function fetchNigggEarthquakes(): Promise<NigggEarthquake[]> {
  const res = await fetch('https://ndc.niggg.bas.bg/data.xml', {
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseNigggXml(xml);
}

export interface GdacsAlert {
  id: string;
  title: string;
  category: string;
  type: string;
  icon: string;
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  date: string;
  source: string;
  link: string;
  alertLevel: string;
}

const GDACS_TYPE_MAP: Record<string, { type: string; icon: string; severity: 'low' | 'medium' | 'high' }> = {
  EQ: { type: 'Earthquake Alert', icon: 'earthquake', severity: 'high' },
  FL: { type: 'Forest Fire', icon: 'fire', severity: 'high' },
  TC: { type: 'Tropical Cyclone', icon: 'cyclone', severity: 'high' },
  VO: { type: 'Volcano', icon: 'volcano', severity: 'high' },
  DR: { type: 'Drought', icon: 'drought', severity: 'medium' },
  WF: { type: 'Wildfire', icon: 'fire', severity: 'high' },
};

function gdacsSeverity(level: string): 'low' | 'medium' | 'high' {
  const l = level.toLowerCase();
  if (l === 'red' || l === 'orange') return 'high';
  if (l === 'yellow') return 'medium';
  return 'low';
}

const BALKANS_KEYWORDS = [
  'bulgaria', 'българ', 'greece', 'гърц', 'romania', 'румън', 'turkey', 'турц',
  'serbia', 'сърб', 'balkans', 'балкан', 'black sea', 'черно море', 'macedonia', 'македон',
];

function bboxOverlapsBalkans(bboxStr: string): boolean {
  const parts = bboxStr.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) return false;
  const [lonMin, lonMax, latMin, latMax] = parts;
  return latMax >= BALKANS_BBOX.minLat && latMin <= BALKANS_BBOX.maxLat
    && lonMax >= BALKANS_BBOX.minLng && lonMin <= BALKANS_BBOX.maxLng;
}

function mentionsBalkans(text: string): boolean {
  const lower = text.toLowerCase();
  return BALKANS_KEYWORDS.some(kw => lower.includes(kw));
}

export function parseGdacsRss(xml: string, bbox = BALKANS_BBOX): GdacsAlert[] {
  const alerts: GdacsAlert[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return (m?.[1] || '').trim();
    };

    const lat = parseFloat(getTag('geo:lat'));
    const lng = parseFloat(getTag('geo:long'));
    const title = getTag('title').replace(/<[^>]+>/g, '');
    const description = getTag('description').replace(/<[^>]+>/g, '');
    const gdacsBbox = getTag('gdacs:bbox');
    const inRegion = (Number.isFinite(lat) && Number.isFinite(lng) && inBbox(lat, lng, bbox))
      || bboxOverlapsBalkans(gdacsBbox)
      || mentionsBalkans(`${title} ${description}`);
    if (!inRegion) continue;

    const eventType = getTag('gdacs:eventtype') || 'UN';
    const alertLevel = getTag('gdacs:alertlevel') || 'Green';
    const mapped = GDACS_TYPE_MAP[eventType] || { type: 'Disaster Alert', icon: 'alert', severity: 'low' as const };
    const link = getTag('link');
    const pubDate = getTag('pubDate');
    const guid = getTag('guid') || link;
    const pointLat = Number.isFinite(lat) ? lat : (bbox.minLat + bbox.maxLat) / 2;
    const pointLng = Number.isFinite(lng) ? lng : (bbox.minLng + bbox.maxLng) / 2;

    alerts.push({
      id: `gdacs-${guid.replace(/[^a-zA-Z0-9]/g, '')}`,
      title,
      category: eventType.toLowerCase(),
      type: mapped.type,
      icon: mapped.icon,
      severity: gdacsSeverity(alertLevel) === 'low' ? mapped.severity : gdacsSeverity(alertLevel),
      lat: pointLat,
      lng: pointLng,
      date: pubDate,
      source: 'GDACS',
      link,
      alertLevel,
    });
  }

  return alerts;
}

export async function fetchGdacsBalkansAlerts(): Promise<GdacsAlert[]> {
  const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseGdacsRss(xml);
}

export function mergeEarthquakes<T extends { lat: number; lng: number; time?: number; magnitude?: number }>(
  primary: T[],
  regional: T[],
): T[] {
  const merged = [...primary];

  for (const eq of regional) {
    const duplicate = merged.some(existing => {
      const dist = Math.hypot(existing.lat - eq.lat, existing.lng - eq.lng);
      if (dist > 0.12) return false;
      const tA = existing.time || 0;
      const tB = eq.time || 0;
      if (tA && tB && Math.abs(tA - tB) < 3600000) return true;
      return dist < 0.05 && Math.abs((existing.magnitude || 0) - (eq.magnitude || 0)) < 0.3;
    });
    if (!duplicate) merged.push(eq);
  }

  return merged.sort((a, b) => (b.time || 0) - (a.time || 0));
}
