import React from 'react';
import { CURRICULUM } from '../constants';
import { UserProgress } from '../types';
import { CheckCircle2, Lock, PlayCircle, BookOpen, Infinity, Database, Settings } from 'lucide-react';

interface SidebarProps {
  progress: UserProgress;
  currentDay: number | 'infinite' | 'library';
  onSelectDay: (dayId: number | 'infinite' | 'library') => void;
  onOpenSync: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ progress, currentDay, onSelectDay, onOpenSync }) => {
  
  const renderWeek = (weekNum: number, title: string) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
        {title}
      </h3>
      <div className="space-y-1">
        {CURRICULUM.filter(day => day.week === weekNum).map((day) => {
          const status = progress[day.id]?.status || 'locked';
          const isActive = currentDay === day.id;
          
          let Icon = Lock;
          let colorClass = "text-gray-600";
          let bgClass = "hover:bg-gray-800/50";
          
          if (status === 'completed') {
            Icon = CheckCircle2;
            colorClass = "text-green-500";
          } else if (status === 'active') {
             // If it's active but not selected, it's playable. If selected, it's open.
            Icon = isActive ? BookOpen : PlayCircle;
            colorClass = isActive ? "text-indigo-400" : "text-gray-300";
            bgClass = isActive ? "bg-indigo-900/20 border-r-2 border-indigo-500" : "hover:bg-gray-800";
          } else {
             // Locked
             bgClass = "opacity-50 cursor-not-allowed";
          }

          return (
            <button
              key={day.id}
              disabled={status === 'locked'}
              onClick={() => onSelectDay(day.id)}
              className={`w-full flex items-center p-2 rounded-md transition-all duration-200 group text-left ${bgClass}`}
            >
              <div className={`mr-3 ${colorClass}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  День {day.id}: {day.title.split('(')[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
             <span className="text-white font-bold text-lg">P</span>
           </div>
           <div>
             <h1 className="text-lg font-bold text-white leading-none">PromptMaster</h1>
             <span className="text-xs text-indigo-400 font-medium">14 Day Course</span>
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {renderWeek(1, "Неделя 1: Фундамент")}
        {renderWeek(2, "Неделя 2: Продвинутые техники")}
        
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-1">
             <button
                onClick={() => onSelectDay('infinite')}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-left border ${currentDay === 'infinite' ? 'bg-purple-900/20 border-purple-500/50 text-white' : 'border-transparent hover:bg-gray-800 text-gray-300'}`}
             >
                  <div className={`mr-3 ${currentDay === 'infinite' ? 'text-purple-400' : 'text-purple-500'}`}>
                    <Infinity size={20} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">Бесконечная практика</p>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded font-bold">PRO</span>
                      </div>
                      <p className="text-xs text-gray-500">Генератор заданий</p>
                  </div>
             </button>

             <button
                onClick={() => onSelectDay('library')}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group text-left border ${currentDay === 'library' ? 'bg-yellow-900/20 border-yellow-500/50 text-white' : 'border-transparent hover:bg-gray-800 text-gray-300'}`}
             >
                  <div className={`mr-3 ${currentDay === 'library' ? 'text-yellow-400' : 'text-yellow-500'}`}>
                    <Database size={20} />
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">База Промптов</p>
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 rounded font-bold">PRO</span>
                      </div>
                      <p className="text-xs text-gray-500">Золотые шаблоны</p>
                  </div>
             </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800">
          <button
             onClick={onOpenSync}
             className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors py-2 mb-2 rounded hover:bg-gray-800"
          >
             <Settings size={16} /> Синхронизация
          </button>
          <div className="text-xs text-gray-600 text-center">
             AI Mentor powered by Gemini 2.0
          </div>
       </div>
    </div>
  );
};

export default Sidebar;