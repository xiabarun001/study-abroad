import React from 'react';

export function ContinentDrawer({ continentId, onClose }) {
  if (!continentId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 z-40 backdrop-blur-[2px] transition-all" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-20 bottom-0 w-96 bg-white/95 backdrop-blur-xl border-l border-slate-200/50 shadow-2xl z-50 transform transition-transform p-8 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">{continentId === 'north-america' ? '北美洲' : continentId === 'europe' ? '欧洲' : continentId === 'asia' ? '亚洲' : continentId}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1">
           <h3 className="text-sm font-bold text-slate-400 mb-4 border-b border-slate-100 pb-2">热门国家</h3>
           <ul className="space-y-2 mb-8">
             <li className="p-3 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl cursor-pointer transition-all text-slate-700 font-medium">
               🇺🇸 美国
             </li>
             <li className="p-3 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl cursor-pointer transition-all text-slate-700 font-medium">
               🇨🇦 加拿大
             </li>
           </ul>
        </div>
      </div>
    </>
  );
}
