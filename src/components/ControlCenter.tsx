import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Zap,
  Car,
  Activity,
  BarChart2,
  Sliders,
  FileText,
  Settings as SettingsIcon,
  Home,
  Plus,
  Trash2,
  Download,
  Printer,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Sun,
  Shield,
  Clock,
  Battery,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  OptimizerState,
  PRESETS,
  STATIONS,
  TOTAL_SLOTS,
  formatSlotTime,
  formatNumber,
  calculateRequiredEnergy,
  createEV,
  validateInputs,
  DualComparison,
} from '../optimizer/engine';
import { StationData, ScenarioHistoryEntry, EV } from '../types';
import { SatelliteMap } from './SatelliteMap';

interface ControlCenterProps {
  state: OptimizerState;
  setState: React.Dispatch<React.SetStateAction<OptimizerState>>;
  comparison: DualComparison;
  onOptimize: () => void;
  onGoToLanding: () => void;
  onReplayIntro: () => void;
  scenarioHistory: ScenarioHistoryEntry[];
  setScenarioHistory: React.Dispatch<React.SetStateAction<ScenarioHistoryEntry[]>>;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  state,
  setState,
  comparison,
  onOptimize,
  onGoToLanding,
  onReplayIntro,
  scenarioHistory,
  setScenarioHistory,
  activeNavTab,
  setActiveNavTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const o = comparison.o;
  const b = comparison.b;
  const validationErrors = validateInputs(state);

