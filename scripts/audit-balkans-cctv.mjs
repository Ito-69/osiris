#!/usr/bin/env node
/**
 * Health-check Balkans CCTV feeds (BG, GR, TR, RO).
 * Usage: node scripts/audit-balkans-cctv.mjs [--api http://localhost:3000]
 */
import fs from 'fs';

const API = process.argv.includes('--api')
  ? process.argv[process.argv.indexOf('--api') + 1]
  : 'http://localhost:3000';

const UA = 'Mozilla/5.0 (compatible; OSIRIS/1.0; CCTV-audit)';
const RTSP_BLOCKED = /temporarily limited|Top up|broadcast has been deleted|broadcast has been removed|video_off/i;
const CONCURRENCY = 12;
const TIMEOUT_MS = 10000;

async function fetchCameras(region) {
  const res = await fetch(`${API}/api/cctv?region=${region}`, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`API ${region}: ${res.status}`);
  const data = await res.json();
  return data.cameras || [];
}

async function timedFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: { 'User-Agent': UA, ...(opts.headers || {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: 'follow',
  });
}

async function probeJpg(url) {
  try {
    let res = await timedFetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-16383' },
    });
    if (res.status === 405 || res.status === 501) {
      res = await timedFetch(url, { method: 'GET' });
    }
    if (!res.ok) return false;
    const type = res.headers.get('content-type') || '';
    if (/html/i.test(type)) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 800;
  } catch {
    return false;
  }
}

async function probeRtspMe(url) {
  try {
    const res = await timedFetch(url, { headers: { Accept: 'text/html' } });
    if (!res.ok) return false;
    const html = await res.text();
    return !RTSP_BLOCKED.test(html);
  } catch {
    return false;
  }
}

async function probeWindyFeed(feedUrl, streamUrl) {
  const id = (feedUrl || streamUrl || '').match(/\/(\d{8,12})(?:\/current|\/embed)/)?.[1]
    || (streamUrl || '').match(/webcams\/(\d+)/)?.[1];
  if (!id) return false;
  return probeJpg(`https://images-webcams.windy.com/37/${id}/current/full/${id}.jpg`);
}

async function probeHls(url) {
  if (url.startsWith('/api/cctv/blc-stream')) {
    try {
      const res = await timedFetch(`${API}${url}`);
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.stream_url) return false;
      url = data.stream_url;
    } catch {
      return false;
    }
  }
  try {
    const res = await timedFetch(url, { headers: { Accept: '*/*' } });
    if (!res.ok) return false;
    const body = (await res.text()).trim();
    return body.length > 20 && !/^not found$/i.test(body) && (body.includes('#EXTM3U') || body.includes('.ts') || body.includes('.m3u8'));
  } catch {
    return false;
  }
}

async function probeIframe(url) {
  if (/youtube\.com|youtube-nocookie\.com/i.test(url)) {
    try {
      const res = await timedFetch(url.replace('/embed/', '/watch?v=').split('?')[0] + '?' + (url.split('?')[1] || ''));
      return res.ok;
    } catch {
      return true; // YouTube often blocks probes — keep if not clearly dead
    }
  }
  if (/click2stream\.com/i.test(url)) {
    try {
      const res = await timedFetch(url, { headers: { Accept: 'text/html' } });
      return res.ok && !(await res.text()).includes('offline');
    } catch {
      return false;
    }
  }
  if (/ipcamlive\.com/i.test(url)) {
    try {
      const res = await timedFetch(url, { headers: { Accept: 'text/html' } });
      return res.ok;
    } catch {
      return false;
    }
  }
  if (/windy\.com\/webcams/i.test(url)) {
    return probeWindyFeed(null, url);
  }
  if (/rtsp\.me/i.test(url)) return probeRtspMe(url);
  try {
    const res = await timedFetch(url, { headers: { Accept: 'text/html' } });
    return res.ok;
  } catch {
    return false;
  }
}

