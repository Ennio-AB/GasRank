import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useProfile } from './profile';
import type { User } from '@supabase/supabase-js';

type State = {
  user: User | null;
  init: () => Promise<void>;
};

export const useAuth = create<State>((set) => ({
  user: null,
  init: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) logger.info('auth', 'no session', error.message);
      else {
        logger.info('auth', 'session loaded', { userId: user?.id ?? 'none' });
        if (user) useProfile.getState().load(user.id);
      }
      set({ user });

      supabase.auth.onAuthStateChange((event, session) => {
        logger.info('auth', `state: ${event}`, { userId: session?.user?.id ?? 'none' });
        const u = session?.user ?? null;
        set({ user: u });
        if (u) useProfile.getState().load(u.id);
        else useProfile.getState().clear();
      });
    } catch (e) {
      logger.error('auth', 'init exception', e);
    }
  },
}));
