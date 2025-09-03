"use client";

import { useEffect, useState } from "react";

type GovRow = {
  appliance: string;
  avg_usage_minutes: number;
  region: string;
  source: string;
};

export default function GovDataMock() {
  const [rows, setRows] = useState<GovRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/gov_energy_mock.json", { cache: "no-store" });
        const json = (await res.json()) as GovRow[];
        setRows(json);
      } catch (e: any) {
        setError("Failed to load gov reference data");
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl p-6 shadow border bg-white">
      <h3 className="text-xl font-semibold mb-3">Government Energy Reference (Mock)</h3>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rows.map((r, idx) => (
          <div key={`${r.appliance}-${idx}`} className="rounded-xl border p-4">
            <div className="font-semibold">{r.appliance}</div>
            <div className="text-sm text-gray-700">Avg: {r.avg_usage_minutes} min</div>
            <div className="text-sm text-gray-500">{r.region}</div>
            <div className="text-xs text-gray-400 mt-1">{r.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


