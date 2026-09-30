import type { APIRoute } from "astro";
import { checkIn } from "../../../../lib/db";
import { bus } from "../../../../lib/events";

// The other half of the no-show mechanic (see db.ts's expireNoShows): the
// person who actually turned up hits this to prove it, which is what stops
// the room being reclaimed at the grace deadline. Broadcasts the same way a
// booking or cancellation does, so another tab watching this room's "auto-
// releases at" note sees it clear the moment someone checks in.
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const date = String(form.get("date") ?? "");
  if (Number.isInteger(id)) {
    const bookingDate = checkIn(id);
    if (bookingDate) bus.emit("booking", { date: bookingDate });
  }
  return redirect(`/?${new URLSearchParams({ date })}`, 303);
};
