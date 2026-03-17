const API = 'https://overpass-api.de/api/interpreter';

export type OsmStation = {
  osmId: string; name: string; brand?: string;
  lat: number; lng: number; address?: string;
};

function parseElements(elements: any[]): OsmStation[] {
  return elements
    .filter((e) => e.tags?.name)
    .map((e) => {
      const t = e.tags;
      const lat = e.lat ?? e.center?.lat;
      const lng = e.lon ?? e.center?.lon;
      const parts = [t['addr:street'], t['addr:city']].filter(Boolean);
      return {
        osmId:   String(e.id),
        name:    t.name,
        brand:   t.brand ?? t.operator ?? undefined,
        lat,
        lng,
        address: parts.length ? parts.join(', ') : undefined,
      };
    })
    .filter((s) => s.lat && s.lng);
}

export async function searchNearby(lat: number, lng: number, radius = 5000): Promise<OsmStation[]> {
  const q = `[out:json][timeout:10];(node["amenity"="fuel"](around:${radius},${lat},${lng});way["amenity"="fuel"](around:${radius},${lat},${lng}););out center 25;`;
  const res = await fetch(API, { method: 'POST', body: `data=${encodeURIComponent(q)}` });
  const json = await res.json();
  return parseElements(json.elements ?? []);
}

export async function searchByName(query: string, lat?: number, lng?: number): Promise<OsmStation[]> {
  const bbox = lat && lng
    ? `(${lat - 1},${lng - 1},${lat + 1},${lng + 1})`
    : '(-90,-180,90,180)';
  const q = `[out:json][timeout:10];(node["amenity"="fuel"]["name"~"${query}",i]${bbox};way["amenity"="fuel"]["name"~"${query}",i]${bbox};);out center 20;`;
  const res = await fetch(API, { method: 'POST', body: `data=${encodeURIComponent(q)}` });
  const json = await res.json();
  return parseElements(json.elements ?? []);
}
