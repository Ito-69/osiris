# Fork: Ito-69/osiris

Този репозиторий е **форк** на [simplifaisoul/osiris](https://github.com/simplifaisoul/osiris) — оригиналния OSIRIS OSINT dashboard. Upstream `master` остава глобалният проект; тук са добавени локални подобрения за **Балканите** и **истински live CCTV**.

## Upstream vs. този fork

| | [simplifaisoul/osiris](https://github.com/simplifaisoul/osiris) | [Ito-69/osiris](https://github.com/Ito-69/osiris) (този fork) |
|---|----------------------------------------------------------------|----------------------------------------------------------------|
| **Обхват** | Глобални слоеве: полети, земетресения, новини, CCTV (UK, US, EU…) | Същото + **~80 камери** в BG, GR, RS, MK, TR, RO |
| **CCTV региони** | `uk`, `us-*`, `canada`, `europe`, `asia` | + `bulgaria`, `greece`, `serbia`, `macedonia`, `turkey`, `romania` |
| **Преглед на камера** | Статично JPG изображение, обновяване на ~30 s | **HLS видео**, **iframe embeds** (YouTube, rtsp.me, ipcamlive) или JPG на 5 s |
| **Цел** | Публичен live demo на [osirislive.app](https://osirislive.app) | Личен/локален deploy с фокус върху съседни държави и гранични пунктове |

Всичко извън CCTV модулите и `CameraViewer` е **непроменено** спрямо upstream — без форк на целия проект, само допълнения.

## Какво добавя fork-ът

### 1. Балкански CCTV източници

Нови API модули под `src/app/api/cctv/`:

- **bulgaria.ts** — Sofia, Plovdiv, Varna, Burgas, курорти, GKPP (Kulata, Makaza, Kapitan Andreevo…) + **~350 камери** от free-webcambg.com (`bulgaria-fwcbg.generated.ts`, ~170 live rtsp.me)
- **greece.ts** — Attiki Odos (Атина) + **Солун, Кavala, Халкидики/Ситония, Ксанти, Тасос, Промахон**
- **serbia.ts** — Belgrade, Niš, граница Gradina
- **macedonia.ts** — Skopje, Ohrid, гранични пунктове (Neotel HLS)
- **turkey.ts** — Edirne/Kırklareli borders (Kapıkule, Hamzabeyli, Dereköy, İpsala, Pazarkule), Tekirdağ, **Istanbul** (Galata, Sultanahmet, Bosphorus, Yavuz Bridge)
- **romania.ts** — Constanța, Eforie Sud, гранични преходи

Зареждане: `GET /api/cctv?region=bulgaria` (или `greece`, `serbia`, …) или `?region=all`.

### 2. Истински live streaming

- **`stream_type: hls`** — `.m3u8` потоци (Burgas Smart, Attiki Odos, Neotel, AMSS Serbia)
- **`stream_type: iframe`** — вградени плейъри (YouTube GKPP Makaza, rtsp.me, ipcamlive)
- **`stream_type: jpg`** — snapshot feeds (UAB, home-solutions.bg) — по-бърз refresh (5 s), не е видео

Плейърът е в `src/components/CameraViewer.tsx` (зависимост: `hls.js`).

### 3. Карта

`OsirisMap.tsx` подава `stream_url` и `stream_type` към viewer-а при клик на CCTV маркер.

**Стартов изглед:** центрирана върху България/Балканите (`[25.48, 42.70]`, zoom ~6.5), вместо глобален изглед.

### 4. Балкански OSINT източници

| Слой | Източник | Какво добавя |
|------|----------|--------------|
| **Земетресения** | [NIGGG-BAS](https://ndc.niggg.bas.bg/) | Регионална мрежа (30 дни, по-ниски magnitude) — merge с USGS |
| **Бедствия / alerts** | [GDACS](https://www.gdacs.org/) | EU civil protection — филтрирани за Балканите bbox |
| **Новини** | [Dnevnik.bg](https://www.dnevnik.bg/rss/) + [Actualno](https://www.actualno.com/rss/actualno.xml) + [Mediapool](https://www.mediapool.bg/rss/) + BBC Europe | BG/EU RSS + keyword geo-mapping (София, Варна, Балкани…) |

Споделена логика: `src/lib/bulgaria-sources.ts`.

## Локален Docker deploy

Fork-ът се пуска локално от отделна папка (не е част от git repo-то):

```bash
git clone git@github.com:Ito-69/osiris.git repo
# compose.yaml в родителската папка — build context: ./repo
docker compose up -d --build
# → http://localhost:3000
```

Примерна структура: `osiris/compose.yaml` + `osiris/repo/` (clone на този fork).

## Синхронизация с upstream

```bash
git remote add upstream https://github.com/simplifaisoul/osiris.git   # веднъж
git fetch upstream
git merge upstream/master   # или rebase, ако предпочиташ линейна история
```

След merge провери конфликти в `src/app/api/cctv/route.ts` и `CameraViewer.tsx` — там са основните локални промени.

## Комити само в този fork

- `9391982` — Balkans CCTV coverage (BG, GR, RS, MK, TR, RO)
- `9b87658` — HLS + iframe live playback, по-бърз JPG refresh

---

*Upstream лиценз: MIT. Fork-ът запазва същия лиценз; допълненията не са официална част от simplifaisoul/osiris.*
