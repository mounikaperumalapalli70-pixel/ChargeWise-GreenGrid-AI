import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { STATIONS, formatNumber } from '../optimizer/engine';
import { StationData } from '../types';
import { Search, MapPin, Zap, Sun, Battery, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface SatelliteMapProps {
  selectedStationName: string;
  onSelectStation: (station: StationData) => void;
  onOpenInOptimizer: (station: StationData) => void;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  selectedStationName,
  onSelectStation,
  onOpenInOptimizer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ marker: L.CircleMarker; station: StationData }[]>([]);
  const layerGroupsRef = useRef<{
    st: L.LayerGroup;
    so: L.LayerGroup;
    gr: L.LayerGroup;
    ba: L.LayerGroup;
    fl: L.LayerGroup;
  } | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    stations: true,
    solar: true,
    grid: true,
    battery: true,
    flow: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  const [tileErrorNotice, setTileErrorNotice] = useState<string | null>(null);

  const activeStation =
    STATIONS.find((s) => s.n === selectedStationName) || STATIONS[0];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [16.51, 80.64],
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Base tile layers
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
          maxZoom: 19,
        }
      );

      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      );

      if (mapType === 'satellite') {
        satLayer.addTo(map);
      } else {
        streetLayer.addTo(map);
      }

      satLayer.on('tileerror', () => {
        if (mapType === 'satellite') {
          map.removeLayer(satLayer);
          streetLayer.addTo(map);
          setMapType('street');
          setTileErrorNotice(
            'Satellite imagery tiles temporarily delayed; fallback street map engaged.'
          );
        }
      });

      // Layer groups
      const lg = {
        st: L.layerGroup().addTo(map),
        so: L.layerGroup().addTo(map),
        gr: L.layerGroup().addTo(map),
        ba: L.layerGroup().addTo(map),
        fl: L.layerGroup().addTo(map),
      };
      layerGroupsRef.current = lg;
      markersRef.current = [];

      // Add station and infrastructure pins
      STATIONS.forEach((s) => {
        // Main Station marker
        const stMarker = L.circleMarker([s.lat, s.lng], {
          radius: 12,
          color: '#ffffff',
          fillColor: '#10b981',
          fillOpacity: 1,
          weight: 3,
        })
          .bindTooltip(
            `<div class="font-bold text-slate-900">${s.n}</div><div class="text-xs text-slate-600">${s.ch} Chargers · ${s.cap} kW</div>`,
            { direction: 'top', className: 'rounded-lg shadow-md px-2 py-1' }
          )
          .on('click', () => {
            onSelectStation(s);
            map.flyTo([s.lat, s.lng], 13, { duration: 1 });
          });

        stMarker.addTo(lg.st);
        markersRef.current.push({ marker: stMarker, station: s });

        // Solar Array companion marker
        const solPos: [number, number] = [s.lat + 0.007, s.lng + 0.007];
        L.circleMarker(solPos, {
          radius: 7,
          color: '#ffffff',
          fillColor: '#f59e0b',
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(`☀ ${s.n} Solar Array: ${s.solar} kW Peak`)
          .addTo(lg.so);

        // Battery Storage companion marker
        const batPos: [number, number] = [s.lat - 0.007, s.lng + 0.009];
        L.circleMarker(batPos, {
          radius: 6,
          color: '#ffffff',
          fillColor: '#8b5cf6',
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(`▣ Smart Battery Storage: 60 kWh`)
          .addTo(lg.ba);

        // Grid Connection marker
        const gridPos: [number, number] = [
          16.51 + (s.lat - 16.51) * 0.3 - 0.035,
          80.64 + (s.lng - 80.64) * 0.3 + 0.045,
        ];
        L.circleMarker(gridPos, {
          radius: 6,
          color: '#ffffff',
          fillColor: '#3b82f6',
          fillOpacity: 1,
          weight: 2,
        })
          .bindTooltip(`⚡ Regional Substation Feed (${s.grid} kW)`)
          .addTo(lg.gr);

        // Energy Flow Polylines with dash animation
        L.polyline([solPos, [s.lat, s.lng]], {
          color: '#fde047',
          weight: 3,
          dashArray: '6, 6',
          className: 'animate-energy-flow',
        }).addTo(lg.fl);

        L.polyline([gridPos, [s.lat, s.lng]], {
          color: '#60a5fa',
          weight: 3,
          dashArray: '6, 6',
          className: 'animate-energy-flow',
        }).addTo(lg.fl);
      });

      // Fly to active station initially
      map.setView([activeStation.lat, activeStation.lng], 12);
    } catch (err) {
      console.error('Leaflet initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layer visibility on toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupsRef.current;
    if (!map || !lg) return;

    if (activeLayers.stations) lg.st.addTo(map);
    else map.removeLayer(lg.st);

    if (activeLayers.solar) lg.so.addTo(map);
    else map.removeLayer(lg.so);

    if (activeLayers.grid) lg.gr.addTo(map);
    else map.removeLayer(lg.gr);

    if (activeLayers.battery) lg.ba.addTo(map);
    else map.removeLayer(lg.ba);

    if (activeLayers.flow) lg.fl.addTo(map);
    else map.removeLayer(lg.fl);
  }, [activeLayers]);

  // Handle station selection pan
  const handleSelectStation = (st: StationData) => {
    onSelectStation(st);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([st.lat, st.lng], 13, { duration: 1.2 });
    }
  };

  const freeChargers = Math.round(activeStation.ch * (1 - activeStation.occ));
  const estimatedWaitMin = activeStation.q
    ? Math.round((activeStation.q * 25) / Math.max(1, freeChargers))
    : 0;

  const filteredStations = STATIONS.filter((s) =>
    s.n.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station or campus…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mapType === 'satellite'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('street')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mapType === 'street'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Street Map
            </button>
          </div>
        </div>

        {/* Layer Checkboxes */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.stations}
              onChange={(e) =>
                setActiveLayers({ ...activeLayers, stations: e.target.checked })
              }
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Stations
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.solar}
              onChange={(e) =>
                setActiveLayers({ ...activeLayers, solar: e.target.checked })
              }
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Solar Arrays
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.grid}
              onChange={(e) =>
                setActiveLayers({ ...activeLayers, grid: e.target.checked })
              }
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Grid Feeds
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.battery}
              onChange={(e) =>
                setActiveLayers({ ...activeLayers, battery: e.target.checked })
              }
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Battery Storage
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.flow}
              onChange={(e) =>
                setActiveLayers({ ...activeLayers, flow: e.target.checked })
              }
              className="accent-emerald-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-4 border-t-2 border-dashed border-emerald-500" />
              Flow Lines
            </span>
          </label>
        </div>
      </div>

      {tileErrorNotice && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{tileErrorNotice}</span>
        </div>
      )}

      {/* Main Map + Inspector Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-2 relative h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick Station Switcher Pill Overlay */}
          <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            {filteredStations.map((s) => (
              <button
                key={s.n}
                onClick={() => handleSelectStation(s)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  s.n === activeStation.n
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s.n}
              </button>
            ))}
          </div>

          <div className="absolute bottom-2 left-3 z-[400] text-[10px] text-white/70 bg-slate-950/70 backdrop-blur-xs px-2 py-0.5 rounded">
            Simulated Campus Network Telemetry · Coordinate Reference WGS84
          </div>
        </div>

        {/* Station Inspector Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Station Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{activeStation.n}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Operational
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activeStation.locationName}</span>
                </div>
              </div>
            </div>

            {/* Station Real Photo / Render Thumbnail */}
            <div className="relative h-32 rounded-xl overflow-hidden mb-4 border border-slate-100 shadow-inner">
              <img
                src="/src/assets/images/station_hub_preview_1792766869942.jpg"
                alt="Station hub canopy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-medium text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Solar Canopy Active · {activeStation.solar} kW
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-500">Chargers Available</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {freeChargers} / {activeStation.ch}
                </div>
                <div className="text-[10px] text-slate-400">
                  {Math.round(activeStation.occ * activeStation.ch)} in use
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-500">Hub Capacity</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {activeStation.cap} kW
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeStation.grid} kW grid feed
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-500">Solar Generation</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">
                  {activeStation.solar} kW
                </div>
                <div className="text-[10px] text-emerald-600">Peak generation now</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-500">Waiting Queue</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                  {activeStation.q} EVs
                </div>
                <div className="text-[10px] text-slate-400">
                  ~{estimatedWaitMin} min estimated wait
                </div>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Charger Utilization</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatNumber(activeStation.occ * 100, 0)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeStation.occ * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onOpenInOptimizer(activeStation)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all cursor-pointer hover:shadow-md"
            >
              <span>Load Station in Optimizer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-slate-400">
              Configures {activeStation.ch} chargers, {activeStation.cap} kW, and local grid limit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
