"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = { id: string; appliance: string; minutes: number };

const APPLIANCES = ["Geyser", "Heater", "Fan", "TV"] as const;

export default function CustomThresholds() {
  const [userId, setUserId] = useState<string | null>(null);
  const [appliance, setAppliance] = useState<typeof APPLIANCES[number]>("Geyser");
  const [minutes, setMinutes] = useState<number>(60);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id || null;
      if (!uid) {
        setError("Login required");
        setLoading(false);
        return;
      }
      setUserId(uid);
      await load(uid);
      setLoading(false);
    })();
  }, []);

  async function load(uid: string) {
    const { data, error } = await supabase
      .from("custom_thresholds")
      .select("id, appliance, minutes")
      .eq("user_id", uid)
      .order("appliance");
    if (error) {
      setError(error.message);
      return;
    }
    setRows((data as Row[]) || []);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    const { error } = await supabase.from("custom_thresholds").upsert({
      user_id: userId,
      appliance,
      minutes: Number(minutes) || 0,
    });
    if (error) {
      setError(error.message);
      return;
    }
    await load(userId);
  }

  return (
    <div className="rounded-2xl p-6 shadow border bg-white">
      <h3 className="text-xl font-semibold mb-3">Custom Thresholds</h3>
      <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <select className="rounded-xl border px-3 py-2" value={appliance} onChange={(e) => setAppliance(e.target.value as any)}>
          {APPLIANCES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="number"
          className="rounded-xl border px-3 py-2"
          value={minutes}
          min={0}
          onChange={(e) => setMinutes(Number(e.target.value))}
          placeholder="Threshold minutes"
        />
        <button type="submit" className="sm:col-span-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
          Save
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2">Appliance</th>
                <th className="py-2">Threshold (minutes)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.appliance}</td>
                  <td className="py-2">{r.minutes}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={2}>No thresholds saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


