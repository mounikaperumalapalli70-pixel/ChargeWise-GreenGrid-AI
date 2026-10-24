export interface EV {
  id: string;
  cap: number;   // Battery capacity in kWh
  soc: number;   // Current State of Charge %
  tgt: number;   // Target State of Charge %
  arr: number;   // Arrival slot (0 to T-1)
  dep: number;   // Departure slot (1 to T)
  pmax: number;  // Max charging power kW
}

export interface BatteryStorage {
  on: number;    // 1 if enabled, 0 if disabled
  cap: number;   // Capacity kWh
  pw: number;    // Max power kW
  eff: number;   // Round-trip efficiency 0.5 - 1.0
  soc0: number;  // Initial SOC %
}

export interface ScenarioPreset {
  name: string;
  pk: number;    // Solar peak kW
  grid: number;  // Grid limit kW
  n: number;     // Number of chargers
  cp: number;    // Charger power kW
  evs: EV[];
}

export interface SlotTelemetry {
  tot: number;   // Total charging power delivered kW
  s: number;     // Solar power used kW
  b: number;     // Battery discharge to EVs kW
  bc: number;    // Battery charge from solar kW
  bs: number;    // Battery stored energy kWh at end of slot
  g: number;     // Grid power drawn kW
  sol: number;   // Available solar kW
  cost: number;  // Cost for slot (grid kWh * tariff)
  tr: number;    // Tariff rate ₹/kWh
  ch: number;    // Active chargers count
  dem: number;   // Total requested unconstrained demand kW
}

export interface SlotAllocation {
  p: number;     // Power delivered kW
  sf: number;    // Fraction from solar (0-1)
  bf: number;    // Fraction from battery (0-1)
}

export interface DecisionLog {
  t: number;     // Slot index
  m: string;     // Explanation text
}

export interface SimulationMetrics {
  bat: number;   // Total battery discharged kWh
  bchg: number;  // Total battery charged kWh
  cost: number;  // Total electricity cost ₹
  solar: number; // Total solar energy utilized kWh
  grid: number;  // Total grid energy imported kWh
  peak: number;  // Peak grid demand kW
  succ: number;  // Number of EVs reaching target SOC
  unmet: number; // Total unmet energy kWh
  fair: number;  // Jain's fairness index (0 to 1)
  deliv: number; // Total energy delivered to EVs kWh
}

export interface SimulationResult {
  sch: (SlotAllocation | null)[][]; // [evIndex][slotIndex]
  sl: SlotTelemetry[];
  ex: DecisionLog[];
  rem: number[]; // Remaining energy needed per EV
  ok: boolean[]; // Whether each EV met target SOC
  m: SimulationMetrics;
}

export interface StationData {
  n: string;
  lat: number;
  lng: number;
  ch: number;
  cap: number;
  solar: number;
  occ: number;
  q: number;
  grid: number;
  locationName: string;
}

export interface ScenarioHistoryEntry {
  t: string;
  s: string;
  c: string;
  so: string;
  p: string;
  m: string;
  u: string;
}

export interface ConnectorSpec {
  standard: 'CCS-2' | 'Type 2 AC' | 'Bharat DC-001' | 'GB/T' | 'CHAdeMO' | 'Ather LEV';
  count: number;
  powerKw: number;
}

export interface IndiaStation {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  network: string;
  connectors: ConnectorSpec[];
  totalPowerKw: number;
  status: 'Available' | 'Busy' | 'Operational' | 'Under Maintenance';
  pricing: string;
  hours: string;
  amenities: string[];
  isSolarPowered?: boolean;
  contact?: string;
}

export interface IndiaStateInfo {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
}

