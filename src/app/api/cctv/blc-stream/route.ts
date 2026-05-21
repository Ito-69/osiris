import { NextResponse } from 'next/server';

const BLC_AJAX = 'https://balticlivecam.com/wp-admin/admin-ajax.php';
const M3U8_RE = /src:\s*'([^']+\.m3u8[^']*)'/;

/** Resolve BalticLiveCam auth_token → signed HLS URL (tokens expire ~hours). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    const res = await fetch(BLC_AJAX, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OSIRIS/1.0; +https://github.com/Ito-69/osiris)',
        Referer: 'https://balticlivecam.com/',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `action=auth_token&id=${id}&embed=0&main_referer=https://balticlivecam.com/`,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'blc_auth_failed' }, { status: 502 });
    }

    const html = await res.text();
    const match = html.match(M3U8_RE);
    if (!match?.[1]) {
      return NextResponse.json({ error: 'stream_not_found', available: false }, { status: 404 });
    }

    const streamUrl = match[1].replace(/\\'/g, "'");

    return NextResponse.json(
      { stream_url: streamUrl, available: true, provider: 'balticlivecam.com' },
      { headers: { 'Cache-Control': 'private, max-age=300' } },
    );
  } catch {
    return NextResponse.json({ error: 'blc_unreachable' }, { status: 502 });
  }
}
