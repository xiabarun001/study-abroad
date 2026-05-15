/**
 * 院校服务层模块
 * 负责处理所有与大学（Universities）相关的数据请求与实时订阅
 */
import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const universityService = {
  /**
   * 根据院校ID获取单一院校详情
   * @param {string} id - 院校记录的 UUID
   * @returns {Promise<Object>} 院校详细数据对象
   */
  async getById(id) {
    return handleResponse(
      supabase.from('universities').select('*').eq('id', id).single()
    );
  },

  /**
   * 获取所有院校列表
   * @returns {Promise<Array>} 包含所有院校对象的数组
   */
  async listAll() {
    return handleResponse(supabase.from('universities').select('*'));
  },

  /**
   * 根据国家ID获取大学列表
   * @param {string} countryId - 国家ID
   * @returns {Promise<Array>} 大学列表
   */
  async getUniversitiesByCountry(countryId) {
    return handleResponse(
      supabase.from('universities').select('*').eq('country_id', countryId).order('name')
    );
  },

  /**
   * 订阅特定院校的数据变更（实时更新）
   * @param {string} id - 院校记录的 UUID
   * @param {Function} callback - 数据发生变化时的回调函数
   * @returns {Object} 包含 unsubscribe 方法的订阅对象
   */
  subscribeToUniversity(id, callback) {
    return supabase
      .channel(`public:universities:id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'universities', filter: `id=eq.${id}` },
        (payload) => callback(payload)
      )
      .subscribe();
  }
};
