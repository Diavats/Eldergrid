"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EnergySavingsCounter() {
  const [savings, setSavings] = useState({ kwh: 0, inr: 0 });
  const [loading, setLoading] = useState(true);

  // Simple assumptions (hackathon-friendly mock numbers)
  const APPLIANCE_ENERGY = {
    geyser: { kwhPerHour: 2, costPerKwh: 8 }, // 2 kWh per hr, ₹8 per kWh
    heater: { kwhPerHour: 1.5, costPerKwh: 8 },
    tv: { kwhPerHour: 0.2, costPerKwh: 8 },
  } as const;

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      // Get last 50 appliance logs
      const { data: logs, error } = await supabase
        .from("appliance_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching logs:", error);
        setLoading(false);
        return;
      }

      // Calculate "saved" energy → pretend anomalies were prevented
      let totalKwhSaved = 0;

      logs?.forEach((log: any) => {
        const appliance: string = (log.appliance_name || "").toLowerCase();
        const minutes: number = Number(log.usage_minutes) || 0;

        if (appliance.includes("geyser") && minutes > 60) {
          totalKwhSaved += ((minutes - 60) / 60) * APPLIANCE_ENERGY.geyser.kwhPerHour;
        }

        if (appliance.includes("heater") && minutes > 120) {
          totalKwhSaved += ((minutes - 120) / 60) * APPLIANCE_ENERGY.heater.kwhPerHour;
        }

        if (appliance.includes("tv") && minutes > 240) {
          totalKwhSaved += ((minutes - 240) / 60) * APPLIANCE_ENERGY.tv.kwhPerHour;
        }
      });

      const totalInrSaved = totalKwhSaved * 8; // ₹8 per kWh

      setSavings({ kwh: totalKwhSaved, inr: totalInrSaved });
      setLoading(false);
    }

    fetchLogs();
  }, []);

  return (
    <div className="p-6 bg-green-50 rounded-2xl shadow-md border border-green-200">
      <h2 className="text-xl font-bold text-green-800 mb-2">🌱 Energy Savings</h2>
      {loading ? (
        <p className="text-gray-500">Calculating savings...</p>
      ) : (
        <div>
          <p className="text-3xl font-extrabold text-green-700">{savings.kwh.toFixed(2)} kWh</p>
          <p className="text-lg text-green-600">≈ ₹{savings.inr.toFixed(2)} saved</p>
          <p className="text-sm text-gray-500 mt-2">Based on anomalies prevented (geyser, heater, TV usage)</p>
        </div>
      )}
    </div>
  );
}


