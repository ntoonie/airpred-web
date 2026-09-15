"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Smile,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Tooltip,
} from "recharts";

// Available NCR stations (display labels, matching thesis Table 2's formatting)
const cities = [
  "Manila",
  "Quezon City",
  "Caloocan",
  "Valenzuela",
  "Pasig",
  "Makati",
  "Mandaluyong City",
  "Navotas City",
  "Pasay City",
  "San Juan City",
];

// The training pipeline's raw city labels (config.yaml's data.cities, and
// therefore demo_inputs.npz's keys on the backend) don't exactly match the
// display names above -- no "City" suffix, underscores for multi-word names.
// Map display label -> backend key here at request time, rather than
// changing either side to match the other.
const cityApiKey: Record<string, string> = {
  "Manila": "Manila",
  "Quezon City": "Quezon_City",
  "Caloocan": "Caloocan",
  "Valenzuela": "Valenzuela",
  "Pasig": "Pasig",
  "Makati": "Makati",
  "Mandaluyong City": "Mandaluyong",
  "Navotas City": "Navotas",
  "Pasay City": "Pasay",
  "San Juan City": "San_Juan",
};

const modelVariants = [
  "Variant A - Single-branch TCN with Unified Encoding and Concatenation Fusion (Multimodal input)",
  "Variant B - Dual-branch TCN with Concatenation Fusion (Multimodal input)",
  "Variant C - AIRPRED: Dual-branch TCN with Cross-Modal Attention Fusion (Multimodal input)",
  "Variant D - Single-branch TCN with PM2.5-only input",
];

// Real predictions, computed LIVE by a small FastAPI backend (see
// airpred-api/) that loads the trained checkpoints and runs model.forward()
// on every request -- nothing here is precomputed or cached client-side.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ChartPoint = {
  hour: string;
  variantA: number;
  variantB: number;
  variantC: number;
  variantD: number;
};

type PredictResponse = {
  city: string;
  computed_live: boolean;
  variants: {
    A: { predicted: number[] };
    B: { predicted: number[] };
    C: { predicted: number[] };
    D: { predicted: number[] };
  };
};

type AqiCategory = {
  label: string;
  icon: "smile" | "warning";
  iconBg: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  advisory: string;
};

// Thresholds match the AQI Legend already rendered in the side panel below
// (EMB-DENR / Philippine NAAQS PM2.5 categories).
function getAqiCategory(peak: number): AqiCategory {
  if (peak <= 12) {
    return {
      label: "GOOD", icon: "smile", iconBg: "bg-green-500",
      textColor: "text-green-600", badgeBg: "bg-green-100", badgeText: "text-green-700",
      advisory: "Air quality is satisfactory for all groups.",
    };
  }
  if (peak <= 35.4) {
    return {
      label: "MODERATE", icon: "smile", iconBg: "bg-yellow-400",
      textColor: "text-yellow-500", badgeBg: "bg-yellow-200/50", badgeText: "text-yellow-700",
      advisory: "Sensitive groups should limit outdoor activity.",
    };
  }
  if (peak <= 55.4) {
    return {
      label: "UNHEALTHY FOR SENSITIVE GROUPS", icon: "warning", iconBg: "bg-orange-400",
      textColor: "text-orange-500", badgeBg: "bg-orange-100", badgeText: "text-orange-700",
      advisory: "Sensitive groups should avoid prolonged outdoor exertion.",
    };
  }
  if (peak <= 150.4) {
    return {
      label: "UNHEALTHY", icon: "warning", iconBg: "bg-red-500",
      textColor: "text-red-600", badgeBg: "bg-red-100", badgeText: "text-red-700",
      advisory: "Everyone should limit prolonged outdoor exertion.",
    };
  }
  if (peak <= 250.4) {
    return {
      label: "VERY UNHEALTHY", icon: "warning", iconBg: "bg-purple-500",
      textColor: "text-purple-600", badgeBg: "bg-purple-100", badgeText: "text-purple-700",
      advisory: "Everyone should avoid outdoor activity.",
    };
  }
  return {
    label: "HAZARDOUS", icon: "warning", iconBg: "bg-rose-900",
    textColor: "text-rose-900", badgeBg: "bg-rose-100", badgeText: "text-rose-800",
    advisory: "Health warning: everyone should remain indoors.",
  };
}

