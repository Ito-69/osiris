import { BALKANS_OFFLINE_CAMERA_IDS } from './balkans-offline.generated';
import type { CctvCamera } from './types';

/** Drop cameras that failed the last Balkans health audit. */
export function filterHealthyBalkansCameras(cameras: CctvCamera[]): CctvCamera[] {
  if (BALKANS_OFFLINE_CAMERA_IDS.size === 0) return cameras;
  return cameras.filter((cam) => !BALKANS_OFFLINE_CAMERA_IDS.has(cam.id));
}
