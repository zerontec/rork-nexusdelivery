import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hfwieloyhfelelduwkgu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd2llbG95aGZlbGVsZHV3a2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODAwMDMsImV4cCI6MjA3OTI1NjAwM30.0gmJm0rXIFmaOls4E936AEYfinfGRZ2wGX_eoOvKHes'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('=== DRIVERS TABLE ===')
    const { data: drivers } = await supabase.from('drivers').select('*').limit(1)
    console.log('Columns:', drivers?.[0] ? Object.keys(drivers[0]) : 'No data')
    console.log('Sample:', JSON.stringify(drivers?.[0], null, 2))

    console.log('\n=== BUSINESSES TABLE ===')
    const { data: businesses } = await supabase.from('businesses').select('*').limit(1)
    console.log('Columns:', businesses?.[0] ? Object.keys(businesses[0]) : 'No data')
    console.log('Sample:', JSON.stringify(businesses?.[0], null, 2))
}

debug()
