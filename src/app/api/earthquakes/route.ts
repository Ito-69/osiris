import { NextResponse } from 'next/server';
import { fetchNigggEarthquakes, mergeEarthquakes } from '@/lib/bulgaria-sources';

/**
 * OSIRIS — Earthquake Data API
 * USGS global (M2.5+, 24h) + NIGGG-BAS Balkans network (30 days, lower magnitude)
 */

export async function GET() {
  try {
    const [usgsRes, nigggEvents] = await Promise.all([
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 60 },
      }),
      fetchNigggEarthquakes().catch(() => []),
    ]);

    let usgsEarthquakes: any[] = [];
    if (usgsRes.ok) {
      const data = await usgsRes.json();
      usgsEarthquakes = (data.features || []).map((f: any) => {
        const coords = f.geometry?.coordinates || [0, 0, 0];
        const props = f.properties || {};
        return {
          id: f.id,
          lat: coords[1],
          lng: coords[0],
          depth: coords[2],
          magnitude: props.mag,
          place: props.place,
          time: props.time,
          url: props.url,
          tsunami: props.tsunami,
          type: props.type,
          felt: props.felt,
          alert: props.alert,
          source: 'USGS',
        };
      });
    }

    const earthquakes = mergeEarthquakes(usgsEarthquakes, nigggEvents);

    return NextResponse.json({
      earthquakes,
      total: earthquakes.length,
      sources: ['USGS', 'NIGGG-BAS'],
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Earthquake fetch error:', error);
    return NextResponse.json({ earthquakes: [], error: 'Failed to fetch earthquake data' }, { status: 500 });
  }
}
