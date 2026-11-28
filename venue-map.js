export async function initVenueMap(container, venues, group) {
  await import("./assets/vendor/leaflet/leaflet.js");
  const L = window.L;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const keys = group === 3 ? ["wedding"] : ["hotel", "wedding"];
  const block = container.closest(".venue-map-block");
  const status = block.querySelector(".map-status");
  const buttons = [...block.querySelectorAll("[data-map-focus]")];
  const map = L.map(container, {
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    zoomAnimation: !reducedMotion,
    fadeAnimation: !reducedMotion,
    markerZoomAnimation: !reducedMotion,
  });
  map.attributionControl.setPrefix(false);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).on("tileerror", () => {
    status.textContent = "Map details are unavailable. The venue pins and Google Maps links still work.";
  }).addTo(map);

  const bounds = L.latLngBounds(keys.map((key) => venues[key].coordinates));
  const fitVenues = () => map.fitBounds(bounds, { padding: [50, 45], maxZoom: group === 3 ? 15 : 13 });
  fitVenues();
  const markers = {};
  const focusVenue = (key) => {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mapFocus === key)));
    if (key === "all") {
      map.closePopup();
      fitVenues();
    } else {
      map.flyTo(venues[key].coordinates, 15, { duration: 1, animate: !reducedMotion });
      markers[key].openPopup();
    }
  };
  for (const key of keys) {
    const venue = venues[key];
    const link = document.createElement("a");
    link.href = venue.url;
    link.textContent = `${venue.name} ↗`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    markers[key] = L.marker(venue.coordinates, {
      title: venue.name,
      alt: venue.name,
      icon: L.divIcon({
        className: `venue-pin venue-pin-${key}`,
        html: `<span>${key === "hotel" ? "H" : "SA"}</span>`,
        iconSize: [38, 46],
        iconAnchor: [19, 44],
        popupAnchor: [0, -38],
      }),
    }).addTo(map).bindPopup(link, { maxWidth: 230, autoPan: false });
    markers[key].getElement().setAttribute("aria-label", venue.name);
    markers[key].on("click", () => focusVenue(key));
  }
  buttons.forEach((button) => button.addEventListener("click", () => focusVenue(button.dataset.mapFocus)));
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mapFocus === (group === 3 ? "wedding" : "all"))));
  status.textContent = "Tap a pin or choose a venue to explore. Open its name for Google Maps.";

  if (group !== 3) {
    try {
      const response = await fetch("assets/venue-connection.geojson");
      if (!response.ok) throw new Error("Connection unavailable");
      L.geoJSON(await response.json(), {
        style: { color: "#822d46", weight: 3, opacity: 0.8, dashArray: "6 10", className: "venue-route" },
        interactive: false,
      }).addTo(map);
    } catch {
      // The venue pins and Google Maps links remain usable without the connection.
    }
  }
}
