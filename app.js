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

if (typeof document !== "undefined") {
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
      welcomeCover.classList.add("is-opening");
      setTimeout(() => welcomeCover.close(),
        matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1800);
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

  document.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-day]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
        document.getElementById(`day-${item.dataset.day}`).hidden = !active;
      });
    });
  });

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
