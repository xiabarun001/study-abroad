import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

/**
 * 收藏服务层 (Favorite Service)
 * 负责管理用户对留学项目的收藏状态
 */
export const favoriteService = {
  /**
   * 获取用户的所有收藏记录
   * @param {string} userId - 用户的 UUID
   * @returns {Promise<Array>} 包含被收藏项目详情的列表，按收藏时间降序
   */
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

  /**
   * 检查某个特定项目是否已被用户收藏
   * @param {string} userId - 用户的 UUID
   * @param {string} programId - 项目的 UUID
   * @returns {Promise<boolean>} 如果已收藏返回 true，否则返回 false
   */
  async isFavorite(userId, programId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // 忽略“无返回行”的错误
    return !!data;
  },

  /**
   * 切换收藏状态 (添加或取消收藏)
   * @param {string} userId - 用户的 UUID
   * @param {string} programId - 项目的 UUID
   * @param {boolean} isCurrentlyFavorite - 当前的收藏状态，如果为 true 则执行删除，为 false 则执行插入
   */
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
