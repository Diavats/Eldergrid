#!/usr/bin/env tsx
/*
  Environment validation script for ElderGrid
  Usage: npm run validate:env
  or: npx tsx scripts/validate-env.ts
*/

import 'dotenv/config'

interface EnvVar {
  name: string
  value: string | undefined
  required: boolean
  description: string
  validator?: (value: string) => boolean
}

const envVars: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    required: true,
    description: 'Supabase project URL',
    validator: (value) => value.startsWith('https://') && value.includes('.supabase.co')
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    required: true,
    description: 'Supabase anonymous key (public)',
    validator: (value) => value.startsWith('eyJ') && value.length > 100
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    required: false,
    description: 'Supabase service role key (for admin operations)',
    validator: (value) => value.startsWith('eyJ') && value.length > 100
  }
]

function validateEnvironment() {
  console.log('🔍 Validating ElderGrid environment variables...\n')
  
  let hasErrors = false
  
  for (const envVar of envVars) {
    const { name, value, required, description, validator } = envVar
    
    if (!value) {
      if (required) {
        console.error(`❌ ${name}: MISSING (Required)`)
        console.error(`   Description: ${description}`)
        hasErrors = true
      } else {
        console.warn(`⚠️  ${name}: MISSING (Optional)`)
        console.warn(`   Description: ${description}`)
      }
    } else {
      if (validator && !validator(value)) {
        console.error(`❌ ${name}: INVALID FORMAT`)
        console.error(`   Description: ${description}`)
        console.error(`   Value: ${value.substring(0, 20)}...`)
        hasErrors = true
      } else {
        console.log(`✅ ${name}: OK`)
        console.log(`   Description: ${description}`)
        if (name.includes('URL')) {
          console.log(`   Value: ${value}`)
        } else {
          console.log(`   Value: ${value.substring(0, 20)}...`)
        }
      }
    }
    console.log('')
  }
  
  if (hasErrors) {
    console.error('❌ Environment validation failed!')
    console.error('💡 Please check your .env.local file and ensure all required variables are set.')
    process.exit(1)
  } else {
    console.log('✅ All environment variables are valid!')
    console.log('🚀 ElderGrid is ready to run.')
  }
}

// Check if .env.local exists
import { existsSync } from 'fs'

if (!existsSync('.env.local')) {
  console.error('❌ .env.local file not found!')
  console.error('💡 Please create a .env.local file in the project root with your Supabase credentials.')
  console.error('   See the project documentation for the required environment variables.')
  process.exit(1)
}

validateEnvironment()
