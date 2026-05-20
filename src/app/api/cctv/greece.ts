import type { CctvCamera } from './types';

/** Public IPCamLive credentials exposed on Attiki Odos live-streaming pages. */
const IPCAMLIVE_API_SECRET = '65586c9ba88ef';

const ATTiki_ODOS_CAMERAS: Array<{
  alias: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}> = [
  { alias: 'cam128', name: 'I/C D. Plakentias – Imittos Ring Road', city: 'Athens', lat: 38.0208, lng: 23.8578 },
  { alias: 'cam231', name: 'I/C Papagou (Imittos Ring Road)', city: 'Athens', lat: 37.9906, lng: 23.7947 },
  { alias: 'cam38', name: 'The Mall Athens – Neratziotissa Station', city: 'Athens', lat: 38.0414, lng: 23.7897 },
  { alias: 'cam053', name: 'I/C Metamorfosi', city: 'Athens', lat: 38.065, lng: 23.7575 },
  { alias: 'cam6', name: 'Koropi Toll Station', city: 'Koropi', lat: 37.8969, lng: 23.8753 },
  { alias: 'cam88', name: 'Roupaki Toll Station', city: 'Elefsina', lat: 38.0781, lng: 23.6528 },
];

/** Northern Greece & regional live cameras (Thessaloniki, Kavala, Halkidiki, Thrace). */
const GREECE_REGIONAL_CAMERAS: CctvCamera[] = [
  {
    id: 'gr-thessaloniki-center-live',
    lat: 40.6401,
    lng: 22.9444,
    name: 'Thessaloniki – Center (live)',
    city: 'Thessaloniki',
    country: 'Greece',
    stream_url: 'https://www.youtube.com/embed/7V0IRFbzRFI?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://www.webcameras.gr/loc_wc/webcameras.asp?ID=510&lang=en',
    source: 'meteothes.gr / webcameras.gr',
  },
  {
    id: 'gr-thessaloniki-port',
    lat: 40.635,
    lng: 22.938,
    name: 'Thessaloniki – Port',
    city: 'Thessaloniki',
    country: 'Greece',
    feed_url: 'https://weather-webcam.eu/wp-content/uploads/2012/11/solun-webcam.jpg',
    external_url: 'https://weather-webcam.eu/thessaloniki-live-online-webcam-solun-na-jivo/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'gr-kavala-live',
    lat: 40.939,
    lng: 24.408,
    name: 'Kavala – City View (live)',
    city: 'Kavala',
    country: 'Greece',
    stream_url: 'https://city-view-of-kavala.click2stream.com/',
    stream_type: 'iframe',
    external_url: 'https://www.webcameras.gr/loc_wc/webcameras.asp?ID=286&lang=en',
    source: 'click2stream / Angelcam',
  },
  {
    id: 'gr-kavala-iraklitsa',
    lat: 40.864,
    lng: 24.32,
    name: 'Nea Iraklitsa – Beach (live)',
    city: 'Kavala',
    country: 'Greece',
    stream_url: 'https://iraklitsa.click2stream.com/',
    stream_type: 'iframe',
    external_url: 'https://www.webcameras.gr/loc_wc/webcameras.asp?ID=620&lang=en',
    source: 'click2stream / Angelcam',
  },
  {
    id: 'gr-kavala-panorama',
    lat: 40.936,
    lng: 24.412,
    name: 'Kavala – Panorama',
    city: 'Kavala',
    country: 'Greece',
    feed_url: 'https://weather-webcam.eu/wp-content/uploads/2013/03/kavala-webcam.jpg',
    external_url: 'https://weather-webcam.eu/cam-camera-online-kavala-greece-garcia/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'gr-halkidiki-sithonia-live',
    lat: 40.098,
    lng: 23.979,
    name: 'Halkidiki – Sithonia (YouTube live)',
    city: 'Sithonia',
    country: 'Greece',
    stream_url: 'https://www.youtube.com/embed/live_stream?channel=UCe7RFCllOgqTV5H4Y411XUw&autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://weather-webcam.eu/ueb-kameri-ot-sitoniya-halkidiki-garcziya-na-zhivo/',
    source: 'YouTube / Sithonia',
  },
  {
    id: 'gr-sarti-kalamitsi',
    lat: 40.096,
    lng: 23.978,
    name: 'Sarti / Kalamitsi – Paralia Sykia',
    city: 'Sarti',
    country: 'Greece',
    feed_url: 'https://camping-melissi.gr/images/melissicam/snap/webcam.jpg',
    external_url: 'https://weather-webcam.eu/kalamitsi-sarti-sithonia-garcia-greece-webcam-live-kamera-online-weather-vremeto/',
    source: 'camping-melissi.gr',
  },
  {
    id: 'gr-vourvourou-halkidiki',
    lat: 40.248,
    lng: 23.791,
    name: 'Vourvourou – Chalkidiki (live)',
    city: 'Vourvourou',
    country: 'Greece',
    stream_url: 'https://www.youtube.com/embed/6E4IXis5myU?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://www.webcameras.gr/loc_wc/webcameras.asp?ID=659&lang=en',
    source: 'webcameras.gr',
  },
  {
    id: 'gr-xanthi-windy',
    lat: 41.135,
    lng: 24.888,
    name: 'Xanthi – City (Windy live)',
    city: 'Xanthi',
    country: 'Greece',
    stream_url: 'https://www.windy.com/webcams/1574440292/embed',
    stream_type: 'iframe',
    external_url: 'https://weather-webcam.eu/xanthi-ksanti-garcia-greece-webcam-live-kamera-online-weather-vremeto/',
    source: 'Windy Webcams',
  },
  {
    id: 'gr-thassos-prinos',
    lat: 40.687,
    lng: 24.576,
    name: 'Thassos – Prinos (live)',
    city: 'Thassos',
    country: 'Greece',
    stream_url: 'https://www.youtube-nocookie.com/embed/r_ql6ILPj0c?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://weather-webcam.eu/prinos-grees-garcia-webcam-live-kamera-online-vremeto/',
    source: 'hotel-angelica.gr',
  },
  {
    id: 'gr-thassos-live',
    lat: 40.78,
    lng: 24.68,
    name: 'Thassos Island (live)',
    city: 'Thassos',
    country: 'Greece',
    stream_url: 'https://www.youtube.com/embed/Zksbxgm6VHA?autoplay=1&mute=1',
    stream_type: 'iframe',
    external_url: 'https://www.webcameras.gr/loc_wc/webcameras.asp?ID=290&lang=en',
    source: 'webcameras.gr',
  },
  {
    id: 'gr-promachon-kulata-gr',
    lat: 41.392,
    lng: 23.355,
    name: 'Promachon – Kulata border (GR side)',
    city: 'Promachon',
    country: 'Greece',
    feed_url: 'https://cdn.uab.org/images/cctv/images/cctv/cctv_01/cctv.jpg',
    external_url: 'https://weather-webcam.eu/kameri-ot-gkpp-kulata-promahon-sledete-trafika-na-grackata-granica/',
    source: 'UAB / GKPP',
  },
];

