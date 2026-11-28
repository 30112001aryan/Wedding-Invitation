// Set to true when the venue names and Google Maps links are ready to announce.
export const SHOW_VENUES = false;
// 1: both days; 2: 16 January, hotel and venue; 3: 16 January, venue only.
export const GUEST_GROUP = 1;

export function readInviteSettings(storage) {
  const defaults = { guestGroup: GUEST_GROUP, showVenues: SHOW_VENUES };
  try {
    storage ??= typeof window === "undefined" ? undefined : window.sessionStorage;
    const group = storage?.getItem("guestGroup");
    const show = storage?.getItem("showVenues");
    return {
      guestGroup: ["1", "2", "3"].includes(group) ? Number(group) : defaults.guestGroup,
      showVenues: show === "true" ? true : show === "false" ? false : defaults.showVenues,
    };
  } catch {
    return defaults;
  }
}

export function calendarForGroup(calendar, group) {
  if (group === 1) return calendar;
  return calendar.replace(/BEGIN:VEVENT\r?\n[\s\S]*?END:VEVENT\r?\n/g, (event) => {
    if (event.includes("DTSTART;VALUE=DATE:20270115")) return "";
    return group === 3
      ? event.replace(/^DESCRIPTION:.*(?:\r?\n[ \t].*)*/m, "DESCRIPTION:Baraat welcome at 3:30 PM\\, Pheras\\, Dinner & Jaimala.")
      : event;
  });
}

export const venues = {
  hotel: {
    name: "Welcomhotel by ITC Hotels, Madhuban, Dehradun",
    shortName: "Madhuban",
    coordinates: [30.3389692, 78.0582251],
    url: "https://maps.app.goo.gl/6eRzTdoQNGfgRrK2A",
  },
  wedding: {
    name: "Regal Manor by Grand Dream",
    shortName: "Regal Manor",
    coordinates: [30.3812036, 78.0752597],
    url: "https://maps.app.goo.gl/XsY1umToxdnqWJhc8",
  },
};

export function setVenueVisibility(root, announced = SHOW_VENUES) {
  if (announced) {
    for (const link of root.querySelectorAll("[data-venue]")) {
      const venue = venues[link.dataset.venue];
      link.textContent = link.hasAttribute("data-venue-short") ? venue.shortName : venue.name;
      link.href = venue.url;
      link.setAttribute("aria-label", `View ${venue.name} on Google Maps`);
    }
  }
  root.querySelectorAll("[data-venue-details]").forEach((element) => {
    element.hidden = !announced;
  });
  root.querySelectorAll("[data-venue-pending]").forEach((element) => {
    element.hidden = announced;
  });
}

// The countdown marks the wedding date at midnight in India, not the ceremony time.
export const weddingDay = Date.parse("2027-01-16T00:00:00+05:30");

export function remainingTime(now = Date.now()) {
  const minutes = Math.max(0, Math.floor((weddingDay - now) / 60_000));
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor(minutes / 60) % 24,
    minutes: minutes % 60,
  };
}

export function guestName(search) {
  return (new URLSearchParams(search).get("n") || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 80);
}

