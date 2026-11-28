import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { remainingTime, guestName, weddingDay, openingGeometry, SHOW_VENUES, venues, setVenueVisibility, GUEST_GROUP, readInviteSettings, calendarForGroup } from "../app.js";

test("console preview settings accept all three groups and handle invalid or blocked storage", () => {
  assert.deepEqual(readInviteSettings(), { guestGroup: GUEST_GROUP, showVenues: SHOW_VENUES });
  for (const guestGroup of [1, 2, 3]) {
    for (const showVenues of [false, true]) {
      const values = { guestGroup: String(guestGroup), showVenues: String(showVenues) };
      assert.deepEqual(readInviteSettings({ getItem: (key) => values[key] ?? null }), { guestGroup, showVenues });
    }
  }
  for (const value of [null, "", "0", "4", "2abc", "Group3"]) {
    assert.deepEqual(readInviteSettings({ getItem: () => value }), { guestGroup: GUEST_GROUP, showVenues: SHOW_VENUES });
  }
  assert.deepEqual(readInviteSettings({ getItem() { throw new Error("Storage blocked"); } }), {
    guestGroup: GUEST_GROUP, showVenues: SHOW_VENUES,
  });
});

test("each guest group downloads only its own dates and event descriptions", () => {
  const calendar = readFileSync(new URL("../wedding.ics", import.meta.url), "utf8");
  assert.equal(calendarForGroup(calendar, 1), calendar);
  for (const group of [2, 3]) {
    const output = calendarForGroup(calendar, group);
    assert.equal((output.match(/BEGIN:VEVENT/g) || []).length, 1);
    assert.doesNotMatch(output, /20270115-celebrations|DTSTART;VALUE=DATE:20270115|Haldi|Sangeet/);
    assert.match(output, /UID:20270116-wedding/);
    assert.match(output, /DTSTART;VALUE=DATE:20270116\r\nDTEND;VALUE=DATE:20270117/);
    assert.ok(output.endsWith("END:VCALENDAR\r\n"));
  }
  assert.match(calendarForGroup(calendar, 2), /Tilak & Saafa Bandhi/);
  const venueOnly = calendarForGroup(calendar, 3);
  assert.doesNotMatch(venueOnly, /Tilak|Saafa|2:30 PM|\r\n ner & Jaimala/);
  assert.match(venueOnly, /DESCRIPTION:Baraat welcome at 3:30 PM\\, Pheras\\, Dinner & Jaimala\.\r\nSTATUS:/);
});

test("one announcement flag switches placeholders, venue names and supplied map links", () => {
  assert.equal(SHOW_VENUES, false);
  const links = ["hotel", "wedding", "hotel"].map((key, index) => ({
    dataset: { venue: key },
    hasAttribute: () => index === 2,
    setAttribute(name, value) { this[name] = value; },
  }));
  const details = [{ hidden: true }];
  const pending = [{ hidden: false }];
  const root = {
    querySelectorAll: (selector) => ({
      "[data-venue]": links,
      "[data-venue-details]": details,
      "[data-venue-pending]": pending,
    })[selector],
  };
  setVenueVisibility(root);
  assert.equal(details[0].hidden, true);
  assert.equal(pending[0].hidden, false);
  assert.equal(links[0].href, undefined);

  setVenueVisibility(root, true);
  assert.equal(details[0].hidden, false);
  assert.equal(pending[0].hidden, true);
  assert.equal(links[0].textContent, "Welcomhotel by ITC Hotels, Madhuban, Dehradun");
  assert.equal(links[0].href, "https://maps.app.goo.gl/6eRzTdoQNGfgRrK2A");
  assert.equal(links[1].textContent, "Regal Manor by Grand Dream");
  assert.equal(links[1].href, "https://maps.app.goo.gl/XsY1umToxdnqWJhc8");
  assert.equal(links[2].textContent, "Madhuban");
  assert.match(links[2]["aria-label"], /Welcomhotel.*Google Maps/);

  setVenueVisibility(root, false);
  assert.equal(details[0].hidden, true);
  assert.equal(pending[0].hidden, false);
});

