
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
    console.log('Inspecting schema...');

    // Check drivers table columns (using a trick by selecting a non-existent column to see error or just selecting * limit 0)
    // Better: try to insert or just select *
    const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .limit(1);

    if (driversError) {
        console.error('Error fetching drivers:', driversError);
    } else if (drivers && drivers.length > 0) {
        console.log('Drivers table columns:', Object.keys(drivers[0]));
    } else {
        console.log('Drivers table is empty, cannot infer columns from data.');
        // Try to insert a dummy row to fail and see columns? No, that's risky.
        // Let's try to select specific columns I expect.
        const { error: checkUserId } = await supabase
            .from('drivers')
            .select('user_id')
            .limit(1);

        if (checkUserId) {
            console.log('Column user_id check failed:', checkUserId.message);
        } else {
            console.log('Column user_id exists.');
        }
    }
}

inspectSchema();
