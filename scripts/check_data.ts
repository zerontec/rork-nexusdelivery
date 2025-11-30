
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

async function checkData() {
    console.log('Checking database data...');

    // 1. Check Businesses
    const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, owner_id');

    if (businessError) {
        console.error('Error fetching businesses:', businessError);
    } else {
        console.log(`Found ${businesses?.length} businesses.`);
        if (businesses && businesses.length > 0) {
            console.log('Sample Business:', businesses[0]);

            const businessId = businesses[0].id;

            // 2. Check Orders for this business
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, status, created_at, total')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
            } else {
                console.log(`Found ${orders?.length} recent orders for business ${businesses[0].name}.`);
                if (orders && orders.length > 0) {
                    console.log('Sample Order:', orders[0]);

                    // Check if date filter would work
                    const today = new Date().toISOString().split('T')[0];
                    const todayOrders = orders.filter(o => o.created_at.startsWith(today));
                    console.log(`Orders matching today (${today}): ${todayOrders.length}`);
                }
            }
        }
    }

    // 3. Check Notifications
    const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

    if (notifError) {
        console.error('Error fetching notifications:', notifError);
    } else {
        console.log(`Found ${notifications?.length} notifications (sample).`);
    }
}

checkData();
