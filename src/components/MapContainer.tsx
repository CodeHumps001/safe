import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HazardReport, HazardType, SeverityLevel } from '../types';
import { HAZARD_CONFIG, SEVERITY_CONFIG } from '../utils/hazardConfig';
import { Navigation, MapPin, ZoomIn, ZoomOut, Layers, Eye, RefreshCw, Compass } from 'lucide-react';

interface MapContainerProps {
  reports: HazardReport[];
  selectedReport: HazardReport | null;
  onSelectReport: (report: HazardReport) => void;
  isReportingMode: boolean;
  reportingCoords: { lat: number; lng: number } | null;
  onSelectCoords: (coords: { lat: number; lng: number }) => void;
  activeRoute: { lat: number; lng: number }[] | null;
  routeSafetyGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  theme: 'light' | 'dark';
}

export default function MapContainer({
  reports,
  selectedReport,
  onSelectReport,
  isReportingMode,
  reportingCoords,
  onSelectCoords,
  activeRoute,
  routeSafetyGrade,
  theme
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userLocationMarkerRef = useRef<L.CircleMarker | null>(null);

  const [mapType, setMapType] = useState<'dark' | 'streets'>(theme === 'light' ? 'streets' : 'dark');

  useEffect(() => {
    setMapType(theme === 'light' ? 'streets' : 'dark');
  }, [theme]);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    pothole: true,
    flooded_road: true,
    accident: true,
    broken_traffic_light: true,
    broken_street_light: true,
    fallen_tree: true,
    construction: true,
    heavy_traffic: true,
    unsafe_area: true,
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const isReportingModeRef = useRef(isReportingMode);
  const onSelectCoordsRef = useRef(onSelectCoords);

  useEffect(() => {
    isReportingModeRef.current = isReportingMode;
  }, [isReportingMode]);

  useEffect(() => {
    onSelectCoordsRef.current = onSelectCoords;
  }, [onSelectCoords]);

  // Initialize Map
  useEffect(() => {
    const mapElement = document.getElementById('saferoute-leaflet-map-element');
    if (!mapElement || mapRef.current) return;

    // Accra center coordinates
    const defaultCenter: L.LatLngExpression = [5.6037, -0.1870];
    const initialZoom = 13;

    // Explicitly call L.map with confirmed DOM element id and setView
    const map = L.map('saferoute-leaflet-map-element', {
      zoomControl: false,
      attributionControl: false
    }).setView(defaultCenter, initialZoom);

    mapRef.current = map;

    // Default tile layer (CartoDB Dark Matter - looks extremely futuristic and high contrast)
    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 20,
    }).addTo(map);

    setMapLoaded(true);

    // Map click handling
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isReportingModeRef.current) {
        const { lat, lng } = e.latlng;
        onSelectCoordsRef.current({ lat, lng });
      }
    });

    let pulseIntervalId: any = null;

    // Detect user coordinates on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          
          // Draw user pulse on map
          if (mapRef.current) {
            const userPulse = L.circleMarker([latitude, longitude], {
              radius: 9,
              color: '#00A651', // Ghana green
              fillColor: '#00A651',
              fillOpacity: 0.9,
              weight: 3
            }).addTo(mapRef.current);

            // Pulse animation
            let growing = true;
            pulseIntervalId = setInterval(() => {
              if (!userPulse || !mapRef.current) return;
              try {
                const currentRadius = userPulse.getRadius();
                if (growing) {
                  userPulse.setRadius(currentRadius + 0.5);
                  if (currentRadius >= 13) growing = false;
                } else {
                  userPulse.setRadius(currentRadius - 0.5);
                  if (currentRadius <= 8) growing = true;
                }
              } catch (e) {
                // Ignore any Leaflet errors if unmounted
              }
            }, 100);

            userLocationMarkerRef.current = userPulse;
            mapRef.current.setView([latitude, longitude], 14);
          }
        },
        () => console.log('Location access declined.')
      );
    }

    return () => {
      if (pulseIntervalId) {
        clearInterval(pulseIntervalId);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle container resizing to fix Leaflet gray area bug
  useEffect(() => {
    if (!mapRef.current || !mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    // Initial timeout trigger for extra robustness
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [mapLoaded]);

  // Handle map type toggle
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear current layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (mapType === 'dark') {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, [mapType]);

  // Sync / Draw Active Hazards
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Clear old markers
    Object.keys(markersRef.current).forEach((key) => {
      map.removeLayer(markersRef.current[key]);
    });
    markersRef.current = {};

    reports.forEach((report) => {
      // Check filters
      if (!activeFilters[report.type]) return;

      const config = HAZARD_CONFIG[report.type];
      const severity = SEVERITY_CONFIG[report.severity];

      // Custom DivIcon with glowing badge depending on severity
      let pulseColor = config.color;
      if (report.severity === 'critical') pulseColor = '#EF4444';
      else if (report.severity === 'high') pulseColor = '#F97316';

      const iconHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 rounded-full bg-[${pulseColor}] opacity-30 animate-ping" style="animation-duration: 2s; background-color: ${pulseColor}"></div>
          <div class="relative w-8 h-8 rounded-full border border-white/20 shadow-xl flex items-center justify-center text-sm font-semibold text-white transition-transform hover:scale-110" 
               style="background-color: ${config.markerColor}; box-shadow: 0 4px 12px ${pulseColor}60">
            <span>${config.emoji}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-hazard-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(map);

      // Create interactive popup
      const popupContent = `
        <div class="p-1 max-w-[200px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-base">${config.emoji}</span>
            <span class="font-bold text-slate-100 text-sm leading-tight">${config.label}</span>
          </div>
          <p class="text-[11px] text-slate-300 line-clamp-2 mb-1.5 leading-snug">${report.description}</p>
          <div class="flex items-center justify-between gap-1 mt-1">
            <span class="text-[9px] px-1.5 py-0.5 rounded font-semibold" style="background-color: ${severity.color}20; color: ${severity.color}">
              ${severity.label}
            </span>
            <button id="view-pop-${report.id}" class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded hover:bg-emerald-500 hover:text-slate-950 transition-colors">
              Inspect details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false });
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-pop-${report.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectReport(report);
            map.closePopup();
          });
        }
      });

      markersRef.current[report.id] = marker;
    });
  }, [reports, activeFilters, mapLoaded]);

  // Center on Selected Report
  useEffect(() => {
    if (!mapRef.current || !selectedReport) return;
    mapRef.current.setView([selectedReport.latitude, selectedReport.longitude], 15);
    
    // Open popup programmatically
    const marker = markersRef.current[selectedReport.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedReport]);

  // Draw temporary pin during Reporting Mode
  useEffect(() => {
    if (!mapRef.current) return;

    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }

    if (isReportingMode && reportingCoords) {
      const redPinIcon = L.divIcon({
        className: 'temp-marker',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12">
            <div class="absolute inset-0 rounded-full bg-brand-gold opacity-40 animate-ping"></div>
            <div class="relative w-8 h-8 rounded-full bg-brand-gold border-2 border-white flex items-center justify-center shadow-2xl">
              <span class="text-slate-950 font-bold text-sm">📍</span>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      tempMarkerRef.current = L.marker([reportingCoords.lat, reportingCoords.lng], { icon: redPinIcon })
        .addTo(mapRef.current)
        .bindPopup('<div class="text-[11px] font-bold text-brand-gold">Reporting Spot Set!</div>')
        .openPopup();

      mapRef.current.setView([reportingCoords.lat, reportingCoords.lng], 15);
    }
  }, [isReportingMode, reportingCoords]);

  // Draw glowing Safety Route overlay (Express Commute analysis)
  useEffect(() => {
    if (!mapRef.current) return;

    if (routePolylineRef.current) {
      mapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.length > 0) {
      const latLngs = activeRoute.map(pt => [pt.lat, pt.lng] as L.LatLngTuple);
      
      // Determine glow color based on grade
      let routeColor = '#00A651'; // Green (A/B)
      if (routeSafetyGrade === 'C') routeColor = '#FCD116'; // Gold/Yellow
      if (routeSafetyGrade === 'D' || routeSafetyGrade === 'F') routeColor = '#CE1126'; // Red

      // Draw the beautiful glowing multi-stage route line
      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'safety-route-line shadow-lg'
      }).addTo(mapRef.current);

      routePolylineRef.current = polyline;

      // Fit bounds to show entire route neatly
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [activeRoute, routeSafetyGrade]);

  const handleLocateMe = () => {
    if (userCoords && mapRef.current) {
      mapRef.current.setView([userCoords.lat, userCoords.lng], 15);
    } else if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        mapRef.current?.setView([latitude, longitude], 15);
      });
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="w-full h-full relative" id="saferoute-map-container">
      {/* Real Leaflet Map mount */}
      <div id="saferoute-leaflet-map-element" ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0 bg-slate-900 rounded-3xl" />

      {/* Floating Header Overlay: Filters & Status */}
      <div className="absolute top-4 left-4 right-4 z-[10] flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* Map Style & Real-time Pulsing indicator */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 border border-white/10 px-3 py-2 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 mr-2 border-r border-white/10 pr-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold">Community Live</span>
          </div>
          
          <button
            onClick={() => setMapType(mapType === 'dark' ? 'streets' : 'dark')}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-medium"
            title="Toggle Map Style"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="capitalize">{mapType} Map</span>
          </button>
        </div>

        {/* Locate Me button */}
        <button
          onClick={handleLocateMe}
          className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
          title="Zoom to My Location"
        >
          <Compass className="w-5 h-5 animate-spin-slow" />
        </button>
      </div>

      {/* Floating Bottom Filter Panel (Collapsible Grid) */}
      <div className="absolute bottom-4 left-4 right-4 z-[10] pointer-events-none flex flex-col items-center">
        <div className="pointer-events-auto bg-slate-950/95 border border-white/10 rounded-2xl p-3 shadow-2xl max-w-2xl w-full backdrop-blur-md">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1">
            <Eye className="w-3.5 h-3.5" />
            Toggle road hazard visibility
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
            {Object.entries(HAZARD_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                  activeFilters[type]
                    ? 'border-white/10 bg-white/5 text-white shadow-sm'
                    : 'border-transparent bg-transparent text-slate-500 line-through'
                }`}
              >
                <span className="text-sm mb-0.5">{config.emoji}</span>
                <span className="text-[8px] font-semibold truncate w-full">{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route Scoring Overlay Indicator */}
      {activeRoute && (
        <div className="absolute top-20 right-4 z-[10] pointer-events-auto bg-slate-950/95 border border-white/10 p-4 rounded-2xl shadow-2xl max-w-xs backdrop-blur-md animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-2xl shadow-md ${
              routeSafetyGrade === 'A' || routeSafetyGrade === 'B'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : routeSafetyGrade === 'C'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            }`}>
              {routeSafetyGrade}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">AI Route Safety Score</div>
              <div className="text-[10px] text-slate-400 font-mono">Active tracking overlay loaded</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
