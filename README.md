# Saksham & Ayushi — A wedding in Dehradun

A bespoke, responsive invitation for 15–16 January 2027. Plain HTML, CSS and JavaScript. No build step, framework, package install, external font requests, tracking or backend.

## Preview

From this folder run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. `npm start` does the same thing if Node is installed. Serve over HTTP rather than double-clicking the HTML, because the JavaScript uses an ES module.

Personalise a guest's greeting with `?n=Anita%20%26%20family`. The greeting is inserted as text; names are not stored or sent anywhere.

## What is ready

- Custom Doon Valley watercolor, existing family monogram and locally hosted editorial fonts.
- One real engagement portrait in an arched frame with a gentle zoom. A single faded Dehradun panorama sits behind the guest notes, combining Clock Tower, FRI, IMA's Chetwode Hall and Mindrolling's Great Stupa and Buddha statue. The separate landmark section has been removed to shorten the invitation.
- Gentle entry animation, drifting petals, scroll reveals and reduced-motion support.
- Day selectors, India-time countdown and a single calendar download.
- Watercolor ceremony motifs, a decorated vintage car for the Baraat and an Aipan-inspired closing accent.
- Dedicated mobile mandap artwork that keeps the full pavilion visible.
- A Pahadi jharokha with Likhai-inspired woodcarving opens its shutters when guests click the wax seal bearing the family's supplied monogram. The frame nearly fills the phone width, and a synchronized camera and doorway aperture reveal the invitation through the opening. Completion follows the native animations rather than a fixed timeout. The tap starts the music with a four-second fade-in; a small speaker icon then controls mute/unmute. The locally hosted 80-second middle excerpt has reduced volume and four-second fades. Source and licence are in `assets/artwork-credits.txt`.
- The cover supports keyboard activation, Escape dismissal and reduced-motion settings. Without JavaScript, the invitation remains available directly with native audio controls.
- Mobile layouts, keyboard focus styles and a skip link.

## Before sharing with guests

- **The venue is intentionally pending**, as requested. Different planning documents name different venues. No venue pin or contact number has been guessed.
- The 15 January events and 16 January timings are a **provisional** guest-friendly selection from `Wedding_Itinerary_14-17_January_2027.pdf`. Confirm them with the family. Room assignments, setup tasks, rituals restricted to family, quotations and vendor information are excluded.
- Per the family's latest instruction, **Tilak & Saafa Bandhi** appear as one **Morning** event on 16 January, without an exact time. The website keeps the brief invitation format rather than publishing the detailed planning schedule.
- Confirm arrivals, dress guidance and family contact details before adding them. No RSVP collection is wired up or implied. Guest copy is English only; holiday, sightseeing and extended-stay suggestions are intentionally excluded.
- The calendar holds the two dates as tentative all-day events, not unconfirmed ceremony appointments. The countdown is to **midnight IST on 16 January**, not the pheras time.
- The canonical URL and social sharing metadata use the GitHub Pages address. Check WhatsApp link previews after publication; third-party preview caches can take time to update. The illustration is artwork inspired by Dehradun, not a photograph of the venue.

## Edit

`index.html` contains the guest-facing words, events and sections. `styles.css` contains the palette, responsive layouts and animation. `app.js` contains the countdown, day switching, greeting and reveal behaviour. Update `wedding.ics` too if dates change. Keep event UIDs stable for calendar updates.

## Check

```sh
node --test
```

The small built-in test file checks the India-time countdown, guest-name parsing and calendar date boundaries. No test dependencies are needed.

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
- `assets/monogram.jpg`: copy of the existing family logo, cropped for display using CSS.
- `assets/dehradun-watercolor.jpg`: custom illustration created with the built-in ImageGen tool. See [ARTWORK.md](ARTWORK.md) for the complete generation prompt. Optimised as a local JPEG for the site.
- Cormorant Garamond, Pinyon Script and Jost: self-hosted Google Fonts. Their SIL Open Font License files are included in `assets/fonts/`.
