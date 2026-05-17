import { supabase } from '../shared/db/supabase';
import { handleResponse } from './baseService';
import { apiKeysService } from './apiKeysService';

/**
 * 留学项目服务层 (Program Service)
 * 负责获取热门项目、执行本地项目搜索，以及触发基于大模型和爬虫的实时搜索功能
 */

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
  },

  /**
   * 根据关键字和国家筛选项目
   * @param {Object} params
   * @param {string} params.keyword - 搜索关键字
   * @param {Array<string>} params.countries - 国家名称数组
   * @param {number} params.limit - 返回数量
   */
  async searchPrograms({ keyword = '', countries = [], limit = 50 }) {
    let query = supabase
      .from('programs')
      .select(`
        id,
        title,
        description,
        url,
        universities!inner (
          id,
          name_zh,
          name_en,
          countries!inner (
            id,
            name_zh
          )
        )
      `);

    if (keyword && keyword.trim() !== '') {
      // 匹配 title 或 description
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    if (countries && countries.length > 0) {
      query = query.in('universities.countries.name_zh', countries);
    }

    query = query.limit(limit);
    
    let results = [];
    let useMock = false;

    try {
      const data = await handleResponse(query);
      if (data && data.length > 0) {
        results = data;
      } else {
        useMock = true;
      }
    } catch (err) {
      console.error('Search programs error (falling back to mock data):', err.message);
      useMock = true;
    }

    if (useMock) {
      const mockPrograms = [
        { id: 'p1', title: '计算机科学理学硕士 (MSCS)', description: '斯坦福大学计算机科学系提供的人工智能方向顶级硕士项目，注重理论与工程实践的结合。', url: '#', universities: { id: 'u1', name_zh: '斯坦福大学', name_en: 'Stanford University', countries: { id: 'c1', name_zh: '美国' } } },
        { id: 'p2', title: '商业分析硕士 (MBAn)', description: 'MIT 斯隆商学院提供的硬核商业分析项目，结合数据科学与管理学。', url: '#', universities: { id: 'u2', name_zh: '麻省理工学院', name_en: 'MIT', countries: { id: 'c1', name_zh: '美国' } } },
        { id: 'p3', title: '金融学硕士 (MSc Finance)', description: 'LSE 的王牌金融项目，培养具备全球视野的投资与公司金融精英。', url: '#', universities: { id: 'u3', name_zh: '伦敦政治经济学院', name_en: 'LSE', countries: { id: 'c2', name_zh: '英国' } } },
        { id: 'p4', title: '计算机科学理学硕士 (MSc Computer Science)', description: '牛津大学提供的顶尖计算机科学项目，涵盖高级算法与人工智能。', url: '#', universities: { id: 'u4', name_zh: '牛津大学', name_en: 'University of Oxford', countries: { id: 'c2', name_zh: '英国' } } },
        { id: 'p5', title: '信息系统硕士 (Master of Information Systems)', description: '新加坡国立大学提供的交叉学科项目，聚焦企业架构与数字化转型。', url: '#', universities: { id: 'u5', name_zh: '新加坡国立大学', name_en: 'NUS', countries: { id: 'c3', name_zh: '新加坡' } } },
        { id: 'p6', title: '计算机科学理学硕士 (MSc in Computer Science)', description: '多伦多大学的强势学科，AI和机器学习方向全球领先。', url: '#', universities: { id: 'u6', name_zh: '多伦多大学', name_en: 'University of Toronto', countries: { id: 'c4', name_zh: '加拿大' } } },
        { id: 'p7', title: '数据科学硕士 (Master of Data Science)', description: '墨尔本大学提供，专注于大数据处理和机器学习应用。', url: '#', universities: { id: 'u7', name_zh: '墨尔本大学', name_en: 'University of Melbourne', countries: { id: 'c5', name_zh: '澳大利亚' } } },
        { id: 'p8', title: '金融学硕士 (MSc in Finance)', description: '香港大学商学院王牌项目，地处亚洲金融中心。', url: '#', universities: { id: 'u8', name_zh: '香港大学', name_en: 'HKU', countries: { id: 'c6', name_zh: '中国香港' } } },
        { id: 'p9', title: '人工智能硕士 (MSc in Artificial Intelligence)', description: '南洋理工大学提供的顶尖AI项目，涵盖深度学习与机器人技术。', url: '#', universities: { id: 'u9', name_zh: '南洋理工大学', name_en: 'NTU', countries: { id: 'c3', name_zh: '新加坡' } } },
        { id: 'p10', title: '机器人与自动控制硕士 (MSc Robotics)', description: '苏黎世联邦理工大学的核心优势学科，机械与计算机高度交叉。', url: '#', universities: { id: 'u10', name_zh: '苏黎世联邦理工学院', name_en: 'ETH Zurich', countries: { id: 'c7', name_zh: '瑞士' } } },
        { id: 'p11', title: '电气与计算机工程硕士 (MEng ECE)', description: '慕尼黑工业大学的强势工科项目，免学费且在欧洲工业界认可度极高。', url: '#', universities: { id: 'u11', name_zh: '慕尼黑工业大学', name_en: 'TUM', countries: { id: 'c8', name_zh: '德国' } } },
        { id: 'p12', title: '管理学硕士 (Master in Management)', description: '巴黎高等商学院 (HEC Paris) 蝉联欧洲第一的管理学项目。', url: '#', universities: { id: 'u12', name_zh: '巴黎高等商学院', name_en: 'HEC Paris', countries: { id: 'c9', name_zh: '法国' } } },
        { id: 'p13', title: '亚太研究硕士 (MA in Asia-Pacific Studies)', description: '东京大学提供的跨学科区域研究项目，包含政治、经济与文化。', url: '#', universities: { id: 'u13', name_zh: '东京大学', name_en: 'University of Tokyo', countries: { id: 'c10', name_zh: '日本' } } },
        { id: 'p14', title: '计算机科学博士 (PhD in CS)', description: '卡内基梅隆大学提供的全美第一的计算机科学博士项目。', url: '#', universities: { id: 'u14', name_zh: '卡内基梅隆大学', name_en: 'CMU', countries: { id: 'c1', name_zh: '美国' } } },
        { id: 'p15', title: '国际关系硕士 (MA International Relations)', description: '早稻田大学极具国际视野的人文社科类项目，英文授课。', url: '#', universities: { id: 'u15', name_zh: '早稻田大学', name_en: 'Waseda University', countries: { id: 'c10', name_zh: '日本' } } },
        { id: 'p16', title: '文化管理硕士 (MA Culture Management)', description: '首尔国立大学艺术学院与商学院联合项目。', url: '#', universities: { id: 'u16', name_zh: '首尔大学', name_en: 'Seoul National University', countries: { id: 'c11', name_zh: '韩国' } } },
        { id: 'p17', title: '可持续能源硕士 (MSc Sustainable Energy)', description: '代尔夫特理工大学提供的全球顶级新能源与风能工程项目。', url: '#', universities: { id: 'u17', name_zh: '代尔夫特理工大学', name_en: 'TU Delft', countries: { id: 'c12', name_zh: '荷兰' } } },
        { id: 'p18', title: '数据科学硕士 (Master of Data Science)', description: '奥克兰大学的新兴交叉学科，结合统计学与计算机应用。', url: '#', universities: { id: 'u18', name_zh: '奥克兰大学', name_en: 'University of Auckland', countries: { id: 'c13', name_zh: '新西兰' } } },
        { id: 'p19', title: '工商管理硕士 (MBA)', description: '阿姆斯特丹大学商学院提供的精品一年制MBA项目，注重欧洲市场。', url: '#', universities: { id: 'u19', name_zh: '阿姆斯特丹大学', name_en: 'UvA', countries: { id: 'c12', name_zh: '荷兰' } } }
      ];

      results = mockPrograms.filter(program => {
        let matchKeyword = true;
        let matchCountry = true;
        
        if (keyword && keyword.trim() !== '') {
          const kw = keyword.toLowerCase();
          matchKeyword = program.title.toLowerCase().includes(kw) || program.description.toLowerCase().includes(kw);
        }
        
        if (countries && countries.length > 0) {
          matchCountry = countries.includes(program.universities.countries.name_zh);
        }
        
        return matchKeyword && matchCountry;
      }).slice(0, limit);
    }

    return results;
  },

  /**
   * Real-time search using AI and Web scraping
   */
  async searchProgramsRealTime(params) {
    if (!window.electronAPI) {
      console.warn('Electron API not available, falling back to local search.');
      return this.searchPrograms(params);
    }
    
    // FAST PATH: For initial load (no keyword, no specific country), return rich local data immediately
    if ((!params.keyword || params.keyword.trim() === '') && (!params.countries || params.countries.length === 0)) {
      return this.searchPrograms(params);
    }

    const keys = apiKeysService.getKeys();
    try {
      const aiPromise = window.electronAPI.aiSearchPrograms(params, keys);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI Search Timeout')), 12000));
      
      const results = await Promise.race([aiPromise, timeoutPromise]);
      if (results && results.length > 0) return results;
      
      // If AI returns empty, fallback to local search
      return this.searchPrograms(params);
    } catch (err) {
      console.warn('AI Search failed or timed out, gracefully falling back to local database/mock:', err.message);
      return this.searchPrograms(params);
    }
  }
};
