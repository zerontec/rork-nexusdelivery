
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

async function checkRelationships() {
    console.log('Checking foreign keys on orders table...');

    // Query to find foreign keys for 'orders' table
    // We can't query information_schema directly via supabase-js easily unless we use rpc or just raw sql if allowed (usually not via client)
    // But we can try to infer it by making a query that relies on it and seeing the error, or just checking if the column exists.

    // Actually, we can use the `rpc` if we had a function, but we don't.
    // Let's try to just perform the query that is failing and print the exact error details.

    const { error } = await supabase
        .from('orders')
        .select('*, business:businesses(*)')
        .limit(1);

    if (error) {
        console.error('Relationship check failed:', error);
        console.log('Error code:', error.code);
        console.log('Error details:', error.details);
        console.log('Error hint:', error.hint);
    } else {
        console.log('Relationship check PASSED. The schema cache might have updated or it works here.');
    }
}

checkRelationships();
