"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureUserAndPatient } from "@/lib/supaHelpers";

type Med = {
	id: string;
	medication_name: string;
	dosage: string | null;
	frequency: string | null; // time-of-day label like "08:00 daily" or "9 PM"
	start_date: string | null; // ISO date (YYYY-MM-DD)
	end_date: string | null;
	created_at: string | null;
};

export default function MedicationReminders() {
	const [patientId, setPatientId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [list, setList] = useState<Med[]>([]);
	const [error, setError] = useState<string | null>(null);

	// form state
	const [medicationName, setMedicationName] = useState("");
	const [dosage, setDosage] = useState("");
	const [timeOfDay, setTimeOfDay] = useState(""); // e.g., "08:00" or "21:30"
	const [frequency, setFrequency] = useState("daily"); // daily / twice-daily / as-needed

	useEffect(() => {
		(async () => {
			try {
				const { patientId } = await ensureUserAndPatient();
				setPatientId(patientId);
				await fetchMeds(patientId);
			} catch (e: any) {
				setError(e?.message || "Failed to initialize reminders.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function fetchMeds(pid: string) {
		const { data, error } = await supabase
			.from("medications")
			.select(
				"id, medication_name, dosage, frequency, start_date, end_date, created_at"
			)
			.eq("patient_id", pid)
			.order("created_at", { ascending: false });
		if (error) {
			setError(error.message);
			return;
		}
		setList((data as Med[]) || []);
	}

	async function addMedication(e: React.FormEvent) {
		e.preventDefault();
		if (!patientId) return;
		if (!medicationName.trim()) {
			setError("Please enter a medication name.");
			return;
		}
		setError(null);

		// We'll store time-of-day inside frequency text to keep it schema-free.
		const freqLabel =
			timeOfDay && frequency
				? `${timeOfDay} • ${frequency}`
				: timeOfDay
				? timeOfDay
				: frequency;

		const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

		const { error } = await supabase.from("medications").insert([
			{
				patient_id: patientId,
				medication_name: medicationName.trim(),
				dosage: dosage.trim() || null,
				frequency: freqLabel || null,
				start_date: today,
				end_date: null,
			},
		]);

		if (error) {
			setError(error.message);
			return;
		}

		// reset form + refresh list
		setMedicationName("");
		setDosage("");
		setTimeOfDay("");
		setFrequency("daily");
		await fetchMeds(patientId);
	}

	async function deleteMedication(id: string) {
		if (!patientId) return;
		const { error } = await supabase.from("medications").delete().eq("id", id);
		if (error) {
			setError(error.message);
			return;
		}
		await fetchMeds(patientId);
	}

	if (loading) {
		return (
			<div className="w-full rounded-2xl border p-4 shadow-sm">
				<h3 className="text-lg font-semibold">Medication Reminders</h3>
				<p className="text-sm text-muted-foreground mt-2">Loading…</p>
			</div>
		);
	}

	return (
		<div className="w-full rounded-2xl border p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Medication Reminders</h3>
				{error && (
					<span className="text-sm text-red-600 max-w-[60%]">{error}</span>
				)}
			</div>

			{/* Add Form */}
			<form onSubmit={addMedication} className="mt-4 grid gap-3 sm:grid-cols-4">
				<input
					className="col-span-2 rounded-xl border px-3 py-2"
					placeholder="Medication name (e.g., Metformin)"
					value={medicationName}
					onChange={(e) => setMedicationName(e.target.value)}
					required
				/>
				<input
					className="rounded-xl border px-3 py-2"
					placeholder="Dosage (e.g., 500mg)"
					value={dosage}
					onChange={(e) => setDosage(e.target.value)}
				/>
				<input
					type="time"
					className="rounded-xl border px-3 py-2"
					value={timeOfDay}
					onChange={(e) => setTimeOfDay(e.target.value)}
				/>

				<select
					className="rounded-xl border px-3 py-2"
					value={frequency}
					onChange={(e) => setFrequency(e.target.value)}
				>
					<option value="daily">Daily</option>
					<option value="twice daily">Twice daily</option>
					<option value="as needed">As needed</option>
				</select>

				<button
					type="submit"
					className="sm:col-span-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition"
				>
					Add Reminder
				</button>
			</form>

			{/* List */}
			<div className="mt-6 space-y-3">
				{list.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No medications yet. Add your first reminder above.
					</p>
				) : (
					list.map((m) => (
						<div
							key={m.id}
							className="flex items-center justify-between rounded-xl border px-4 py-3"
						>
							<div>
								<div className="font-semibold">{m.medication_name}</div>
								<div className="text-sm text-muted-foreground">
									{m.dosage ? `${m.dosage} • ` : ""}
									{m.frequency || "—"}
								</div>
							</div>
							<button
								onClick={() => deleteMedication(m.id)}
								className="rounded-lg border px-3 py-1 text-sm hover:bg-red-50 hover:text-red-600"
							>
								Delete
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}


