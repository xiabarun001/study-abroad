import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

/**
 * 智能体对话与记忆服务层 (Chat & Memory Service)
 * 负责将会话和历史消息持久化写入 Supabase 云端数据库并附带详细中文注释
 */
export const chatService = {
  /**
   * 获取用户的所有会话列表，按更新时间降序排列
   * @param {string} userId - 用户 UUID
   */
  async getSessions(userId) {
    return handleResponse(
      supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    );
  },

  /**
   * 创建一个新会话，默认标题为“新会话”，推荐列表为空数组
   * @param {string} userId - 用户 UUID
   * @param {string} title - 会话标题
   */
  async createSession(userId, title = '新会话') {
    return handleResponse(
      supabase
        .from('chat_sessions')
        .insert([{ user_id: userId, title, recommended_programs: [] }])
        .select()
        .single()
    );
  },

  /**
   * 删除指定会话，级联删除会自动清空对应的历史消息记录
   * @param {string} sessionId - 会话 UUID
   */
  async deleteSession(sessionId) {
    return handleResponse(
      supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
    );
  },

  /**
   * 更新会话标题（通常为智能提取的用户提问首句）
   * @param {string} sessionId - 会话 UUID
   * @param {string} newTitle - 新标题内容
   */
  async updateSessionTitle(sessionId, newTitle) {
    return handleResponse(
      supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date() })
        .eq('id', sessionId)
    );
  },

  /**
   * 覆盖更新会话聚合产生的 AI 推荐列表 JSON
   * @param {string} sessionId - 会话 UUID
   * @param {Array} recommendedPrograms - 推荐项目列表数组
   */
  async updateSessionRecommendations(sessionId, recommendedPrograms) {
    return handleResponse(
      supabase
        .from('chat_sessions')
        .update({ recommended_programs: recommendedPrograms, updated_at: new Date() })
        .eq('id', sessionId)
    );
  },

  /**
   * 获取某个会话下的所有历史对话消息，按创建时间正序加载
   * @param {string} sessionId - 会话 UUID
   */
  async getMessages(sessionId) {
    return handleResponse(
      supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
    );
  },

  /**
   * 保存单条对话消息（无论是用户发送的，还是 AI 回复的）
   * @param {string} sessionId - 会话 UUID
   * @param {string} role - 角色，只能是 'user' | 'assistant' | 'system'
   * @param {string} content - 对话文本正文
   */
  async saveMessage(sessionId, role, content) {
    return handleResponse(
      supabase
        .from('chat_messages')
        .insert([{ session_id: sessionId, role, content }])
    );
  }
};
