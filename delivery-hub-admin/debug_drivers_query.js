import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hfwieloyhfelelduwkgu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd2llbG95aGZlbGVsZHV3a2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODAwMDMsImV4cCI6MjA3OTI1NjAwM30.0gmJm0rXIFmaOls4E936AEYfinfGRZ2wGX_eoOvKHes'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('Testing current query (with profiles join):')
    const { data: withJoin, error: error1 } = await supabase
        .from('drivers')
        .select(`
      *,
      profiles:id (full_name, phone_number, email)
    `)

    if (error1) {
        console.error('Error with JOIN:', error1)
    } else {
        console.log('Result with JOIN:', JSON.stringify(withJoin, null, 2))
    }

    console.log('\n\nTesting simple query (no join):')
    const { data: noJoin, error: error2 } = await supabase
        .from('drivers')
        .select('*')

    if (error2) {
        console.error('Error without JOIN:', error2)
    } else {
        console.log('Result without JOIN:', JSON.stringify(noJoin, null, 2))
    }
}

debug()
