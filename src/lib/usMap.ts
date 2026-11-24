import "server-only";
import { geoAlbersUsa, geoBounds, geoContains, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import statesTopo from "us-atlas/states-10m.json";
import { STATES, type StateCode } from "./site";

export type UsMapData = {
  width: number;
  height: number;
  dot: number;
  /** All U.S. dots that are not in an active state, as one path ("M x y h0" segments). */
  base: string;
  /** Dots of each active state. */
  active: { code: StateCode; d: string }[];
  /** Visual center of each active state. */
  nodes: { code: StateCode; x: number; y: number }[];
  /** Curved connections between active states, west to east. */
  links: string[];
};

const WIDTH = 975;
const HEIGHT = 610;
const STEP = 11;

let cache: UsMapData | null = null;

export function getUsMap(): UsMapData {
  if (cache) return cache;

  const topo = statesTopo as unknown as Topology<{ states: GeometryCollection }>;
  const collection = feature(topo, topo.objects.states);
  const features = collection.features as Feature<Geometry, { name: string }>[];
  const projection = geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]);
  const path = geoPath(projection);

  const fipsToCode = new Map<string, StateCode>(STATES.map((s) => [s.fips, s.code]));
  const boxes = features.map((f) => ({ f, b: geoBounds(f), code: fipsToCode.get(String(f.id)) }));

  const inBox = (lon: number, lat: number, b: [[number, number], [number, number]]) => {
    const [[w, s], [e, n]] = b;
    if (lat < s || lat > n) return false;
    return w <= e ? lon >= w && lon <= e : lon >= w || lon <= e;
  };

  let base = "";
  const activeDots = new Map<StateCode, string>();

  for (let y = STEP / 2; y < HEIGHT; y += STEP) {
    for (let x = STEP / 2; x < WIDTH; x += STEP) {
      const ll = projection.invert?.([x, y]);
      if (!ll) continue;
      const hit = boxes.find(({ f, b }) => inBox(ll[0], ll[1], b) && geoContains(f, ll));
      if (!hit) continue;
      const seg = `M${x} ${y}h0`;
      if (hit.code) activeDots.set(hit.code, (activeDots.get(hit.code) ?? "") + seg);
      else base += seg;
    }
  }

  const nodes = STATES.map((s) => {
    const f = features.find((ft) => String(ft.id) === s.fips)!;
    const [x, y] = path.centroid(f);
    // Florida's geometric centroid falls in the Gulf side; nudge it onto the peninsula.
    const adj = s.code === "FL" ? [x + 14, y + 6] : s.code === "MD" ? [x + 4, y - 2] : [x, y];
    return { code: s.code, x: Math.round(adj[0]), y: Math.round(adj[1]) };
  });

  const links: string[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(60, len * 0.25);
    const cx = mx + (dy / len) * bend;
    const cy = my - (dx / len) * bend;
    links.push(`M${a.x} ${a.y}Q${Math.round(cx)} ${Math.round(cy)} ${b.x} ${b.y}`);
  }

  cache = {
    width: WIDTH,
    height: HEIGHT,
    dot: 4.2,
    base,
    active: STATES.map((s) => ({ code: s.code, d: activeDots.get(s.code) ?? "" })),
    nodes,
    links,
  };
  return cache;
}
