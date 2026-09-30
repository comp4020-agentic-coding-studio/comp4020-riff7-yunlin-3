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

/** One floor of a building, drawn in its own coordinate space. */
export interface Level {
  id: string;
  name: string;
  source: string;
  viewBox: { w: number; h: number };
  /** Closed SVG path for the floor's outer wall, traced from the published plan. */
  outline: string;
  features: PlanFeature[];
}

export interface Library {
  id: LibraryId;
  name: string;
  building: string;
  /** The building's own pin, from its anu.edu.au/maps page. */
  coords: { lat: number; lng: number };
  /** Floors in the order the level picker shows them, lowest first. */
  levels: Level[];
}

export type Wall = "north" | "south" | "east" | "west";

export type RoomState = "now" | "booked" | "free";

export interface RoomDesign extends Rect {
  library: LibraryId;
  /** Which of the building's levels (Level.id) the room is on. */
  level: string;
  label: string;
  door: Wall;
  capacity: number;
  screen: boolean;
  whiteboard: boolean;
}

// Marie Reay's core is the same on every traced floor.
const MR_CORE: PlanFeature[] = [
  { kind: "room", x: 196, y: 10, w: 26, h: 60, label: "Svc" },
  { kind: "stairs", x: 222, y: 10, w: 66, h: 48, label: "Stairs" },
  { kind: "lift", x: 240, y: 72, w: 30, h: 14, label: "Lift" },
  { kind: "room", x: 106, y: 110, w: 33, h: 99 },
  { kind: "stairs", x: 52, y: 288, w: 59, h: 80, label: "Stair/lift" },
];
const MR_TOILETS: PlanFeature = { kind: "room", x: 10, y: 110, w: 96, h: 92, label: "Toilets" };

