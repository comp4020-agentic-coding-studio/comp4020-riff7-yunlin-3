import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { and, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Booking, type Room, bookings, rooms } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

// The rooms themselves aren't something a booking app's users create — they're
// the fixed slice of the real system this prototype stands in for (a handful
// of ANU Library group study rooms). Seeded once, on whichever machine boots
// first against an empty database; never re-seeded once a room exists, so a
// deploy never resets what's already there.
// Real room numbers from ANU Library's floor plans (see src/lib/layout.ts);
// drizzle/0002 renamed the original placeholders on existing databases.
const SEEDED_ROOMS = ["Hancock — Group Study 3.33", "Hancock — Group Study 3.34", "Chifley — Group Study 3.05"];
if (db.select().from(rooms).limit(1).all().length === 0) {
  for (const name of SEEDED_ROOMS) db.insert(rooms).values({ name }).run();
}

export type { Booking, Room };

export class ConflictError extends Error {}
export class ValidationError extends Error {}

export function listRooms(): Room[] {
  return db.select().from(rooms).orderBy(rooms.id).all();
}

export function listBookingsForDate(date: string): Booking[] {
  return db.select().from(bookings).where(eq(bookings.date, date)).orderBy(bookings.startTime).all();
}

// Minutes into a booking's start before an un-checked-in room counts as a
// no-show and its slot is taken back — the same "happening now" red is
// otherwise indistinguishable from "booked, but nobody's actually here",
// which is the exact real-system friction this board stands in for
// (see README.md). Kept short enough to matter inside a half-hour session.
export const GRACE_MINUTES = 5;

/**
 * The read half of the no-show mechanic: any booking that started more than
 * GRACE_MINUTES ago with no check-in is deleted here, before the caller sees
 * the list — so "expired" is never a separate state the UI has to render,
 * it just means the slot is free again. Only ever called for *today* (see
 * index.astro), the same scoping isNowWithin already uses — a past date's
 * unchecked bookings are left as history, not retroactively erased. Takes
 * `nowTime` (Canberra HH:MM, from clock.ts) rather than reading the clock
 * itself, so it can be driven by a fixed instant in tests the same way
 * addBooking's overlap check is.
 */
export function expireNoShows(date: string, nowTime: string): void {
  const candidates = db
    .select()
    .from(bookings)
    .where(and(eq(bookings.date, date), isNull(bookings.checkedInAt)))
    .all();
  for (const booking of candidates) {
    if (minutesSince(booking.startTime, nowTime) >= GRACE_MINUTES) {
      db.delete(bookings).where(eq(bookings.id, booking.id)).run();
    }
  }
}

function minutesSince(startTime: string, nowTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [nh, nm] = nowTime.split(":").map(Number);
  return nh * 60 + nm - (sh * 60 + sm);
}

/** Marks a booking as checked into, so expireNoShows never reclaims it. Returns the booking's own date, or null if no booking with that id existed. */
export function checkIn(id: number): string | null {
  const updated = db
    .update(bookings)
    .set({ checkedInAt: sql`(datetime('now'))` })
    .where(eq(bookings.id, id))
    .returning()
    .all();
  return updated[0]?.date ?? null;
}

function overlaps(a: Booking | NewBooking, b: Booking): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

interface NewBooking {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
}

// Runs the whole check-then-insert as one call: better-sqlite3's calls are
// synchronous, so nothing else touches the database between the read and the
// write, which is what makes the overlap check race-free without a separate
// SQL constraint.
export function addBooking(candidate: NewBooking): Booking {
  if (!(candidate.startTime < candidate.endTime)) {
    throw new ValidationError("end time must be after start time");
  }
  const sameRoomAndDay = db
    .select()
    .from(bookings)
    .where(and(eq(bookings.roomId, candidate.roomId), eq(bookings.date, candidate.date)))
    .all();
  if (sameRoomAndDay.some((existing) => overlaps(candidate, existing))) {
    throw new ConflictError("room already booked for part of this time");
  }
  return db.insert(bookings).values(candidate).returning().get();
}

/** Returns the deleted booking's own date, or null if no booking with that id existed. */
export function cancelBooking(id: number): string | null {
  const removed = db.delete(bookings).where(eq(bookings.id, id)).returning().all();
  return removed[0]?.date ?? null;
}
