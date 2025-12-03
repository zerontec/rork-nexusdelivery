import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hfwieloyhfelelduwkgu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd2llbG95aGZlbGVsZHV3a2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODAwMDMsImV4cCI6MjA3OTI1NjAwM30.0gmJm0rXIFmaOls4E936AEYfinfGRZ2wGX_eoOvKHes'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .limit(5)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Drivers Data:', JSON.stringify(data, null, 2))
    }
}

debug()
