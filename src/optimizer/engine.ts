import { EV, BatteryStorage, ScenarioPreset, SimulationResult, StationData, SlotTelemetry, SlotAllocation, DecisionLog } from '../types';

export const TOTAL_SLOTS = 14; // 06:00 to 20:00 (14 1-hour slots)
export const SLOT_DURATION_HOURS = 1;

export const formatSlotTime = (t: number): string => {
  const h = 6 + t;
  return `${h < 10 ? '0' : ''}${h}:00`;
};

export const formatNumber = (x: number, d = 1): string => {
  return (+x).toFixed(d);
};

export const generateSolarCurve = (peak: number, T = TOTAL_SLOTS): number[] => {
  return Array.from({ length: T }, (_, t) =>
    Math.max(0, Math.round(peak * Math.sin((Math.PI * (t + 0.5)) / T)))
  );
};

export const DEFAULT_TARIFF: number[] = Array.from({ length: TOTAL_SLOTS }, (_, t) =>
  t < 3 ? 6 : t < 11 ? 7 : 10
);

export const createEV = (
  id: string,
  cap: number,
  soc: number,
  tgt: number,
  arr: number,
  dep: number,
  pmax: number
): EV => ({ id, cap, soc, tgt, arr, dep, pmax });

export const PRESETS: Record<string, ScenarioPreset> = {
  sunny: {
    name: 'A · Sunny Campus',
    pk: 90,
    grid: 60,
    n: 5,
    cp: 22,
    evs: [
      createEV('EV-01', 60, 20, 80, 0, 8, 22),
      createEV('EV-02', 75, 30, 90, 1, 10, 22),
      createEV('EV-03', 40, 25, 85, 1, 9, 11),
      createEV('EV-04', 60, 40, 90, 2, 12, 22),
      createEV('EV-05', 80, 15, 80, 2, 13, 22),
      createEV('EV-06', 50, 35, 85, 3, 11, 11),
      createEV('EV-07', 60, 20, 70, 4, 13, 22),
      createEV('EV-08', 45, 30, 80, 4, 12, 11),
    ],
  },
  evening: {
    name: 'B · Evening Peak',
    pk: 22,
    grid: 70,
    n: 5,
    cp: 22,
    evs: [
      createEV('EV-01', 60, 20, 80, 6, 13, 22),
      createEV('EV-02', 75, 15, 85, 7, 14, 22),
      createEV('EV-03', 40, 25, 90, 7, 13, 11),
      createEV('EV-04', 60, 30, 80, 8, 14, 22),
      createEV('EV-05', 80, 20, 75, 8, 14, 22),
      createEV('EV-06', 50, 25, 85, 9, 14, 11),
      createEV('EV-07', 60, 20, 80, 9, 14, 22),
      createEV('EV-08', 45, 35, 90, 10, 14, 11),
      createEV('EV-09', 55, 20, 80, 10, 14, 22),
      createEV('EV-10', 70, 30, 85, 10, 14, 22),
    ],
  },
  urgent: {
    name: 'C · Urgent Arrivals',
    pk: 50,
    grid: 40,
    n: 4,
    cp: 22,
    evs: [
      createEV('EV-01', 60, 20, 80, 2, 5, 22),
      createEV('EV-02', 75, 15, 70, 2, 6, 22),
      createEV('EV-03', 40, 25, 85, 3, 6, 11),
      createEV('EV-04', 60, 30, 80, 3, 6, 22),
      createEV('EV-05', 80, 20, 75, 4, 7, 22),
      createEV('EV-06', 50, 25, 80, 4, 8, 11),
      createEV('EV-07', 60, 40, 90, 1, 12, 22),
      createEV('EV-08', 45, 30, 80, 1, 13, 11),
    ],
  },
};

