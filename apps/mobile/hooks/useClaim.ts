import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Claim } from '../types';

export function useClaim(claimId: string) {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async (): Promise<Claim> => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();
      if (error) throw error;
      return data as Claim;
    },
    refetchInterval: 30_000,
  });
}

export function useUserClaims() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['claims', user?.id],
    queryFn: async (): Promise<Claim[]> => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user!.id)
        .order('claimed_at', { ascending: false });
      if (error) throw error;
      return data as Claim[];
    },
    enabled: !!user,
  });
}

export function useClaimDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [claimId, setClaimId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      dealId,
      restaurantId,
      partySize,
    }: {
      dealId: string;
      restaurantId: string;
      partySize: number;
    }): Promise<Claim> => {
      const { data, error } = await supabase
        .from('claims')
        .insert({
          user_id: user!.id,
          deal_id: dealId,
          restaurant_id: restaurantId,
          party_size: partySize,
          status: 'claimed',
        })
        .select()
        .single();
      if (error) throw error;
      return data as Claim;
    },
    onSuccess: (claim) => {
      setClaimId(claim.id);
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });

  return { ...mutation, claimId };
}
