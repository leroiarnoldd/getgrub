import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import type { UserProfile } from '../types';

export function useAuth() {
  const { user, session, isLoading, setSession, setLoading, signOut: clearAuth } = useAuthStore();
  const setProfile = useUserStore(s => s.setProfile);

  useEffect(() => {
    const loadProfile = async (userId: string | undefined) => {
      if (!userId) { setProfile(null); return; }
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data as UserProfile);
    };

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        await loadProfile(session?.user?.id);
      })
      .catch((e) => {
        console.warn('getSession failed:', e);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadProfile(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    clearAuth();
  };

  return { user, session, isLoading, signIn, signUp, signOut };
}
