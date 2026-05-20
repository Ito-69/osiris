import { NextResponse } from 'next/server';
import { fetchGdacsBalkansAlerts } from '@/lib/bulgaria-sources';

/**
 * OSIRIS — Severe Weather & Anomalies API
 * NASA EONET (global) + GDACS Balkans civil-protection alerts
 */

export async function GET() {
  try {
    const [eonetRes, gdacsAlerts] = await Promise.all([
      fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100', {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 1800 },
      }),
      fetchGdacsBalkansAlerts().catch(() => []),
    ]);

    const events: any[] = [];

    if (eonetRes.ok) {
      const data = await eonetRes.json();

      for (const event of data.events || []) {
        const geom = event.geometry && event.geometry.length > 0 ? event.geometry[event.geometry.length - 1] : null;
        if (!geom || geom.type !== 'Point') continue;

        const category = event.categories?.[0]?.id || 'unknown';
        if (category === 'wildfires' || category === 'earthquakes') continue;

        let typeLabel = 'Event';
        let icon = 'alert';
        let severity = 'low';

        if (category === 'severeStorms') {
          typeLabel = 'Severe Storm';
          icon = 'cyclone';
          severity = 'high';
        } else if (category === 'volcanoes') {
          typeLabel = 'Volcano Eruption';
          icon = 'volcano';
          severity = 'high';
        } else if (category === 'seaIce') {
          typeLabel = 'Iceberg / Sea Ice';
          icon = 'ice';
          severity = 'medium';
        } else {
          typeLabel = event.categories?.[0]?.title || 'Anomaly';
        }

        events.push({
          id: event.id,
          title: event.title,
          category,
          type: typeLabel,
          icon,
          severity,
          lat: geom.coordinates[1],
          lng: geom.coordinates[0],
          date: geom.date,
          source: event.sources?.[0]?.url || 'NASA EONET',
        });
      }
    }

    for (const alert of gdacsAlerts) {
      events.push({
        id: alert.id,
        title: alert.title,
        category: alert.category,
        type: alert.type,
        icon: alert.icon,
        severity: alert.severity,
        lat: alert.lat,
        lng: alert.lng,
        date: alert.date,
        source: alert.source,
        link: alert.link,
        alertLevel: alert.alertLevel,
      });
    }

    return NextResponse.json({
      events,
      total: events.length,
      sources: ['NASA EONET', 'GDACS'],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ events: [], error: 'Failed to fetch weather/disaster data' }, { status: 500 });
  }
}
