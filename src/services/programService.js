import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';

export const programService = {
  /**
   * 获取热门推荐的留学项目
   * 随机拉取或者按某种规则拉取项目，并关联对应的大学信息
   * @param {number} limit - 返回的数量
   * @returns {Promise<Array>} 项目列表
   */
  async getTrendingPrograms(limit = 6) {
    // 简单起见，按随机顺序获取一些项目，并关联大学名称和国家
    return handleResponse(
      supabase
        .from('programs')
        .select(`
          id,
          title,
          description,
          url,
          universities (
            id,
            name_zh,
            name_en,
            countries (
              id,
              name_zh
            )
          )
        `)
        .limit(limit)
    );
  }
};