async function probeCamera(cam) {
  const reasons = [];
  let ok = false;

  const streamUrl = cam.stream_url?.replace(/&amp;/g, '&');
  const feedUrl = cam.feed_url;
  const streamType = cam.stream_type;

  if (streamUrl && (streamType === 'hls' || /\.m3u8/i.test(streamUrl) || streamUrl.includes('blc-stream'))) {
    ok = await probeHls(streamUrl);
    if (ok) return { id: cam.id, ok: true, via: 'hls' };
    if (feedUrl && (await probeJpg(feedUrl))) return { id: cam.id, ok: true, via: 'jpg-fallback' };
    return { id: cam.id, ok: false, via: 'hls-dead', name: cam.name, source: cam.source };
  }

  if (streamUrl && (streamType === 'iframe' || /embed|click2stream|ipcamlive|windy|rtsp|youtube/i.test(streamUrl))) {
    ok = await probeIframe(streamUrl);
    if (ok) return { id: cam.id, ok: true, via: 'iframe' };
    if (feedUrl && (await probeJpg(feedUrl))) return { id: cam.id, ok: true, via: 'jpg-fallback' };
    if (/windy/i.test(streamUrl) || /windy/i.test(cam.source || '')) {
      const windyOk = await probeWindyFeed(feedUrl, streamUrl);
      if (windyOk) return { id: cam.id, ok: true, via: 'windy-jpg' };
    }
    return { id: cam.id, ok: false, via: 'iframe-dead', name: cam.name, source: cam.source, streamUrl, feedUrl };
  }

  if (feedUrl) {
    if (/windy\.com/i.test(feedUrl)) {
      ok = await probeWindyFeed(feedUrl, streamUrl);
    } else {
      ok = await probeJpg(feedUrl);
    }
    if (ok) return { id: cam.id, ok: true, via: 'jpg' };
    return { id: cam.id, ok: false, via: 'jpg-dead', name: cam.name, source: cam.source, feedUrl };
  }

  if (cam.external_url) {
    return { id: cam.id, ok: false, via: 'external-only', name: cam.name, source: cam.source };
  }

  return { id: cam.id, ok: false, via: 'no-url', name: cam.name };
}

async function pool(items, fn, n) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
      if (idx % 25 === 0) process.stderr.write(`\r  ${idx + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  process.stderr.write('\n');
  return results;
}

async function main() {
  console.error(`Fetching cameras from ${API} ...`);
  const regions = ['bulgaria', 'greece', 'turkey', 'romania'];
  const all = [];
  for (const r of regions) {
    const cams = await fetchCameras(r);
    console.error(`  ${r}: ${cams.length}`);
    all.push(...cams);
  }
  console.error(`Total: ${all.length} — probing (concurrency ${CONCURRENCY})...`);

  const results = await pool(all, probeCamera, CONCURRENCY);
  const offline = results.filter((r) => !r.ok);
  const online = results.filter((r) => r.ok);

  const byVia = {};
  for (const r of online) byVia[r.via] = (byVia[r.via] || 0) + 1;

  const report = {
    audited_at: new Date().toISOString(),
    total: all.length,
    online: online.length,
    offline: offline.length,
    online_by_via: byVia,
    offline_ids: offline.map((r) => r.id),
    offline_details: offline,
  };

  fs.writeFileSync('/tmp/balkans-cctv-audit.json', JSON.stringify(report, null, 2));

  const ts = `/** Auto-generated by scripts/audit-balkans-cctv.mjs — ${report.audited_at} */
export const BALKANS_OFFLINE_CAMERA_IDS = new Set<string>([
${offline.map((r) => `  '${r.id}',`).join('\n')}
]);
`;

  fs.writeFileSync('src/app/api/cctv/balkans-offline.generated.ts', ts);

  console.log(JSON.stringify({
    total: report.total,
    online: report.online,
    offline: report.offline,
    online_by_via: report.online_by_via,
    sample_offline: offline.slice(0, 15).map((r) => ({ id: r.id, via: r.via, name: r.name })),
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
