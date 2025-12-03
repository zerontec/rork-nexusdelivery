import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hfwieloyhfelelduwkgu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd2llbG95aGZlbGVsZHV3a2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODAwMDMsImV4cCI6MjA3OTI1NjAwM30.0gmJm0rXIFmaOls4E936AEYfinfGRZ2wGX_eoOvKHes'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('=== CHECKING DRIVER EMAIL ===')
    const { data: drivers } = await supabase.from('drivers').select('id, name').limit(1)
    const driverId = drivers?.[0]?.id
    console.log('Driver ID:', driverId)

    // Check if there's a profile with this ID
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', driverId).single()
    console.log('Profile for driver:', JSON.stringify(profile, null, 2))

    console.log('\n=== CHECKING BUSINESS EMAIL ===')
    const { data: business } = await supabase.from('businesses').select('id, owner_id, name, email').limit(1)
    console.log('Business data:', JSON.stringify(business?.[0], null, 2))

    if (business?.[0]?.owner_id) {
        const { data: ownerProfile } = await supabase.from('profiles').select('*').eq('id', business[0].owner_id).single()
        console.log('Owner profile:', JSON.stringify(ownerProfile, null, 2))
    }
}

debug()
