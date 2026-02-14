import React from 'react';
import { DayCurriculum } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Lightbulb, BookOpen } from 'lucide-react';

interface DayContentProps {
  data: DayCurriculum;
}

const DayContent: React.FC<DayContentProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-400 border border-indigo-700/50 mb-3">
          День {data.id} • {data.week === 1 ? 'Фундамент' : 'Продвинутые техники'}
        </span>
        <h2 className="text-3xl font-bold text-white">{data.title}</h2>
      </div>

      {/* Theory Section */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-indigo-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Теория</h3>
        </div>
        <MarkdownRenderer content={data.theory} />
      </div>

      {/* Example Section */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-emerald-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Пример</h3>
        </div>
        <MarkdownRenderer content={data.example} />
      </div>
    </div>
  );
};

export default DayContent;
