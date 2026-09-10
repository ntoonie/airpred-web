"use client";

import React, { useState } from "react";
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
} from "recharts";

// Mock data for the chart based on the image
const forecastData = [
  { hour: "Now", pm25: 17 },
  { hour: "", pm25: 21 },
  { hour: "", pm25: 24.5 },
  { hour: "", pm25: 29 },
  { hour: "6", pm25: 34 },
  { hour: "", pm25: 38 },
  { hour: "", pm25: 35 },
  { hour: "12", pm25: 31 },
  { hour: "", pm25: 35 },
  { hour: "", pm25: 30 },
  { hour: "18", pm25: 24.5 },
  { hour: "", pm25: 20 },
  { hour: "", pm25: 16.5 },
  { hour: "24", pm25: 14.5 },
];

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

const modelVariants = [
  "Variant A - Single-branch TCN with Unified Encoding and Concatenation Fusion (Multimodal input)",
  "Variant B - Dual-branch TCN with Concatenation Fusion (Multimodal input)",
  "Variant C - AIRPRED: Dual-branch TCN with Cross-Modal Attention Fusion (Multimodal input)",
  "Variant D - Single-branch TCN with PM2.5-only input",
];

const variantForecastData = {
  [modelVariants[0]]: forecastData,
  [modelVariants[1]]: forecastData.map((point, index) => ({
    ...point,
    pm25: point.pm25 + [0, 1, -1, 1.5, 2, 1, -1.5, 1, 0.5, -1, 1, 0, -0.5, 1][index],
  })),
  [modelVariants[2]]: forecastData.map((point, index) => ({
    ...point,
    pm25: point.pm25 + [0, -1, 0.5, -1, -1.5, 0, 1, -1, -1.5, 0.5, -1, 0, 0.5, -1][index],
  })),
  [modelVariants[3]]: forecastData.map((point, index) => ({
    ...point,
    pm25: point.pm25 + [0, 2, 1, 2.5, 3, 2, 1.5, 2, 2.5, 1, 2, 1.5, 1, 2][index],
  })),
};

function ForecastChart({ data }: { data: typeof forecastData }) {
  return (
    <div className="h-[300px] min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
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
            dataKey="pm25"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-gray-400">Hours</div>
    </div>
  );
}

export default function AirPredPage() {
  // State to toggle between the main dashboard and the "How It Works" view
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  // ===== "HOW IT WORKS" VIEW =====
  if (showHowItWorks) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-12 relative">
            {/* Empty div to balance flexbox */}
            <div className="w-24"></div> 
            
            <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">
              How It Works
            </span>
            
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-md transition-colors"
            >
              Home
            </button>
          </div>

          {/* Header Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About the AIRPRED Model
          </h1>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            AIRPRED uses a direct multi-step forecasting architecture trained on historical station data, meteorological inputs, and satellite-derived aerosol observations to produce 24-hour PM2.5 predictions for Philippine urban areas.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#f0f4ff] rounded-xl py-10 px-6 text-center border border-blue-50">
              <div className="text-blue-600 text-5xl font-bold mb-2">24h</div>
              <div className="text-slate-500 font-medium">Forecast window</div>
            </div>
            
            <div className="bg-[#f0fdf4] rounded-xl py-10 px-6 text-center border border-green-50">
              <div className="text-green-500 text-5xl font-bold mb-2">10</div>
              <div className="text-slate-500 font-medium">Urban stations</div>
            </div>
            
            <div className="bg-[#fffdf0] rounded-xl py-10 px-6 text-center border border-yellow-50">
              <div className="text-orange-500 text-5xl font-bold mb-2">Hourly</div>
              <div className="text-slate-500 font-medium">Update frequency</div>
            </div>
          </div>

          {/* Numbered Steps */}
          <div className="space-y-10 max-w-4xl">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 mt-1">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Feature extraction</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meteorological drivers and lagged PM2.5 values are normalized and encoded into a fixed-length input tensor covering a 48-hour lookback window.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 mt-1">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Direct multi-step output</h3>
                <p className="text-gray-600 leading-relaxed">
                  The model produces all 24 hourly PM2.5 predictions simultaneously — avoiding error accumulation that plagues recursive single-step approaches.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 mt-1">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Post-processing & thresholds</h3>
                <p className="text-gray-600 leading-relaxed">
                  Raw predictions are bias-corrected and mapped against Philippine NAAQS (25 µg/m³) and WHO (15 µg/m³) guidelines for health-contextualized output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN DASHBOARD VIEW =====
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
          // Remember to ensure image_c48b35.jpg is in your /public folder!
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.65), rgba(17, 24, 39, 0.65)), url('/image_c48b35.jpg')`,
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
          
          {/* UPDATED: Added onClick handler to trigger the state change */}
          <button 
            onClick={() => setShowHowItWorks(true)}
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
              <p className="text-xs text-gray-400">Forecast generated:</p>
              <p className="text-sm font-medium">May 9, 2026 at 8:00 AM (PHT)</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <Calendar className="text-blue-500 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-400">24-hour window:</p>
              <p className="text-sm font-medium">
                May 9, 8:00 AM &rarr; May 10, 8:00 AM
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Chart Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col lg:col-span-3">
            <div className="mb-6">
              <h3 className="font-bold text-gray-800">Model Comparison</h3>
              <p className="mt-1 text-xs text-gray-500">
                Compare the next 24-hour PM2.5 forecast from all four model variants.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-2">
              {modelVariants.map((variant) => {
                const [variantName, ...descriptionParts] = variant.split(" - ");

                return (
                  <div key={variant} className="min-w-0 rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-bold text-gray-800">{variantName}</h4>
                    <p className="mt-1 min-h-10 text-xs leading-relaxed text-gray-500">
                      {descriptionParts.join(" - ")}
                    </p>
                    <ForecastChart data={variantForecastData[variant as keyof typeof variantForecastData]} />
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                <span><span className="mr-1 inline-block h-0.5 w-4 bg-blue-500 align-middle"></span>24-hr Forecast</span>
                <span><span className="mr-1 inline-block w-4 border-b border-dashed border-red-400 align-middle"></span>PH NAAQS (25 µg/m³)</span>
                <span><span className="mr-1 inline-block w-4 border-b border-dashed border-green-500 align-middle"></span>WHO Guideline (15 µg/m³)</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Forecast generated: May 9, 2026 at 8:00 AM (PHT)</p>
              <p className="text-xs text-gray-500">24-hour window: May 9, 2026 8:00 AM &rarr; May 10, 2026 8:00 AM</p>
            </div>
          </div>

          {/* Side Status Panel */}
          <div className="bg-[#fffdf2] border border-orange-100 rounded-xl p-4 shadow-sm flex flex-col self-start lg:col-span-1 lg:h-fit">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-600 mb-4">Manila — Next 24 Hours</p>
              <div className="flex flex-col items-center justify-center">
                <div className="bg-yellow-400 text-white rounded-full p-2 mb-2">
                   <Smile className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-yellow-500 tracking-wide mb-2">
                  MODERATE
                </h2>
                <div className="bg-yellow-200/50 text-yellow-700 text-xs font-semibold py-1 px-3 rounded-full">
                  Peak: 28.4 µg/m³
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded p-2 mb-4 flex items-start gap-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Sensitive groups should limit outdoor activity.
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
              <li><a href="#" onClick={(e) => { e.preventDefault(); setShowHowItWorks(true); }} className="hover:text-white transition-colors">About the Model</a></li>
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