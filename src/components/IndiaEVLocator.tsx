import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Search, MapPin, Zap, ExternalLink, Navigation, SlidersHorizontal, Sun, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, ChevronRight } from 'lucide-react';
import { INDIA_STATES, INDIA_EV_STATIONS } from '../data/indiaStationsData';
import { IndiaStation } from '../types';

interface IndiaEVLocatorProps {
  onLoadStationInOptimizer: (station: IndiaStation) => void;
}

export const IndiaEVLocator: React.FC<IndiaEVLocatorProps> = ({ onLoadStationInOptimizer }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter States
  const [selectedStateCode, setSelectedStateCode] = useState<string>('AP'); // Default to Andhra Pradesh as requested
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [selectedPowerSpeed, setSelectedPowerSpeed] = useState<string>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [solarOnly, setSolarOnly] = useState<boolean>(false);
  const [mapTileType, setMapTileType] = useState<'street' | 'satellite'>('street');

  // Selected station for details panel
  const [selectedStation, setSelectedStation] = useState<IndiaStation>(() => {
    return INDIA_EV_STATIONS.find((s) => s.state === 'Andhra Pradesh') || INDIA_EV_STATIONS[0];
  });

  // Extract unique networks for filter
  const networksList = useMemo(() => {
    const set = new Set<string>();
    INDIA_EV_STATIONS.forEach((s) => set.add(s.network));
    return Array.from(set).sort();
  }, []);

  // Filtered station list
  const filteredStations = useMemo(() => {
    return INDIA_EV_STATIONS.filter((st) => {
      // State filter
      if (selectedStateCode !== 'ALL') {
        const stateObj = INDIA_STATES.find((s) => s.code === selectedStateCode);
        if (stateObj && st.state.toLowerCase() !== stateObj.name.toLowerCase()) {
          return false;
        }
      }

      // Search query (name, city, address, network)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          st.name.toLowerCase().includes(q) ||
          st.city.toLowerCase().includes(q) ||
          st.address.toLowerCase().includes(q) ||
          st.network.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Connector filter
      if (selectedConnector !== 'all') {
        const hasConnector = st.connectors.some((c) =>
          c.standard.toLowerCase().includes(selectedConnector.toLowerCase())
        );
        if (!hasConnector) return false;
      }

      // Power speed filter
      if (selectedPowerSpeed === 'ultra' && st.totalPowerKw < 100) return false;
      if (selectedPowerSpeed === 'fast' && (st.totalPowerKw < 50 || st.totalPowerKw >= 100)) return false;
      if (selectedPowerSpeed === 'standard' && st.totalPowerKw >= 50) return false;

      // Network filter
      if (selectedNetwork !== 'all' && st.network !== selectedNetwork) return false;

      // Solar only filter
      if (solarOnly && !st.isSolarPowered) return false;

      return true;
    });
  }, [selectedStateCode, searchQuery, selectedConnector, selectedPowerSpeed, selectedNetwork, solarOnly]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Find initial center based on selected state
      const initialCenter: [number, number] = [16.5062, 80.648]; // Vijayawada, AP
      const initialZoom = 8;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | India EV Registry (CEEW & BEE Data)',
        maxZoom: 19,
      });

      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      });

      if (mapTileType === 'satellite') {
        satLayer.addTo(map);
      } else {
        streetLayer.addTo(map);
      }

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
    } catch (e) {
      console.error('Failed to initialize India Leaflet map:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapTileType]);

  // Update map markers when filtered list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredStations.forEach((st) => {
      const isSelected = selectedStation?.id === st.id;
      const isSolar = st.isSolarPowered;
      const isFast = st.totalPowerKw >= 60;

      // Circle marker with custom styling
      const marker = L.circleMarker([st.lat, st.lng], {
        radius: isSelected ? 12 : isFast ? 9 : 7,
        color: '#ffffff',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#10b981' : isSolar ? '#f59e0b' : isFast ? '#059669' : '#3b82f6',
        fillOpacity: 1,
      });

      // Tooltip
      marker.bindTooltip(
        `<div class="p-1 font-sans">
          <div class="font-bold text-xs text-slate-900">${st.name}</div>
          <div class="text-[10px] text-slate-600">${st.city}, ${st.state} · ${st.totalPowerKw} kW</div>
        </div>`,
        { direction: 'top', className: 'rounded-xl shadow-md border-0' }
      );

      marker.on('click', () => {
        setSelectedStation(st);
        map.flyTo([st.lat, st.lng], Math.max(map.getZoom(), 13), { duration: 0.8 });
      });

      marker.addTo(markersGroup);
    });

    // If state changed and has center, zoom to state
    if (selectedStateCode !== 'ALL') {
      const stateObj = INDIA_STATES.find((s) => s.code === selectedStateCode);
      if (stateObj) {
        map.flyTo(stateObj.center, stateObj.zoom, { duration: 1.2 });
      }
    } else if (filteredStations.length > 0) {
      // Zoom to bounds of stations if all India
      const latLngs = filteredStations.map((s) => [s.lat, s.lng] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [filteredStations, selectedStation, selectedStateCode]);

  // Handle station click from sidebar list
  const handleSelectStationFromList = (st: IndiaStation) => {
    setSelectedStation(st);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([st.lat, st.lng], 14, { duration: 1.2 });
    }
  };

  // Open Google Maps Directions
  const handleOpenDirections = (st: IndiaStation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">India EV Charging Network Locator</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Verified Public Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real geographic coordinates, fast DC connector standards, and charging infrastructure across all Indian states and highway corridors.
          </p>
        </div>

        {/* State Quick Selector & Tile Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMapTileType('street')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mapTileType === 'street' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapTileType('satellite')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mapTileType === 'satellite' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, city, or route…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* State / UT Dropdown */}
          <div>
            <select
              value={selectedStateCode}
              onChange={(e) => setSelectedStateCode(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All India (Nationwide)</option>
              {INDIA_STATES.map((st) => {
                const count = INDIA_EV_STATIONS.filter((s) => s.state.toLowerCase() === st.name.toLowerCase()).length;
                return (
                  <option key={st.code} value={st.code}>
                    {st.name} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Connector Standard Filter */}
          <div>
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="all">All Connector Types</option>
              <option value="CCS-2">CCS-2 (Fast DC 50–120 kW)</option>
              <option value="Type 2 AC">Type 2 AC (7.4–22 kW)</option>
              <option value="Bharat DC">Bharat DC-001 (15 kW)</option>
              <option value="Ather">Ather LEV / 2-Wheeler</option>
            </select>
          </div>

          {/* Power Speed Filter */}
          <div>
            <select
              value={selectedPowerSpeed}
              onChange={(e) => setSelectedPowerSpeed(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="all">All Charging Speeds</option>
              <option value="ultra">Ultra-Fast (≥ 100 kW)</option>
              <option value="fast">Fast DC (50–99 kW)</option>
              <option value="standard">Standard AC (&lt; 50 kW)</option>
            </select>
          </div>

          {/* Network Filter */}
          <div>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="all">All Networks ({networksList.length})</option>
              {networksList.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State Quick Chips & Filter Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
            {['AP', 'TS', 'KA', 'MH', 'TN', 'DL', 'GJ', 'ALL'].map((code) => {
              const label =
                code === 'ALL'
                  ? 'All India'
                  : code === 'AP'
                  ? 'Andhra Pradesh'
                  : code === 'TS'
                  ? 'Telangana'
                  : code === 'KA'
                  ? 'Karnataka'
                  : code === 'MH'
                  ? 'Maharashtra'
                  : code === 'TN'
                  ? 'Tamil Nadu'
                  : code === 'DL'
                  ? 'Delhi NCR'
                  : 'Gujarat';
              const isActive = selectedStateCode === code;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedStateCode(code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={solarOnly}
                onChange={(e) => setSolarOnly(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Solar-Powered Only</span>
              </span>
            </label>

            <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {filteredStations.length} Stations Found
            </span>
          </div>
        </div>
      </div>

      {/* Main Map + Station Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Station List Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3 max-h-[620px] overflow-y-auto pr-1">
          {filteredStations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No charging stations match your criteria</div>
              <p className="text-xs text-slate-500">
                Try clearing search terms or selecting a different Indian state.
              </p>
              <button
                onClick={() => {
                  setSelectedStateCode('ALL');
                  setSearchQuery('');
                  setSelectedConnector('all');
                  setSelectedPowerSpeed('all');
                  setSelectedNetwork('all');
                  setSolarOnly(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredStations.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStationFromList(st)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
                        {st.network}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                        {st.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700 shrink-0">
                      {st.totalPowerKw} kW
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{st.city}, {st.state}</span>
                  </div>

                  {/* Connectors tag strip */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {st.connectors.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700"
                      >
                        {c.count}× {c.standard} ({c.powerKw} kW)
                      </span>
                    ))}
                    {st.isSolarPowered && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 flex items-center gap-0.5">
                        <Sun className="w-2.5 h-2.5" />
                        Solar
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Center & Right: Map & Details Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Leaflet Map Stage */}
          <div className="relative h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Map Legend & Coordinates Info Overlay */}
            <div className="absolute bottom-2 left-3 z-[400] text-[10px] text-white/80 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>DC Fast (&gt; 50kW)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Solar Hub</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>AC Standard</span>
              </span>
            </div>
          </div>

          {/* Selected Station Detailed Inspector Card */}
          {selectedStation && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedStation.network}
                    </span>
                    {selectedStation.isSolarPowered && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        Solar Microgrid Integration
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedStation.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                    {selectedStation.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedStation.address}</span>
                  </div>
                </div>

                {/* Primary CTA Buttons: Directions & Optimizer Bridge */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenDirections(selectedStation)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onLoadStationInOptimizer(selectedStation)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Optimize for this Hub</span>
                  </button>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Total Power Capacity</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {selectedStation.totalPowerKw} kW
                  </div>
                  <div className="text-[10px] text-slate-400">Peak deliverable output</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Standard Pricing</div>
                  <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                    {selectedStation.pricing}
                  </div>
                  <div className="text-[10px] text-slate-400">Public tariff rate</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Operating Hours</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {selectedStation.hours}
                  </div>
                  <div className="text-[10px] text-slate-400">Daily availability</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Coordinates</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-1">
                    {selectedStation.lat.toFixed(4)}°, {selectedStation.lng.toFixed(4)}°
                  </div>
                  <div className="text-[10px] text-slate-400">WGS84 GPS reference</div>
                </div>
              </div>

              {/* Connectors Detailed Specs */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-2">Available Connectors & Charging Bays</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedStation.connectors.map((c, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{c.standard}</div>
                        <div className="text-[10px] text-slate-500">{c.count} Dedicated Bay(s)</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        {c.powerKw} kW
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities & Provenance Info */}
              {selectedStation.amenities && selectedStation.amenities.length > 0 && (
                <div className="pt-4 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 mr-1">On-Site Amenities:</span>
                  {selectedStation.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
