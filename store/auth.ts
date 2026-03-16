import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type State = {
  user: User | null;
  init: () => Promise<void>;
};

export const useAuth = create<State>((set) => ({
  user: null,
  init: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user });
    supabase.auth.onAuthStateChange((_, session) => set({ user: session?.user ?? null }));
  },
}));
