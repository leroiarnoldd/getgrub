import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Claim, DealSlot } from '../types';

export function useDealSlots(dealId: string) {
  return useQuery({
    queryKey: ['slots', dealId],
    queryFn: async (): Promise<DealSlot[]> => {
      const { data, error } = await supabase
        .from('deal_slots')
        .select('*')
        .eq('deal_id', dealId)
        .eq('status', 'open')
        .gt('ends_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(40);
      if (error) throw error;
      return data as DealSlot[];
    },
    enabled: !!dealId,
    refetchInterval: 30_000,
  });
}

export function useSlot(slotId: string | null | undefined) {
  return useQuery({
    queryKey: ['slot', slotId],
    queryFn: async (): Promise<DealSlot> => {
      const { data, error } = await supabase
        .from('deal_slots')
        .select('*')
        .eq('id', slotId!)
        .single();
      if (error) throw error;
      return data as DealSlot;
    },
    enabled: !!slotId,
  });
}

export interface NextSlot {
  starts_at: string;
  seatsLeft: number;
  discount: number | null;
}

// Earliest still-bookable slot per deal, for "tonight 7pm · 4 left" urgency
// on the home feed. One query for all visible deals.
export function useUpcomingSlotsByDeal(dealIds: string[]) {
  const key = [...dealIds].sort().join(',');
  return useQuery({
    queryKey: ['upcoming-slots', key],
    queryFn: async (): Promise<Record<string, NextSlot>> => {
      if (dealIds.length === 0) return {};
      const { data, error } = await supabase
        .from('deal_slots')
        .select('deal_id, starts_at, total_covers, booked_covers, discount_percent')
        .in('deal_id', dealIds)
        .eq('status', 'open')
        .gt('ends_at', new Date().toISOString())
        .order('starts_at', { ascending: true });
      if (error) throw error;
      const map: Record<string, NextSlot> = {};
      for (const s of data ?? []) {
        const seatsLeft = s.total_covers - s.booked_covers;
        if (seatsLeft <= 0) continue;
        if (!map[s.deal_id]) {
          map[s.deal_id] = { starts_at: s.starts_at, seatsLeft, discount: s.discount_percent };
        }
      }
      return map;
    },
    enabled: dealIds.length > 0,
    refetchInterval: 60_000,
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slotId,
      partySize,
    }: {
      slotId: string;
      partySize: number;
    }): Promise<Claim> => {
      const { data, error } = await supabase.rpc('book_slot', {
        p_slot_id: slotId,
        p_party_size: partySize,
      });
      if (error) {
        if (error.message.includes('SLOT_UNAVAILABLE')) {
          throw new Error('That time just sold out — pick another slot.');
        }
        throw error;
      }
      return data as Claim;
    },
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['slots', claim.deal_id] });
    },
  });
}
