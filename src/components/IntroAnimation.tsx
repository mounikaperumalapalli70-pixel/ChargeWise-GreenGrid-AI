import React, { useEffect, useState } from 'react';
import {
  Zap,
  Battery,
  AlertTriangle,
  FastForward,
  Navigation,
  CheckCircle2,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import cinematicEvDriving from '../assets/images/cinematic_ev_driving.jpg';
import cinematicEvApproachingHub from '../assets/images/cinematic_ev_approaching_hub.jpg';

interface IntroAnimationProps {
  onComplete: () => void;
  onSkipToDashboard: () => void;
  onSkipToLanding: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  onSkipToDashboard,
  onSkipToLanding,
}) => {
  // Scene 1: 0–2s (Real EV driving on highway)
  // Scene 2: 2–4s (Low battery warning overlay on real EV)
  // Scene 3: 4–7s (Arriving at solar charging hub with ChargeWise energy trail)
  // Scene 4: 7–10s (Smooth transition into live platform)
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [batteryPct, setBatteryPct] = useState<number>(15);
  const [speedMph, setSpeedMph] = useState<number>(68);
  const [img1Error, setImg1Error] = useState<boolean>(false);
  const [img2Error, setImg2Error] = useState<boolean>(false);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSkipToLanding();
      return;
    }

    const tScene2 = setTimeout(() => {
      setScene(2);
    }, 2000);

    const tScene3 = setTimeout(() => {
      setScene(3);
    }, 4200);

    const tScene4 = setTimeout(() => {
      setScene(4);
    }, 7200);

    const tDone = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => {
      clearTimeout(tScene2);
      clearTimeout(tScene3);
      clearTimeout(tScene4);
      clearTimeout(tDone);
    };
  }, [onComplete, onSkipToLanding]);

  // Handle battery drain in Scene 2
  useEffect(() => {
    if (scene === 2) {
      const interval = setInterval(() => {
        setBatteryPct((prev) => {
          if (prev <= 8) {
            clearInterval(interval);
            return 8;
          }
          return prev - 1;
        });
        setSpeedMph((prev) => Math.max(52, prev - 2));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [scene]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#040907] text-white overflow-hidden select-none">
      {/* Top 10-Second Linear Progress Bar */}
      <div className="w-full h-1 bg-white/10 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300 transition-all duration-300 ease-linear"
          style={{
            width: `${
              scene === 1 ? 20 : scene === 2 ? 42 : scene === 3 ? 72 : 100
            }%`,
          }}
        />
      </div>

      {/* Top Header Bar with Logo and Action Controls (Prevents Header Clipping) */}
      <header className="h-14 sm:h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between gap-4 z-40 bg-[#040907]/90 backdrop-blur-md">
        {/* Left: Brand Identity & Active Scene Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-tight leading-tight flex items-center gap-1.5">
              <span>ChargeWise</span>
              <span className="text-emerald-400">GreenGrid AI</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              {scene === 1 && 'Scene 1/4 · Real-World Highway Cruising'}
              {scene === 2 && 'Scene 2/4 · Critical Low Battery Alert'}
              {scene === 3 && 'Scene 3/4 · Solar Charging Hub Discovery'}
              {scene === 4 && 'Scene 4/4 · Live Platform Transition'}
            </div>
          </div>
        </div>

        {/* Right: Skip and Direct Launch Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSkipToLanding}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold tracking-wider uppercase text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={onSkipToDashboard}
            className="hidden sm:inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-white/5 hover:bg-white/10 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
          >
            <span>Control Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Cinematic Viewport Stage (Constrained to prevent clipping) */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center px-3 sm:px-6 my-1 sm:my-2 min-h-0">
        <div className="relative w-full h-full max-h-[74vh] aspect-[16/9] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-[#091510] flex items-center justify-center">
          {/* ========================================================= */}
          {/* SCENE 1 & 2: PHOTOREALISTIC ELECTRIC VEHICLE ON HIGHWAY   */}
          {/* ========================================================= */}
          {(scene === 1 || scene === 2) && (
            <div className="relative w-full h-full overflow-hidden">
              {/* Photorealistic Simulated Backdrop Fallback (Guarantees scene is never black) */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e3b] via-[#5c3e2e] to-[#151a1e]">
                {/* Golden hour sun flare */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
                {/* Coastal horizon line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-amber-200/20 blur-xs" />
                {/* Road perspective base */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#121619] border-t border-slate-700/40" />
              </div>

              {/* Real Cinematic Vehicle Image with Camera Tracking */}
              {!img1Error && (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={cinematicEvDriving || '/assets/images/cinematic_ev_driving.jpg'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = 'true';
                        target.src = '/assets/images/cinematic_ev_driving.jpg';
                      } else {
                        setImg1Error(true);
                      }
                    }}
                    alt="Photorealistic modern electric SUV driving on coastal highway at golden hour"
                    className="w-full h-full object-cover animate-cinematic-drive"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle cinematic anamorphic letterbox vignette & lighting */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
                </div>
              )}

              {/* In-Car Automotive Digital Instrument Telemetry HUD */}
              <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20 flex items-center gap-2 sm:gap-3 text-xs font-mono text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-xl">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-xs sm:text-sm tracking-wider font-mono">
                    {speedMph}
                  </span>
                  <span className="text-[10px] text-white/60">MPH</span>
                </div>
                <span className="text-white/30">|</span>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px] sm:text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ECO DRIVE</span>
                </div>
              </div>

              {/* Scene 2: Realistic Automotive Glass Low-Battery Warning HUD */}
              {scene === 2 && (
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 max-w-[280px] sm:max-w-sm w-full animate-fade-in">
                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-red-500/50 shadow-2xl shadow-red-950/60 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center animate-pulse shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] sm:text-xs font-bold text-red-400 uppercase tracking-wider">
                            Low Battery Alert
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-300">
                            Find a charging station
                          </div>
                        </div>
                      </div>
                      {/* SOC percentage */}
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-extrabold font-mono text-red-400 tabular-nums">
                          {batteryPct}%
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono">18 mi remaining</div>
                      </div>
                    </div>

                    {/* Battery Drain Gauge Bar */}
                    <div className="w-full bg-slate-800/90 h-2 sm:h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(batteryPct / 100) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Locating nearest solar hub…
                      </span>
                      <span className="text-white/60">Auto Navigation</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SCENE 3: PHOTOREALISTIC ARRIVAL AT SOLAR CHARGING HUB    */}
          {/* ========================================================= */}
          {scene === 3 && (
            <div className="relative w-full h-full overflow-hidden animate-fade-in">
              {/* Photorealistic Backdrop Fallback */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#10241c] via-[#091b14] to-[#040e0b]">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Real Solar Canopy Station Footage / Image */}
              {!img2Error && (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={cinematicEvApproachingHub || '/assets/images/cinematic_ev_approaching_hub.jpg'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = 'true';
                        target.src = '/assets/images/cinematic_ev_approaching_hub.jpg';
                      } else {
                        setImg2Error(true);
                      }
                    }}
                    alt="Photorealistic EV pulling up to solar canopy charging station with glowing emerald LEDs"
                    className="w-full h-full object-cover animate-cinematic-arrive"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
                </div>
              )}

              {/* Glowing Restrained Emerald Energy Trail Overlay SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1000 562"
              >
                <defs>
                  <linearGradient id="emeraldTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                    <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="emeraldGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M 780 320 C 700 340, 650 360, 520 400"
                  stroke="url(#emeraldTrail)"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#emeraldGlow)"
                  className="animate-energy-trail"
                />
              </svg>

              {/* ChargeWise Discovery Brand Plaque */}
              <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20 flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-emerald-500/40 shadow-2xl">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
                    <span>ChargeWise GreenGrid</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                      HUB CONNECTED
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-300 mt-0.5">
                    100% On-Site Solar · Fast Charging Engaged
                  </div>
                </div>
              </div>

              {/* Bottom Status Card */}
              <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Charging: 22 kW Solar</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="text-slate-300">
                    Departure Target: <strong>80% SOC</strong> by 05:00 PM
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  Transitioning to Landing Page…
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCENE 4: SMOOTH TRANSITION INTO THE LIVE PLATFORM        */}
          {/* ========================================================= */}
          {scene === 4 && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 bg-[#061711] text-center animate-fade-in overflow-y-auto">
              {/* Glowing Logo Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/40 mb-3 sm:mb-4 animate-pulse-glow shrink-0">
                <div className="w-full h-full bg-[#041c14] rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-7 h-7 sm:w-9 sm:h-9">
                    <circle cx="32" cy="32" r="30" fill="#064e3b" />
                    <path d="M32 8C48 14 52 34 32 56 12 34 16 14 32 8z" fill="#10b981" />
                    <path d="M35 18 24 36h8l-3 12 12-20h-8z" fill="#fff" />
                  </svg>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <span>ChargeWise GreenGrid AI</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 leading-tight">
                Charge Smarter. Power Greener.
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-4 sm:mb-5 leading-relaxed">
                Entering the ChargeWise platform. Explore smart scheduling intelligence, solar canopy
                telemetry, and satellite-connected hubs.
              </p>

              {/* Quick Loading Indicator */}
              <div className="w-44 sm:w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-emerald-400 animate-pulse w-full" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Subtitle / Caption Bar (Never clipped, cleanly positioned) */}
      <footer className="h-10 sm:h-12 shrink-0 px-4 flex items-center justify-center text-center text-[11px] sm:text-xs text-slate-400 font-medium bg-[#040907]/90 z-40">
        {scene === 1 && '0–2s: Production electric SUV driving along coastal highway at golden hour'}
        {scene === 2 && '2–4s: HUD low-battery notification: "Low battery — find a charging station"'}
        {scene === 3 && '4–7s: Arriving at photorealistic solar-powered charging hub with emerald energy flow'}
        {scene === 4 && '7–10s: Entering ChargeWise GreenGrid AI platform'}
      </footer>
    </div>
  );
};
