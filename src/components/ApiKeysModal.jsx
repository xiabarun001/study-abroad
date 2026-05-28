import React, { useState, useEffect } from 'react';
import { apiKeysService } from '../services/apiKeysService';

/**
 * API 密钥配置弹窗组件 (Api Keys Modal)
 * 允许用户输入并保存 OpenAI 和 DeepSeek 的私有密钥，存储于本地 localStorage 中。
 */
export function ApiKeysModal({ isOpen, onClose }) {
  const [openAiKey, setOpenAiKey] = useState('');
  const [deepSeekKey, setDeepSeekKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const keys = apiKeysService.getKeys();
      setOpenAiKey(keys.openAiKey || '');
      setDeepSeekKey(keys.deepSeekKey || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    apiKeysService.setKeys(openAiKey, deepSeekKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      {/* 弹窗卡片主体：限制最大高度为屏幕高度减去 2rem，开启自适应内部静默滚动，防止溢出或“顶格” */}
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-fade-in my-auto max-h-[calc(100vh-2rem)] overflow-y-auto silent-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">API 密钥配置</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">✕</button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">OpenAI 密钥</label>
            <input 
              type="password" 
              value={openAiKey} 
              onChange={e => setOpenAiKey(e.target.value)} 
              placeholder="sk-proj-..."
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">DeepSeek 密钥</label>
            <input 
              type="password" 
              value={deepSeekKey} 
              onChange={e => setDeepSeekKey(e.target.value)} 
              placeholder="sk-..."
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" 
            />
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={handleSave} 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
