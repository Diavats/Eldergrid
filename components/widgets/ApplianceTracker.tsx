"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock appliances
const initialAppliances = [
	{ id: 1, name: "Fan", status: "ON", power: 50 },
	{ id: 2, name: "AC", status: "OFF", power: 0 },
	{ id: 3, name: "Geyser", status: "OFF", power: 0 },
	{ id: 4, name: "Lights", status: "ON", power: 20 },
];

export default function ApplianceTracker() {
	const [appliances, setAppliances] = useState(initialAppliances);
	const [usageData, setUsageData] = useState<{ time: string; totalPower: number }[]>([]);

	// Simulate power usage updates every 5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setAppliances((prev) =>
				prev.map((appliance) => {
					if (appliance.name === "AC" && Math.random() > 0.7) {
						return {
							...appliance,
							status: appliance.status === "ON" ? "OFF" : "ON",
							power: appliance.status === "ON" ? 0 : 1500,
						};
					}
					if (appliance.name === "Geyser" && Math.random() > 0.8) {
						return {
							...appliance,
							status: appliance.status === "ON" ? "OFF" : "ON",
							power: appliance.status === "ON" ? 0 : 2000,
						};
					}
					return appliance;
				})
			);

			// Add new usage snapshot based on latest state
			setUsageData((prev) => {
				const total = appliances.reduce((sum, a) => sum + a.power, 0);
				const next = [
					...prev.slice(-9),
					{ time: new Date().toLocaleTimeString(), totalPower: total },
				];
				return next;
			});
		}, 5000);

		return () => clearInterval(interval);
	}, [appliances]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>⚡ Appliance Usage Tracker</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-6">
					{appliances.map((appliance) => (
						<div
							key={appliance.id}
							className={`p-4 rounded-xl shadow ${
								appliance.status === "ON" ? "bg-green-100" : "bg-gray-200"
							}`}
						>
							<p className="font-semibold">{appliance.name}</p>
							<p>Status: {appliance.status}</p>
							<p>Power: {appliance.power} W</p>
						</div>
					))}
				</div>

				<h3 className="text-lg font-semibold mb-2">Energy Consumption Over Time</h3>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={usageData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="time" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line type="monotone" dataKey="totalPower" stroke="#8884d8" />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}


