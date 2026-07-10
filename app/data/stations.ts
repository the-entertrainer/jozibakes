/**
 * Tappable points in the diorama. Each station projects a marker onto the
 * scene; tapping it eases the isometric camera to that spot and opens the
 * relevant sheet.
 *
 * `anchor` is a world-space point in the Spline scene (same units as the
 * camera constants in HeroSpline). Jozi stands at world x = 0, so both
 * anchors sit on that safe centre line; tune y/z against screenshots if the
 * scene is re-exported. `focusZoom` multiplies the fitted overview zoom for
 * the close-up.
 */

export type StationKind = 'menu' | 'about';

export type Station = {
  id: string;
  label: string;
  emoji: string;
  kind: StationKind;
  anchor: { x: number; y: number; z: number };
  focusZoom: number;
};

export const STATIONS: Station[] = [
  {
    id: 'counter',
    label: 'Order the bakes',
    emoji: '🧁',
    kind: 'menu',
    anchor: { x: 0, y: 60, z: 212 },
    focusZoom: 1.9,
  },
  {
    id: 'jozi',
    label: 'Meet Jozi',
    emoji: '👩‍🍳',
    kind: 'about',
    anchor: { x: 0, y: 150, z: 212 },
    focusZoom: 2.1,
  },
];

export const STATION_BY_ID: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s]),
);
