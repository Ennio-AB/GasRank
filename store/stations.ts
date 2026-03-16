import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type Station = { id: string; name: string; brand?: string; address?: string; lat: number; lng: number };

type State = {
  stations: Station[];
  load: () => Promise<void>;
};

export const useStations = create<State>((set) => ({
  stations: [],
  load: async () => {
    const { data } = await supabase.from('stations').select('*');
    if (data) set({ stations: data });
  },
}));
