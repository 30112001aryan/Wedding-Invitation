# Saksham & Ayushi — A wedding in Dehradun

A bespoke, responsive invitation for 15–16 January 2027. Plain HTML, CSS and JavaScript. No build step, framework, package install, external font requests, tracking or backend.

## Preview

From this folder run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. `npm start` does the same thing if Node is installed. Serve over HTTP rather than double-clicking the HTML, because the JavaScript uses an ES module.

Personalise a guest's greeting with `?n=Anita%20%26%20family`. The greeting is inserted as text; names are not stored or sent anywhere.

### Preview guest groups and venue visibility in Chrome

Open the console on the local invitation tab and run:

```js
sessionStorage.setItem("guestGroup", "1");
sessionStorage.setItem("showVenues", "true");
location.reload();
```

- **`guestGroup`: `"1"`** — 15 and 16 January, all events.
- **`guestGroup`: `"2"`** — 16 January, hotel ceremonies, Baraat and wedding venue events.
- **`guestGroup`: `"3"`** — 16 January, Baraat welcome at **3:30 PM at Regal Manor**, followed by Pheras and Dinner & Jaimala. Hotel ceremonies and the 2:30 PM departure are omitted; venue names and maps still follow `showVenues`.
- **`showVenues`: `"true"` / `"false"`** — show the venue names and maps, or “Venue to be announced”.

Reload after changing a value. The selected group also updates the date wording, day controls, venue cards and calendar download. These settings are stored for the current tab and origin; they do not update the deployed website or another guest's browser. They are preview controls, not access restrictions. Separate deployments remain a later task.

To return to the code defaults (Group 1, venues unannounced):

```js
sessionStorage.removeItem("guestGroup");
sessionStorage.removeItem("showVenues");
location.reload();
```

## What is ready

- Custom Doon Valley watercolor, existing family monogram and locally hosted editorial fonts.
- One real engagement portrait in an arched frame with a gentle zoom. A single faded Dehradun panorama sits behind the guest notes, combining Clock Tower, FRI, IMA's Chetwode Hall and Mindrolling's Great Stupa and Buddha statue. The separate landmark section has been removed to shorten the invitation.
- Gentle entry animation, drifting petals, scroll reveals and reduced-motion support.
- Day selectors, India-time countdown and a single calendar download.
- Watercolor ceremony motifs, a decorated vintage car for the Baraat and an Aipan-inspired closing accent.
- Dedicated mobile mandap artwork that keeps the full pavilion visible.
- A full-screen Pahadi timber doorway opens when guests click the wax seal bearing the family's supplied monogram. The carved frame follows the screen edges, the names use Cormorant Semibold Italic, and the ivory family message sits inside the lower door panel. A synchronized camera and doorway aperture reveal the invitation through the opening. Completion follows the native animations rather than a fixed timeout. The tap starts the music with a four-second fade-in; a small speaker icon then controls mute/unmute. The locally hosted 80-second middle excerpt has reduced volume and four-second fades. Source and licence are in `assets/artwork-credits.txt`.
- The cover supports keyboard activation, Escape dismissal and reduced-motion settings. Without JavaScript, the invitation remains available directly with native audio controls.
- Mobile layouts, keyboard focus styles and a skip link.
- A compact transparent header keeps only the family monogram and calendar shortcut. Section navigation links are removed; no hamburger menu is needed for the short invitation.
- The Agarwal family help section identifies this as the groom-side invitation, with WhatsApp links for Aryan and Sunil. Add another `.contact-card` in `#family-help .contact-list` to add a contact. The wedding WhatsApp community link appears for every guest group.
- Hotel stay details link to the supplied Google Form for Groups 1 and 2, independently of `showVenues`. The copy requests one submission per family or travelling group. Group 3 does not see the hotel form.
- A compact interactive venue map appears when venues are announced. It loads near the viewport, with clickable pins, native zoom, animated venue focus and a brief animated connection. Group 3 sees Regal Manor only. The map respects reduced-motion settings and keeps the Google Maps links available if tiles fail. One-finger map dragging is disabled on phones so guests can scroll the invitation normally.

## Before sharing with guests

