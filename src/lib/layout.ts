// The physical side of the board: where each library sits on campus, what
// its floor looks like, and how each group room is laid out inside. None of
// this is something users edit, so it lives in code rather than the
// database — rooms are matched to their design by name (see db.ts's
// SEEDED_ROOMS). Every plan is schematic: positions and furniture are drawn
// to explain the mechanic, not surveyed.

export type LibraryId = "hancock" | "chifley";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanFeature extends Rect {
  kind: "stairs" | "lift" | "stacks" | "tables";
  label?: string;
}

export interface Library {
  id: LibraryId;
  name: string;
  level: string;
  /** Footprint on the campus map (viewBox 0 0 640 360). */
  map: Rect;
  /** Gap in the floor plan's south wall (viewBox 0 0 420 260). */
  entry: { x: number; w: number };
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
    level: "Level 1",
    map: { x: 150, y: 70, w: 130, h: 80 },
    entry: { x: 24, w: 56 },
    features: [
      { kind: "stairs", x: 20, y: 20, w: 50, h: 60, label: "Stairs" },
      { kind: "lift", x: 20, y: 104, w: 34, h: 34, label: "Lift" },
      { kind: "stacks", x: 96, y: 24, w: 170, h: 128, label: "Collection" },
      { kind: "tables", x: 96, y: 176, w: 170, h: 58, label: "Quiet study" },
    ],
  },
  {
    id: "chifley",
    name: "Chifley Library",
    level: "Level 2",
    map: { x: 400, y: 232, w: 120, h: 76 },
    entry: { x: 224, w: 70 },
    features: [
      { kind: "stacks", x: 196, y: 24, w: 134, h: 128, label: "Collection" },
      { kind: "stairs", x: 350, y: 20, w: 50, h: 60, label: "Stairs" },
      { kind: "lift", x: 356, y: 104, w: 34, h: 34, label: "Lift" },
      { kind: "tables", x: 24, y: 168, w: 150, h: 64, label: "Reading room" },
    ],
  },
];

export const ROOM_DESIGNS: Record<string, RoomDesign> = {
  "Hancock — Group Room 1": {
    library: "hancock",
    label: "Room 1",
    x: 290,
    y: 20,
    w: 110,
    h: 106,
    door: "west",
    capacity: 6,
    screen: true,
    whiteboard: true,
  },
  "Hancock — Group Room 2": {
    library: "hancock",
    label: "Room 2",
    x: 290,
    y: 134,
    w: 110,
    h: 106,
    door: "west",
    capacity: 4,
    screen: false,
    whiteboard: true,
  },
  "Chifley — Group Room 3": {
    library: "chifley",
    label: "Room 3",
    x: 20,
    y: 20,
    w: 150,
    h: 118,
    door: "south",
    capacity: 8,
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
