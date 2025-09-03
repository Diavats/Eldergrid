"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { getGovernmentAveragesMap } from "@/lib/api/govData";

type ApplianceLog = {
	id: string;
	appliance_name: string;
	usage_minutes: number;
	log_time: string;
};

export default function AnomalyDetector() {
	const [logs, setLogs] = useState<ApplianceLog[]>([]);
	const [anomalies, setAnomalies] = useState<string[]>([]);
	const [govAverages, setGovAverages] = useState<Record<string, number>>({});
	const [custom, setCustom] = useState<Record<string, number>>({});

	useEffect(() => {
		const fetchLogs = async () => {
			try {
				// Load government averages using the integration layer
				const govAveragesMap = await getGovernmentAveragesMap();
				setGovAverages(govAveragesMap);

				// Load user custom thresholds
				const { data: sessionData } = await supabase.auth.getSession();
				const uid = sessionData.session?.user.id;
				if (uid) {
					const { data: ct } = await supabase
						.from("custom_thresholds")
						.select("appliance, minutes")
						.eq("user_id", uid);
					const cm: Record<string, number> = {};
					(ct || []).forEach((r: any) => (cm[(r.appliance as string).toLowerCase()] = Number(r.minutes) || 0));
					setCustom(cm);
				}

				// Load appliance logs
				const { data, error } = await supabase
					.from("appliance_logs")
					.select("*")
					.order("log_time", { ascending: false })
					.limit(20);

				if (error) {
					console.error("Error fetching appliance logs:", error);
					return;
				}

				if (data) {
					setLogs(data as ApplianceLog[]);
					detectAnomalies(data as ApplianceLog[]);
				}
			} catch (error) {
				console.error("Error in fetchLogs:", error);
			}
		};

		fetchLogs();
	}, []);

	// Threshold-based anomaly detection with priority: custom > gov*2
	const detectAnomalies = (logs: ApplianceLog[]) => {
		const alerts: string[] = [];
		logs.forEach((log) => {
			const key = (log.appliance_name || "").toLowerCase();
			const customMin = custom[key];
			const govMin = govAverages[key];
			const threshold = customMin || (govMin ? govMin * 2 : undefined);
			if (threshold && log.usage_minutes > threshold) {
				const base = customMin ? `${customMin} min (custom)` : `${govMin} min (gov avg)`;
				alerts.push(`⚠️ ${log.appliance_name} used ${log.usage_minutes} min vs threshold ${base}`);
			}
		});
		setAnomalies(alerts);
	};

	return (
		<Card className="mt-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="text-red-500" />
					Anomaly Detector
				</CardTitle>
			</CardHeader>
			<CardContent>
				{anomalies.length > 0 ? (
					<ul className="list-disc pl-6 space-y-2 text-red-600 font-medium">
						{anomalies.map((a, idx) => (
							<li key={idx}>{a}</li>
						))}
					</ul>
				) : (
					<p className="text-gray-500">✅ No unusual activity detected.</p>
				)}
			</CardContent>
		</Card>
	);
}


