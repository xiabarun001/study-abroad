import React, { useEffect, useState } from 'react';
import { AiAdvisorPanel } from '../features/advisor/AiAdvisorPanel';
import { supabase } from '../shared/db/supabase';

export function AiAdvisorDrawer({ isOpen, onClose }) {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    if (isOpen && programs.length === 0) {
      // Fetch some programs so AI has context, limit to 50 for performance
      supabase.from('programs').select('id, title, university_id, universities(name)').limit(50)
        .then(({ data }) => {
          if (data) setPrograms(data);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/10 z-40 backdrop-blur-[2px] transition-all" 
        onClick={onClose}
      />
      <div className="fixed right-0 top-20 bottom-0 w-96 bg-white/95 backdrop-blur-xl border-l border-slate-200/50 shadow-2xl z-50 transform transition-transform p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-wider flex items-center gap-2">
            <span>✨</span> AI Advisor
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AiAdvisorPanel programs={programs} />
        </div>
      </div>
    </>
  );
}
