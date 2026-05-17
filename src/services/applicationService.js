import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

/**
 * 申请记录服务层 (Application Service)
 * 负责管理用户的留学申请进度记录（增删改查）
 */
export const applicationService = {
  /**
   * 获取用户的所有申请记录
   * @param {string} userId - 用户的 UUID
   * @returns {Promise<Array>} 包含关联项目信息的申请列表，按更新时间降序排列
   */
  async getApplications(userId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .select(`
          id,
          status,
          deadline,
          program_id,
          programs (*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    );
  },

  /**
   * 为用户创建一条新的申请记录
   * 默认状态为 'planning' (计划中)
   * @param {string} userId - 用户的 UUID
   * @param {string} programId - 项目的 UUID
   */
  async createApplication(userId, programId) {
    return handleResponse(
      supabase
        .from('user_applications')
        .insert([{ 
          user_id: userId, 
          program_id: programId,
          status: 'planning'
        }])
    );
  },

  /**
   * 更新申请状态
   * @param {string} id - 申请记录的 UUID
   * @param {string} newStatus - 新状态 (如 planning, applied, accepted, rejected 等)
   */
  async updateStatus(id, newStatus) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ status: newStatus })
        .eq('id', id)
    );
  },

  /**
   * 更新申请的截止日期或重要时间节点
   * @param {string} id - 申请记录的 UUID
   * @param {string} newDeadline - 新的截止日期 (ISO 格式字符串)
   */
  async updateDeadline(id, newDeadline) {
    return handleResponse(
      supabase
        .from('user_applications')
        .update({ deadline: newDeadline })
        .eq('id', id)
    );
  },

  /**
   * 删除指定的申请记录
   * @param {string} id - 申请记录的 UUID
   */
  async deleteApplication(id) {
    return handleResponse(
      supabase
        .from('user_applications')
        .delete()
        .eq('id', id)
    );
  }
};
