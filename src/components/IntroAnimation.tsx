import React, { useEffect, useState } from 'react';
import {
  Zap,
  Battery,
  AlertTriangle,
  FastForward,
  Navigation,
  Compass,
  CheckCircle2,
  Sun,
  Shield,
  Gauge,
} from 'lucide-react';

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
  // Scene 1: 0–2s (Real EV driving)
  // Scene 2: 2–4s (Low battery warning overlay on real EV)
  // Scene 3: 4–7s (Arriving at solar charging hub with ChargeWise energy trail)
  // Scene 4: 7–10s (Smooth transition into live platform)
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [batteryPct, setBatteryPct] = useState<number>(15);
  const [speedMph, setSpeedMph] = useState<number>(68);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSkipToLanding();
      return;
    }

    // Scene timing timers
    // 0 -> 2.2s: Scene 1 (Real EV cruising)
    // 2.2s -> 4.2s: Scene 2 (Battery drops 15% -> 8% with warning)
    // 4.2s -> 7.2s: Scene 3 (Arriving at photorealistic solar hub)
    // 7.2s -> 10s: Scene 4 (Transition to Control Center)
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
        setSpeedMph((prev) => Math.max(54, prev - 2));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [scene]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050d0a] text-white overflow-hidden select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={onSkipToLanding}
          className="px-4.5 py-2 text-xs font-bold tracking-wider uppercase text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={onSkipToDashboard}
          className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-black/60 hover:bg-black/80 border border-emerald-500/40 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-lg hover:border-emerald-400"
        >
          Direct to Control Center →
        </button>
      </div>

      {/* Top 10-Second Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300 transition-all duration-300 ease-linear"
          style={{
            width: `${
              scene === 1 ? 20 : scene === 2 ? 42 : scene === 3 ? 72 : 100
            }%`,
          }}
        />
      </div>

      {/* Main Cinematic Viewport Container (16:9 ratio frame) */}
      <div className="relative w-full max-w-6xl aspect-[16/9] max-h-[88vh] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-black">
        {/* ========================================================= */}
        {/* SCENE 1 & 2: PHOTOREALISTIC ELECTRIC VEHICLE ON HIGHWAY   */}
        {/* ========================================================= */}
        {(scene === 1 || scene === 2) && (
          <div className="relative w-full h-full overflow-hidden">
            {/* Cinematic Background Footage / Photo with Camera Tracking */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/src/assets/images/cinematic_ev_driving_1792768556946.jpg"
                alt="Photorealistic electric SUV driving along a highway at golden hour"
                className="w-full h-full object-cover animate-cinematic-drive"
                referrerPolicy="no-referrer"
              />
              {/* Subtle cinematic anamorphic letterbox vignette & lighting */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* In-Car Automotive Digital Instrument Telemetry HUD */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-4 text-xs font-mono text-white/90 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shadow-xl">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm tracking-wider">{speedMph}</span>
                <span className="text-[10px] text-white/60">MPH</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] text-white/80">Coastal Highway 1</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ECO DRIVE</span>
              </div>
            </div>

            {/* Scene 2: Realistic Automotive Glass Low-Battery Warning HUD */}
            {scene === 2 && (
              <div className="absolute bottom-8 right-8 z-30 max-w-sm w-full animate-fade-in">
                <div className="p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-red-500/40 shadow-2xl shadow-red-950/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                          Low Battery Alert
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Find a charging station
                        </div>
                      </div>
                    </div>
                    {/* SOC percentage pill */}
                    <div className="text-right">
                      <span className="text-2xl font-extrabold font-mono text-red-400 tabular-nums">
                        {batteryPct}%
                      </span>
                      <div className="text-[9px] text-slate-400 font-mono">18 mi remaining</div>
                    </div>
                  </div>

                  {/* Battery Cell Graphic Drain Bar */}
                  <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(batteryPct / 100) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Searching nearby hubs…
                    </span>
                    <span className="text-white/60">Auto Route Nav</span>
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
            {/* Real Solar Canopy Station Footage / Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/src/assets/images/cinematic_ev_approaching_hub_1792768556653.jpg"
                alt="Photorealistic EV pulling up to solar canopy charging station with glowing emerald LEDs"
                className="w-full h-full object-cover animate-cinematic-arrive"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>

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

              {/* Energy stream from charging pedestal to vehicle port */}
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
            <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/40 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
                  <span>ChargeWise GreenGrid</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                    HUB CONNECTED
                  </span>
                </div>
                <div className="text-xs text-emerald-300 mt-0.5">
                  100% On-Site Solar · Fast Charging Engaged
                </div>
              </div>
            </div>

            {/* Bottom Status Card */}
            <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-wrap items-center justify-between gap-4 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Charging Started: 22 kW Solar</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="text-slate-300">
                  Departure Target: <strong>80% SOC</strong> by 05:00 PM
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Transitioning to Control Center…
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCENE 4: SMOOTH TRANSITION INTO THE LIVE CONTROL CENTER   */}
        {/* ========================================================= */}
        {scene === 4 && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-[#071712] text-center animate-fade-in">
            {/* Glowing Logo Icon */}
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/40 mb-5 animate-pulse-glow">
              <div className="w-full h-full bg-[#051c14] rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-10 h-10">
                  <circle cx="32" cy="32" r="30" fill="#064e3b" />
                  <path d="M32 8C48 14 52 34 32 56 12 34 16 14 32 8z" fill="#10b981" />
                  <path d="M35 18 24 36h8l-3 12 12-20h-8z" fill="#fff" />
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span>ChargeWise GreenGrid AI</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Charge Smarter. Power Greener.
            </h2>

            <p className="text-slate-300 text-xs md:text-sm max-w-lg mb-6 leading-relaxed">
              Entering the ChargeWise GreenGrid AI platform. Explore the ecosystem, scheduling intelligence, and satellite-connected hubs.
            </p>

            {/* Quick Loading Indicator */}
            <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 animate-pulse w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Cinematic Subtitle bar below the video frame */}
      <div className="absolute bottom-5 text-center text-xs text-slate-400 font-medium">
        {scene === 1 && '0–2s: Production electric SUV driving on coastal asphalt at golden hour'}
        {scene === 2 && '2–4s: HUD low-battery notification: "Low battery — find a charging station"'}
        {scene === 3 && '4–7s: Arriving at photorealistic solar-powered charging hub'}
        {scene === 4 && '7–10s: Entering ChargeWise GreenGrid AI platform'}
      </div>
    </div>
  );
};
