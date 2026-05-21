# Fork: Ito-69/osiris

This repository is a **fork** of [simplifaisoul/osiris](https://github.com/simplifaisoul/osiris) — the original OSIRIS OSINT dashboard. Upstream `master` remains the global project; this fork adds local improvements focused on the **Balkans**, **northern Italy**, and **reliable live CCTV playback**.

## Upstream vs. this fork

| | [simplifaisoul/osiris](https://github.com/simplifaisoul/osiris) | [Ito-69/osiris](https://github.com/Ito-69/osiris) (this fork) |
|---|----------------------------------------------------------------|----------------------------------------------------------------|
| **Scope** | Global layers: flights, earthquakes, news, CCTV (UK, US, EU…) | Same + **~115 Balkans cameras** (BG, GR, RS, MK, TR, RO) and **17 Italy cameras** (Milan, Verona, Sardinia) |
| **CCTV regions** | `uk`, `us-*`, `canada`, `europe`, `asia` | + `bulgaria`, `greece`, `serbia`, `macedonia`, `turkey`, `romania`, `italy` |
| **Camera viewer** | Static JPG image, ~30 s refresh | **HLS video**, **iframe embeds** (YouTube, rtsp.me, IPCamLive), **Windy JPG snapshots** (5 s), BalticLiveCam HLS proxy |
| **Health filtering** | None | Offline/dead feeds hidden via audit script + generated blocklist |
| **Map default view** | Global | Centered on Bulgaria / Balkans (`[25.48, 42.70]`, zoom ~6.5) |
| **Goal** | Public live demo at [osirislive.app](https://osirislive.app) | Personal/local deploy with focus on neighbouring countries, border crossings, and Mediterranean coast |

Everything outside the CCTV modules, `CameraViewer`, Balkans OSINT routes, and map defaults is **unchanged** from upstream — a targeted fork, not a full rewrite.

## What this fork adds

### 1. Balkans & Italy CCTV sources

New API modules under `src/app/api/cctv/`:

| Module | Coverage | Sources |
|--------|----------|---------|
| **bulgaria.ts** | Sofia, Plovdiv, Varna, Burgas, resorts, Stara Planina, border crossings (GKPP) | free-webcambg.com (~350 catalogued, ~76 live rtsp.me after audit), meteoblue/Windy, weather-webcam.eu, webcamera24.com, BalticLiveCam, meter.ac |
| **greece.ts** | Attiki Odos (Athens), Thessaloniki, Kavala, Halkidiki/Sithonia, Xanthi, Thasos, Promachonas, Evros/Alexandroupoli | meteoblue/Windy, weather-webcam.eu, Attiki Odos HLS |
| **serbia.ts** | Belgrade, Niš, Gradina border | Neotel HLS, weather-webcam.eu |
| **macedonia.ts** | Skopje, Ohrid, border crossings | Neotel HLS |
| **turkey.ts** | Edirne/Kırklareli borders, Tekirdağ, Istanbul (Galata, Sultanahmet, Bosphorus) | meteoblue/Windy, weather-webcam.eu |
| **romania.ts** | Bucharest, Brașov, Constanța coast, Danube border crossings, Eforie Sud | meteoblue/Windy, weather-webcam.eu, IPCamLive |
| **italy.ts** | Milan (Duomo, CityLife, Porta Nuova), Verona, Sardinia (Cagliari, Olbia / Costa Smeralda) | meteoblue/Windy |

Load cameras via `GET /api/cctv?region=bulgaria` (or `greece`, `italy`, …) or `?region=all`.

**Approximate live counts** (after health audit, May 2026):

| Region | On map |
|--------|--------|
| Bulgaria | ~64 |
| Greece | ~23 |
| Turkey | ~16 |
| Romania | ~11 |
| Italy | 17 |
| Serbia / N. Macedonia | varies |

### 2. Windy / meteoblue integration

- **`windy.ts`** — shared helper for Windy webcam IDs, snapshot URLs, and live probes
- Cameras sourced from [meteoblue.com](https://www.meteoblue.com) webcam pages (imgproxy → Windy ID)
- **Viewer behaviour:** Windy iframe embeds are blocked by CSP (`frame-ancestors`); the viewer shows a **JPG snapshot** refreshed every 5 s, with an **OPEN LIVE** link to windy.com

### 3. True live streaming & proxies

| `stream_type` | Use case | Examples |
|---------------|----------|----------|
| **hls** | `.m3u8` streams | Burgas Smart, Attiki Odos, Neotel, AMSS Serbia, BalticLiveCam |
| **iframe** | Embedded players | YouTube (GKPP Makaza), rtsp.me, IPCamLive |
| **jpg** | Snapshot feeds | UAB, home-solutions.bg, Windy snapshots |

Additional infrastructure:

- **`/api/cctv/blc-stream`** — proxies BalticLiveCam HLS (signed token → m3u8)
- **`/api/cctv/stream-status`** — probes rtsp.me, Windy, and other feeds for offline/quota/deleted states
- **`CameraViewer.tsx`** — HLS via `hls.js`, iframe fallback, JPG refresh, rtsp.me quota detection

### 4. Health audit & offline filtering

Broken feeds are kept in the repo but **hidden at runtime**:

- **`scripts/audit-balkans-cctv.mjs`** — probes all Balkans cameras (Windy JPG, rtsp.me embed, HTTP feeds)
- **`balkans-offline.generated.ts`** — generated blocklist (~348 offline IDs)
- **`balkans-filter.ts`** — `filterHealthyBalkansCameras()` applied in BG/GR/TR/RO fetchers

Re-run audit after source changes:

```bash
node scripts/audit-balkans-cctv.mjs --api http://localhost:3000
```

Utility scripts:

- **`scripts/generate-bg-fwcbg.mjs`** — scrape free-webcambg.com catalog
- **`scripts/scrape-weather-webcam.mjs`** — scrape weather-webcam.eu pages

### 5. Balkans OSINT data sources

| Layer | Source | What it adds |
|-------|--------|--------------|
| **Earthquakes** | [NIGGG-BAS](https://ndc.niggg.bas.bg/) | Regional network (30 days, lower magnitudes) — merged with USGS |
| **Disasters / alerts** | [GDACS](https://www.gdacs.org/) | EU civil protection — filtered to Balkans bbox |
| **News** | Dnevnik.bg, Actualno, Mediapool, BBC Europe RSS | BG/EU feeds + keyword geo-mapping (Sofia, Varna, Balkans…) |

Shared logic: `src/lib/bulgaria-sources.ts`.

#### SIGINT Feed panel & news-on-map fixes

Two separate bugs made Balkans news unusable until commit `0829c40`:

| Problem | Cause | Fix |
|---------|-------|-----|
| **SIGINT FEED panel not clickable** | Parent layout uses `pointer-events-none`; `IntelFeed` did not re-enable clicks, so taps passed through to the map underneath | Added `pointer-events-auto` to `IntelFeed`; article rows open the source link in a new tab |
| **RSS news invisible on map** | `/api/news` articles were never rendered as map markers — only YouTube **Live News Feeds** (pink dots) appeared | New layer **SIGINT News (RSS)** — gold markers on the map (`news_intel`, on by default) |
| **LIVE ALERTS → NEWS filter empty** | `LiveAlerts` read `data.articles` with `lat`/`lng`, but the API returns `data.news` with `coords[]` and `link` | Aligned field names; severity derived from `risk_score` |

**How to use:** toggle **SIGINT News (RSS)** in the layer panel for gold dots on the map; click a dot for popup + **OPEN ARTICLE**. Use the left **SIGINT FEED** panel to browse headlines — each row is clickable.

### 6. Map

- `OsirisMap.tsx` passes `stream_url` and `stream_type` to the viewer on CCTV marker click
- Default viewport centered on Bulgaria / Balkans instead of a global view

## Local Docker deploy

### Option A — pull pre-built image (recommended for friends)

No git clone, no build. Only Docker required.

```bash
curl -fsSL -o compose.yaml https://raw.githubusercontent.com/Ito-69/osiris/master/compose.yaml
docker compose pull
docker compose up -d
# → http://localhost:3000
```

Image: `ghcr.io/ito-69/osiris:latest` (published automatically via GitHub Actions on push to `master`).

### Option B — build from source (developers)

```bash
git clone git@github.com:Ito-69/osiris.git
cd osiris
docker compose -f compose.build.yaml up -d --build
# → http://localhost:3000
```

Legacy wrapper layout (clone into `repo/` subfolder + parent `compose.yaml`) still works for local dev.

## Syncing with upstream

```bash
git remote add upstream https://github.com/simplifaisoul/osiris.git   # once
git fetch upstream
git merge upstream/master   # or rebase for a linear history
```

After merge, check conflicts in `src/app/api/cctv/route.ts` and `src/components/CameraViewer.tsx` — those files contain most fork-specific changes.

## Branch & commits (this fork only)

Branch: **`custom/bg-gr-cctv`**

| Commit | Summary |
|--------|---------|
| `9391982` | Balkans CCTV coverage (BG, GR, RS, MK, TR, RO) |
| `9b87658` | HLS + iframe live playback, faster JPG refresh |
| `3e09474` | Document fork differences (FORK.md) |
| `2b874f9` | Varna live CCTV via rtsp.me embeds |
| `4bc39c2` | Full free-webcambg catalog + northern Greece |
| `6016e8e` | Center map on Bulgaria; Balkans OSINT sources |
| `0829c40` | Balkans news UX; expand Turkey CCTV; rtsp.me playback fix |
| `fb965c1` | Windy/meteoblue cameras; health filtering; Italy; viewer fixes |

---

*Upstream license: MIT. This fork keeps the same license; additions are not an official part of simplifaisoul/osiris.*
