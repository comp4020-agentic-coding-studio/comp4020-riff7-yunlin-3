// The physical side of the board: where each library sits on campus, what
// its floor looks like, and how each bookable room sits on it. None of this
// is something users edit, so it lives in code rather than the database —
// rooms are matched to their design by name (see db.ts's SEEDED_ROOMS).
//
// Sources:
// - Floor outlines, room numbers and neighbouring spaces are traced from ANU
//   Library's published floor plans: "Hancock Library floor plan" (Feb 2021)
//   and "Chifley Library floor plan" (Mar 2021), linked from each branch's
//   page on anulib.anu.edu.au. Coordinates are those images' pixels minus an
//   origin, so the plans keep the real proportions.
// - Campus positions are the Google Maps coordinates on each building's
//   anu.edu.au/maps page, and the campus map itself is Google Maps.
// - Chifley's footprint, and its setting between Fellows Oval and Union
//   Court over the old Sullivans Creek bed, are from the ANU Acton Campus
//   Site Inventory for building 15, which reproduces T.E. O'Mahony's July
//   1961 plans for the School of General Studies Library (ANU Archives).
// Furniture inside each bookable room (table, chairs) is indicative: the
// library publishes which rooms exist, not how many seats each one has.

export type LibraryId = "hancock" | "chifley";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanFeature extends Rect {
  kind: "stairs" | "lift" | "stacks" | "tables" | "room" | "void";
  label?: string;
}

export interface Library {
  id: LibraryId;
  name: string;
  building: string;
  level: string;
  source: string;
  viewBox: { w: number; h: number };
  /** Closed SVG path for the floor's outer wall, traced from the published plan. */
  outline: string;
  /** The building's own pin, from its anu.edu.au/maps page. */
  coords: { lat: number; lng: number };
  features: PlanFeature[];
}

export type Wall = "north" | "south" | "east" | "west";

export type RoomState = "now" | "booked" | "free";

export interface RoomDesign extends Rect {
  library: LibraryId;
  label: string;
  door: Wall;
  capacity: number;
  screen: boolean;
  whiteboard: boolean;
}

export const LIBRARIES: Library[] = [
  {
    id: "hancock",
    name: "Hancock Library",
    building: "WK Hancock Building (West wing 43, East wing 122)",
    level: "Level 3",
    source: "ANU Library, Hancock Library floor plan, Feb 2021",
    viewBox: { w: 410, h: 900 },
    // Level 3: the West Wing block at the top (group study rooms), joined by
    // a narrow link to the East Wing's T-shaped silent-study floor below.
    outline:
      "M65 50 L200 50 L200 10 L360 10 L360 383 L145 383 L145 655 L180 655 L180 670 L310 670 L310 700 " +
      "L335 700 L335 735 L395 735 L395 890 L320 890 L320 830 L110 830 L110 890 L35 890 L35 735 L90 735 " +
      "L90 655 L10 655 L10 450 L120 450 L120 383 L65 383 Z",
    coords: { lat: -35.27725, lng: 149.118284 },
    features: [
      { kind: "void", x: 125, y: 85, w: 100, h: 50 },
      { kind: "room", x: 150, y: 160, w: 75, h: 55, label: "3.39" },
      { kind: "room", x: 60, y: 185, w: 84, h: 80, label: "3.36–3.38" },
      { kind: "room", x: 245, y: 175, w: 115, h: 70, label: "3.27–3.29" },
      { kind: "room", x: 240, y: 255, w: 120, h: 45, label: "Flex Lab" },
      { kind: "tables", x: 22, y: 470, w: 110, h: 160, label: "Open group study" },
      { kind: "lift", x: 102, y: 662, w: 18, h: 18, label: "Lift" },
      { kind: "stairs", x: 190, y: 676, w: 70, h: 30, label: "Stairs" },
      { kind: "tables", x: 42, y: 752, w: 150, h: 64, label: "Computer area" },
      { kind: "tables", x: 238, y: 752, w: 145, h: 64, label: "Silent study" },
    ],
  },
  {
    id: "chifley",
    name: "Chifley Library",
    building: "JB Chifley Building (15)",
    level: "Level 3",
    source: "ANU Library, Chifley Library floor plan, Mar 2021",
    viewBox: { w: 392, h: 893 },
    outline:
      "M10 10 L382 10 L382 298 L297 298 L297 343 L222 343 L222 463 L312 463 L312 583 L382 583 L382 883 L10 883 Z",
    coords: { lat: -35.278182, lng: 149.120692 },
    features: [
      { kind: "void", x: 40, y: 40, w: 57, h: 35 },
      { kind: "stacks", x: 117, y: 38, w: 245, h: 85, label: "Books A–HC, E" },
      { kind: "stacks", x: 192, y: 153, w: 170, h: 80, label: "Books BC–DU" },
      { kind: "room", x: 10, y: 166, w: 149, h: 82, label: "Flex Lab 2" },
      { kind: "room", x: 10, y: 248, w: 149, h: 82, label: "Flex Lab 1" },
      { kind: "room", x: 222, y: 248, w: 40, h: 50, label: "3.07" },
      { kind: "room", x: 262, y: 248, w: 40, h: 50, label: "3.06" },
      { kind: "room", x: 342, y: 248, w: 40, h: 50, label: "3.04" },
      { kind: "stairs", x: 240, y: 303, w: 44, h: 36, label: "Stairs" },
      { kind: "tables", x: 24, y: 380, w: 180, h: 120, label: "Quiet study" },
      { kind: "lift", x: 230, y: 570, w: 50, h: 18, label: "Lifts" },
      { kind: "room", x: 312, y: 583, w: 70, h: 100, label: "Access. room" },
      { kind: "stairs", x: 244, y: 608, w: 50, h: 40, label: "Stairs" },
      { kind: "tables", x: 24, y: 620, w: 180, h: 120, label: "Computer area" },
      { kind: "void", x: 302, y: 793, w: 50, h: 65 },
    ],
  },
];

export const ROOM_DESIGNS: Record<string, RoomDesign> = {
  "Hancock — Group Study 3.33": {
    library: "hancock",
    label: "3.33",
    x: 236,
    y: 305,
    w: 66,
    h: 74,
    door: "north",
    capacity: 6,
    screen: true,
    whiteboard: true,
  },
  "Hancock — Group Study 3.34": {
    library: "hancock",
    label: "3.34",
    x: 172,
    y: 305,
    w: 62,
    h: 74,
    door: "north",
    capacity: 4,
    screen: true,
    whiteboard: true,
  },
  "Chifley — Group Study 3.05": {
    library: "chifley",
    label: "3.05",
    x: 302,
    y: 248,
    w: 40,
    h: 50,
    door: "south",
    capacity: 4,
    screen: true,
    whiteboard: true,
  },
};

export function designFor(roomName: string): RoomDesign | undefined {
  return ROOM_DESIGNS[roomName];
}

export function describeRoom(design: RoomDesign): string {
  return [
    `${design.capacity} seats`,
    ...(design.screen ? ["wall screen"] : []),
    ...(design.whiteboard ? ["whiteboard"] : []),
  ].join(" · ");
}

export function googleMapsLink({ lat, lng }: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
