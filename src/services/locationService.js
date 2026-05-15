/**
 * 地理位置服务层模块
 * 负责处理与洲际、国家相关的地理数据请求
 */
import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const locationService = {
  /**
   * 获取大洲列表
   * @returns {Promise<Array>} 大洲对象列表
   */
  async getContinents() {
    return handleResponse(
      supabase.from('continents').select('*').order('name')
    );
  },

  /**
   * 根据大洲ID获取国家列表
   * @param {string} continentId - 大洲记录的 UUID
   * @returns {Promise<Array>} 国家列表
   */
  async getCountriesByContinent(continentId) {
    return handleResponse(
      supabase.from('countries').select('*').eq('continent_id', continentId).order('name')
    );
  },

  /**
   * 根据国家ID获取详情信息
   * @param {string} id - 国家记录的 UUID
   * @returns {Promise<Object>} 国家详细数据
   */
  async getCountryById(id) {
    return handleResponse(
      supabase.from('countries').select('*').eq('id', id).single()
    );
  }
};
