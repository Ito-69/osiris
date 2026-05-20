import type { CctvCamera } from './types';

/** Turkish border and traffic webcams near Bulgaria/Greece. */
const TURKEY_CAMERAS: CctvCamera[] = [
  {
    id: 'tr-makaza-nymfea-1',
    lat: 41.295,
    lng: 24.137,
    name: 'Makaza – Nymfea Border (cam 1)',
    city: 'Komotini',
    country: 'Turkey',
    external_url: 'https://www.youtube.com/embed/pnr0lhrqRAc',
    source: 'YouTube / GKPP',
  },
  {
    id: 'tr-makaza-nymfea-2',
    lat: 41.294,
    lng: 24.139,
    name: 'Makaza – Nymfea Border (cam 2)',
    city: 'Komotini',
    country: 'Turkey',
    external_url: 'https://www.youtube.com/embed/YXN19ZEpIkc',
    source: 'YouTube / GKPP',
  },
  {
    id: 'tr-kapikule',
    lat: 41.717,
    lng: 26.33,
    name: 'Kapıkule – Kapitan Andreevo Border',
    city: 'Edirne',
    country: 'Turkey',
    external_url: 'https://weather-webcam.eu/svilengrad-kapitan-andreevo-kapakule-odrin-live-kamera/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'tr-hamzabeyli',
    lat: 41.97,
    lng: 26.388,
    name: 'Hamzabeyli – Lesovo Border',
    city: 'Edirne',
    country: 'Turkey',
    external_url: 'https://weather-webcam.eu/lesovo-hamzabeyli-live-kamera-balgaria-turcia-granica-trafik-vremeto/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'tr-derekoy',
    lat: 41.405,
    lng: 27.521,
    name: 'Dereköy – Malko Tarnovo Border',
    city: 'Kırklareli',
    country: 'Turkey',
    external_url: 'https://weather-webcam.eu/gkpp-malko-tarnovo-derekoi-live-kamera-balgaria-turcia-granica-trafik-vremeto/',
    source: 'weather-webcam.eu',
  },
  {
    id: 'tr-edirne-kapitan',
    lat: 41.677,
    lng: 26.555,
    name: 'Edirne – Kapıkule Approach',
    city: 'Edirne',
    country: 'Turkey',
    external_url: 'https://weather-webcam.eu/svilengrad-kapitan-andreevo-kapakule-odrin-live-kamera/',
    source: 'weather-webcam.eu',
  },
];

export async function fetchTurkeyCameras(): Promise<CctvCamera[]> {
  return TURKEY_CAMERAS.filter((cam) => cam.feed_url || cam.external_url);
}
