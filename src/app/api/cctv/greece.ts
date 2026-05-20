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
  {
    alias: 'cam128',
    name: 'I/C D. Plakentias – Imittos Ring Road',
    city: 'Athens',
    lat: 38.0208,
    lng: 23.8578,
  },
  {
    alias: 'cam231',
    name: 'I/C Papagou (Imittos Ring Road)',
    city: 'Athens',
    lat: 37.9906,
    lng: 23.7947,
  },
  {
    alias: 'cam38',
    name: 'The Mall Athens – Neratziotissa Station',
    city: 'Athens',
    lat: 38.0414,
    lng: 23.7897,
  },
  {
    alias: 'cam053',
    name: 'I/C Metamorfosi',
    city: 'Athens',
    lat: 38.065,
    lng: 23.7575,
  },
  {
    alias: 'cam6',
    name: 'Koropi Toll Station',
    city: 'Koropi',
    lat: 37.8969,
    lng: 23.8753,
  },
  {
    alias: 'cam88',
    name: 'Roupaki Toll Station',
    city: 'Elefsina',
    lat: 38.0781,
    lng: 23.6528,
  },
];

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
  const settled = await Promise.allSettled(
    ATTiki_ODOS_CAMERAS.map(async (cam) => {
      const snapshot = await fetchIpcamLiveSnapshot(cam.alias);
      const fallback = `https://www.aodos.gr/wp-content/themes/aodos/assets/img/cameras/${cam.alias}-snapshot.jpg`;

      return {
        id: `gr-aodos-${cam.alias}`,
        lat: cam.lat,
        lng: cam.lng,
        name: cam.name,
        city: cam.city,
        country: 'Greece',
        feed_url: snapshot || fallback,
        external_url: 'https://www.aodos.gr/en/live-streaming/',
        source: 'Attiki Odos',
      } satisfies CctvCamera;
    }),
  );

  return settled
    .filter((result): result is PromiseFulfilledResult<CctvCamera> => result.status === 'fulfilled')
    .map((result) => result.value);
}
