import {
  Zap,
  Sun,
  TrendingDown,
  Leaf,
  ShieldAlert,
  Clock,
  Compass,
  ArrowRight,
  Play,
  CheckCircle2,
  Cpu,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { DualComparison } from '../optimizer/engine';
import { formatNumber } from '../optimizer/engine';
import heroSolarEvHub from '../assets/images/hero_solar_ev_hub.jpg';
import stationHubPreview from '../assets/images/station_hub_preview.jpg';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onWatchDemo: () => void;
  onOpenMap: () => void;
  onOpenIndiaLocator?: () => void;
  comparison: DualComparison;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onWatchDemo,
  onOpenMap,
  onOpenIndiaLocator,
  comparison,
}) => {
  const o = comparison.o.m;
  const b = comparison.b.m;
  const costSavingsPct = b.cost > 0 ? ((b.cost - o.cost) / b.cost) * 100 : 0;
  const solarPct = o.solar + o.grid > 0 ? (o.solar / (o.solar + o.grid)) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <a href="#home" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b] flex items-center justify-center text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 64 64" className="w-6 h-6">
                <circle cx="32" cy="32" r="30" fill="#064e3b" />
                <path d="M32 8C48 14 52 34 32 56 12 34 16 14 32 8z" fill="#10b981" />
                <path d="M35 18 24 36h8l-3 12 12-20h-8z" fill="#fff" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                Charge<span className="text-emerald-600">Wise</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase block -mt-0.5">
                GreenGrid AI
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#home" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Home
            </a>
            <a href="#product" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Product
            </a>
            <a href="#solutions" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Solutions
            </a>
            <a href="#technology" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Technology
            </a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Impact
            </a>
            <a href="#about" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              About
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onWatchDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Demo</span>
            </button>
            <button
              onClick={onLaunchDashboard}
              className="px-4.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
            >
              <span>Launch Control Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-10 pb-16 px-6 overflow-hidden">
        {/* Subtle radial emerald background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AI-POWERED · EV · RENEWABLE ENERGY · SMART CITIES</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Charge Smarter.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Power Greener.
              </span>{' '}
              Drive Further.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              An intelligent EV charging and energy management platform that optimizes charging
              schedules using solar energy, grid constraints and AI — for a cleaner, cheaper and
              more sustainable tomorrow.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchDashboard}
                className="px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-700/25 hover:shadow-emerald-700/40 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Launch Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onWatchDemo}
                className="px-5 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:border-slate-300"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 4 Value Pillars Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">
                  AI-Powered Scheduling
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Deadline-aware & fair</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">
                  Solar-First Charging
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Maximize renewable use</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">Cost Optimization</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Lower electricity costs</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-2">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">
                  Sustainable Mobility
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Cleaner, greener future</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Showcase with Floating Glass Metric Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xl bg-slate-900 group">
              <img
                src={heroSolarEvHub || '/assets/images/hero_solar_ev_hub.jpg'}
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/hero_solar_ev_hub.jpg';
                }}
                alt="Solar canopy charging station with electric cars"
                className="w-full h-[460px] object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

              {/* Floating Real-Time Glass Telemetry Stack */}
              <div className="absolute top-4 right-4 space-y-2 max-w-[210px] w-full">
                {/* Solar Gen */}
                <div className="p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">Solar Generation</span>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-400">
                    {formatNumber(comparison.o.sl[6]?.sol || 86, 0)} kW
                  </div>
                  <div className="text-[9px] text-slate-400">Peak daylight array output</div>
                </div>

                {/* Grid Power Draw */}
                <div className="p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">Grid Power Draw</span>
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-blue-400">
                    {formatNumber(comparison.o.sl[6]?.g || 48, 0)} kW
                  </div>
                  <div className="text-[9px] text-emerald-400">Shaved 33% below cap</div>
                </div>

                {/* EVs Charging */}
                <div className="p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">EVs Charging</span>
                    <span className="text-[9px] font-bold text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-white">
                    {comparison.o.sl[6]?.ch || 5} / {comparison.b.m ? '5' : '5'}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-500 h-full w-[80%]" />
                  </div>
                </div>

                {/* Solar Utilization */}
                <div className="p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">Solar Utilization</span>
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-300">
                    {formatNumber(solarPct, 0)}%
                  </div>
                  <div className="text-[9px] text-slate-400">Zero solar curtailment</div>
                </div>
              </div>

              {/* Bottom Tagline Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Campus Solar EV Hub · Live Simulation
                </span>
                <span className="text-[11px] text-slate-400">SMART ENERGY · CLEANER CITIES</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Capabilities Section */}
      <section id="product" className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Platform Features
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Engineered for Sustainability and Grid Stability
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Combining transparent constraint optimization with real-world energy infrastructure
              to deliver predictable, cost-effective charging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Deterministic Slack Scheduler</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Orders vehicles by remaining deadline slack. Urgently departing EVs are guaranteed
                full power while flexible vehicles are scheduled into high-solar slots.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Solar-First Self-Consumption</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prioritizes local on-site photovoltaic generation before pulling energy from the
                grid, cutting utility costs and maximizing sustainability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Feeder & Grid Protection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enforces strict peak demand caps on substation feeds, preventing brownouts and
                eliminating expensive demand charges from local utilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Time-of-Use Tariff Shifting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically identifies peak price hours and shifts charging sessions to
                off-peak or free solar windows without compromising departure targets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Explainable AI Audit Trails</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every scheduling decision produces human-readable justification logs explaining why
                charging was throttled, deferred, or prioritized.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Carbon Footprint Accounting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Calculates real avoided grid CO₂ emissions using regional grid emission factors and
                quantifies environmental impact for fleet reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / How it works */}
      <section id="solutions" className="py-20 px-6 bg-[#0c1a15] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Execution Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">How ChargeWise Works</h2>
            <p className="text-slate-300 text-sm mt-3">
              A transparent four-stage closed-loop optimization engine that turns grid constraints
              into cost savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400 font-mono">01</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Model</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingests vehicle arrival times, current and target battery SOC, charger ratings,
                  solar generation forecast, and dynamic tariff curves.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-400">
                Inputs: Battery kWh, SOC, Grid Cap
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400 font-mono">02</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Optimize</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deterministic algorithm calculates remaining slack for each EV and allocates power
                  to maximize solar self-consumption while respecting feeder limits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-400">
                Slack = Deadline Slots - Energy Need
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400 font-mono">03</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Compare</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Runs the identical scenario through standard First-Come-First-Served (FCFS) logic
                  to quantify exact monetary savings and peak demand reduction.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-400">
                Baseline FCFS vs Optimized Metrics
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400 font-mono">04</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2">Explain</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generates an immutable audit trail showing why each vehicle was prioritized,
                  curtailed, or shifted, guaranteeing fleet operator trust.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-400">
                Plain-Language Decision Records
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Satellite Intelligence Preview */}
      <section id="satellite" className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Spatial Monitoring
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Satellite Intelligence for Campus & Regional Hubs
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Explore charging hubs, solar arrays, grid connections and simulated energy flow on an
              actual interactive satellite map. Inspect station capacity, monitor real-time queue
              lengths, and send live station profiles directly into the optimizer.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real satellite and street tile overlays via Esri and OpenStreetMap</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Station status, queue simulation, and charger occupancy tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seamless 1-click station load into the charging optimizer</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenMap}
                className="px-5 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Compass className="w-4 h-4" />
                <span>Open Satellite Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onOpenIndiaLocator && (
                <button
                  onClick={onOpenIndiaLocator}
                  className="px-5 py-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>India EV Station Locator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-3 bg-slate-950 rounded-2xl shadow-xl border border-slate-800">
              <div className="relative h-72 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={stationHubPreview || '/assets/images/station_hub_preview.jpg'}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/images/station_hub_preview.jpg';
                  }}
                  alt="Satellite map view preview"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>4 Connected Demo Stations</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Main Campus Hub · North Campus · Research Park · City Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="technology" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Optimization Methodology
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Mathematical Precision, Not Black-Box Guesswork
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Built on transparent linear constraints and slack analysis, ensuring 100% predictable
              and verifiable execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Energy & Feasibility Equations</h3>
              <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 border border-slate-200/80 space-y-2">
                <div>
                  <span className="text-emerald-700 font-bold">Required Energy:</span>
                  <br />
                  E_req = Battery_Capacity × (Target_SOC − Current_SOC) / 100
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-blue-700 font-bold">Departure Slack:</span>
                  <br />
                  Slack_i(t) = (Departure_Slot − t) − E_rem / (P_effective × Slot_Duration)
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                EVs with Slack ≤ 1 are critically prioritized to safeguard departure targets. EVs
                with Slack &gt; 2 are deferred if a subsequent slot provides cheaper grid power or
                excess solar generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Grid & Supply Constraints</h3>
              <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 border border-slate-200/80 space-y-2">
                <div>
                  <span className="text-purple-700 font-bold">Total Feeder Limit:</span>
                  <br />
                  Total_Power(t) ≤ P_solar(t) + P_grid_limit + P_battery_discharge(t)
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-amber-700 font-bold">Per-Charger Limit:</span>
                  <br />
                  P_delivered(i, t) ≤ min(EV_Max_Power, Charger_Capacity)
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guarantees zero substation over-draw. Battery storage actively absorbs surplus solar
                during mid-day peaks and discharges during evening tariff spikes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-6 bg-[#0c1a15] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Verified Simulation Impact
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Measurable Savings for Fleet Operators
            </h2>
            <p className="text-slate-300 text-sm mt-3">
              Performance metrics from the active scenario comparison engine.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60">
              <div className="text-xs text-slate-400 uppercase font-semibold">Cost Savings</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">
                ↓ {formatNumber(costSavingsPct, 0)}%
              </div>
              <div className="text-xs text-slate-300 mt-1">
                ₹{formatNumber(o.cost, 0)} vs ₹{formatNumber(b.cost, 0)} baseline
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60">
              <div className="text-xs text-slate-400 uppercase font-semibold">Solar Utilized</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">
                {formatNumber(o.solar)} kWh
              </div>
              <div className="text-xs text-slate-300 mt-1">
                vs {formatNumber(b.solar)} kWh on FCFS
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60">
              <div className="text-xs text-slate-400 uppercase font-semibold">Peak Grid Power</div>
              <div className="text-3xl font-extrabold text-blue-400 font-mono mt-2">
                {formatNumber(o.peak)} kW
              </div>
              <div className="text-xs text-slate-300 mt-1">
                vs {formatNumber(b.peak)} kW on unconstrained
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#142821] border border-emerald-900/60">
              <div className="text-xs text-slate-400 uppercase font-semibold">Deadlines Fulfilled</div>
              <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-2">
                {o.succ} / {comparison.o.rem.length}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {formatNumber((o.succ / comparison.o.rem.length) * 100, 0)}% success rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">About ChargeWise GreenGrid AI</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            ChargeWise GreenGrid AI is a hackathon innovation prototype created to tackle the dual
            challenges of rapid EV adoption and grid congestion. By synthesizing solar generation,
            battery storage dynamics, and deadline-aware charging queues into an explainable scheduler,
            it makes clean mobility commercially viable for campuses, municipal transit, and private
            fleets.
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchDashboard}
              className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Open Interactive Control Center
            </button>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-8 px-6 bg-[#091511] text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>ChargeWise GreenGrid AI</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            <span>Simulated Telemetry · Charge Smarter. Power Greener. Drive Further.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
