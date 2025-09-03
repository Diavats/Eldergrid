"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MedicationReminders from "@/components/widgets/MedicationReminders";
import ApplianceTracker from "@/components/widgets/ApplianceTracker";

export default function PatientDashboard() {
	const router = useRouter();
	const [session, setSession] = useState<any>(null);
  const [fullName, setFullName] = useState<string>("");

	useEffect(() => {
		const getSession = async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) {
				router.push("/login");
			} else {
				setSession(data.session);
          // load profile name
          const userId = data.session.user.id;
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", userId)
            .maybeSingle();
          setFullName(prof?.full_name ?? "");
			}
		};
		getSession();
	}, [router]);

	if (!session) {
		return <div className="p-6 text-center">Loading dashboard...</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="p-4 border-b bg-white">
				<h1 className="text-2xl font-bold">👵 ElderGrid Patient Dashboard</h1>
				<p className="text-gray-600">
            {fullName ? `Welcome, ${fullName}!` : "Add your name"}
          </p>
			</header>
			<main className="p-6 space-y-6">
				{/* Medication Reminders Widget */}
				<section className="bg-white shadow rounded-2xl p-4">
					<MedicationReminders />
				</section>

				{/* Appliance Tracker Widget */}
				<section className="bg-white shadow rounded-2xl p-4">
					<ApplianceTracker />
				</section>

				{/* Placeholder Widgets */}
				<section className="bg-white shadow rounded-2xl p-4">
					<h2 className="font-semibold">Health Tracking (Coming Soon)</h2>
					<p className="text-sm text-gray-600">Widget placeholder</p>
				</section>
				<section className="bg-white shadow rounded-2xl p-4">
					<h2 className="font-semibold">Emergency Button (Coming Soon)</h2>
					<p className="text-sm text-gray-600">Widget placeholder</p>
				</section>
				<section className="bg-white shadow rounded-2xl p-4">
					<h2 className="font-semibold">AI Assistant (Coming Soon)</h2>
					<p className="text-sm text-gray-600">Widget placeholder</p>
				</section>
			</main>
		</div>
	);
}


