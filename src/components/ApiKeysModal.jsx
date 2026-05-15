import React, { useState, useEffect } from 'react';
import { apiKeysService } from '../services/apiKeysService';

export function ApiKeysModal({ isOpen, onClose }) {
  const [llmKey, setLlmKey] = useState('');
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const keys = apiKeysService.getKeys();
      setLlmKey(keys.llmKey);
      setSearchKey(keys.searchKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    apiKeysService.setKeys(llmKey, searchKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">API Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">✕</button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          To enable the AI Plan Generator with real-time web scraping, please configure your API keys below. All keys are stored securely in your local browser.
        </p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">OpenAI / DeepSeek API Key</label>
            <input 
              type="password" 
              value={llmKey} 
              onChange={e => setLlmKey(e.target.value)} 
              placeholder="sk-..."
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tavily Search API Key</label>
            <input 
              type="password" 
              value={searchKey} 
              onChange={e => setSearchKey(e.target.value)} 
              placeholder="tvly-..."
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm" 
            />
            <p className="text-xs text-slate-400 mt-2">Required for real-time university data scraping.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={handleSave} 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
