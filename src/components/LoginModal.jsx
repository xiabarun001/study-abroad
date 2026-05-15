import React, { useState } from 'react';
import { authService } from '../services/authService';

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center font-outfit">
          {isLogin ? '登录账户' : '注册账户'}
        </h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full button-glow font-bold py-3 mt-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
            {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? '没有账号？' : '已有账号？'}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 hover:text-indigo-300 ml-2 font-bold">
            {isLogin ? '立即注册' : '返回登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