async function fetchIpcamLiveHls(alias: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://ipcamlive.com/api/v2/getstreamhlsurl?apisecret=${IPCAMLIVE_API_SECRET}&alias=${alias}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== 'ok' || !data.data?.url) return null;
    return String(data.data.url).replace(/^http:\/\//i, 'https://');
  } catch {
    return null;
  }
}

async function fetchIpcamLiveSnapshot(alias: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://ipcamlive.com/api/v2/getsnapshoturl?apisecret=${IPCAMLIVE_API_SECRET}&alias=${alias}`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== 'ok' || !data.data?.url) return null;
    return String(data.data.url).replace(/^http:\/\//i, 'https://');
  } catch {
    return null;
  }
}

export async function fetchGreeceCameras(): Promise<CctvCamera[]> {
  const attikiSettled = await Promise.allSettled(
    ATTiki_ODOS_CAMERAS.map(async (cam) => {
      const [hls, snapshot] = await Promise.all([
        fetchIpcamLiveHls(cam.alias),
        fetchIpcamLiveSnapshot(cam.alias),
      ]);
      const fallback = `https://www.aodos.gr/wp-content/themes/aodos/assets/img/cameras/${cam.alias}-snapshot.jpg`;

      return {
        id: `gr-aodos-${cam.alias}`,
        lat: cam.lat,
        lng: cam.lng,
        name: cam.name,
        city: cam.city,
        country: 'Greece',
        stream_url: hls || undefined,
        stream_type: hls ? ('hls' as const) : undefined,
        feed_url: snapshot || fallback,
        external_url: 'https://www.aodos.gr/en/live-streaming/',
        source: 'Attiki Odos',
      } satisfies CctvCamera;
    }),
  );

  const attiki = attikiSettled
    .filter((result): result is PromiseFulfilledResult<CctvCamera> => result.status === 'fulfilled')
    .map((result) => result.value);

  return [...attiki, ...GREECE_REGIONAL_CAMERAS];
}
