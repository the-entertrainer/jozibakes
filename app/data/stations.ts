/**
 * Tappable points in the diorama. Each station projects a marker onto the
 * scene; tapping it eases the isometric camera to that spot and opens the
 * relevant sheet.
 *
 * `anchor` is a world-space point in the Spline scene (same units as the
 * camera constants in HeroSpline). Cross-checked against the live scene's
 * object dump: Jozi's root sits at (0, 33, 212), Bruno at (34, 32, 216),
 * Shop at (0, 16, 0) — both stations sit on Jozi's x/z line, offset up in y
 * toward waist/head height. Re-derive via ?debug (SPLINE_OBJECTS console
 * dump) + screenshots if the scene is re-exported. `focusZoom` multiplies
 * the fitted overview zoom for the close-up.
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
    anchor: { x: 0, y: 70, z: 212 },
    focusZoom: 1.9,
  },
  {
    id: 'jozi',
    label: 'Meet Jozi',
    emoji: '👩‍🍳',
    kind: 'about',
    anchor: { x: 0, y: 120, z: 212 },
    focusZoom: 2.1,
  },
];

export const STATION_BY_ID: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s]),
);