export const STATIONS: StationData[] = [
  {
    n: 'Main Campus Hub',
    locationName: 'NRI Institute of Technology, Agiripalli, Andhra Pradesh',
    lat: 16.5062,
    lng: 80.648,
    ch: 12,
    cap: 120,
    solar: 86,
    occ: 0.67,
    q: 3,
    grid: 48,
  },
  {
    n: 'North Campus',
    locationName: 'North Technology Enclave, Sector 4',
    lat: 16.545,
    lng: 80.62,
    ch: 8,
    cap: 36,
    solar: 30,
    occ: 0.75,
    q: 2,
    grid: 22,
  },
  {
    n: 'Research Park',
    locationName: 'Clean Energy Innovation Corridor',
    lat: 16.47,
    lng: 80.7,
    ch: 8,
    cap: 50,
    solar: 32,
    occ: 0.5,
    q: 0,
    grid: 18,
  },
  {
    n: 'City Center',
    locationName: 'Metro Transit Interchange Plaza',
    lat: 16.52,
    lng: 80.59,
    ch: 10,
    cap: 80,
    solar: 20,
    occ: 0.4,
    q: 1,
    grid: 44,
  },
];

export const calculateRequiredEnergy = (ev: EV): number => {
  return (ev.cap * (ev.tgt - ev.soc)) / 100;
};

export interface OptimizerState {
  sc: string;
  solar: number[];
  tariff: number[];
  grid: number;
  n: number;
  cp: number;
  sS: number;   // Solar multiplier
  pm: number;   // Price multiplier
  ef: number;   // Grid emissions factor kg/kWh
  station: string;
  dur: number;
  T: number;
  bt: BatteryStorage;
  evs: EV[];
  msg: string;
}

export const getInitialOptimizerState = (): OptimizerState => {
  const p = PRESETS['sunny'];
  return {
    sc: 'sunny',
    solar: generateSolarCurve(p.pk),
    tariff: [...DEFAULT_TARIFF],
    grid: p.grid,
    n: p.n,
    cp: p.cp,
    sS: 1.0,
    pm: 1.0,
    ef: 0.82,
    station: 'Main Campus Hub',
    dur: SLOT_DURATION_HOURS,
    T: TOTAL_SLOTS,
    bt: {
      on: 0,
      cap: 60,
      pw: 20,
      eff: 0.92,
      soc0: 20,
    },
    evs: JSON.parse(JSON.stringify(p.evs)),
    msg: '',
  };
};

export const validateInputs = (s: OptimizerState): string[] => {
  const errors: string[] = [];
  if (s.bt.on) {
    if (
      !(
        s.bt.cap > 0 &&
        s.bt.pw > 0 &&
        s.bt.eff >= 0.5 &&
        s.bt.eff <= 1.0 &&
        s.bt.soc0 >= 0 &&
        s.bt.soc0 <= 100
      )
    ) {
      errors.push('Battery: capacity & power > 0, efficiency 0.5–1.0, initial SOC 0–100%');
    }
  }
  if (s.grid <= 0) errors.push('Grid import limit must be greater than 0 kW');
  if (s.n < 1 || s.cp <= 0) errors.push('Chargers count and power (kW) must be positive');

  s.evs.forEach((v) => {
    const reasons: string[] = [];
    if (!v.id) reasons.push('missing ID');
    if (!(v.cap > 0)) reasons.push('capacity must be > 0 kWh');
    if (!(v.soc >= 0 && v.soc < 100)) reasons.push('current SOC must be 0–99%');
    if (!(v.tgt > v.soc && v.tgt <= 100)) reasons.push('target SOC must exceed current SOC (≤ 100%)');
    if (!(v.pmax > 0)) reasons.push('max power must be > 0 kW');
    if (!(v.dep > v.arr && v.dep <= s.T && v.arr >= 0)) {
      reasons.push(`arrival & departure slots invalid (0–${s.T})`);
    }
    if (reasons.length) {
      errors.push(`${v.id || 'Unnamed EV'}: ${reasons.join(', ')}`);
    }
  });

  return errors;
};

