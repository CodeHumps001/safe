import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { HazardReport } from "../types";
import { HAZARD_CONFIG, SEVERITY_CONFIG } from "../utils/hazardConfig";
import { Layers, Eye, Compass } from "lucide-react";

// Fix default marker icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapContainerProps {
  reports: HazardReport[];
  selectedReport: HazardReport | null;
  onSelectReport: (report: HazardReport) => void;
  isReportingMode: boolean;
  reportingCoords: { lat: number; lng: number } | null;
  onSelectCoords: (coords: { lat: number; lng: number }) => void;
  activeRoute: { lat: number; lng: number }[] | null;
  routeSafetyGrade?: "A" | "B" | "C" | "D" | "F";
}

// All hazard type keys — must match exactly what's in HAZARD_CONFIG
const ALL_HAZARD_TYPES = [
  "pothole",
  "flooded_road",
  "accident",
  "broken_traffic_light",
  "broken_street_light",
  "fallen_tree",
  "construction",
  "heavy_traffic",
  "unsafe_area",
] as const;

type FilterState = Record<(typeof ALL_HAZARD_TYPES)[number], boolean>;

export default function MapContainer({
  reports,
  selectedReport,
  onSelectReport,
  isReportingMode,
  reportingCoords,
  onSelectCoords,
  activeRoute,
  routeSafetyGrade,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<"dark" | "streets">("dark");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [activeFilters, setActiveFilters] = useState<FilterState>(
    ALL_HAZARD_TYPES.reduce(
      (acc, t) => ({ ...acc, [t]: true }),
      {} as FilterState,
    ),
  );

  // Keep refs in sync so map event callbacks always read latest values
  const isReportingModeRef = useRef(isReportingMode);
  const onSelectCoordsRef = useRef(onSelectCoords);
  useEffect(() => {
    isReportingModeRef.current = isReportingMode;
  }, [isReportingMode]);
  useEffect(() => {
    onSelectCoordsRef.current = onSelectCoords;
  }, [onSelectCoords]);

  // ─── Init Map (runs once) ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [5.6037, -0.187],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Add zoom control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark tile layer
      const darkTiles = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        { maxZoom: 20 },
      ).addTo(map);
      tileLayerRef.current = darkTiles;

      // Force correct size after mount
      setTimeout(() => map.invalidateSize(), 150);

      setMapLoaded(true);

      // Click to place pin in reporting mode
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (isReportingModeRef.current) {
          onSelectCoordsRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      // Geolocation
      let pulseId: ReturnType<typeof setInterval> | null = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude: lat, longitude: lng } = coords;
            setUserCoords({ lat, lng });

            const dot = L.circleMarker([lat, lng], {
              radius: 9,
              color: "#00A651",
              fillColor: "#00A651",
              fillOpacity: 0.9,
              weight: 3,
            }).addTo(map);

            let growing = true;
            pulseId = setInterval(() => {
              try {
                const r = dot.getRadius();
                if (growing) {
                  dot.setRadius(r + 0.5);
                  if (r >= 13) growing = false;
                } else {
                  dot.setRadius(r - 0.5);
                  if (r <= 8) growing = true;
                }
              } catch {
                /* map unmounted */
              }
            }, 100);

            map.setView([lat, lng], 14);
          },
          () => {
            /* permission denied — silent */
          },
        );
      }

      return () => {
        if (pulseId) clearInterval(pulseId);
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error("Map init error:", err);
      setMapError("Failed to initialise map. Please refresh.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handle container resize ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapContainerRef.current) return;
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
    ro.observe(mapContainerRef.current);
    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [mapLoaded]);

  // ─── Swap tile layer when mapType changes ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    const url =
      mapType === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    tileLayerRef.current = L.tileLayer(url, { maxZoom: 20 }).addTo(
      mapRef.current,
    );
  }, [mapType]);

  // ─── Draw / sync hazard markers ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove all existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    reports.forEach((report) => {
      if (!activeFilters[report.type as (typeof ALL_HAZARD_TYPES)[number]])
        return;

      // Gracefully fall back if config key doesn't exist
      const config = (HAZARD_CONFIG as any)[report.type];
      const severity = (SEVERITY_CONFIG as any)[report.severity];
      if (!config || !severity) return;

      const pulseColor =
        report.severity === "critical"
          ? "#EF4444"
          : report.severity === "high"
            ? "#F97316"
            : config.color;

      const icon = L.divIcon({
        className: "custom-hazard-marker",
        html: `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;background-color:${pulseColor};opacity:0.3;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative;width:32px;height:32px;border-radius:50%;background-color:${config.markerColor};border:1.5px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 12px ${pulseColor}60;">
              ${config.emoji}
            </div>
          </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([report.latitude, report.longitude], {
        icon,
      }).addTo(map);

      const popupHtml = `
        <div style="padding:4px;max-width:200px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="font-size:16px;">${config.emoji}</span>
            <span style="font-weight:700;color:#f1f5f9;font-size:13px;">${config.label}</span>
          </div>
          <p style="font-size:11px;color:#94a3b8;margin:0 0 8px;line-height:1.4;">${report.description}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${severity.color}20;color:${severity.color};font-weight:600;">
              ${severity.label}
            </span>
            <button id="view-btn-${report.id}" style="font-size:10px;font-weight:700;color:#34d399;background:rgba(52,211,153,0.1);border:none;padding:3px 8px;border-radius:4px;cursor:pointer;">
              View details
            </button>
          </div>
        </div>`;

      marker.bindPopup(popupHtml, { closeButton: false });
      marker.on("popupopen", () => {
        document
          .getElementById(`view-btn-${report.id}`)
          ?.addEventListener("click", () => {
            onSelectReport(report);
            map.closePopup();
          });
      });

      markersRef.current[report.id] = marker;
    });
  }, [reports, activeFilters, mapLoaded, onSelectReport]);

  // ─── Pan to selected report ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedReport) return;
    mapRef.current.setView(
      [selectedReport.latitude, selectedReport.longitude],
      15,
    );
    markersRef.current[selectedReport.id]?.openPopup();
  }, [selectedReport]);

  // ─── Temp pin while in reporting mode ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
    if (!isReportingMode || !reportingCoords) return;

    const icon = L.divIcon({
      className: "temp-marker",
      html: `
        <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;border-radius:50%;background-color:#FCD116;opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative;width:32px;height:32px;border-radius:50%;background:#FCD116;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 16px rgba(252,209,22,0.5);">
            📍
          </div>
        </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    tempMarkerRef.current = L.marker(
      [reportingCoords.lat, reportingCoords.lng],
      { icon },
    )
      .addTo(mapRef.current)
      .bindPopup(
        '<div style="color:#FCD116;font-weight:700;font-size:11px;">Pin set! Tap Submit in the form.</div>',
      )
      .openPopup();

    mapRef.current.setView([reportingCoords.lat, reportingCoords.lng], 15);
  }, [isReportingMode, reportingCoords]);

  // ─── Safety route polyline ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (routePolylineRef.current) {
      mapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    if (!activeRoute || activeRoute.length === 0) return;

    const color =
      routeSafetyGrade === "C"
        ? "#FCD116"
        : routeSafetyGrade === "D" || routeSafetyGrade === "F"
          ? "#CE1126"
          : "#00A651";

    routePolylineRef.current = L.polyline(
      activeRoute.map((p) => [p.lat, p.lng] as L.LatLngTuple),
      { color, weight: 6, opacity: 0.85, lineCap: "round", lineJoin: "round" },
    ).addTo(mapRef.current);

    mapRef.current.fitBounds(
      L.latLngBounds(activeRoute.map((p) => [p.lat, p.lng] as L.LatLngTuple)),
      { padding: [50, 50] },
    );
  }, [activeRoute, routeSafetyGrade]);

  const handleLocateMe = () => {
    if (userCoords && mapRef.current) {
      mapRef.current.setView([userCoords.lat, userCoords.lng], 15);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        mapRef.current?.setView([coords.latitude, coords.longitude], 15);
      });
    }
  };

  // ─── Error state ─────────────────────────────────────────────────────────
  if (mapError) {
    return (
      <div className="w-full h-full rounded-3xl bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-lg font-semibold">Map failed to load</p>
          <p className="text-sm text-slate-400 mt-1">{mapError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-amber-400 text-slate-900 rounded-xl font-bold hover:bg-amber-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full relative" id="saferoute-map-container">
      {/* Leaflet mount point — must be position:absolute to fill parent */}
      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          borderRadius: "24px",
          background: "#050506",
        }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            borderRadius: "24px",
          }}
          className="bg-slate-900 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-medium">Loading map…</p>
          </div>
        </div>
      )}

      {/* Top bar: live indicator + map style toggle + locate button */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
        className="flex items-center justify-between gap-2 pointer-events-none"
      >
        {/* Left: live badge + layer toggle */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-2 rounded-2xl shadow-xl backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold border-r border-white/10 pr-2 mr-1">
            Community Live
          </span>
          <button
            onClick={() => setMapType(mapType === "dark" ? "streets" : "dark")}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="capitalize">{mapType}</span>
          </button>
        </div>

        {/* Right: locate me */}
        <button
          onClick={handleLocateMe}
          className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Route safety grade badge */}
      {activeRoute && routeSafetyGrade && (
        <div
          style={{ position: "absolute", top: 72, right: 16, zIndex: 10 }}
          className="pointer-events-auto bg-slate-950/95 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in-up"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl border ${
                routeSafetyGrade === "A" || routeSafetyGrade === "B"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : routeSafetyGrade === "C"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
              }`}
            >
              {routeSafetyGrade}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">
                AI Route Safety
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Active route overlay
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom: hazard type filter panel */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
        className="flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-2xl w-full max-w-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 pb-1 border-b border-white/5">
            <Eye className="w-3.5 h-3.5" />
            Toggle hazard visibility
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
            {ALL_HAZARD_TYPES.map((type) => {
              const config = (HAZARD_CONFIG as any)[type];
              if (!config) return null;
              return (
                <button
                  key={type}
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      [type]: !prev[type],
                    }))
                  }
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                    activeFilters[type]
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-transparent bg-transparent text-slate-500 opacity-40"
                  }`}
                >
                  <span className="text-sm mb-0.5">{config.emoji}</span>
                  <span className="text-[8px] font-semibold truncate w-full text-center leading-tight">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
