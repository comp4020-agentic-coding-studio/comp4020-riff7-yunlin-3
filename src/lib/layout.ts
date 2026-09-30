// The physical side of the board: where each library sits on campus, what
// its floor looks like, and how each bookable room sits on it. None of this
// is something users edit, so it lives in code rather than the database —
// rooms are matched to their design by name (see db.ts's SEEDED_ROOMS).
//
// Sources:
// - Hancock and Chifley: floor outlines, room numbers and neighbouring spaces are traced from ANU
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
// - Marie Reay: traced from Kambri's Marie Reay Teaching Centre brochure.
// - Hanna Neumann and Skaidrite Darius: no public floor plans, so the outer
//   wall is each building's OpenStreetMap footprint and room positions inside
//   are estimated (noted per building below); lab names are cs.anu.edu.au's.
// Furniture inside each bookable room (table, chairs) is indicative: the
// library publishes which rooms exist, not how many seats each one has.

export type LibraryId = string;

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
  {
    id: "marie-reay",
    name: "Marie Reay Building",
    building: "Marie Reay Teaching Centre (155)",
    level: "Level 4",
    source: "Kambri, Marie Reay Teaching Centre venue brochure, Level 4 plan",
    viewBox: { w: 400, h: 400 },
    outline: "M10 10 H390 V390 H10 Z",
    coords: { lat: -35.277786, lng: 149.120685 },
    features: [
      { kind: "room", x: 196, y: 10, w: 26, h: 60, label: "Svc" },
      { kind: "stairs", x: 222, y: 10, w: 66, h: 48, label: "Stairs" },
      { kind: "lift", x: 240, y: 72, w: 30, h: 14, label: "Lift" },
      { kind: "room", x: 10, y: 110, w: 96, h: 92, label: "Toilets" },
      { kind: "room", x: 106, y: 110, w: 33, h: 99 },
      { kind: "stairs", x: 52, y: 288, w: 59, h: 80, label: "Stairs / lift" },
      { kind: "void", x: 146, y: 293, w: 50, h: 50 },
      { kind: "stairs", x: 155, y: 350, w: 40, h: 26, label: "Feature stair" },
      { kind: "void", x: 294, y: 293, w: 50, h: 50 },
      { kind: "stairs", x: 346, y: 293, w: 33, h: 44, label: "Stairs" },
    ],
  },
  {
    id: "hanna-neumann",
    name: "Hanna Neumann Building",
    building: "Hanna Neumann Building (145)",
    level: "Level 1",
    // No public floor plan: outline is the OpenStreetMap footprint (way
    // 687265476) rotated so the NW façade is the top edge; room positions are
    // approximated from StudentVIP's Level 1 room pins. Stairs/lifts unknown,
    // so not drawn.
    source: "OpenStreetMap footprint; rooms placed from StudentVIP Level 1 pins",
    viewBox: { w: 400, h: 240 },
    outline: "M13 10 L390 10 L389 112 L142 112 L128 230 L29 228 L30 124 L10 118 Z",
    coords: { lat: -35.275532, lng: 149.1191 },
    features: [
      { kind: "tables", x: 40, y: 40, w: 70, h: 50, label: "Study" },
      { kind: "room", x: 122, y: 24, w: 56, h: 52, label: "1.33" },
      { kind: "room", x: 186, y: 70, w: 30, h: 20, label: "1.59" },
      { kind: "room", x: 222, y: 66, w: 30, h: 26, label: "1.57" },
      { kind: "room", x: 292, y: 24, w: 50, h: 30, label: "1.53" },
      { kind: "room", x: 300, y: 62, w: 40, h: 40, label: "1.37" },
      { kind: "room", x: 100, y: 130, w: 34, h: 20, label: "1.25" },
      { kind: "room", x: 104, y: 158, w: 26, h: 28, label: "WC" },
      { kind: "room", x: 100, y: 196, w: 24, h: 28, label: "1.17" },
    ],
  },
  {
    id: "skaidrite-darius",
    name: "Skaidrite Darius Building",
    building: "Skaidrite Darius Building (108, formerly CSIT)",
    level: "Level 1",
    // No public floor plan: outer wall is the OpenStreetMap footprint (way
    // 168926088, © OpenStreetMap contributors) rotated so the long axis runs
    // across; lab names from cs.anu.edu.au, positions inside are estimated.
    source: "OpenStreetMap footprint; lab positions estimated",
    viewBox: { w: 400, h: 200 },
    outline:
      "M211 62 L211 41 L222 42 L231 43 L241 49 L248 56 L256 66 L261 79 L261 92 L239 92 L239 107 L369 107 " +
      "L370 135 L377 134 L384 135 L388 139 L389 144 L390 160 L370 160 L370 185 L208 187 L207 138 L192 138 " +
      "L192 160 L186 161 L184 161 L178 160 L160 150 L153 142 L148 132 L144 125 L142 118 L143 110 L163 109 " +
      "L163 93 L119 93 L10 90 L10 12 L195 12 L193 63 Z",
    coords: { lat: -35.275345, lng: 149.120583 },
    features: [
      { kind: "room", x: 152, y: 16, w: 38, h: 32, label: "N110" },
      { kind: "stairs", x: 136, y: 58, w: 20, h: 20 },
      { kind: "lift", x: 162, y: 58, w: 14, h: 14 },
      { kind: "void", x: 213, y: 62, w: 38, h: 28 },
      { kind: "room", x: 152, y: 112, w: 36, h: 26 },
      { kind: "room", x: 215, y: 115, w: 145, h: 65, label: "South wing" },
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
  // Marie Reay: capacities are the brochure's workshop layout; whiteboards unconfirmed.
  "Marie Reay — Room 4.02": { library: "marie-reay", label: "4.02", x: 10, y: 10, w: 186, h: 99, door: "south", capacity: 60, screen: true, whiteboard: true },
  "Marie Reay — Room 4.03": { library: "marie-reay", label: "4.03", x: 288, y: 10, w: 102, h: 98, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 4.04": { library: "marie-reay", label: "4.04", x: 288, y: 109, w: 102, h: 91, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 4.05": { library: "marie-reay", label: "4.05", x: 288, y: 201, w: 102, h: 90, door: "west", capacity: 30, screen: true, whiteboard: true },
  // Hanna Neumann: real Linux labs (cs.anu.edu.au); seat counts unpublished, 40 is a guess.
  "Hanna Neumann — Lab 1.23": { library: "hanna-neumann", label: "1.23", x: 34, y: 194, w: 62, h: 30, door: "north", capacity: 40, screen: true, whiteboard: true },
  "Hanna Neumann — Lab 1.24": { library: "hanna-neumann", label: "1.24", x: 34, y: 152, w: 66, h: 34, door: "south", capacity: 40, screen: true, whiteboard: true },
  // Skaidrite Darius: real Linux labs and displays (cs.anu.edu.au); seat counts unpublished, guesses.
  "Skaidrite Darius — Lab N112": { library: "skaidrite-darius", label: "N112", x: 20, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N113": { library: "skaidrite-darius", label: "N113", x: 64, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N114": { library: "skaidrite-darius", label: "N114", x: 108, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N115/N116": { library: "skaidrite-darius", label: "N115/N116", x: 20, y: 58, w: 110, h: 28, door: "north", capacity: 60, screen: true, whiteboard: true },
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