export function openingGeometry(rect, width, height) {
  const doorWidth = rect.right - rect.left;
  const doorHeight = rect.bottom - rect.top;
  const scale = Math.max(width / doorWidth, height / doorHeight) * 1.12;
  const destination = {
    left: (width - doorWidth * scale) / 2,
    right: (width + doorWidth * scale) / 2,
    top: (height - doorHeight * scale) / 2,
    bottom: (height + doorHeight * scale) / 2,
  };
  return {
    scale,
    x: width / 2 - (rect.left + rect.right) / 2,
    y: height / 2 - (rect.top + rect.bottom) / 2,
    keyframes: [rect, destination].map(({ left, top, right, bottom }) => ({
      clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px)`,
    })),
  };
}

if (typeof document !== "undefined") {
  const { guestGroup, showVenues } = readInviteSettings();
  setVenueVisibility(document, showVenues);
  document.documentElement.dataset.guestGroup = String(guestGroup);
  document.querySelectorAll("[data-groups]").forEach((element) => {
    element.hidden = !element.dataset.groups.split(" ").includes(String(guestGroup));
  });
  document.querySelector(".day-switch").hidden = guestGroup !== 1;
  document.getElementById("single-day").hidden = guestGroup === 1;
  if (guestGroup === 3) {
    document.querySelector(".baraat-card .event-time").textContent = "3:30 PM";
    document.getElementById("venue-map-label").textContent = "Your way to the wedding";
  }
  if (showVenues) {
    const block = document.querySelector(".venue-map-block");
    const loadMap = () => import("./venue-map.js?v=20261128-map")
      .then(({ initVenueMap }) => initVenueMap(document.getElementById("venue-map"), venues, guestGroup))
      .catch(() => {
        document.getElementById("venue-map").dataset.unavailable = "true";
        block.querySelector(".venue-map-controls").hidden = true;
        block.querySelector(".map-status").textContent = "Use the venue links below to open Google Maps.";
      });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadMap();
        }
      }, { rootMargin: "150px" });
      observer.observe(block);
    } else {
      loadMap();
    }
  }
  if (guestGroup !== 1) {
    document.getElementById("celebrations-label").textContent = "The wedding day";
    document.getElementById("celebration-duration").textContent = "One day.";
    document.getElementById("celebration-dates").textContent = "16 January 2027 · Dehradun";
    document.getElementById("hotel-events").textContent = "16 January · Tilak & Saafa Bandhi and Baraat departure.";

    const calendarLink = document.querySelector(".header-date");
    calendarLink.hidden = true;
    fetch(calendarLink.href)
      .then((response) => {
        if (!response.ok) throw new Error("Calendar unavailable");
        return response.text();
      })
      .then((calendar) => {
        const content = calendarForGroup(calendar, guestGroup);
        calendarLink.href = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
        calendarLink.download = "saksham-ayushi-wedding.ics";
        calendarLink.setAttribute("aria-label", "Save the wedding date to your calendar");
        calendarLink.hidden = false;
      })
      .catch(() => console.warn("Calendar download could not be loaded. Reload to try again."));
  }

  const music = document.getElementById("invitation-music");
  const musicToggle = document.getElementById("music-toggle");
  const syncMusic = () => {
    const silent = music.muted || music.paused;
    const label = silent ? "Unmute music" : "Mute music";
    musicToggle.setAttribute("aria-pressed", String(silent));
    musicToggle.setAttribute("aria-label", label);
    musicToggle.title = label;
  };
  music.volume = 0.4;
  music.controls = false;
  syncMusic();
  for (const event of ["playing", "pause", "volumechange", "error"]) {
    music.addEventListener(event, syncMusic);
  }
  musicToggle.addEventListener("click", () => {
    const silent = music.muted || music.paused;
    music.muted = !silent;
    if (silent) music.play().catch(syncMusic);
    syncMusic();
  });
  const welcomeCover = document.getElementById("welcome-cover");
  const openInvitation = document.getElementById("open-invitation");
  if (typeof welcomeCover.showModal === "function") {
    document.documentElement.classList.add("invitation-closed");
    welcomeCover.showModal();
    welcomeCover.addEventListener("close", () => {
      document.documentElement.classList.remove("invitation-closed");
      musicToggle.hidden = false;
      document.getElementById("couple-names").focus({ preventScroll: true });
    });
    openInvitation.addEventListener("click", () => {
      // Start within the seal's click so mobile browsers allow the audio.
      music.play().catch(syncMusic);
      openInvitation.disabled = true;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        welcomeCover.close();
        return;
      }
      const stage = welcomeCover.querySelector(".jharokha-stage");
      const backdrop = welcomeCover.querySelector(".cover-backdrop");
      const left = welcomeCover.querySelector(".jharokha-left").getBoundingClientRect();
      const right = welcomeCover.querySelector(".jharokha-right").getBoundingClientRect();
      const geometry = openingGeometry({
        left: left.left, right: right.right, top: left.top, bottom: left.bottom,
      }, welcomeCover.clientWidth, welcomeCover.clientHeight);
      const transform = new DOMMatrix(getComputedStyle(stage).transform);
      const destination = transform.translate(geometry.x, geometry.y).scale(geometry.scale);
      const timing = {
        duration: 2200, delay: 180, easing: "cubic-bezier(0.35, 0.02, 0.12, 1)", fill: "forwards",
      };
      backdrop.style.clipPath = geometry.keyframes[0].clipPath;
      welcomeCover.classList.add("is-opening");
      const camera = stage.animate([
        { transform: transform.toString() }, { transform: destination.toString() },
      ], timing);
      const reveal = backdrop.animate(geometry.keyframes, timing);
      Promise.all([camera.finished, reveal.finished]).then(
        () => welcomeCover.close(),
        () => welcomeCover.close(),
      );
    }, { once: true });
  } else {
    musicToggle.hidden = false;
  }

  const name = guestName(location.search);
  if (name) {
    document.getElementById("guest-greeting").textContent = `Dear ${name},`;
    document.getElementById("cover-recipient").textContent = `For ${name}`;
  }

  const updateCountdown = () => {
    const now = Date.now();
    for (const [unit, value] of Object.entries(remainingTime(now))) {
      document.getElementById(unit).textContent = String(value).padStart(
        2,
        "0",
      );
    }
    if (now >= weddingDay) {
      document.getElementById("countdown-heading").textContent =
        now < weddingDay + 86_400_000
          ? "Today, our forever begins"
          : "A beautiful beginning, forever cherished";
    }
  };
  updateCountdown();
  setInterval(updateCountdown, 30_000);

  const selectDay = (day) => {
    document.querySelectorAll("[data-day]").forEach((item) => {
      const active = item.dataset.day === day;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
      document.getElementById(`day-${item.dataset.day}`).hidden = !active;
    });
  };
  document.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => selectDay(guestGroup === 1 ? button.dataset.day : "16"));
  });
  selectDay(guestGroup === 1 ? "15" : "16");

  if (
    "IntersectionObserver" in window &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.documentElement.classList.add("js-reveals");
    document
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element));
  }
}