const modelDetails = [
  { label: "Variant A", detail: "Single branch · Unified encoding · Concatenation fusion · Multimodal", color: "bg-blue-500" },
  { label: "Variant B", detail: "Dual branch · Concatenation fusion · Multimodal", color: "bg-orange-500" },
  { label: "Variant C (AIRPRED)", detail: "Dual branch · Cross-modal attention fusion · Multimodal", color: "bg-green-600" },
  { label: "Variant D", detail: "Single branch · PM2.5-only input", color: "bg-purple-500" },
];

function ForecastChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[460px] min-h-[460px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            dy={10}
          />
          <YAxis
            domain={[0, 50]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            ticks={[0, 10, 20, 30, 40, 50]}
            label={{ value: "PM2.5 (µg/m³)", angle: -90, position: "insideLeft", offset: 20, style: { fontSize: "12px", fill: "#888" } }}
          />
          <ReferenceLine y={25} stroke="#f87171" strokeDasharray="4 4" />
          <ReferenceLine y={15} stroke="#22c55e" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="variantA"
            name="Variant A"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line type="monotone" dataKey="variantB" name="Variant B" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="variantC" name="Variant C (AIRPRED)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4, fill: "#16a34a", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="variantD" name="Variant D" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: "#a855f7", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Tooltip
            formatter={(value, name) => [`${value} µg/m³`, name]}
            contentStyle={{ borderRadius: "8px", borderColor: "#e5e7eb", fontSize: "12px" }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px" }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-gray-400">Hours</div>
    </div>
  );
}

export default function AirPredPage() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [livePrediction, setLivePrediction] = useState<PredictResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [respondedAt, setRespondedAt] = useState<Date | null>(null);

  // Re-runs on every city change -- each call is a genuine live forward
  // pass through all four models on the backend, not a lookup.
  useEffect(() => {
    setIsComputing(true);
    setLoadError(null);
    fetch(`${API_BASE_URL}/predict?city=${encodeURIComponent(cityApiKey[selectedCity] ?? selectedCity)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json() as Promise<PredictResponse>;
      })
      .then((data) => {
        setLivePrediction(data);
        setRespondedAt(new Date());
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setIsComputing(false));
  }, [selectedCity]);

  const comparisonData: ChartPoint[] = livePrediction
    ? livePrediction.variants.A.predicted.map((_, i) => ({
        hour: i === 0 ? "Now" : [5, 11, 17, 23].includes(i) ? String(i + 1) : "",
        variantA: livePrediction.variants.A.predicted[i],
        variantB: livePrediction.variants.B.predicted[i],
        variantC: livePrediction.variants.C.predicted[i],
        variantD: livePrediction.variants.D.predicted[i],
      }))
    : [];

  // The advisory panel is driven by AIRPRED (Variant C) specifically -- the
  // thesis's proposed system -- not an average across the four variants
  // being compared in the chart.
  const peakValue = livePrediction ? Math.max(...livePrediction.variants.C.predicted) : null;
  const aqi = peakValue !== null ? getAqiCategory(peakValue) : null;

  // NOTE: the backend's demo input windows have no per-window timestamp
  // attached (test.npz only tracks which city each window belongs to), so
  // there's no real calendar date to show for "which 24 hours this is."
  // This timestamp reflects when THIS live computation actually ran.
  const generatedAtLabel = respondedAt
    ? respondedAt.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "medium" })
    : isComputing
    ? "Computing..."
    : "—";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* ===== NAVIGATION ===== */}
      <nav className="bg-white px-8 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="text-blue-600 font-bold text-xl tracking-wider">
          AIRPRED
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section
        className="relative h-[600px] flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: "linear-gradient(rgba(2, 13, 45, 0.32), rgba(2, 13, 45, 0.48)), url('/airpred-network.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Breathe Easier with <br /> Predictive Intelligence
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-md transition-colors">
            Explore Live Dashboard
          </button>
          
          <button 
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-8 rounded-md transition-colors"
          >
            Learn How It Works
          </button>
        </div>

        {/* Floating Badge */}
        <div className="absolute bottom-6 right-6 bg-white rounded-full py-2 px-4 flex items-center gap-2 shadow-lg">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
          <span className="text-blue-600 text-sm font-semibold">
            Live for Philippine Urban Areas
          </span>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="bg-[#111827] text-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Powered by Advanced Analytics
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Our model continuously processes meteorological and environmental data
              to bring you highly accurate 24-hour predictive windows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
              <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24-Hour Precision</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Anticipate air quality drops before they happen with our rolling
                24-hour PM2.5 forecasting curve.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
              <div className="bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Health Guidelines</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Forecasts mapped against Philippine NAAQS and WHO guidelines to
                give actionable health context.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
              <div className="bg-orange-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Vulnerable Group Alerts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Clear, color-coded AQI warnings ensure sensitive groups know when
                to limit outdoor activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD SECTION ===== */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide mb-2">
            AIRPRED
          </h2>
          <p className="text-gray-500">
            PM2.5 Forecast for Philippine Urban Areas
          </p>
        </div>

        {/* Dashboard Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <label htmlFor="city-select" className="text-gray-400 text-sm whitespace-nowrap">
              Select City:
            </label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <Clock className="text-blue-500 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-400">Live prediction computed:</p>
              <p className="text-sm font-medium">{generatedAtLabel}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <Calendar className="text-blue-500 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-400">Forecast window:</p>
              <p className="text-sm font-medium">
                Most recent held-out test window
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(220px,1fr)]">
          {/* Chart Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-gray-800">Model Comparison</h3>
              <p className="mt-1 text-xs text-gray-500">
                Compare the next 24-hour PM2.5 forecast from all four model variants.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-xs text-gray-500">
                All four forecasts share the same PM2.5 scale for direct comparison.
              </p>
              <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {modelDetails.map((model) => (
                  <div key={model.label} className="rounded-md bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${model.color}`} />
                      {model.label}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{model.detail}</p>
                  </div>
                ))}
              </div>
              {loadError && (
                <p className="mb-3 text-xs text-red-500">
                  Could not reach the live inference API ({loadError}). Check that the
                  backend is running and NEXT_PUBLIC_API_URL is set correctly.
                </p>
              )}
              {isComputing && !loadError && (
                <p className="mb-3 text-xs text-blue-500">
                  Computing live prediction for {selectedCity}...
                </p>
              )}
              <ForecastChart data={comparisonData} />
            </div>

            <div className="mt-8 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                <span><span className="mr-1 inline-block h-0.5 w-4 bg-blue-500 align-middle"></span>24-hr Forecast</span>
                <span><span className="mr-1 inline-block w-4 border-b border-dashed border-red-400 align-middle"></span>PH NAAQS (25 µg/m³)</span>
                <span><span className="mr-1 inline-block w-4 border-b border-dashed border-green-500 align-middle"></span>WHO Guideline (15 µg/m³)</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Live prediction computed: {generatedAtLabel}</p>
              <p className="text-xs text-gray-500">Forecast window: most recent held-out test window (per station)</p>
            </div>
          </div>

          {/* Side Status Panel */}
          <div className="bg-[#fffdf2] border border-orange-100 rounded-xl p-4 shadow-sm flex flex-col self-start lg:h-fit">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-600 mb-4">{selectedCity} — Next 24 Hours</p>
              <div className="flex flex-col items-center justify-center">
                <div className={`${aqi?.iconBg ?? "bg-gray-300"} text-white rounded-full p-2 mb-2`}>
                  {aqi?.icon === "warning" ? (
                    <AlertTriangle className="w-10 h-10" />
                  ) : (
                    <Smile className="w-10 h-10" />
                  )}
                </div>
                <h2 className={`text-xl font-bold ${aqi?.textColor ?? "text-gray-400"} tracking-wide mb-2`}>
                  {aqi?.label ?? "LOADING..."}
                </h2>
                <div className={`${aqi?.badgeBg ?? "bg-gray-100"} ${aqi?.badgeText ?? "text-gray-500"} text-xs font-semibold py-1 px-3 rounded-full`}>
                  Peak: {peakValue !== null ? `${peakValue.toFixed(1)} µg/m³` : "--"}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded p-2 mb-4 flex items-start gap-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                {aqi?.advisory ?? "Loading advisory..."}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-800 mb-3">
                AQI Legend (PM2.5 µg/m³)
              </h4>
              <ul className="text-xs space-y-2">
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">Good</span>
                  </div>
                  <span className="text-gray-500">0 - 12</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="text-gray-600">Moderate</span>
                  </div>
                  <span className="text-gray-500">12.1 - 35.4</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span className="text-gray-600">Unhealthy for Sensitive Groups</span>
                  </div>
                  <span className="text-gray-500">35.5 - 55.4</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-gray-600">Unhealthy</span>
                  </div>
                  <span className="text-gray-500">55.5 - 150.4</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-gray-600">Very Unhealthy</span>
                  </div>
                  <span className="text-gray-500">150.5 - 250.4</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-900"></span>
                    <span className="text-gray-600">Hazardous</span>
                  </div>
                  <span className="text-gray-500">250.5+</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-8 py-16 scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">How It Works</p>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">About the AIRPRED Model</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              AIRPRED uses a direct multi-step forecasting architecture trained on historical station data, meteorological inputs, and satellite-derived aerosol observations to produce 24-hour PM2.5 predictions for Philippine urban areas.
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-blue-50 bg-[#f0f4ff] px-6 py-10 text-center">
              <div className="mb-2 text-5xl font-bold text-blue-600">24h</div>
              <div className="font-medium text-slate-500">Forecast window</div>
            </div>
            <div className="rounded-xl border border-green-50 bg-[#f0fdf4] px-6 py-10 text-center">
              <div className="mb-2 text-5xl font-bold text-green-500">10</div>
              <div className="font-medium text-slate-500">Urban stations</div>
            </div>
            <div className="rounded-xl border border-yellow-50 bg-[#fffdf0] px-6 py-10 text-center">
              <div className="mb-2 text-5xl font-bold text-orange-500">Hourly</div>
              <div className="font-medium text-slate-500">Update frequency</div>
            </div>
          </div>

          <div className="max-w-4xl space-y-10">
            <div className="flex items-start gap-6">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">1</div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Feature extraction</h3>
                <p className="leading-relaxed text-gray-600">Meteorological drivers and lagged PM2.5 values are normalized and encoded into a fixed-length input tensor covering a 48-hour lookback window.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">2</div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Direct multi-step output</h3>
                <p className="leading-relaxed text-gray-600">The model produces all 24 hourly PM2.5 predictions simultaneously, avoiding error accumulation that plagues recursive single-step approaches.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">3</div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Post-processing &amp; thresholds</h3>
                <p className="leading-relaxed text-gray-600">Raw predictions are bias-corrected and mapped against Philippine NAAQS (25 µg/m³) and WHO (15 µg/m³) guidelines for health-contextualized output.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#111827] text-gray-400 py-12 px-8 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="text-white font-bold text-lg mb-2 tracking-wider">
              AIRPRED
            </div>
            <p className="max-w-xs">
              Dedicated to providing accurate, accessible air quality forecasts
              for healthier urban living in the Philippines.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">About the Model</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Methodology</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between text-xs">
          <p>© 2026 AIRPRED. All rights reserved.</p>
          <p>Data models provided for informational purposes.</p>
        </div>
      </footer>
    </div>
  );
}