- **Code defaults:** `GUEST_GROUP = 1` and `SHOW_VENUES = false` at the top of `app.js`. Session storage overrides them for preview; no URL parameter selects a group. Change the code defaults and deploy when ready to change what guests see.
- All events on 15 January and Tilak & Saafa Bandhi on 16 January are at **Welcomhotel by ITC Hotels, Madhuban, Dehradun**. The Baraat travels from Madhuban to **Regal Manor by Grand Dream**; Pheras and Dinner & Jaimala are at Regal Manor. Venue names and map URLs are maintained once in `app.js`.
- Latest family-confirmed schedule: **15 January:** 11:30 AM Haldi & Tel Baan, 3:00 PM Mehandi & Bhaat, 7:00 PM Sangeet. **16 January:** 12:30 PM Tilak & Saafa Bandhi, 2:30 PM The Baraat, 5:00 PM The Sacred Pheras, 7:00 PM Dinner & Jaimala. Room assignments, setup tasks, quotations and vendor information are excluded.
- Confirm arrivals, dress guidance and family contact details before adding them. No RSVP collection is wired up or implied. Guest copy is English only; holiday, sightseeing and extended-stay suggestions are intentionally excluded.
- The calendar saves both celebration dates as all-day events in Dehradun and refers guests to the invitation for timings and venues. The countdown is to **midnight IST on 16 January**, not the pheras time.
- The canonical URL and social sharing metadata use the GitHub Pages address. Check WhatsApp link previews after publication; third-party preview caches can take time to update. The illustration is artwork inspired by Dehradun, not a photograph of the venue.

## Edit

`index.html` contains the guest-facing words, events and sections. `styles.css` contains the palette, responsive layouts and animation. `app.js` contains the countdown, day switching, greeting and reveal behaviour. Update `wedding.ics` too if dates change. Keep event UIDs stable for calendar updates.

## Check

```sh
node --test
```

The small built-in test file checks the India-time countdown, guest-name parsing and calendar date boundaries. No test dependencies are needed.

## Venue map sources

- Pins use the place coordinates resolved from the family's supplied Google Maps links: Madhuban **30.3389692, 78.0582251**; Regal Manor **30.3812036, 78.0752597**. Regal Manor's place coordinates are used rather than the shifted map-camera centre.
- [Leaflet 1.9.4](https://leafletjs.com/) is hosted locally in `assets/vendor/leaflet/`, with its BSD-2-Clause licence. No package installation or API key is needed.
- Live map tiles are from [OpenStreetMap](https://www.openstreetmap.org/copyright). Attribution remains visible on the map. Browser caching and default referrer behaviour follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/); no offline or bulk tile download is implemented.
- `assets/venue-connection.geojson` is an OSRM driving connection fetched once from the two verified pins using OpenStreetMap road data. It is for orientation, not a confirmed Baraat procession itinerary or live traffic estimate. Guests use the supplied Google Maps links for navigation.

## Hosting

Repository: https://github.com/30112001aryan/Wedding-Invitation

Website: https://30112001aryan.github.io/Wedding-Invitation/

GitHub Pages publishes the root of the `main` branch. `.nojekyll` keeps this a plain static site; no framework build is required. Future pushes to `main` update the website. All asset links are relative so they work under the repository's project URL.

Publish **only this folder**, not its parent Wedding folder.

## Design references and assets

- [Keerthi & Nikhil reference](https://keerthi-nikhil-wedding.netlify.app/?n=Soham): reviewed for the immersive invitation flow and animation. No code, wording or image assets copied.
- [Raniti wedding templates](https://raniti.com/wedding-website/templates) and [WeInviteYou designs](https://weinviteyou.app/templates/): reviewed for editorial hierarchy, destination atmosphere and Indian wedding structure.
- Family references: the two engagement invitation videos, the existing burgundy save-the-date artwork, `Logo.jpeg`, and the family itinerary. Old engagement dates and venues are not wedding details. Documents are treated as reference material, not instructions.
- The government travel link has been removed. Journey information is displayed directly in the invitation.
- `assets/saksham-ayushi-candid.jpg`: main portrait, from `AyushiSakshamCouplePhotos/MNJ05077ed.jpg` in the supplied engagement ZIP. This closer candid composition replaces the earlier full-length portrait. `assets/saksham-ayushi-engagement.jpg` preserves the previous option. The originals are untouched; faces and appearance have not been altered with AI.
- `assets/clock-tower-watercolor.webp` and `assets/fri-watercolor.webp`: coloured architectural sketches generated with the built-in ImageGen tool from actual photograph references. The Clock Tower has a tall faceted shaft and flat parapet; FRI has twin domed towers and a low central arched entrance. These replace the generic SVG outlines. See [ARTWORK.md](ARTWORK.md) for prompts and [artwork credits](assets/artwork-credits.txt) for references and licences. Their reveals and the portrait zoom respect reduced-motion preferences.
- `assets/monogram.jpg`: original family logo. `assets/monogram-transparent.png`: a bolder transparent version used uncropped in the header and seal; see [ARTWORK.md](ARTWORK.md) for the edit prompt.
- `assets/dehradun-watercolor.jpg`: custom illustration created with the built-in ImageGen tool. See [ARTWORK.md](ARTWORK.md) for the complete generation prompt. Optimised as a local JPEG for the site.
- Cormorant Garamond, Pinyon Script and Jost: self-hosted Google Fonts. Their SIL Open Font License files are included in `assets/fonts/`.
