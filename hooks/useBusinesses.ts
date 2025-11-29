import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Business } from '@/types';

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('businesses')
                .select('*');

            if (error) throw error;

            if (data) {
                // Map Supabase data to Business type
                const mappedBusinesses: Business[] = data.map(b => ({
                    ...b,
                    deliveryTime: b.delivery_time,
                    deliveryFee: b.delivery_fee,
                    minimumOrder: b.minimum_order,
                    isOpen: b.is_open,
                    freeDelivery: b.delivery_fee === 0,
                }));
                setBusinesses(mappedBusinesses);
            }
        } catch (err: any) {
            console.error('[useBusinesses] Error fetching businesses:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshBusinesses = () => {
        fetchBusinesses();
    };

    return {
        businesses,
        isLoading,
        error,
        refreshBusinesses,
    };
}
