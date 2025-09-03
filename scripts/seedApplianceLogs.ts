/*
  Seed script for demo appliance usage logs.
  Usage: npm run seed:logs

  Env required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (recommended for admin access)
  Optional:
  - SUPABASE_TARGET_USER_ID (seed for a specific user id)
*/

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined
const targetUserId = process.env.SUPABASE_TARGET_USER_ID as string | undefined

if (!url) {
  console.error('✖ Missing NEXT_PUBLIC_SUPABASE_URL in env')
  process.exit(1)
}

if (!serviceKey) {
  console.error('✖ Missing SUPABASE_SERVICE_ROLE_KEY in env (required to query auth.users)')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

type UserRow = { id: string }

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pastDateWithin(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, days))
  d.setHours(randInt(6, 22), randInt(0, 59), randInt(0, 59), 0)
  return d.toISOString()
}

async function resolveUserId(): Promise<string | null> {
  if (targetUserId) return targetUserId
  // fallback: take the most recent user from auth.users
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error) {
    console.error('✖ Unable to list users via admin API:', error.message)
    return null
  }
  const first = data?.users?.[0]
  return first?.id ?? null
}

async function main() {
  const userId = await resolveUserId()
  if (!userId) {
    console.log('ℹ No users found. Create an account first, or set SUPABASE_TARGET_USER_ID.')
    return
  }

  const appliances = [
    { name: 'Geyser', min: 20, max: 140 },
    { name: 'Heater', min: 60, max: 240 },
    { name: 'Fan', min: 200, max: 500 },
  ]

  const rows: Array<{ user_id: string; appliance: string; usage_minutes: number; timestamp: string }> = []

  const total = randInt(15, 20)
  for (let i = 0; i < total; i++) {
    const pick = appliances[randInt(0, appliances.length - 1)]
    rows.push({
      user_id: userId,
      appliance: pick.name,
      usage_minutes: randInt(pick.min, pick.max),
      timestamp: pastDateWithin(7),
    })
  }

  const { error } = await supabase.from('appliance_logs').insert(rows)
  if (error) {
    console.error('✖ Failed to seed logs:', error.message)
    return
  }

  console.log(`✅ Seeded ${rows.length} appliance logs for user ${userId}`)
}

main().catch((e) => {
  console.error('✖ Seed script crashed:', e?.message || e)
  process.exit(1)
})


