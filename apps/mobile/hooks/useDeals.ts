import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DealWithRestaurant } from '../types';

export function useDeals(cityId?: string, cuisineFilter?: string) {
  return useQuery({
    queryKey: ['deals', cityId, cuisineFilter],
    queryFn: async (): Promise<DealWithRestaurant[]> => {
      let query = supabase
        .from('deals')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (cityId) {
        query = query.eq('restaurant.city_id', cityId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data as DealWithRestaurant[]).filter(d => d.restaurant?.is_active);

      if (cuisineFilter && cuisineFilter !== 'all') {
        results = results.filter(d =>
          d.restaurant?.cuisine_tags?.includes(cuisineFilter)
        );
      }

      return results;
    },
    enabled: true,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: async (): Promise<DealWithRestaurant> => {
      const { data, error } = await supabase
        .from('deals')
        .select(`*, restaurant:restaurants(*)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DealWithRestaurant;
    },
  });
}