  const handlePresetSelect = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setState((prev) => ({
      ...prev,
      sc: presetKey,
      solar: p.pk ? Array.from({ length: TOTAL_SLOTS }, (_, t) =>
        Math.max(0, Math.round(p.pk * Math.sin((Math.PI * (t + 0.5)) / TOTAL_SLOTS)))
      ) : prev.solar,
      grid: p.grid,
      n: p.n,
      cp: p.cp,
      sS: 1.0,
      pm: 1.0,
      evs: JSON.parse(JSON.stringify(p.evs)),
      msg: '',
    }));
  };

  const handleAddEV = (isUrgent = false) => {
    const num = state.evs.length + 1;
    const newEV: EV = isUrgent
      ? createEV(`URG-${num}`, 60, 10, 80, 4, 7, 22)
      : createEV(`EV-${num < 10 ? '0' : ''}${num}`, 60, 25, 80, 2, 10, 22);

    setState((prev) => ({
      ...prev,
      evs: [...prev.evs, newEV],
    }));
  };

  const handleUpdateEV = (index: number, key: keyof EV, value: string | number) => {
    setState((prev) => {
      const copy = [...prev.evs];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, evs: copy };
    });
  };

  const handleRemoveEV = (index: number) => {
    setState((prev) => {
      const copy = prev.evs.filter((_, i) => i !== index);
      return { ...prev, evs: copy };
    });
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['Timestamp', 'Scenario', 'Cost (Baseline/Opt ₹)', 'Solar Utilized (kWh)', 'Peak Grid (kW)', 'Targets Met', 'Unmet Energy (kWh)'],
      ...scenarioHistory.map((h) => [h.t, h.s, h.c, h.so, h.p, h.m, h.u]),
    ];

    if (rows.length < 2) {
      rows.push([
        new Date().toLocaleTimeString(),
        state.sc,
        `${formatNumber(b.m.cost, 0)} / ${formatNumber(o.m.cost, 0)}`,
        `${formatNumber(b.m.solar)} / ${formatNumber(o.m.solar)}`,
        `${formatNumber(b.m.peak)} / ${formatNumber(o.m.peak)}`,
        `${b.m.succ} / ${o.m.succ}`,
        `${formatNumber(b.m.unmet)} / ${formatNumber(o.m.unmet)}`,
      ]);
    }

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chargewise_grid_optimization_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Satellite Intelligence', icon: Compass },
    { id: 'opt', label: 'Charging Optimizer', icon: Zap },
    { id: 'fleet', label: 'EV Fleet', icon: Car },
    { id: 'energy', label: 'Energy Flow', icon: Activity },
    { id: 'impact', label: 'Impact Analytics', icon: BarChart2 },
    { id: 'scen', label: 'Scenarios & What-if', icon: Sliders },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Helper for SVG Sparkline Chart
  const renderLineChart = (
    series: { name: string; color: string; data: number[] }[],
    height = 180
  ) => {
    const W = 580;
    const allValues = series.flatMap((s) => s.data);
    const maxVal = Math.max(1, ...allValues) * 1.15;

    const x = (i: number) => 36 + (i * (W - 50)) / (series[0]?.data.length - 1 || 1);
    const y = (v: number) => height - 24 - (v / maxVal) * (height - 38);

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto overflow-visible" role="img">
          {/* Grid lines */}
          <line x1="36" x2={W} y1={height - 24} y2={height - 24} stroke="#e2e8f0" strokeWidth="1" />
          <line x1="36" x2={W} y1={y(maxVal * 0.5)} y2={y(maxVal * 0.5)} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="36" x2={W} y1={y(maxVal)} y2={y(maxVal)} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {/* Left Y Labels */}
          <text x="4" y={y(maxVal) + 4} fontSize="9" fill="#94a3b8" className="font-mono">
            {Math.round(maxVal)}
          </text>
          <text x="4" y={y(maxVal * 0.5) + 4} fontSize="9" fill="#94a3b8" className="font-mono">
            {Math.round(maxVal * 0.5)}
          </text>
          <text x="12" y={height - 20} fontSize="9" fill="#94a3b8" className="font-mono">
            0
          </text>

          {/* Lines */}
          {series.map((s, idx) => {
            const points = s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
            return (
              <polyline
                key={idx}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            );
          })}

          {/* Bottom X Time Labels */}
          {series[0]?.data.map((_, i) =>
            i % 2 === 0 ? (
              <text key={i} x={x(i) - 12} y={height - 6} fontSize="9" fill="#94a3b8" className="font-mono">
                {formatSlotTime(i)}
              </text>
            ) : null
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 mt-2">
          {series.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
          <span className="text-[11px] text-slate-400 font-mono ml-auto">Units: kW</span>
        </div>
      </div>
    );
  };

  // Helper for Comparison Table
  const renderComparisonTable = () => {
    const ob = b.m;
    const oo = o.m;
    const evCount = state.evs.length;

    const row = (
      label: string,
      bv: number,
      ov: number,
      unit: string,
      lowerIsBetter = true
    ) => {
      const isBetter = lowerIsBetter ? ov < bv : ov > bv;
      const isSame = Math.abs(ov - bv) < 1e-4;
      const pct = bv !== 0 ? (((ov - bv) / bv) * 100).toFixed(1) + '%' : '0.0%';

      return (
        <tr className="border-b border-slate-100 text-xs">
          <td className="py-2.5 px-3 font-medium text-slate-700">{label}</td>
          <td className="py-2.5 px-3 font-mono text-slate-600">
            {formatNumber(bv)} {unit}
          </td>
          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
            {formatNumber(ov)} {unit}
          </td>
          <td className="py-2.5 px-3">
            {isSame ? (
              <span className="text-slate-400 font-mono">No change</span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                  isBetter ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isBetter ? '✓' : '▲'} {pct}
              </span>
            )}
          </td>
        </tr>
      );
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3">Metric</th>
              <th className="py-2 px-3">Baseline (FCFS)</th>
              <th className="py-2 px-3">Optimized (ChargeWise)</th>
              <th className="py-2 px-3">Improvement</th>
            </tr>
          </thead>
          <tbody>
            {row('Electricity Cost', ob.cost, oo.cost, '₹', true)}
            {row('Solar Energy Consumed', ob.solar, oo.solar, 'kWh', false)}
            {row('Grid Energy Imported', ob.grid, oo.grid, 'kWh', true)}
            {row('Peak Grid Draw', ob.peak, oo.peak, 'kW', true)}
            {row('Deadlines Fulfilled', ob.succ, oo.succ, `/${evCount}`, false)}
            {row('Unmet Energy Deficit', ob.unmet, oo.unmet, 'kWh', true)}
            {row('Fairness (Jain Index)', ob.fair, oo.fair, '', false)}
            {state.bt.on ? row('Battery Delivered to EVs', ob.bat, oo.bat, 'kWh', false) : null}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper for Timeline Schedule Visual Matrix
  const renderScheduleTimeline = (res: typeof o, title: string) => {
    return (
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">{title}</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-2 px-3 text-left font-bold text-slate-800">Vehicle</th>
                {Array.from({ length: TOTAL_SLOTS }, (_, t) => (
                  <th key={t} className="py-1 px-1.5 text-center font-normal min-w-[34px]">
                    {formatSlotTime(t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.evs.map((e, evIdx) => (
                <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-bold font-mono text-slate-800 whitespace-nowrap">
                    {e.id}
                  </td>
                  {Array.from({ length: TOTAL_SLOTS }, (_, t) => {
                    const alloc = res.sch[evIdx]?.[t];
                    const isPresent = e.arr <= t && t < e.dep;
                    const isDeparture = t === e.dep - 1;

                    let bgClass = 'bg-transparent';
                    let label = '';
                    let titleTooltip = `Window: ${formatSlotTime(e.arr)} - ${formatSlotTime(e.dep)}`;

                    if (alloc) {
                      label = Math.round(alloc.p).toString();
                      if (alloc.sf > 0.95) {
                        bgClass = 'bg-emerald-400 text-slate-950 font-bold';
                        titleTooltip = `${formatNumber(alloc.p)} kW (100% Solar)`;
                      } else if (alloc.sf + alloc.bf < 0.05) {
                        bgClass = 'bg-blue-400 text-white font-bold';
                        titleTooltip = `${formatNumber(alloc.p)} kW (Grid Import)`;
                      } else {
                        bgClass = 'bg-teal-400 text-slate-950 font-bold';
                        titleTooltip = `${formatNumber(alloc.p)} kW (${formatNumber(alloc.sf * 100, 0)}% Solar)`;
                      }
                    } else if (isPresent && res.rem[evIdx] > 1e-6) {
                      bgClass = 'bg-slate-100 text-slate-400';
                      titleTooltip = 'Waiting for slot / throttled';
                    }

                    return (
                      <td
                        key={t}
                        className={`py-1 px-1 text-center font-mono border-r border-slate-100 ${bgClass} ${
                          isDeparture ? 'border-r-2 border-r-red-500' : ''
                        }`}
                        title={titleTooltip}
                      >
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-400 inline-block" /> Solar-Powered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-blue-400 inline-block" /> Grid-Powered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-teal-400 inline-block" /> Mixed Solar/Grid
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-slate-100 inline-block" /> Waiting Queue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-3 bg-red-500 inline-block" /> Departure Deadline
          </span>
          <span className="ml-auto font-mono text-slate-400">Values in cells = Charging kW</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Persistent Sidebar Navigation */}
      <aside
        className={`w-64 bg-[#0a1813] text-slate-300 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-40 shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Wordmark */}
          <div className="p-5 border-b border-emerald-900/40 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToLanding();
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base tracking-tight leading-tight">
                  Charge<span className="text-emerald-400">Wise</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                  GreenGrid AI
                </div>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNavTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-emerald-950/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Operator Profile Card at bottom */}
        <div className="p-4 border-t border-emerald-900/40 bg-[#07130f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              A
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">Campus Hub Admin</div>
              <div className="text-[10px] text-emerald-400 truncate">ChargeWise Operator</div>
            </div>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onGoToLanding();
            }}
            className="w-full mt-3 py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Control Center Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {navItems.find((n) => n.id === activeNavTab)?.label || 'Control Center'}
              </h1>
              <div className="text-[11px] sm:text-xs text-slate-500">
                Station: <strong className="text-slate-700">{state.station}</strong> · Simulated
                Telemetry (Oct 23, 2026)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Return to Landing Page Button */}
            <button
              onClick={onGoToLanding}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
            {/* Station Preset Quick Dropdown */}
            <select
              value={state.sc}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(PRESETS).map(([k, p]) => (
                <option key={k} value={k}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Live Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sim Active</span>
            </div>

            {/* Run Optimizer Trigger Button */}
            <button
              onClick={onOptimize}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Re-optimize</span>
            </button>
          </div>
        </header>

        {/* View Switcher Container */}
        <div className="p-8 space-y-6 max-w-7xl w-full">
          {/* VIEW: OVERVIEW */}
          {activeNavTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Total EVs</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                    {state.evs.length}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    ↑ Active fleet
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Charging Now</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                    {o.sl[6]?.ch || 5}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    at peak daylight (12:00)
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Solar Available</div>
                  <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">
                    {formatNumber(o.sl[6]?.sol || 86, 0)} kW
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">On-site generation</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Grid Draw</div>
                  <div className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">
                    {formatNumber(o.sl[6]?.g || 48, 0)} kW
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Cap: {state.grid} kW</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Total Cost</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                    ₹{formatNumber(o.m.cost, 0)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Base: ₹{formatNumber(b.m.cost, 0)}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Deadline Success</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                    {o.m.succ}/{state.evs.length}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    {formatNumber((o.m.succ / state.evs.length) * 100, 0)}% fulfilled
                  </div>
                </div>
              </div>

              {/* Chart Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Solar vs EV Demand</h3>
                  {renderLineChart([
                    { name: 'Solar Generation', color: '#f59e0b', data: o.sl.map((x) => x.sol) },
                    { name: 'Requested Demand', color: '#a855f7', data: o.sl.map((x) => x.dem) },
                    { name: 'Scheduled Charging', color: '#10b981', data: o.sl.map((x) => x.tot) },
                  ])}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Grid Import Profile</h3>
                  {renderLineChart([
                    { name: 'Grid Import (kW)', color: '#3b82f6', data: o.sl.map((x) => x.g) },
                    {
                      name: 'Feeder Limit',
                      color: '#ef4444',
                      data: o.sl.map(() => state.grid),
                    },
                  ])}
                </div>
              </div>

              {/* Warnings and Recent Decision Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Feasibility & Deadline Audit</span>
                  </h3>
                  {o.m.succ === state.evs.length ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All {state.evs.length} vehicles reach target SOC before departure.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {state.evs.map((e, idx) => {
                        if (o.ok[idx]) return null;
                        return (
                          <div
                            key={e.id}
                            className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800"
                          >
                            <span className="font-bold">{e.id} Target Infeasible:</span>
                            <span>{formatNumber(o.rem[idx])} kWh short at departure {formatSlotTime(e.dep)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Recent Optimizer Decision Reasons</span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {o.ex.slice(-5).map((log, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed"
                      >
                        {log.m}
                      </div>
                    ))}
                    {o.ex.length === 0 && (
                      <div className="text-xs text-slate-400">Standard optimal schedule allocated.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time Charger Bay Visualizer */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Active Charging Bays</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {Array.from({ length: state.n }, (_, k) => {
                    const isOccupied = k < (o.sl[6]?.ch || 0);
                    return (
                      <div
                        key={k}
                        className={`p-3 rounded-xl border text-center text-xs transition-colors ${
                          isOccupied
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="font-bold">Bay {k + 1}</div>
                        <div className="text-[11px] font-mono mt-0.5">
                          {isOccupied ? `${state.cp} kW In Use` : 'Available'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SATELLITE MAP */}
          {activeNavTab === 'map' && (
            <SatelliteMap
              selectedStationName={state.station}
              onSelectStation={(st) => {
                setState((prev) => ({ ...prev, station: st.n }));
              }}
              onOpenInOptimizer={(st) => {
                setState((prev) => ({
                  ...prev,
                  station: st.n,
                  n: Math.min(st.ch, 12),
                  cp: Math.max(7, Math.round(st.cap / st.ch)),
                  grid: Math.max(20, st.cap - st.solar > 0 ? st.cap - Math.min(st.solar, Math.round(st.cap / 2)) : st.cap),
                }));
                setActiveNavTab('opt');
              }}
            />
          )}

          {/* VIEW: CHARGING OPTIMIZER */}
          {activeNavTab === 'opt' && (
            <div className="space-y-6">
              {/* Parameter Settings Row */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">Chargers Count:</span>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={state.n}
                        onChange={(e) =>
                          setState({ ...state, n: Math.max(1, +e.target.value) })
                        }
                        className="w-16 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      />
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">Charger Rating (kW):</span>
                      <input
                        type="number"
                        min="3"
                        max="350"
                        value={state.cp}
                        onChange={(e) =>
                          setState({ ...state, cp: Math.max(3, +e.target.value) })
                        }
                        className="w-18 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      />
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">Grid Limit (kW):</span>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={state.grid}
                        onChange={(e) =>
                          setState({ ...state, grid: Math.max(10, +e.target.value) })
                        }
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      />
                    </label>
                  </div>

                  <button
                    onClick={onOptimize}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ Run Optimization</span>
                  </button>
                </div>

                {/* Validation Warnings */}
                {validationErrors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Input Validation Errors:</span>
                    </div>
                    {validationErrors.map((err, i) => (
                      <div key={i} className="pl-5">• {err}</div>
                    ))}
                  </div>
                )}

                {state.msg && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    {state.msg}
                  </div>
                )}
              </div>

              {/* Optimized Timeline Matrix */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                {renderScheduleTimeline(o, 'Optimized Schedule (Deadline-Aware & Solar-First)')}
              </div>

              {/* Baseline Timeline Matrix */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                {renderScheduleTimeline(b, 'Baseline Schedule (First-Come-First-Served Unoptimized)')}
              </div>

              {/* Comparison Table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Baseline vs. Optimized Performance Comparison
                </h3>
                {renderComparisonTable()}
              </div>

              {/* Decision Log Explanations */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Explainable AI Reasoning Log
                </h3>
                <div className="space-y-2">
                  {o.ex.map((log, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        {formatSlotTime(log.t)}
                      </span>
                      <span>{log.m}</span>
                    </div>
                  ))}
                  {o.ex.length === 0 && (
                    <div className="text-xs text-slate-400">
                      Standard optimization execution with no constraints violated.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: EV FLEET */}
          {activeNavTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">EV Fleet Management</h3>
                  <p className="text-xs text-slate-500">
                    Configure battery capacities, arrival/departure slots, and target state of charge.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddEV(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add EV</span>
                  </button>
                  <button
                    onClick={() => handleAddEV(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Urgent EV</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <th className="py-3 px-3">Vehicle ID</th>
                      <th className="py-3 px-3">Battery (kWh)</th>
                      <th className="py-3 px-3">Current SOC</th>
                      <th className="py-3 px-3">Target SOC</th>
                      <th className="py-3 px-3">Energy Needed</th>
                      <th className="py-3 px-3">Arrival Slot</th>
                      <th className="py-3 px-3">Departure Slot</th>
                      <th className="py-3 px-3">Max kW</th>
                      <th className="py-3 px-3">Optimization Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.evs.map((e, idx) => {
                      const reqKwh = calculateRequiredEnergy(e);
                      const isOk = o.ok[idx];
                      const remKwh = o.rem[idx] || 0;

                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={e.id}
                              onChange={(ev) => handleUpdateEV(idx, 'id', ev.target.value)}
                              className="w-20 px-2 py-1 font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={e.cap}
                              onChange={(ev) => handleUpdateEV(idx, 'cap', +ev.target.value)}
                              className="w-16 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={e.soc}
                              onChange={(ev) => handleUpdateEV(idx, 'soc', +ev.target.value)}
                              className="w-16 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                            <span className="text-slate-400 ml-1">%</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={e.tgt}
                              onChange={(ev) => handleUpdateEV(idx, 'tgt', +ev.target.value)}
                              className="w-16 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                            <span className="text-slate-400 ml-1">%</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {formatNumber(reqKwh)} kWh
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            <input
                              type="number"
                              min="0"
                              max={TOTAL_SLOTS - 1}
                              value={e.arr}
                              onChange={(ev) => handleUpdateEV(idx, 'arr', +ev.target.value)}
                              className="w-14 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({formatSlotTime(e.arr)})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            <input
                              type="number"
                              min="1"
                              max={TOTAL_SLOTS}
                              value={e.dep}
                              onChange={(ev) => handleUpdateEV(idx, 'dep', +ev.target.value)}
                              className="w-14 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({formatSlotTime(e.dep)})
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={e.pmax}
                              onChange={(ev) => handleUpdateEV(idx, 'pmax', +ev.target.value)}
                              className="w-16 px-2 py-1 font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            {isOk ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ Target Met
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                                Short {formatNumber(remKwh)} kWh
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveEV(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                              title="Delete vehicle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: ENERGY FLOW */}
          {activeNavTab === 'energy' && (
            <div className="space-y-6">
              {/* Battery Storage Modeling Config */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="battOn"
                      checked={state.bt.on === 1}
                      onChange={(e) =>
                        setState({
                          ...state,
                          bt: { ...state.bt, on: e.target.checked ? 1 : 0 },
                        })
                      }
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="battOn" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Enable Smart Battery Energy Storage System (BESS)
                    </label>
                  </div>

                  {state.bt.on === 1 && (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5">
                        <span className="text-slate-600">Capacity (kWh):</span>
                        <input
                          type="number"
                          value={state.bt.cap}
                          onChange={(e) =>
                            setState({
                              ...state,
                              bt: { ...state.bt, cap: +e.target.value },
                            })
                          }
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <span className="text-slate-600">Max kW:</span>
                        <input
                          type="number"
                          value={state.bt.pw}
                          onChange={(e) =>
                            setState({
                              ...state,
                              bt: { ...state.bt, pw: +e.target.value },
                            })
                          }
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <span className="text-slate-600">Round-trip Eff:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={state.bt.eff}
                          onChange={(e) =>
                            setState({
                              ...state,
                              bt: { ...state.bt, eff: +e.target.value },
                            })
                          }
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <span className="text-slate-600">Start SOC %:</span>
                        <input
                          type="number"
                          value={state.bt.soc0}
                          onChange={(e) =>
                            setState({
                              ...state,
                              bt: { ...state.bt, soc0: +e.target.value },
                            })
                          }
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Energy Flow Diagram SVG */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Dynamic Energy Routing Diagram
                </h3>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <svg viewBox="0 0 640 140" className="w-full h-auto">
                    {/* Solar Source Node */}
                    <rect x="20" y="20" width="130" height="42" rx="10" fill="#f59e0b" />
                    <text x="35" y="46" fill="#fff" fontSize="12" fontWeight="bold">
                      ☀ Solar: {formatNumber(o.m.solar)} kWh
                    </text>

                    {/* Grid Source Node */}
                    <rect x="20" y="80" width="130" height="42" rx="10" fill="#2563eb" />
                    <text x="35" y="106" fill="#fff" fontSize="12" fontWeight="bold">
                      ⚡ Grid: {formatNumber(o.m.grid)} kWh
                    </text>

                    {/* Battery Node (Center) */}
                    {state.bt.on === 1 ? (
                      <g>
                        <rect x="250" y="50" width="140" height="42" rx="10" fill="#8b5cf6" />
                        <text x="265" y="76" fill="#fff" fontSize="12" fontWeight="bold">
                          ▣ BESS: {formatNumber(o.m.bat)} kWh
                        </text>
                      </g>
                    ) : null}

                    {/* EV Sink Node */}
                    <rect x="480" y="50" width="140" height="42" rx="10" fill="#059669" />
                    <text x="495" y="76" fill="#fff" fontSize="12" fontWeight="bold">
                      🚗 EVs: {formatNumber(o.m.deliv)} kWh
                    </text>

                    {/* Animated Flow Connectors */}
                    <path
                      d="M150 41 Q300 41 480 65"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      fill="none"
                      className="animate-energy-flow"
                    />
                    <path
                      d="M150 101 Q300 101 480 75"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      fill="none"
                      className="animate-energy-flow"
                    />
                  </svg>
                </div>
              </div>

              {/* Energy Allocation Stacked Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Hourly Energy Source Breakdown
                </h3>
                {renderLineChart([
                  { name: 'Solar to EVs', color: '#f59e0b', data: o.sl.map((x) => x.s) },
                  { name: 'Grid to EVs', color: '#3b82f6', data: o.sl.map((x) => x.g) },
                  { name: 'Total Charging', color: '#10b981', data: o.sl.map((x) => x.tot) },
                  ...(state.bt.on ? [{ name: 'Battery Discharge', color: '#8b5cf6', data: o.sl.map((x) => x.b) }] : []),
                ])}
              </div>
            </div>
          )}

          {/* VIEW: IMPACT ANALYTICS */}
          {activeNavTab === 'impact' && (
            <div className="space-y-6">
              {/* CO2 Emissions Calculator */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Avoided CO₂ Emissions</h3>
                    <p className="text-xs text-slate-500">
                      Calculates operational greenhouse gas emissions displaced by solar energy.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">Grid Emission Factor (kg CO₂/kWh):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={state.ef}
                      onChange={(e) => setState({ ...state, ef: +e.target.value })}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="text-xs text-slate-500">Baseline Grid CO₂</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                      {formatNumber(b.m.grid * state.ef)} kg
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="text-xs text-slate-500">Optimized Grid CO₂</div>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                      {formatNumber(o.m.grid * state.ef)} kg
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="text-xs text-emerald-800 font-semibold">Avoided Emissions</div>
                    <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                      {formatNumber(o.m.solar * state.ef)} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Baseline vs Optimized Table */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Comprehensive Impact Summary
                </h3>
                {renderComparisonTable()}
              </div>

              {/* Scenario History Log */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Optimization Run History</h3>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
                {scenarioHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400">
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Scenario</th>
                          <th className="py-2 px-3">Cost (Base / Opt)</th>
                          <th className="py-2 px-3">Solar kWh</th>
                          <th className="py-2 px-3">Peak Grid kW</th>
                          <th className="py-2 px-3">Targets Met</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioHistory.map((h, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2 px-3 font-mono text-slate-600">{h.t}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{h.s}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{h.c}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{h.so}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{h.p}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{h.m}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-3">
                    Click "Run Optimization" to log comparison benchmarks into the history ledger.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SCENARIOS & WHAT-IF */}
          {activeNavTab === 'scen' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900">Scenario Preset Selector</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(PRESETS).map(([k, p]) => (
                    <button
                      key={k}
                      onClick={() => handlePresetSelect(k)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        state.sc === k
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Solar Generation Scale: {Math.round(state.sS * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={state.sS * 100}
                      onChange={(e) => setState({ ...state, sS: +e.target.value / 100 })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Grid Import Capacity: {state.grid} kW
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={state.grid}
                      onChange={(e) => setState({ ...state, grid: +e.target.value })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tariff Rate Multiplier: {Math.round(state.pm * 100)}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={state.pm * 100}
                      onChange={(e) => setState({ ...state, pm: +e.target.value / 100 })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      onOptimize();
                      setActiveNavTab('opt');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    ⚡ Execute What-If Simulation
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Live Simulation Result</h3>
                {renderComparisonTable()}
              </div>
            </div>
          )}

          {/* VIEW: REPORTS */}
          {activeNavTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      ChargeWise Fleet Audit & Energy Report
                    </h3>
                    <p className="text-xs text-slate-500">
                      Generated schedule metrics, cost savings breakdown, and emissions reductions.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadCSV}
                      className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Save PDF</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  {renderComparisonTable()}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeNavTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Application Settings</h3>

                <div className="pt-2">
                  <button
                    onClick={onReplayIntro}
                    className="px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay 10-Second Cinematic Opening Intro</span>
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Plays the car-on-the-road story animation from low battery to solar hub arrival.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-800 mb-1">
                    Simulation Disclosure
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All telemetry, battery curves, and charging queues are deterministic simulations
                    designed for hackathon evaluation and technical benchmarking. No actual high-voltage
                    infrastructure is commanded.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
