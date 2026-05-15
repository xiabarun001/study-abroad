import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const favoriteService = {
  async getFavorites(userId) {
    return handleResponse(
      supabase
        .from('user_favorites')
        .select(`
          id,
          program_id,
          created_at,
          programs (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  async isFavorite(userId, programId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
    return !!data;
  },

  async toggleFavorite(userId, programId, isCurrentlyFavorite) {
    if (isCurrentlyFavorite) {
      return handleResponse(
        supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('program_id', programId)
      );
    } else {
      return handleResponse(
        supabase
          .from('user_favorites')
          .insert([{ user_id: userId, program_id: programId }])
      );
    }
  }
};