export const runSimulation = (s: OptimizerState, isOptimized: boolean): SimulationResult => {
  const { evs, dur, T, n, cp, grid } = s;
  const sol = s.solar.map((x) => x * s.sS);
  const tr = s.tariff.map((x) => x * s.pm);
  const rem = evs.map((e) => calculateRequiredEnergy(e));
  const need = [...rem];

  const sch: (SlotAllocation | null)[][] = evs.map(() => Array(T).fill(null));
  const sl: SlotTelemetry[] = [];
  const ex: DecisionLog[] = [];
  const seen: Record<string, boolean> = {};

  const effectivePower = (i: number) => Math.min(evs[i].pmax, cp);

  // Check physical feasibility for each EV window
  evs.forEach((e, i) => {
    const maxEnergyInWindow = effectivePower(i) * (e.dep - e.arr) * dur;
    if (need[i] > maxEnergyInWindow + 1e-9) {
      ex.push({
        t: e.arr,
        m: `${e.id}: Requested energy (${formatNumber(need[i])} kWh) is physically infeasible in its stay window (max deliverable is ${formatNumber(maxEnergyInWindow)} kWh).`,
      });
    }
  });

  const BT = s.bt;
  let bs = BT.on ? (BT.cap * BT.soc0) / 100 : 0;

  for (let t = 0; t < T; t++) {
    // Vehicles present and needing energy
    const activeIndices = evs
      .map((_, i) => i)
      .filter((i) => evs[i].arr <= t && t < evs[i].dep && rem[i] > 1e-6);

    // Slack metric: how many spare slots remain before deadline
    const calculateSlack = (i: number) =>
      evs[i].dep - t - rem[i] / (effectivePower(i) * dur);

    // Baseline: FCFS (arrival order)
    // Optimized: Urgency (slack order), breaking ties by largest remaining energy
    const ordered = activeIndices.sort(
      isOptimized
        ? (a, b) => calculateSlack(a) - calculateSlack(b) || rem[b] - rem[a]
        : (a, b) => evs[a].arr - evs[b].arr || a - b
    );

    // Effective cost helper: if solar covers car, marginal tariff is 0
    const effectiveTariff = (i: number, slotIdx: number) =>
      sol[slotIdx] >= effectivePower(i) ? 0 : tr[slotIdx];

    const batteryDischarge = BT.on ? Math.min(BT.pw, bs / dur) : 0;
    const totalAvailableSupply = sol[t] + grid + batteryDischarge;
    let usedPower = 0;
    let activeChargers = 0;
    const slotAllocations: [number, number][] = [];

    for (const i of ordered) {
      if (activeChargers >= n) {
        if (!seen['c' + i] && isOptimized) {
          seen['c' + i] = true;
          ex.push({
            t,
            m: `${evs[i].id}: Waited at ${formatSlotTime(t)} — all ${n} chargers busy with more urgent EVs.`,
          });
        }
        continue;
      }

      let capLimit = 1e9;

      if (isOptimized) {
        const slack = calculateSlack(i);
        if (slack <= 1 && !seen['p' + i]) {
          seen['p' + i] = true;
          ex.push({
            t,
            m: `${evs[i].id}: Prioritized at ${formatSlotTime(t)} because departure is approaching with ${formatNumber(rem[i])} kWh still needed.`,
          });
        }

        // Load shifting: if EV has ample slack (> 2 slots), check if solar or cheaper grid awaits
        if (slack > 2) {
          const freeSolar = sol[t] - usedPower;
          if (freeSolar > 0.5) {
            capLimit = freeSolar;
          } else {
            let minFutureTariff = 1e9;
            for (let k = t + 1; k < evs[i].dep; k++) {
              minFutureTariff = Math.min(minFutureTariff, effectiveTariff(i, k));
            }
            if (tr[t] > minFutureTariff) {
              if (!seen['d' + i]) {
                seen['d' + i] = true;
                ex.push({
                  t,
                  m: `${evs[i].id}: Shifted from ${formatSlotTime(t)} to a later slot with higher solar or lower tariff (slack: ${formatNumber(slack)} slots).`,
                });
              }
              continue;
            }
          }
        }
      }

      const wantPower = Math.min(effectivePower(i), rem[i] / dur);
      const allocatedPower = Math.min(
        wantPower,
        capLimit,
        totalAvailableSupply - usedPower
      );

      if (allocatedPower <= 0.01) continue;

      if (
        allocatedPower < Math.min(wantPower, capLimit) - 0.01 &&
        !seen['r' + i]
      ) {
        seen['r' + i] = true;
        ex.push({
          t,
          m: `${evs[i].id}: Charging power reduced to ${formatNumber(allocatedPower)} kW at ${formatSlotTime(t)} to respect the grid import limit.`,
        });
      }

      usedPower += allocatedPower;
      activeChargers++;
      rem[i] -= allocatedPower * dur;
      slotAllocations.push([i, allocatedPower]);
    }

    // Power source breakdown: Solar first, then Battery, then Grid
    const solarUsed = Math.min(usedPower, sol[t]);
    const batteryUsed = Math.min(usedPower - solarUsed, batteryDischarge);
    const gridDrawn = usedPower - solarUsed - batteryUsed;

    let batteryCharged = 0;
    if (BT.on) {
      bs -= batteryUsed * dur;
      const surplusSolar = Math.max(0, sol[t] - solarUsed);
      const roomInBattery = (BT.cap - bs) / (dur * BT.eff);
      batteryCharged = Math.min(BT.pw, surplusSolar, roomInBattery);
      bs += batteryCharged * dur * BT.eff;
    }

    slotAllocations.forEach(([i, powerVal]) => {
      sch[i][t] = {
        p: powerVal,
        sf: usedPower > 0 ? solarUsed / usedPower : 0,
        bf: usedPower > 0 ? batteryUsed / usedPower : 0,
      };
    });

    sl.push({
      tot: usedPower,
      s: solarUsed,
      b: batteryUsed,
      bc: batteryCharged,
      bs,
      g: gridDrawn,
      sol: sol[t],
      cost: gridDrawn * dur * tr[t],
      tr: tr[t],
      ch: activeChargers,
      dem: activeIndices.reduce((acc, idx) => acc + effectivePower(idx), 0),
    });
  }

  const fractionMet = evs.map((_, i) =>
    need[i] > 0 ? 1 - Math.max(0, rem[i]) / need[i] : 1
  );
  const unmetEnergy = rem.reduce((acc, r) => acc + Math.max(0, r), 0);
  const metTargets = rem.map((r) => r <= 1e-6);

  // Jain's fairness index: (sum(xi))^2 / (n * sum(xi^2))
  const sumF = fractionMet.reduce((a, b) => a + b, 0);
  const sumSq = fractionMet.reduce((a, b) => a + b * b, 0);
  const jainIndex =
    evs.length > 0 && sumSq > 0 ? sumF ** 2 / (evs.length * sumSq) : 1;

  const metrics = {
    bat: sl.reduce((acc, x) => acc + x.b * dur, 0),
    bchg: sl.reduce((acc, x) => acc + x.bc * dur, 0),
    cost: sl.reduce((acc, x) => acc + x.cost, 0),
    solar: sl.reduce((acc, x) => acc + x.s * dur, 0),
    grid: sl.reduce((acc, x) => acc + x.g * dur, 0),
    peak: Math.max(...sl.map((x) => x.g), 0),
    succ: metTargets.filter(Boolean).length,
    unmet: unmetEnergy,
    fair: jainIndex,
    deliv: sl.reduce((acc, x) => acc + x.tot * dur, 0),
  };

  return {
    sch,
    sl,
    ex: ex.sort((a, b) => a.t - b.t),
    rem,
    ok: metTargets,
    m: metrics,
  };
};

export interface DualComparison {
  b: SimulationResult;
  o: SimulationResult;
}

export const runFullOptimization = (state: OptimizerState): DualComparison => {
  return {
    b: runSimulation(state, false),
    o: runSimulation(state, true),
  };
};
