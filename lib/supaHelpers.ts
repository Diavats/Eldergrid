"use client";

import { supabase } from "@/lib/supabase";

/**
 * Ensures the logged-in auth user has:
 *  - a row in public.users (linked via auth_id)
 *  - a row in public.patients (linked to users.id)
 * Returns { userId, patientId }.
 * Works even if tables are empty (hackathon-friendly).
 */
export async function ensureUserAndPatient() {
	// 1) Get auth user
	const { data: authData, error: authErr } = await supabase.auth.getUser();
	if (authErr || !authData?.user) {
		throw new Error("Not logged in. Please log in first.");
	}
	const authId = authData.user.id; // string (UUID) from Supabase Auth

	// 2) Ensure users row exists
	let { data: foundUser } = await supabase
		.from("users")
		.select("id, auth_id, role")
		.eq("auth_id", authId)
		.maybeSingle();

	if (!foundUser) {
		// Try to insert a users row; prefer 'patient' role (adjust if your CHECK allows only certain roles)
		const { data: insertedUser, error: userInsertErr } = await supabase
			.from("users")
			.insert([{ auth_id: authId, role: "patient" }])
			.select("id, auth_id, role")
			.single();

		if (userInsertErr) {
			// Fallback: try caregiver if your CHECK constraint excludes 'patient'
			const { data: caregiverUser, error: caregiverErr } = await supabase
				.from("users")
				.insert([{ auth_id: authId, role: "caregiver" }])
				.select("id, auth_id, role")
				.single();
			if (caregiverErr || !caregiverUser) {
				throw new Error(
					"Could not create users row. Check your 'users.role' CHECK constraint includes 'patient' or 'caregiver'."
				);
			}
			foundUser = caregiverUser;
		} else {
			foundUser = insertedUser;
		}
	}

	const userId = foundUser.id as string;

	// 3) Ensure patients row exists
	let { data: foundPatient } = await supabase
		.from("patients")
		.select("id, user_id, full_name")
		.eq("user_id", userId)
		.maybeSingle();

	if (!foundPatient) {
		const { data: insertedPatient, error: patientErr } = await supabase
			.from("patients")
			.insert([{ user_id: userId, full_name: null }])
			.select("id, user_id, full_name")
			.single();
		if (patientErr || !insertedPatient) {
			throw new Error(
				"Could not create patient profile. Check 'patients.user_id' foreign key to 'users.id'."
			);
		}
		foundPatient = insertedPatient;
	}

	return { userId, patientId: foundPatient.id as string };
}


