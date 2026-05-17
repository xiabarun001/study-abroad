import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

// 创建全局鉴权上下文
const AuthContext = createContext({ user: null, session: null, loading: true });

/**
 * 鉴权上下文提供者组件
 * 包裹在应用最外层，用于全局管理和分发用户的登录状态
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // 当前会话信息
  const [user, setUser] = useState(null);       // 当前登录的用户信息
  const [loading, setLoading] = useState(true); // 鉴权加载状态

  useEffect(() => {
    // 初始加载时获取当前会话
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 订阅鉴权状态变化事件 (例如：其他标签页登出、token过期刷新等)
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 组件卸载时清理订阅
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 自定义 Hook: 获取当前的鉴权状态
 * @returns {{user: Object|null, session: Object|null, loading: boolean}}
 */
export const useAuth = () => useContext(AuthContext);
