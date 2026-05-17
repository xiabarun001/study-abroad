import React, { useState } from 'react';
import { authService } from '../services/authService';

/**
 * 登录/注册弹窗组件 (Login Modal)
 * 提供用户鉴权交互界面，通过调用 authService 与 Supabase 后端通信。
 */
export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      setError('两次输入的密码不一致，请重新输入');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = isLogin 
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password);
      
      if (authError) throw authError;
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 w-full max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-indigo-100">
            {isLogin ? '👋' : '✨'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isLogin ? '欢迎回来' : '创建您的账户'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin ? '登录以继续您的留学申请之旅' : '加入留学通，开启名校追踪与智能顾问'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">电子邮箱</label>
            <input 
              type="email" 
              placeholder="hello@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">密码</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
            />
          </div>
          
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">确认密码</label>
              <input 
                type="password" 
                placeholder="请再次输入密码" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all" 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:hover:bg-indigo-600 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                <span>处理中...</span>
              </>
            ) : (isLogin ? '登录账户' : '注册并开始使用')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
          {isLogin ? '还没有账户？' : '已经有账户了？'}
          <button 
            onClick={toggleMode} 
            className="text-indigo-600 hover:text-indigo-800 ml-1.5 font-bold transition-colors hover:underline"
            type="button"
          >
            {isLogin ? '免费注册' : '直接登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
