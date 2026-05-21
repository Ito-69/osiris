#!/usr/bin/env node
/** Scrape weather-webcam.eu pages → probe feeds. */
import fs from 'fs';

const UA = 'Mozilla/5.0 (compatible; OSIRIS/1.0)';
const PAGES = process.argv.slice(2);
if (!PAGES.length) {
  console.error('Usage: node scripts/scrape-weather-webcam.mjs <url>...');
  process.exit(1);
}

async function scrape(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) return { url, error: res.status };
  const html = await res.text();
  const iframe = html.match(/iframe id="frame" src="([^"]+)"/)?.[1];
  const iframeAbs = iframe?.startsWith('http') ? iframe : iframe ? `https://www.weather-webcam.eu${iframe}` : null;
  let camHtml = '';
  if (iframeAbs) {
    const c = await fetch(iframeAbs, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (c.ok) camHtml = await c.text();
  }
  const feed = camHtml.match(/exampleImage" src="([^"]+)"/)?.[1]
    || html.match(/exampleImage" src="([^"]+)"/)?.[1];
  const title = html.match(/<title>([^<]+)/)?.[1]?.trim();
  return { url, title, iframe: iframeAbs, feed };
}

async function probeFeed(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Range: 'bytes=0-16383' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') || '';
    if (/html/i.test(type)) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength > 800;
  } catch {
    return false;
  }
}

async function probeWindy(id) {
  const url = `https://images-webcams.windy.com/37/${id}/current/full/${id}.jpg`;
  return probeFeed(url);
}

for (const url of PAGES) {
  const r = await scrape(url);
  const ok = await probeFeed(r.feed);
  console.log(JSON.stringify({ ...r, ok }));
}
