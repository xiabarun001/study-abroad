/**
 * API 密钥服务
 * 负责在本地 localStorage 中读取和持久化用户的各类大模型 API 密钥
 */
export const apiKeysService = {
  /**
   * 获取当前存储的 API 密钥
   * @returns {{openAiKey: string, deepSeekKey: string}}
   */
  getKeys() {
    return {
      openAiKey: localStorage.getItem('sa_openai_key') || '',
      deepSeekKey: localStorage.getItem('sa_deepseek_key') || ''
    };
  },

  /**
   * 保存或更新 API 密钥到本地存储
   * @param {string} openAiKey - OpenAI 的密钥
   * @param {string} deepSeekKey - DeepSeek 的密钥
   */
  setKeys(openAiKey, deepSeekKey) {
    localStorage.setItem('sa_openai_key', openAiKey);
    localStorage.setItem('sa_deepseek_key', deepSeekKey);
  }
};
