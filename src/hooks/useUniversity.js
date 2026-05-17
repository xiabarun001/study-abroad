/**
 * 院校相关自定义 Hook (ViewModel)
 * 负责连接 Model 层的 universityService 与 View 层，管理院校的数据加载状态与错误处理
 */
import { useState, useEffect } from 'react';
import { universityService } from '../services/universityService';

export function useUniversity(id) {
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 如果没有传入ID，则不执行数据加载
    if (!id) return;
    
    /**
     * 异步加载院校数据
     */
    async function load() {
      setLoading(true);
      try {
        const data = await universityService.getById(id);
        setUniversity(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    // 初始化加载
    load();
    
    // 订阅该院校的实时数据变更
    const sub = universityService.subscribeToUniversity(id, load);
    
    // 组件卸载时取消订阅，防止内存泄漏
    return () => sub.unsubscribe();
  }, [id]);

  return { university, loading, error };
}
