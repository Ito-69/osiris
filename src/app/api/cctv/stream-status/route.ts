import { NextResponse } from 'next/server';
import { extractWindyId, probeWindySnapshot, windySnapshotUrl } from '../windy';

/** rtsp.me failure messages (quota, deleted broadcast, etc.) */
const RTSP_BLOCKED = /temporarily limited|Top up|broadcast has been deleted|broadcast has been removed|video_off/i;

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url');

  if (!url) {
    return NextResponse.json({ available: false, reason: 'missing_url' }, { status: 400 });
  }

  // Windy — snapshot JPG is the health check (embed can load even when stream is dead)
  const windyId = extractWindyId(url) || (/^\d{8,12}$/.test(url) ? url : null);
  if (windyId || /images-webcams\.windy\.com/i.test(url)) {
    const id = windyId || extractWindyId(url) || url.match(/\/(\d{8,12})\//)?.[1];
    if (!id) {
      return NextResponse.json({ available: false, provider: 'windy' });
    }
    const available = await probeWindySnapshot(id);
    return NextResponse.json(
      {
        available,
        blocked: !available,
        provider: 'windy',
        snapshot_url: windySnapshotUrl(id),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  }

  if (!/rtsp\.me\/embed/i.test(url)) {
    return NextResponse.json({ available: false, blocked: false, reason: 'unsupported_provider' });
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OSIRIS/1.0; +https://github.com/Ito-69/osiris)',
        Accept: 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ available: false, blocked: true, provider: 'rtsp.me' });
    }

    const html = await res.text();
    const blocked = RTSP_BLOCKED.test(html);

    return NextResponse.json({
      available: !blocked,
      blocked,
      provider: 'rtsp.me',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json({ available: null, blocked: null, provider: 'rtsp.me' }, { status: 502 });
  }
}
