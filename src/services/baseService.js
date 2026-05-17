/**
 * 基础服务层模块
 * 封装与 Supabase 交互的公共方法，例如统一的请求响应处理和错误捕获
 */
import { supabase } from '../shared/db/supabase';

/**
 * 统一的 Promise 响应处理函数
 * @param {Promise} promise - 要执行的 Supabase 查询 Promise
 * @returns {Promise<any>} 返回查询的数据结果
 * @throws 抛出遇到的任何错误
 */
export const handleResponse = async (promise) => {
  try {
    const { data, error } = await promise;
    if (error) throw error; // 如果存在业务错误，则抛出
    return data;
  } catch (error) {
    console.error('Service Error:', error.message);
    throw error; // 统一向上抛出错误供 ViewModel 层捕获
  }
};