test("the map uses the supplied place pins and a road connection between them", () => {
  assert.deepEqual(venues.hotel.coordinates, [30.3389692, 78.0582251]);
  assert.deepEqual(venues.wedding.coordinates, [30.3812036, 78.0752597]);
  const route = JSON.parse(readFileSync(new URL("../assets/venue-connection.geojson", import.meta.url), "utf8"));
  assert.equal(route.geometry.type, "LineString");
  assert.ok(route.geometry.coordinates.length > 2);
  for (const [point, key] of [[route.geometry.coordinates[0], "hotel"], [route.geometry.coordinates.at(-1), "wedding"]]) {
    assert.ok(Math.abs(point[0] - venues[key].coordinates[1]) < 0.001);
    assert.ok(Math.abs(point[1] - venues[key].coordinates[0]) < 0.001);
  }
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /class="venue-map-block" data-venue-details hidden/);
  assert.match(html, /data-map-focus="hotel" data-groups="1 2"/);
});

test("family contacts and community are shared, while the hotel form is limited to Groups 1 and 2 independently of venues", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const help = html.match(/<section[^>]*id="family-help"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(help);
  assert.match(help, /From the groom’s family/);
  assert.match(help, /https:\/\/wa\.me\/919690307750/);
  assert.match(help, /https:\/\/wa\.me\/919837162460/);
  assert.doesNotMatch(help, /data-venue-details|data-venue-pending/);
  const form = help.match(/<a[^>]*id="hotel-stay-form"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.match(form, /data-groups="1 2"/);
  assert.match(form, /https:\/\/forms\.gle\/VAR3Af6SZgJEPWGE7/);
  assert.match(form, /One submission per family or travelling group, please\./);
  const community = help.match(/<a[^>]*id="wedding-community"[^>]*>/)?.[0];
  assert.match(community, /https:\/\/chat\.whatsapp\.com\/CBXDNhsAUNWJZnmJkjUycL/);
  assert.doesNotMatch(community, /data-groups|data-venue/);
});

test("the full invitation uses the latest seven events and correct venue assignments", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const events = [...html.matchAll(/<p class="event-time">([^<]+)<\/p>\s*<h3>([^<]+)<\/h3>/g)];
  assert.deepEqual(events.map(([, time, title]) => [time, title]), [
    ["11:30 AM", "Haldi & Tel Baan"],
    ["3:00 PM", "Mehandi & Bhaat"],
    ["7:00 PM", "Sangeet"],
    ["12:30 PM", "Tilak & Saafa Bandhi"],
    ["2:30 PM", "The Baraat"],
    ["5:00 PM", "The Sacred Pheras"],
    ["7:00 PM", "Dinner & Jaimala"],
  ]);
  for (const [, attributes] of html.matchAll(/<[^>]+\b(data-venue-details[^>]*)>/g)) {
    assert.match(attributes, /\bhidden\b/);
  }
  const cards = [...html.matchAll(/<article class="event-card ([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  const assignments = Object.fromEntries(cards.slice(3).map(([, name, body]) => [
    name, [...body.matchAll(/data-venue="([^"]+)"/g)].map(([, venue]) => venue),
  ]));
  assert.deepEqual(assignments, {
    "morning-card": ["hotel"],
    "baraat-card": ["hotel", "wedding"],
    "pheras-card": ["wedding"],
    "dinner-card": ["wedding"],
  });
  const baraat = cards.find(([, name]) => name === "baraat-card")[2];
  assert.match(html, /<article class="event-card baraat-card">/);
  assert.match(baraat, /data-venue="hotel" data-venue-short data-groups="1 2"/);
  assert.match(baraat, /<span aria-label="to" data-groups="1 2">/);
  assert.match(html, /id="day-15">\s*<p class="day-venue" data-venue-details hidden>\s*<a data-venue="hotel"/);
  for (const [, key] of html.matchAll(/data-venue="([^"]+)"/g)) assert.ok(venues[key]);
  assert.match(html, /data-venue-pending>\s*Venue to be announced\./);
});

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
  assert.match(html, /class="seal-logo"[^>]*>[\s\S]*?assets\/monogram-transparent\.png/);
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
  assert.equal((calendar.match(/LOCATION:Dehradun/g) || []).length, 2);
  assert.doesNotMatch(calendar, /Venue to be confirmed|Morning:|Times are provisional/);
});
