export interface CctvCamera {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city: string;
  country: string;
  feed_url?: string;
  external_url?: string;
  source: string;
}

export function normalizeFeedUrl(url: string): string {
  if (url.startsWith('pics/')) {
    return `http://free-webcambg.com/${url.split('?')[0]}`;
  }
  return url.split('?')[0];
}
