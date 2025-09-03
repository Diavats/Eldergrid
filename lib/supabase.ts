import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced error handling with detailed messages
if (!supabaseUrl) {
	const error = new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
	console.error("❌ Supabase Configuration Error:", error.message)
	console.error("💡 Please ensure your .env.local file contains:")
	console.error("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")
	throw error
}

if (!supabaseAnonKey) {
	const error = new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
	console.error("❌ Supabase Configuration Error:", error.message)
	console.error("💡 Please ensure your .env.local file contains:")
	console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key")
	throw error
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
	const error = new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format")
	console.error("❌ Supabase Configuration Error:", error.message)
	console.error("💡 URL should be in format: https://your-project.supabase.co")
	console.error("   Current URL:", supabaseUrl)
	throw error
}

console.log("✅ Supabase client initialized successfully")
console.log("🔗 Supabase URL:", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
})


