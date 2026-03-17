import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export type Profile = { id: string; username: string; avatar_url?: string };

type State = {
  profile: Profile | null;
  load: (userId: string) => Promise<void>;
  clear: () => void;
};

export const useProfile = create<State>((set) => ({
  profile: null,
  load: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) logger.error('profile', 'load failed', error.message);
      else { logger.info('profile', 'loaded', { username: data?.username }); set({ profile: data }); }
    } catch (e) {
      logger.error('profile', 'load exception', e);
    }
  },
  clear: () => set({ profile: null }),
}));
