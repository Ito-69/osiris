import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('/tmp/bg-cams.json', 'utf8'));

const CITY_COORDS = {
  Sofia: [42.698, 23.322],
  Plovdiv: [42.15, 24.749],
  Varna: [43.214, 27.915],
  Burgas: [42.504, 27.462],
  Ruse: [43.856, 25.973],
  'Stara Zagora': [42.426, 25.641],
  Pleven: [43.417, 24.617],
  Sliven: [42.681, 26.322],
  Vitosha: [42.57, 23.28],
  Bansko: [41.836, 23.488],
  Borovets: [42.27, 23.6],
  Dobrinishte: [41.823, 23.559],
  Petrich: [41.398, 23.207],
  'Golden Sands': [43.28, 28.04],
  'Sunny Beach': [42.695, 27.71],
  Nessebar: [42.66, 27.736],
  Sozopol: [42.417, 27.695],
  Kavarna: [43.436, 28.34],
  Balchik: [43.55, 28.34],
  Shumen: [43.271, 26.936],
  Dobrich: [43.572, 27.827],
  Gabrovo: [42.874, 25.319],
  'Veliko Tarnovo': [43.075, 25.617],
  Blagoevgrad: [42.026, 23.1],
  Sandanski: [41.567, 23.28],
  Velingrad: [42.027, 24.0],
  Pamporovo: [41.66, 24.68],
  Smolyan: [41.577, 24.701],
  Devin: [41.743, 24.4],
  Kazanlak: [42.619, 25.393],
  Troyan: [42.873, 24.719],
  Montana: [43.412, 23.225],
  Vratsa: [43.21, 23.562],
  Lovech: [43.137, 24.719],
  Pernik: [42.605, 23.037],
  Yambol: [42.484, 26.503],
  Haskovo: [41.934, 25.555],
  Kardzhali: [41.633, 25.377],
  Razgrad: [43.527, 26.524],
  Silistra: [44.117, 27.26],
  Targovishte: [43.251, 26.572],
  Svishtov: [43.617, 25.35],
  Sevlievo: [43.026, 25.104],
  Mountains: [42.65, 23.4],
  'Black Sea': [42.8, 27.9],
  Bulgaria: [42.733, 25.486],
};

function cityFrom(title, page) {
  const t = title.toUpperCase();
  const p = page.toUpperCase();
  for (const city of Object.keys(CITY_COORDS)) {
    if (city === 'Bulgaria' || city === 'Mountains' || city === 'Black Sea') continue;
    const key = city.toUpperCase().replace('-', ' ');
    if (t.includes(key) || p.includes(city.toUpperCase())) return city;
  }
  if (/СОФИ|SOFIA|SOFI/.test(t + p)) return 'Sofia';
  if (/ВАРН|VARNA/.test(t + p)) return 'Varna';
  if (/БУРГ|BURGAS/.test(t + p)) return 'Burgas';
  if (/ПЛОВ|PLOVDIV/.test(t + p)) return 'Plovdiv';
  if (/ВИТОШ|VITOSHA/.test(t + p)) return 'Vitosha';
  if (/ХИЖА|HIJA|HUT/.test(t + p)) return 'Mountains';
  if (/ПЛАЖ|BEACH|CHERNO|МОРЕ/.test(t)) return 'Black Sea';
  return 'Bulgaria';
}

function hash(s) {
  let h = 0;
  for (const c of s) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return h;
}

function coords(city, id) {
  const base = CITY_COORDS[city] || CITY_COORDS.Bulgaria;
  const h = Math.abs(hash(id));
  return [
    +(base[0] + ((h % 100) - 50) * 0.001).toFixed(4),
    +(base[1] + (((Math.floor(h / 100) % 100) - 50) * 0.001)).toFixed(4),
  ];
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const cams = [];
const seen = new Set();

for (const row of raw) {
  const city = cityFrom(row.title, row.page);
  const base = `http://free-webcambg.com/${row.page}`;
  const entries = [];

  if (row.rtsps?.length) {
    row.rtsps.forEach((rtsp, i) => {
      if (rtsp.includes('/Aaaaaaaa/')) return;
      const slug = rtsp.split('/embed/')[1].replace(/\//, '');
      entries.push({
        id: `bg-fwcbg-${slug.toLowerCase()}`,
        city,
        name: row.title + (row.rtsps.length > 1 ? ` (${i + 1})` : ''),
        stream_url: rtsp,
        stream_type: 'iframe',
        feed_url: row.cdn?.[0] || row.pics?.[0],
        external_url: base,
      });
    });
  } else if (row.cdn?.[0] || row.pics?.[0]) {
    const id = `bg-fwcbg-${(row.page.split('-webcam')[0] || row.page).replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 45)}`;
    entries.push({
      id,
      city,
      name: row.title,
      feed_url: row.cdn?.[0] || row.pics?.[0],
      external_url: base,
    });
  }

  for (const e of entries) {
    const key = e.stream_url || e.feed_url;
    if (seen.has(key)) continue;
    seen.add(key);
    cams.push(e);
  }
}

let out = `import type { CctvCamera } from './types';\n\n/** Auto-generated from free-webcambg.com — ${cams.length} cameras */\nexport const BULGARIA_FWCBG_CAMERAS: CctvCamera[] = [\n`;

for (const c of cams) {
  const [lat, lng] = coords(c.city, c.id);
  out += `  {\n    id: '${esc(c.id)}',\n    lat: ${lat},\n    lng: ${lng},\n    name: '${esc(c.name)}',\n    city: '${esc(c.city)}',\n    country: 'Bulgaria',\n`;
  if (c.stream_url) out += `    stream_url: '${esc(c.stream_url)}',\n    stream_type: 'iframe',\n`;
  if (c.feed_url) out += `    feed_url: '${esc(c.feed_url)}',\n`;
  out += `    external_url: '${esc(c.external_url)}',\n    source: 'Free-WebCamBG',\n  },\n`;
}

out += '];\n';

const outPath = new URL('../src/app/api/cctv/bulgaria-fwcbg.generated.ts', import.meta.url);
fs.writeFileSync(outPath, out);
console.log(`Wrote ${cams.length} cameras (${cams.filter((c) => c.stream_url).length} live) → ${outPath.pathname}`);
