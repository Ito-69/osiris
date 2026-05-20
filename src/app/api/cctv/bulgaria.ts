import type { CctvCamera } from './types';
import { BULGARIA_FWCBG_CAMERAS } from './bulgaria-fwcbg.generated';

/**
 * Curated cameras from non-free-webcambg sources (UAB/GKPP, Smart Burgas HLS, YouTube, meteo).
 * Combined with auto-generated free-webcambg catalog (~350 cameras, ~170 live rtsp.me).
 */
const BULGARIA_MANUAL: CctvCamera[] = [
  // ── UAB / KAMEPA traffic (not on free-webcambg) ──
  {
    id: 'bg-sofia-tsarigradsko-uab',
    lat: 42.662,
    lng: 23.376,
    name: 'Tsarigradsko Shose (UAB)',
    city: 'Sofia',
    country: 'Bulgaria',
    feed_url: 'https://cdn.uab.org/images/cctv/images/cctv/cctv_103/cctv.jpg',
    source: 'UAB / KAMEPA',
  },
  {
    id: 'bg-sofia-banishora',
    lat: 42.704,
    lng: 23.327,
    name: 'Banishora / Opalchenska',
    city: 'Sofia',
    country: 'Bulgaria',
    feed_url: 'https://meteo.chavo.biz/Camera_streem/live_snap.jpg',
    source: 'meteo.chavo.biz',
  },
  {
    id: 'bg-sofia-iztok',
    lat: 42.679,
    lng: 23.364,
    name: 'Iztok / Arena',
    city: 'Sofia',
    country: 'Bulgaria',
    feed_url: 'http://85.118.88.81:8000/jpg/image.jpg?resolution=1280x960',
    source: 'Private cam',
  },
  {
    id: 'bg-sofia-lagera',
    lat: 42.603,
    lng: 23.297,
    name: 'Lagera / Vitosha',
    city: 'Sofia',
    country: 'Bulgaria',
    feed_url: 'https://www.meteobrite.com/rest/image?stationId=4',
    source: 'MeteoBrite',
  },

  // ── GKPP / border (UAB + weather-webcam + YouTube) ──
  {
    id: 'bg-gkpp-kulata-1',
    lat: 41.395,
    lng: 23.361,
    name: 'GKPP Kulata – Promachon (BG)',
    city: 'Kulata',
    country: 'Bulgaria',
    feed_url: 'https://cdn.uab.org/images/cctv/images/cctv/cctv_01/cctv.jpg',
    external_url: 'https://weather-webcam.eu/kameri-ot-gkpp-kulata-promahon-sledete-trafika-na-grackata-granica/',
    source: 'UAB / GKPP',
  },
  {
    id: 'bg-gkpp-kulata-2',
    lat: 41.394,
    lng: 23.363,
    name: 'GKPP Kulata – Promachon (approach)',
    city: 'Kulata',
    country: 'Bulgaria',
    feed_url: 'https://cdn.uab.org/images/cctv/images/cctv/cctv_02/cctv.jpg',
    external_url: 'https://weather-webcam.eu/kameri-ot-gkpp-kulata-promahon-sledete-trafika-na-grackata-granica/',
    source: 'UAB / GKPP',
  },
  {
    id: 'bg-gkpp-kulata-3',
    lat: 41.396,
    lng: 23.359,
    name: 'GKPP Kulata – queue',
    city: 'Kulata',
    country: 'Bulgaria',
    feed_url: 'https://cdn.uab.org/images/cctv/images/cctv/cctv_114/cctv.jpg',
    external_url: 'https://weather-webcam.eu/kameri-ot-gkpp-kulata-promahon-sledete-trafika-na-grackata-granica/',
    source: 'UAB / GKPP',
  },
  {
    id: 'bg-gkpp-zlatograd',
    lat: 41.379,
    lng: 25.056,
    name: 'GKPP Zlatograd – Thermes (BG–GR)',
    city: 'Zlatograd',
    country: 'Bulgaria',
    feed_url: 'https://www.weather-webcam.eu/cams/gkpp-zlatograd.jpg',
    external_url: 'https://weather-webcam.eu/ueb-kamera-ot-gkpp-zlatograd-termes-zlatograd-ksanti/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-ruse-1',
    lat: 43.845,
    lng: 25.974,
    name: 'GKPP Ruse – Giurgiu (Danube Bridge)',
    city: 'Ruse',
    country: 'Bulgaria',
    feed_url: 'https://weather-webcam.eu/cams/gkpp-ruse-gurgevo-webcam-kamera-na-jivo.jpg',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-ruse-2',
    lat: 43.844,
    lng: 25.976,
    name: 'GKPP Ruse – Giurgiu (lane 2)',
    city: 'Ruse',
    country: 'Bulgaria',
    feed_url: 'https://weather-webcam.eu/cams/gkpp-ruse-gurgevo-webcam-kamera-na-jivo2.jpg',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-ruse-3',
    lat: 43.846,
    lng: 25.978,
    name: 'GKPP Ruse – Giurgiu (lane 3)',
    city: 'Ruse',
    country: 'Bulgaria',
    feed_url: 'https://weather-webcam.eu/cams/gkpp-ruse-gurgevo-webcam-kamera-na-jivo3.jpg',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-ruse-4',
    lat: 43.743,
    lng: 26.097,
    name: 'GKPP Tutrakan – Oltenița',
    city: 'Tutrakan',
    country: 'Bulgaria',
    feed_url: 'https://weather-webcam.eu/cams/ruse-webcam-gkpp-kam-tutrakan.jpg',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-vrashka-1',
    lat: 43.858,
    lng: 22.448,
    name: 'GKPP Vrashka Chuka',
    city: 'Vrashka Chuka',
    country: 'Bulgaria',
    feed_url: 'https://home-solutions.bg/cams/chuka2.jpg',
    source: 'home-solutions.bg',
  },
  {
    id: 'bg-gkpp-vrashka-2',
    lat: 43.857,
    lng: 22.45,
    name: 'GKPP Vrashka Chuka (alt)',
    city: 'Vrashka Chuka',
    country: 'Bulgaria',
    feed_url: 'https://home-solutions.bg/cams/chuka1.jpg',
    source: 'home-solutions.bg',
  },
  {
    id: 'bg-gkpp-makaza-1',
    lat: 41.297,
    lng: 24.133,
    name: 'GKPP Makaza – Nymfea (cam 1)',
    city: 'Makaza',
    country: 'Bulgaria',
    stream_url: 'https://www.youtube.com/embed/pnr0lhrqRAc?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://weather-webcam.eu/ueb-kameri-ot-gkpp-makaza-nimfeya/',
    source: 'YouTube / GKPP',
  },
  {
    id: 'bg-gkpp-makaza-2',
    lat: 41.296,
    lng: 24.135,
    name: 'GKPP Makaza – Nymfea (cam 2)',
    city: 'Makaza',
    country: 'Bulgaria',
    stream_url: 'https://www.youtube.com/embed/YXN19ZEpIkc?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://weather-webcam.eu/ueb-kameri-ot-gkpp-makaza-nimfeya/',
    source: 'YouTube / GKPP',
  },
  {
    id: 'bg-gkpp-kalotina',
    lat: 42.995,
    lng: 22.878,
    name: 'GKPP Kalotina – Gradina',
    city: 'Kalotina',
    country: 'Bulgaria',
    external_url: 'https://weather-webcam.eu/kalotina-online-webcam-kgpp-granichen-punkt-bulgaria-sarbia-kamera/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-gueshevo',
    lat: 42.148,
    lng: 22.535,
    name: 'GKPP Gyueshevo – Deve Bair',
    city: 'Gyueshevo',
    country: 'Bulgaria',
    external_url: 'https://weather-webcam.eu/gueshevo-online-webcam-kgpp-granichen-punkt-bulgaria-makedonia-kamera/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-kapitan-andreevo',
    lat: 41.718,
    lng: 26.328,
    name: 'GKPP Kapitan Andreevo – Kapıkule',
    city: 'Svilengrad',
    country: 'Bulgaria',
    external_url: 'https://weather-webcam.eu/svilengrad-kapitan-andreevo-kapakule-odrin-live-kamera/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-lesovo',
    lat: 41.968,
    lng: 26.385,
    name: 'GKPP Lesovo – Hamzabeyli',
    city: 'Lesovo',
    country: 'Bulgaria',
    external_url: 'https://weather-webcam.eu/lesovo-hamzabeyli-live-kamera-balgaria-turcia-granica-trafik-vremeto/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-gkpp-malko-tarnovo',
    lat: 41.407,
    lng: 27.518,
    name: 'GKPP Malko Tarnovo – Dereköy',
    city: 'Malko Tarnovo',
    country: 'Bulgaria',
    external_url: 'https://weather-webcam.eu/gkpp-malko-tarnovo-derekoi-live-kamera-balgaria-turcia-granica-trafik-vremeto/',
    source: 'weather-webcam.eu',
  },

  // ── NIMH / Smart Burgas HLS ──
  {
    id: 'bg-varna-treta-buna',
    lat: 43.214,
    lng: 27.923,
    name: 'Sea Garden / Third Buoy (NIMH)',
    city: 'Varna',
    country: 'Bulgaria',
    feed_url: 'https://home-solutions.bg/cams/varna-buna.jpg',
    external_url: 'https://weather-webcam.eu/varna-kamera-na-jivo-zaliv-treta-buna-black-sea/',
    source: 'NIMH / home-solutions.bg',
  },
  {
    id: 'bg-burgas-center',
    lat: 42.497,
    lng: 27.47,
    name: 'Burgas Center (Smart Burgas HLS)',
    city: 'Burgas',
    country: 'Bulgaria',
    stream_url: 'https://pics.smartburgas.eu/m3u8/burgas_town_Center.m3u8',
    stream_type: 'hls',
    external_url: 'https://www.weather-webcam.eu/cams/burgas-centar.html',
    source: 'Smart Burgas',
  },
  {
    id: 'bg-burgas-sarafovo',
    lat: 42.65,
    lng: 27.7,
    name: 'Sarafovo – Black Sea Panorama',
    city: 'Burgas',
    country: 'Bulgaria',
    feed_url: 'https://www.weather-webcam.eu/cams/burgas-kvartal-sarafovo-na-jivo-kamera-panorama-cherno-more.jpg',
    source: 'weather-webcam.eu',
  },
  {
    id: 'bg-burgas-north-beach',
    lat: 42.51,
    lng: 27.474,
    name: 'North Beach / Windsurf',
    city: 'Burgas',
    country: 'Bulgaria',
    feed_url: 'http://5.104.177.125:8080/?action=snapshot',
    source: 'Private cam',
  },
];

function cameraKey(cam: CctvCamera): string {
  return (cam.stream_url || cam.feed_url || cam.external_url || cam.id).split('?')[0];
}

export async function fetchBulgariaCameras(): Promise<CctvCamera[]> {
  const seen = new Set<string>();
  const merged: CctvCamera[] = [];

  for (const cam of [...BULGARIA_MANUAL, ...BULGARIA_FWCBG_CAMERAS]) {
    if (!cam.feed_url && !cam.stream_url && !cam.external_url) continue;
    const key = cameraKey(cam);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(cam);
  }

  return merged;
}
