// Async loaders for the Phase-0-generated assets.
// Each loader is memoized with a single promise so multiple components share fetches.

const cache = new Map();

function fetchJson(path) {
  if (cache.has(path)) return cache.get(path);
  const p = fetch(path).then((r) => {
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
  });
  cache.set(path, p);
  return p;
}

export const loadRegions = () => fetchJson("/assets/data/regions.json");
export const loadRegionStats = () => fetchJson("/assets/data/region_stats.json");
export const loadCrossmodalArcs = () => fetchJson("/assets/data/crossmodal_arcs.json");
export const loadClassification = () => fetchJson("/assets/data/classification.json");

// Index a list of {id, ...} by id for O(1) lookup.
export function byId(list) {
  const m = new Map();
  for (const item of list) m.set(item.id, item);
  return m;
}