export const LIBRARIES: Library[] = [
  {
    id: "hancock",
    name: "Hancock Library",
    building: "WK Hancock Building (West wing 43, East wing 122)",
    coords: { lat: -35.27725, lng: 149.118284 },
    levels: [
    {
      id: "b",
      name: "Basement",
        source: "ANU Library, Hancock Library floor plan, Feb 2021",
      viewBox: { w: 320, h: 388 },
      outline: "M120 10 L310 10 L310 378 L10 378 L10 252 L162 252 L162 80 L120 80 Z",
      features: [
        { kind: "tables", x: 130, y: 20, w: 170, h: 52, label: "Study" },
        { kind: "tables", x: 172, y: 120, w: 128, h: 110, label: "Study" },
        { kind: "tables", x: 20, y: 262, w: 140, h: 90, label: "Study" },
        { kind: "tables", x: 172, y: 262, w: 128, h: 90, label: "Study" },
        { kind: "stairs", x: 219, y: 362, w: 86, h: 14, label: "Stairs" },
      ],
    },
    {
      id: "l1",
      name: "Level 1",
        source: "ANU Library, Hancock Library floor plan, Feb 2021",
      viewBox: { w: 390, h: 791 },
      // West Wing stack block on top, East Wing below (courtyard + entrance hall).
      outline:
        "M41 43 L73 43 L73 10 L109 10 L109 30 L337 30 L337 274 L284 274 L284 340 L380 340 L380 775 " +
        "L308 775 L308 733 L233 733 L233 781 L158 781 L158 733 L146 733 L143 708 L135 683 L121 663 " +
        "L95 655 L10 655 L10 606 L95 606 L95 545 L119 545 L119 274 L41 274 Z",
      features: [
        { kind: "stacks", x: 45, y: 47, w: 50, h: 222, label: "Books Q–BF" },
        { kind: "stacks", x: 128, y: 34, w: 150, h: 9, label: "TL–ZA" },
        { kind: "stacks", x: 128, y: 58, w: 150, h: 165, label: "QA–QR" },
        { kind: "tables", x: 282, y: 80, w: 52, h: 80, label: "Silent" },
        { kind: "tables", x: 128, y: 228, w: 150, h: 30, label: "Silent" },
        { kind: "stairs", x: 285, y: 246, w: 42, h: 25, label: "Stairs" },
        { kind: "tables", x: 124, y: 280, w: 130, h: 260, label: "Courtyard" },
        { kind: "tables", x: 290, y: 345, w: 84, h: 210, label: "Computers" },
        { kind: "lift", x: 97, y: 549, w: 14, h: 14, label: "Lift" },
        { kind: "stairs", x: 155, y: 560, w: 68, h: 35, label: "Stairs" },
        { kind: "room", x: 288, y: 560, w: 65, h: 70, label: "Toilets" },
        { kind: "room", x: 12, y: 608, w: 82, h: 45, label: "Reserve" },
        { kind: "room", x: 150, y: 670, w: 56, h: 24, label: "Info desk" },
        { kind: "tables", x: 215, y: 605, w: 70, h: 120, label: "Social" },
        { kind: "tables", x: 290, y: 640, w: 84, h: 85, label: "Computers" },
        { kind: "stacks", x: 310, y: 737, w: 10, h: 36, label: "Reference" },
        { kind: "room", x: 180, y: 760, w: 32, h: 18, label: "Entry" },
      ],
    },
    {
      id: "l2",
      name: "Level 2",
        source: "ANU Library, Hancock Library floor plan, Feb 2021",
      viewBox: { w: 428, h: 901 },
      // Two subpaths: the plan draws no link between the wings on this level.
      outline:
        "M68 53 L157 53 L157 10 L365 10 L365 352 L309 352 L299 343 L282 361 L289 368 L289 382 L68 382 Z " +
        "M120 408 L147 408 L147 683 L180 683 L180 666 L252 666 L252 683 L285 683 L285 449 L418 449 " +
        "L418 710 L394 710 L394 704 L344 704 L344 687 L323 687 L323 740 L395 740 L395 891 L323 891 " +
        "L323 828 L112 828 L112 891 L38 891 L38 736 L120 736 L120 543 L10 543 L10 448 L120 448 Z",
      features: [
        // West Wing
        { kind: "void", x: 129, y: 71, w: 88, h: 64 },
        { kind: "room", x: 70, y: 76, w: 44, h: 26, label: "Comms" },
        { kind: "room", x: 70, y: 104, w: 44, h: 56, label: "Sci Soc" },
        { kind: "stairs", x: 288, y: 12, w: 42, h: 20, label: "Stairs" },
        { kind: "tables", x: 228, y: 36, w: 54, h: 36, label: "Open" },
        { kind: "room", x: 258, y: 78, w: 104, h: 80, label: "2.22" },
        { kind: "room", x: 262, y: 166, w: 100, h: 66, label: "2.23" },
        { kind: "room", x: 266, y: 244, w: 96, h: 84, label: "2.24" },
        { kind: "room", x: 156, y: 292, w: 106, h: 86, label: "2.25" },
        { kind: "room", x: 72, y: 166, w: 118, h: 84, label: "2.27" },
        { kind: "room", x: 72, y: 262, w: 74, h: 112, label: "2.28" },
        { kind: "tables", x: 196, y: 200, w: 58, h: 80, label: "Open" },
        // East Wing
        { kind: "tables", x: 18, y: 462, w: 96, h: 74, label: "Computers" },
        { kind: "tables", x: 296, y: 470, w: 110, h: 200, label: "Computers" },
        { kind: "lift", x: 122, y: 662, w: 16, h: 18, label: "Lift" },
        { kind: "stairs", x: 182, y: 668, w: 68, h: 36, label: "Stairs" },
        { kind: "void", x: 185, y: 731, w: 63, h: 68 },
        { kind: "tables", x: 46, y: 746, w: 130, h: 74, label: "Study" },
        { kind: "tables", x: 258, y: 746, w: 130, h: 74, label: "Study" },
      ],
    },
    {
      id: "l3",
      name: "Level 3",
        source: "ANU Library, Hancock Library floor plan, Feb 2021",
      viewBox: { w: 410, h: 900 },
      // Unchanged from layout.ts.
      outline:
        "M65 50 L200 50 L200 10 L360 10 L360 383 L145 383 L145 655 L180 655 L180 670 L310 670 L310 700 " +
        "L335 700 L335 735 L395 735 L395 890 L320 890 L320 830 L110 830 L110 890 L35 890 L35 735 L90 735 " +
        "L90 655 L10 655 L10 450 L120 450 L120 383 L65 383 Z",
      features: [
        { kind: "void", x: 125, y: 85, w: 100, h: 50 },
        { kind: "room", x: 108, y: 162, w: 36, h: 30, label: "Parents" },
        { kind: "room", x: 240, y: 262, w: 118, h: 40, label: "Flex Lab" },
        { kind: "stacks", x: 14, y: 458, w: 90, h: 28, label: "Needham" },
        { kind: "tables", x: 22, y: 494, w: 110, h: 136, label: "Open study" },
        { kind: "lift", x: 102, y: 662, w: 18, h: 18, label: "Lift" },
        { kind: "stairs", x: 190, y: 676, w: 70, h: 30, label: "Stairs" },
        { kind: "tables", x: 42, y: 752, w: 150, h: 64, label: "Computers" },
        { kind: "tables", x: 238, y: 752, w: 145, h: 64, label: "Silent" },
      ],
    },
    ],
  },
  {
    id: "chifley",
    name: "Chifley Library",
    building: "JB Chifley Building (15)",
    coords: { lat: -35.278182, lng: 149.120692 },
    levels: [
    {
      id: "l1", name: "Level 1",
        source: "ANU Library, Chifley Library floor plan, Mar 2021",
      viewBox: { w: 397, h: 901 },
      outline:
        "M10 10 L159 10 L159 134 L311 134 L311 230 L387 230 L387 257 L311 257 L311 293 L256 293 L256 317 L158 317 L158 336 L88 336 L88 651 L311 651 L311 577 L248 577 L248 549 L332 549 L332 682 L207 682 L207 775 L385 775 L385 817 L157 817 L157 891 L10 891 Z",
      features: [
        { kind: "tables", x: 24, y: 30, w: 120, h: 90, label: "Powered" },
        { kind: "tables", x: 100, y: 150, w: 150, h: 120, label: "Quiet zone" },
        { kind: "stairs", x: 226, y: 294, w: 30, h: 23, label: "Stairs" },
        { kind: "tables", x: 20, y: 360, w: 55, h: 280, label: "Desks" },
        { kind: "lift", x: 258, y: 556, w: 46, h: 18, label: "Lifts" },
        { kind: "tables", x: 24, y: 700, w: 170, h: 60, label: "Study" },
      ],
    },
    {
      id: "l2", name: "Level 2",
        source: "ANU Library, Chifley Library floor plan, Mar 2021",
      viewBox: { w: 382, h: 721 },
      outline:
        "M77 10 L350 10 L350 99 L287 99 L287 178 L224 178 L224 263 L306 263 L306 311 L224 311 L224 421 L318 421 L318 389 L372 389 L372 461 L224 461 L224 524 L312 524 L312 549 L232 549 L232 577 L295 577 L295 597 L303 597 L303 625 L251 625 L251 711 L78 711 L78 625 L109 625 L109 594 L10 594 L10 181 L39 181 L39 41 L77 41 Z",
      features: [
        { kind: "room", x: 182, y: 10, w: 168, h: 49, label: "The Deck" },
        { kind: "tables", x: 50, y: 70, w: 120, h: 60, label: "Study area" },
        { kind: "tables", x: 190, y: 110, w: 90, h: 55, label: "Newspaper" },
        { kind: "tables", x: 30, y: 260, w: 150, h: 60, label: "Computers" },
        { kind: "stairs", x: 252, y: 266, w: 50, h: 42, label: "Stairs" },
        { kind: "room", x: 137, y: 374, w: 50, h: 42, label: "Info desk" },
        { kind: "room", x: 318, y: 389, w: 54, h: 72, label: "Entry" },
        { kind: "lift", x: 252, y: 528, w: 46, h: 18, label: "Lifts" },
        { kind: "room", x: 10, y: 539, w: 62, h: 55, label: "Reserve" },
        { kind: "stairs", x: 257, y: 579, w: 38, h: 18, label: "Stairs" },
        { kind: "room", x: 78, y: 625, w: 173, h: 86, label: "Graneek" },
      ],
    },
    {
      id: "l3", name: "Level 3",
        source: "ANU Library, Chifley Library floor plan, Mar 2021",
      viewBox: { w: 392, h: 893 },
      outline:
        "M10 10 L382 10 L382 298 L297 298 L297 343 L222 343 L222 463 L312 463 L312 583 L382 583 L382 883 L10 883 Z",
      features: [
        { kind: "void", x: 40, y: 40, w: 57, h: 35 },
        { kind: "stacks", x: 117, y: 38, w: 245, h: 85, label: "Books A–HC, E" },
        { kind: "stacks", x: 192, y: 153, w: 170, h: 80, label: "Books BC–DU" },
        { kind: "room", x: 10, y: 166, w: 149, h: 82, label: "Flex Lab 2" },
        { kind: "room", x: 10, y: 248, w: 149, h: 82, label: "Flex Lab 1" },
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
      id: "l4", name: "Level 4",
        source: "ANU Library, Chifley Library floor plan, Mar 2021",
      viewBox: { w: 400, h: 902 },
      outline:
        "M10 10 L390 10 L390 299 L300 299 L300 346 L230 346 L230 455 L342 455 L342 448 L390 448 L390 892 L10 892 Z",
      features: [
        { kind: "void", x: 40, y: 41, w: 59, h: 36 },
        { kind: "tables", x: 215, y: 40, w: 160, h: 120, label: "Study area" },
        { kind: "stacks", x: 37, y: 128, w: 151, h: 746, label: "Books HD–V" },
        { kind: "stacks", x: 225, y: 178, w: 140, h: 37, label: "Books HD" },
        { kind: "stairs", x: 244, y: 302, w: 45, h: 43, label: "Stairs" },
        { kind: "room", x: 342, y: 448, w: 47, h: 44, label: "Parenting" },
        { kind: "void", x: 230, y: 497, w: 102, h: 57 },
        { kind: "room", x: 332, y: 497, w: 56, h: 70, label: "One Button" },
        { kind: "lift", x: 246, y: 559, w: 45, h: 16, label: "Lifts" },
        { kind: "void", x: 332, y: 568, w: 56, h: 33 },
        { kind: "void", x: 230, y: 577, w: 79, h: 42 },
        { kind: "room", x: 313, y: 602, w: 74, h: 51, label: "CAUL" },
        { kind: "stairs", x: 244, y: 623, w: 48, h: 24, label: "Stairs" },
        { kind: "stacks", x: 230, y: 662, w: 110, h: 120, label: "Large bks" },
        { kind: "void", x: 307, y: 798, w: 50, h: 79 },
      ],
    },
    ],
  },
  {
    id: "marie-reay",
    name: "Marie Reay Building",
    building: "Marie Reay Teaching Centre (155)",
    coords: { lat: -35.277786, lng: 149.120685 },
    // Levels 2–5 traced from the brochure on a shared grid, so the north core,
    // toilets and SW stairs line up floor to floor. Level 6 (room 6.02) has
    // no published plan, so it isn't drawn.
    levels: [
      {
        id: "l2",
        name: "Level 2",
        source: "Kambri, Marie Reay Teaching Centre venue brochure, Level 2 plan",
        viewBox: { w: 400, h: 400 },
        outline: "M10 10 H390 V390 H10 Z",
        features: [
          ...MR_CORE,
          { kind: "stairs", x: 140, y: 110, w: 56, h: 86, label: "Stairs" },
          { kind: "void", x: 196, y: 116, w: 92, h: 45 },
          { kind: "stairs", x: 196, y: 161, w: 92, h: 35, label: "Tiered" },
          { kind: "stairs", x: 346, y: 92, w: 33, h: 40, label: "Stairs" },
          { kind: "void", x: 296, y: 112, w: 48, h: 84 },
          { kind: "void", x: 346, y: 134, w: 32, h: 62 },
        ],
      },
      {
        id: "l3",
        name: "Level 3",
        source: "Kambri, Marie Reay Teaching Centre venue brochure, Level 3 plan",
        viewBox: { w: 400, h: 400 },
        outline: "M10 10 H390 V390 H10 Z",
        features: [
          ...MR_CORE,
          MR_TOILETS,
          { kind: "void", x: 294, y: 110, w: 50, h: 92 },
          { kind: "stairs", x: 346, y: 110, w: 33, h: 90, label: "Stairs" },
          { kind: "void", x: 294, y: 294, w: 50, h: 50 },
          { kind: "stairs", x: 346, y: 280, w: 33, h: 30, label: "Stairs" },
        ],
      },
      {
        id: "l4",
        name: "Level 4",
        source: "Kambri, Marie Reay Teaching Centre venue brochure, Level 4 plan",
        viewBox: { w: 400, h: 400 },
        outline: "M10 10 H390 V390 H10 Z",
        features: [
          ...MR_CORE,
          MR_TOILETS,
          { kind: "void", x: 146, y: 293, w: 50, h: 50 },
          { kind: "stairs", x: 155, y: 350, w: 40, h: 26, label: "Feat stair" },
          { kind: "void", x: 294, y: 293, w: 50, h: 50 },
          { kind: "stairs", x: 346, y: 293, w: 33, h: 44, label: "Stairs" },
        ],
      },
      {
        id: "l5",
        name: "Level 5",
        source: "Kambri, Marie Reay Teaching Centre venue brochure, Level 5 plan",
        viewBox: { w: 400, h: 400 },
        outline: "M10 10 H390 V390 H10 Z",
        features: [
          ...MR_CORE,
          MR_TOILETS,
          { kind: "stairs", x: 112, y: 296, w: 33, h: 80, label: "Feat stair" },
          { kind: "void", x: 146, y: 294, w: 50, h: 50 },
          { kind: "stairs", x: 147, y: 346, w: 49, h: 30, label: "Stairs" },
        ],
      },
    ],
  },
  {
    id: "hanna-neumann",
    name: "Hanna Neumann Building",
    building: "Hanna Neumann Building (145)",
    coords: { lat: -35.275532, lng: 149.1191 },
    levels: [
      {
        id: "l1",
        name: "Level 1",
        // No public floor plan: outline is the OpenStreetMap footprint (way
        // 687265476) rotated so the NW façade is the top edge; room positions are
        // approximated from StudentVIP's Level 1 room pins. Stairs/lifts unknown,
        // so not drawn.
        source: "OpenStreetMap footprint; rooms placed from StudentVIP Level 1 pins",
        viewBox: { w: 400, h: 240 },
        outline: "M13 10 L390 10 L389 112 L142 112 L128 230 L29 228 L30 124 L10 118 Z",
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
    ],
  },
  {
    id: "skaidrite-darius",
    name: "Skaidrite Darius Building",
    building: "Skaidrite Darius Building (108, formerly CSIT)",
    coords: { lat: -35.275345, lng: 149.120583 },
    levels: [
      {
        id: "l1",
        name: "Level 1",
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
        features: [
          { kind: "room", x: 152, y: 16, w: 38, h: 32, label: "N110" },
          { kind: "stairs", x: 136, y: 58, w: 20, h: 20 },
          { kind: "lift", x: 162, y: 58, w: 14, h: 14 },
          { kind: "void", x: 213, y: 62, w: 38, h: 28 },
          { kind: "room", x: 152, y: 112, w: 36, h: 26 },
          { kind: "room", x: 215, y: 115, w: 145, h: 65, label: "South wing" },
        ],
      },
    ],
  },
];

export const ROOM_DESIGNS: Record<string, RoomDesign> = {
  // Hancock: all 9 Level 3 group study rooms (Feb 2021 plan). Capacity unpublished:
  // 6 for the plan's "Group Study Room", 4 for the smaller "Group Study" (guesses).
  "Hancock — Group Study 3.27": { library: "hancock", level: "l3", label: "3.27", x: 326, y: 210, w: 32, h: 46, door: "north", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.28": { library: "hancock", level: "l3", label: "3.28", x: 290, y: 196, w: 34, h: 42, door: "north", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.29": { library: "hancock", level: "l3", label: "3.29", x: 244, y: 180, w: 44, h: 40, door: "north", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.33": { library: "hancock", level: "l3", label: "3.33", x: 236, y: 305, w: 66, h: 74, door: "north", capacity: 6, screen: true, whiteboard: true },
  "Hancock — Group Study 3.34": { library: "hancock", level: "l3", label: "3.34", x: 172, y: 305, w: 62, h: 74, door: "north", capacity: 6, screen: true, whiteboard: true },
  "Hancock — Group Study 3.36": { library: "hancock", level: "l3", label: "3.36", x: 154, y: 226, w: 40, h: 44, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.37": { library: "hancock", level: "l3", label: "3.37", x: 112, y: 205, w: 40, h: 42, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.38": { library: "hancock", level: "l3", label: "3.38", x: 70, y: 193, w: 40, h: 40, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Hancock — Group Study 3.39": { library: "hancock", level: "l3", label: "3.39", x: 146, y: 158, w: 56, h: 44, door: "south", capacity: 6, screen: true, whiteboard: true },
  // Chifley: all 14 group study rooms on the Mar 2021 plan (the library says 15). Capacity
  // unpublished (6 larger / 4 smaller, guesses); 9 of 15 have screens but not which — the
  // 9 largest are marked. All have whiteboards (library page).
  "Chifley — Group Study 1.01": { library: "chifley", level: "l1", label: "1.01", x: 274, y: 136, w: 37, h: 33, door: "west", capacity: 4, screen: false, whiteboard: true },
  "Chifley — Group Study 1.02": { library: "chifley", level: "l1", label: "1.02", x: 274, y: 169, w: 37, h: 30, door: "west", capacity: 4, screen: false, whiteboard: true },
  "Chifley — Group Study 1.03": { library: "chifley", level: "l1", label: "1.03", x: 274, y: 199, w: 37, h: 31, door: "west", capacity: 4, screen: false, whiteboard: true },
  "Chifley — Group Study 1.04": { library: "chifley", level: "l1", label: "1.04", x: 274, y: 260, w: 37, h: 33, door: "west", capacity: 4, screen: false, whiteboard: true },
  "Chifley — Group Study 2.02": { library: "chifley", level: "l2", label: "2.02", x: 78, y: 12, w: 52, h: 46, door: "south", capacity: 6, screen: true, whiteboard: true },
  "Chifley — Group Study 3.04": { library: "chifley", level: "l3", label: "3.04", x: 342, y: 248, w: 40, h: 50, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Chifley — Group Study 3.05": { library: "chifley", level: "l3", label: "3.05", x: 302, y: 248, w: 40, h: 50, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Chifley — Group Study 3.06": { library: "chifley", level: "l3", label: "3.06", x: 262, y: 248, w: 40, h: 50, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Chifley — Group Study 3.07": { library: "chifley", level: "l3", label: "3.07", x: 222, y: 248, w: 40, h: 50, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Chifley — Group Study 4.02": { library: "chifley", level: "l4", label: "4.02", x: 12, y: 12, w: 20, h: 72, door: "south", capacity: 4, screen: true, whiteboard: true },
  "Chifley — Group Study 4.03": { library: "chifley", level: "l4", label: "4.03", x: 32, y: 12, w: 48, h: 29, door: "east", capacity: 4, screen: false, whiteboard: true },
  "Chifley — Group Study 4.05": { library: "chifley", level: "l4", label: "4.05", x: 333, y: 250, w: 56, h: 48, door: "north", capacity: 6, screen: true, whiteboard: true },
  "Chifley — Group Study 4.06": { library: "chifley", level: "l4", label: "4.06", x: 280, y: 250, w: 52, h: 48, door: "north", capacity: 6, screen: true, whiteboard: true },
  "Chifley — Group Study 4.07": { library: "chifley", level: "l4", label: "4.07", x: 225, y: 250, w: 54, h: 48, door: "north", capacity: 6, screen: true, whiteboard: true },
  // Marie Reay: capacities are the brochure's workshop layout; whiteboards seen in photos only.
  "Marie Reay — Room 2.02": { library: "marie-reay", level: "l2", label: "2.02", x: 112, y: 212, w: 182, h: 178, door: "east", capacity: 120, screen: true, whiteboard: true },
  "Marie Reay — Room 3.02": { library: "marie-reay", level: "l3", label: "3.02", x: 10, y: 10, w: 186, h: 99, door: "south", capacity: 60, screen: true, whiteboard: true },
  "Marie Reay — Room 3.03": { library: "marie-reay", level: "l3", label: "3.03", x: 288, y: 10, w: 102, h: 98, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 3.04": { library: "marie-reay", level: "l3", label: "3.04", x: 200, y: 290, w: 92, h: 100, door: "north", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 3.05": { library: "marie-reay", level: "l3", label: "3.05", x: 112, y: 290, w: 88, h: 100, door: "north", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 4.02": { library: "marie-reay", level: "l4", label: "4.02", x: 10, y: 10, w: 186, h: 99, door: "south", capacity: 60, screen: true, whiteboard: true },
  "Marie Reay — Room 4.03": { library: "marie-reay", level: "l4", label: "4.03", x: 288, y: 10, w: 102, h: 98, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 4.04": { library: "marie-reay", level: "l4", label: "4.04", x: 288, y: 109, w: 102, h: 91, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 4.05": { library: "marie-reay", level: "l4", label: "4.05", x: 288, y: 201, w: 102, h: 90, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 5.02": { library: "marie-reay", level: "l5", label: "5.02", x: 10, y: 10, w: 186, h: 99, door: "south", capacity: 60, screen: true, whiteboard: true },
  "Marie Reay — Room 5.03": { library: "marie-reay", level: "l5", label: "5.03", x: 288, y: 10, w: 102, h: 98, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 5.04": { library: "marie-reay", level: "l5", label: "5.04", x: 288, y: 109, w: 102, h: 92, door: "west", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 5.05": { library: "marie-reay", level: "l5", label: "5.05", x: 290, y: 290, w: 100, h: 100, door: "north", capacity: 30, screen: true, whiteboard: true },
  "Marie Reay — Room 5.06": { library: "marie-reay", level: "l5", label: "5.06", x: 198, y: 290, w: 92, h: 100, door: "north", capacity: 30, screen: true, whiteboard: true },
  // Hanna Neumann: real Linux labs (cs.anu.edu.au); seat counts unpublished, 40 is a guess.
  "Hanna Neumann — Lab 1.23": { library: "hanna-neumann", level: "l1", label: "1.23", x: 34, y: 194, w: 62, h: 30, door: "north", capacity: 40, screen: true, whiteboard: true },
  "Hanna Neumann — Lab 1.24": { library: "hanna-neumann", level: "l1", label: "1.24", x: 34, y: 152, w: 66, h: 34, door: "south", capacity: 40, screen: true, whiteboard: true },
  // Skaidrite Darius: real Linux labs and displays (cs.anu.edu.au); seat counts unpublished, guesses.
  "Skaidrite Darius — Lab N112": { library: "skaidrite-darius", level: "l1", label: "N112", x: 20, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N113": { library: "skaidrite-darius", level: "l1", label: "N113", x: 64, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N114": { library: "skaidrite-darius", level: "l1", label: "N114", x: 108, y: 16, w: 40, h: 32, door: "south", capacity: 24, screen: true, whiteboard: true },
  "Skaidrite Darius — Lab N115/N116": { library: "skaidrite-darius", level: "l1", label: "N115/N116", x: 20, y: 58, w: 110, h: 28, door: "north", capacity: 60, screen: true, whiteboard: true },
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
