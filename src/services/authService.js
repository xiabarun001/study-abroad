import { supabase } from '../shared/db/supabase';

/**
 * 身份验证服务 (Auth Service)
 * 封装 Supabase Auth 客户端，提供登录、注册、登出等用户管理功能
 */
export const authService = {
  /**
   * 注册新用户
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   */
  async signUp(email, password) {
    return supabase.auth.signUp({ email, password });
  },

  /**
   * 使用邮箱密码登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   */
  async signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * 登出当前用户
   */
  async signOut() {
    return supabase.auth.signOut();
  },

  /**
   * 获取当前活动的用户会话
   */
  async getSession() {
    return supabase.auth.getSession();
  },

  /**
   * 监听鉴权状态的改变 (例如登录过期或重新登录)
   * @param {function} callback - 状态改变时的回调函数
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * 发送登录/重置密码的 6 位邮箱验证码 (OTP)
   * @param {string} email - 用户邮箱
   */
  async sendOtp(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false // 设为 false 表示仅允许已有账号的注册用户获取验证码进行登录/密码重置
      }
    });
  },

  /**
   * 校验 6 位邮箱数字验证码
   * @param {string} email - 用户邮箱
   * @param {string} token - 邮箱里收到的 6 位数字验证码
   */
  async verifyOtp(email, token) {
    return supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
  },

  /**
   * 更新当前已连接用户的密码
   * @param {string} newPassword - 新密码
   */
  async updatePassword(newPassword) {
    return supabase.auth.updateUser({
      password: newPassword
    });
  }
};
