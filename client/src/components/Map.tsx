/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - "map-attached" → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - "standalone" → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - "data-only" → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

// Extend the Window type so TypeScript knows about the google.maps global
// that is injected dynamically by the Maps script tag.
declare global {
  interface Window {
    google?: typeof google;
  }
}

// Forge proxy is used instead of calling the Google Maps API directly so the
// API key stays server-side and usage can be tracked/rate-limited.
const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
// All Google Maps API requests are routed through this Forge proxy URL.
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

/**
 * Dynamically injects the Google Maps JavaScript API script tag.
 * Loads the marker, places, geocoding, and geometry libraries at once.
 * Returns a Promise that resolves when the script has finished loading.
 * The script element is removed from the DOM after load to keep things tidy
 * (the global `google` object persists in memory regardless).
 */
function loadMapScript() {
  return new Promise(resolve => {
    const script = document.createElement("script");
    // All four libraries are loaded in one request to minimise round trips.
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
      script.remove(); // Clean up immediately – google global is already available.
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

// Props accepted by the MapView component.
interface MapViewProps {
  className?: string;
  /** Latitude/longitude to centre the map on initially. */
  initialCenter?: google.maps.LatLngLiteral;
  /** Default zoom level (1 = world, 20 = building). */
  initialZoom?: number;
  /**
   * Called after the map has been created and is ready to use.
   * Store the map instance in a ref to control it from the parent.
   */
  onMapReady?: (map: google.maps.Map) => void;
}

/**
 * Renders an embedded Google Map inside a div container.
 * The map script is loaded lazily on mount so it does not delay the initial page load.
 *
 * @example
 * const mapRef = useRef<google.maps.Map | null>(null);
 * <MapView initialCenter={{ lat: 33.5731, lng: -7.5898 }} onMapReady={m => mapRef.current = m} />
 */
export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  // Ref to the DOM element that Google Maps will render into.
  const mapContainer = useRef<HTMLDivElement>(null);
  // Ref to the google.maps.Map instance so it persists without causing re-renders.
  const map = useRef<google.maps.Map | null>(null);

  // Stable async initialiser – loads the script and then creates the map instance.
  const init = usePersistFn(async () => {
    // Wait for the Google Maps script to finish loading.
    await loadMapScript();
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    // Instantiate the Google Map inside the container div.
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID", // Required for Advanced Markers API.
    });
    // Notify the parent so it can attach markers or other overlays.
    if (onMapReady) {
      onMapReady(map.current);
    }
  });

  // Initialise the map once after the component mounts.
  useEffect(() => {
    init();
  }, [init]);

  // The map renders inside this div. The height can be customised via className.
  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
