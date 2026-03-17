import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export type Station = {
  id: string; name: string; brand?: string; address?: string;
  lat: number; lng: number;
  avg_rating?: number; total_reviews?: number;
};

type State = {
  stations: Station[];
  load: () => Promise<void>;
  add: (s: Omit<Station, 'id'>) => Promise<string | null>;
};

export const useStations = create<State>((set, get) => ({
  stations: [],
  load: async () => {
    try {
      logger.info('stations', 'loading...');
      const { data: stations, error } = await supabase.from('stations').select('*');
      if (error) { logger.error('stations', 'load failed', { code: error.code, msg: error.message }); return; }

      // Fetch ratings for all stations
      const { data: ratings } = await supabase.from('station_ratings').select('*');
      const ratingMap = Object.fromEntries((ratings ?? []).map((r: any) => [r.station_id, r]));

      const merged = (stations ?? []).map((st: any) => ({
        ...st,
        avg_rating:    ratingMap[st.id]?.avg_rating ? parseFloat(ratingMap[st.id].avg_rating) : undefined,
        total_reviews: ratingMap[st.id]?.total ? parseInt(ratingMap[st.id].total) : undefined,
      }));

      logger.info('stations', `loaded ${merged.length} stations`);
      set({ stations: merged });
    } catch (e) {
      logger.error('stations', 'load exception', e);
    }
  },
  add: async (station) => {
    try {
      logger.info('stations', 'adding', { name: station.name });
      const { data, error } = await supabase.from('stations').insert(station).select().single();
      if (error) { logger.error('stations', 'add failed', error.message); return null; }
      await get().load();
      return data.id;
    } catch (e) {
      logger.error('stations', 'add exception', e);
      return null;
    }
  },
}));
