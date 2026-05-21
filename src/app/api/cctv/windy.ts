import type { CctvCamera } from './types';

/** Public Windy snapshot URL — 404 means the webcam is offline/removed. */
export function windySnapshotUrl(id: string): string {
  return `https://images-webcams.windy.com/37/${id}/current/full/${id}.jpg`;
}

export function extractWindyId(url: string): string | null {
  const m = url.match(/windy\.com\/webcams\/(\d+)/i);
  return m?.[1] ?? null;
}

export function windy(id: string): Pick<CctvCamera, 'stream_url' | 'stream_type' | 'feed_url' | 'external_url' | 'source'> {
  return {
    stream_url: `https://www.windy.com/webcams/${id}/embed`,
    stream_type: 'iframe',
    feed_url: windySnapshotUrl(id),
    external_url: `https://www.windy.com/webcams/${id}`,
    source: 'Windy',
  };
}

/** Probe Windy JPG snapshot — reliable signal that the camera is live. */
export async function probeWindySnapshot(idOrUrl: string): Promise<boolean> {
  const id = /^\d+$/.test(idOrUrl) ? idOrUrl : extractWindyId(idOrUrl);
  if (!id) return false;

  try {
    const res = await fetch(windySnapshotUrl(id), {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OSIRIS/1.0)', Range: 'bytes=0-8191' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') || '';
    const len = Number(res.headers.get('content-length') || '8192');
    return /jpe?g|octet-stream|image\//i.test(type) && len > 5000;
  } catch {
    return false;
  }
}
