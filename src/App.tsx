import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getInitialOptimizerState,
  runFullOptimization,
  validateInputs,
  formatNumber,
  PRESETS,
  OptimizerState,
} from './optimizer/engine';
import { ScenarioHistoryEntry } from './types';
import { LandingPage } from './components/LandingPage';
import { ControlCenter } from './components/ControlCenter';
import { IntroAnimation } from './components/IntroAnimation';

export default function App() {
  const [optimizerState, setOptimizerState] = useState<OptimizerState>(() =>
    getInitialOptimizerState()
  );

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Check if user has already seen intro or prefers reduced motion
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('cw_intro_seen');
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (seen || prefersReduced) return false;
    }
    return true;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeNavTab, setActiveNavTab] = useState<string>('overview');

  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryEntry[]>([
    {
      t: '08:00 AM',
      s: 'A · Sunny Campus',
      c: '₹2,640 / ₹1,480',
      so: '312 / 418',
      p: '60 / 48',
      m: '8 / 8',
      u: '0.0 / 0.0',
    },
  ]);

  // Execute dual simulation whenever optimizerState inputs change
  const comparison = useMemo(() => {
    return runFullOptimization(optimizerState);
  }, [optimizerState]);

  // Synchronize hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const dashboardTabs = [
        'overview',
        'india',
        'map',
        'opt',
        'fleet',
        'energy',
        'impact',
        'scen',
        'reports',
        'settings',
      ];

      if (dashboardTabs.includes(hash)) {
        setCurrentView('dashboard');
        setActiveNavTab(hash);
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOptimizeAction = useCallback(() => {
    const errors = validateInputs(optimizerState);
    if (errors.length > 0) {
      setOptimizerState((prev: OptimizerState) => ({
        ...prev,
        msg: `Validation error: ${errors[0]}`,
      }));
      return;
    }

    const res = runFullOptimization(optimizerState);
    const o = res.o.m;
    const b = res.b.m;

    const newHistoryEntry: ScenarioHistoryEntry = {
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      s: PRESETS[optimizerState.sc]?.name || optimizerState.station || 'Custom Hub',
      c: `₹${formatNumber(b.cost, 0)} / ₹${formatNumber(o.cost, 0)}`,
      so: `${formatNumber(b.solar, 0)} / ${formatNumber(o.solar, 0)}`,
      p: `${formatNumber(b.peak, 0)} / ${formatNumber(o.peak, 0)}`,
      m: `${b.succ} / ${o.succ}`,
      u: `${formatNumber(b.unmet, 1)} / ${formatNumber(o.unmet, 1)}`,
    };

    setScenarioHistory((prev: ScenarioHistoryEntry[]) => [newHistoryEntry, ...prev.slice(0, 9)]);

    const statusMsg =
      o.unmet > 1e-6
        ? `⚠️ Partial Schedule: ${optimizerState.evs.length - o.succ} EV(s) cannot reach target SOC within deadline constraints (${formatNumber(o.unmet, 1)} kWh unmet deficit).`
        : `✓ Optimal Schedule Established: All ${optimizerState.evs.length} vehicles meet target departure SOC. Peak grid load (${formatNumber(o.peak, 1)} kW) capped within ${optimizerState.grid} kW limit.`;

    setOptimizerState((prev: OptimizerState) => ({
      ...prev,
      msg: statusMsg,
    }));
  }, [optimizerState]);

  const handleIntroComplete = () => {
    sessionStorage.setItem('cw_intro_seen', 'true');
    setShowIntro(false);
    setCurrentView('landing');
    window.location.hash = '#home';
  };

  const handleSkipToDashboard = () => {
    sessionStorage.setItem('cw_intro_seen', 'true');
    setShowIntro(false);
    setCurrentView('dashboard');
    setActiveNavTab('overview');
    window.location.hash = '#overview';
  };

  const handleSkipToLanding = () => {
    sessionStorage.setItem('cw_intro_seen', 'true');
    setShowIntro(false);
    setCurrentView('landing');
    window.location.hash = '#home';
  };

  const handleReplayIntro = () => {
    sessionStorage.removeItem('cw_intro_seen');
    setShowIntro(true);
  };

  const handleLaunchDashboard = () => {
    setCurrentView('dashboard');
    setActiveNavTab('overview');
    window.location.hash = '#overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMap = () => {
    setCurrentView('dashboard');
    setActiveNavTab('map');
    window.location.hash = '#map';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenIndiaLocator = () => {
    setCurrentView('dashboard');
    setActiveNavTab('india');
    window.location.hash = '#india';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#f8faf9] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 10-Second Cinematic Storyboard Intro Modal */}
      {showIntro && (
        <IntroAnimation
          onComplete={handleIntroComplete}
          onSkipToDashboard={handleSkipToDashboard}
          onSkipToLanding={handleSkipToLanding}
        />
      )}

      {/* Main View: Landing Page or Control Center Dashboard */}
      {currentView === 'landing' ? (
        <LandingPage
          onLaunchDashboard={handleLaunchDashboard}
          onWatchDemo={handleReplayIntro}
          onOpenMap={handleOpenMap}
          onOpenIndiaLocator={handleOpenIndiaLocator}
          comparison={comparison}
        />
      ) : (
        <ControlCenter
          state={optimizerState}
          setState={setOptimizerState}
          comparison={comparison}
          onOptimize={handleOptimizeAction}
          onGoToLanding={handleGoToLanding}
          onReplayIntro={handleReplayIntro}
          scenarioHistory={scenarioHistory}
          setScenarioHistory={setScenarioHistory}
          activeNavTab={activeNavTab}
          setActiveNavTab={(tab) => {
            setActiveNavTab(tab);
            window.location.hash = `#${tab}`;
          }}
        />
      )}
    </div>
  );
}
