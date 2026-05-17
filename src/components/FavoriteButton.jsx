import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/favoriteService';
import { LoginModal } from './LoginModal';

/**
 * 全局复用的爱心收藏按钮组件 (Favorite Button)
 * 接受 programId 作为参数，内部自动处理用户登录状态检查与收藏库的读写。
 */
export function FavoriteButton({ programId }) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user && programId) {
      favoriteService.isFavorite(user.id, programId).then(setIsFav).catch(console.error);
    } else {
      setIsFav(false);
    }
  }, [user, programId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      await favoriteService.toggleFavorite(user.id, programId, isFav);
      setIsFav(!isFav);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleToggle} 
        disabled={loading}
        className={`p-2 rounded-full transition-all ${isFav ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        title={isFav ? "取消收藏" : "加入收藏"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
