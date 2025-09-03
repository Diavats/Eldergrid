"use client";

import { useEffect, useState } from "react";
import { 
  fetchGovernmentEnergyData, 
  getDataSourceInfo, 
  type GovernmentEnergyData 
} from "@/lib/api/govData";

export default function GovDataMock() {
  const [rows, setRows] = useState<GovernmentEnergyData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the integration layer to fetch government data
        const data = await fetchGovernmentEnergyData();
        setRows(data);
      } catch (e: any) {
        console.error("Failed to load government data:", e);
        setError("Failed to load government reference data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dataSourceInfo = getDataSourceInfo();

  return (
    <div className="rounded-2xl p-6 shadow border bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">Government Energy Reference</h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {dataSourceInfo.source === 'mock' ? 'Mock Data' : 'Live API'}
        </div>
      </div>
      
      {dataSourceInfo.description && (
        <p className="text-sm text-gray-600 mb-3">{dataSourceInfo.description}</p>
      )}
      
      {loading && <p className="text-sm text-gray-500">Loading government data...</p>}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((r, idx) => (
            <div key={`${r.appliance}-${idx}`} className="rounded-xl border p-4">
              <div className="font-semibold">{r.appliance}</div>
              <div className="text-sm text-gray-700">Avg: {r.avg_usage_minutes} min</div>
              <div className="text-sm text-gray-500">{r.region}</div>
              <div className="text-xs text-gray-400 mt-1">
                {r.source === 'mock' ? 'Seeded Data' : 'API Data'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


