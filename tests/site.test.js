import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { remainingTime, guestName, weddingDay, openingGeometry } from "../app.js";

test("the doorway reveal centres its opening and fills portrait and wide screens", () => {
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1440, 900]]) {
    const rect = { left: width * 0.3, right: width * 0.7, top: height * 0.4, bottom: height * 0.8 };
    const reveal = openingGeometry(rect, width, height);
    assert.ok((rect.right - rect.left) * reveal.scale > width);
    assert.ok((rect.bottom - rect.top) * reveal.scale > height);
    assert.equal((rect.left + rect.right) / 2 + reveal.x, width / 2);
    assert.equal((rect.top + rect.bottom) / 2 + reveal.y, height / 2);
  }
});

test("music waits for the invitation seal and retains an accessible speaker control", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const audio = html.match(/<audio\b[^>]*>/)?.[0];
  assert.ok(audio);
  assert.doesNotMatch(audio, /\bautoplay\b/);
  assert.match(audio, /\bloop\b/);
  assert.match(html, /<dialog\b[^>]*id="welcome-cover"/);
  assert.match(html, /id="open-invitation"[^>]*type="button"/);
  assert.match(html, /class="seal-label">Open invitation</);
  assert.match(html, /class="seal-logo"[^>]*>[\s\S]*?assets\/monogram\.jpg/);
  assert.match(html, /aria-controls="invitation-music"/);
  assert.match(html, /aria-label="Unmute music"/);
  assert.match(html, /class="sound-off"/);
  assert.ok(readFileSync(new URL("../assets/wedding-instrumental.m4a", import.meta.url)).length > 0);
});

test("countdown uses the India wedding date and stops at zero", () => {
  assert.equal(new Date(weddingDay).toISOString(), "2027-01-15T18:30:00.000Z");
  assert.deepEqual(
    remainingTime(weddingDay - (2 * 1440 + 3 * 60 + 4) * 60_000),
    { days: 2, hours: 3, minutes: 4 },
  );
  assert.deepEqual(remainingTime(weddingDay), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
  assert.deepEqual(remainingTime(weddingDay + 1_000_000), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
});

test("personal invitation names support Unicode, missing values and bounded input", () => {
  assert.equal(guestName("?n=Anita+%26+family"), "Anita & family");
  assert.equal(
    guestName("?n=%E0%A4%86%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%A8"),
    "आर्यन",
  );
  assert.equal(guestName("?n=%00+"), "");
  assert.equal(guestName(""), "");
  assert.equal(guestName("?n=" + "x".repeat(100)).length, 80);
});

test("calendar contains two all-day celebrations with exclusive end dates", () => {
  const calendar = readFileSync(
    new URL("../wedding.ics", import.meta.url),
    "utf8",
  );
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.match(
    calendar,
    /DTSTART;VALUE=DATE:20270115\r?\nDTEND;VALUE=DATE:20270116/,
  );
  assert.match(
    calendar,
    /DTSTART;VALUE=DATE:20270116\r?\nDTEND;VALUE=DATE:20270117/,
  );
  assert.match(calendar, /Venue to be confirmed/);
});
