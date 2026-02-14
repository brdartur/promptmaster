import React, { useState } from 'react';
import { PROMPT_LIBRARY, PromptTemplate } from '../promptLibrary';
import { Search, Copy, Check, Database, Filter, Lock } from 'lucide-react';

const CATEGORIES = ['All', 'Marketing', 'Coding', 'Business', 'Writing', 'Productivity', 'Image Gen'];

interface PromptLibraryProps {
    isPremium: boolean;
    onUnlock: () => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isPremium, onUnlock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = PROMPT_LIBRARY.filter(prompt => {
    const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (content: string, id: string) => {
    if (!isPremium) {
        onUnlock();
        return;
    }
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-2">
             <Database className="text-yellow-500" /> Библиотека Промптов
           </h1>
           <p className="text-gray-400 text-sm mt-1">Коллекция проверенных шаблонов для работы</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Поиск шаблонов..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat 
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrompts.map(prompt => (
          <div key={prompt.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all group flex flex-col h-full relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-3">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-700/50 text-gray-300 border border-gray-600`}>
                       {prompt.category}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {prompt.title}
                  </h3>
               </div>
               <button
                  onClick={() => handleCopy(prompt.content, prompt.id)}
                  className={`p-2 rounded-lg transition-all z-10 ${
                     !isPremium
                       ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black'
                       : copiedId === prompt.id 
                       ? 'bg-green-500/20 text-green-400' 
                       : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={isPremium ? "Копировать промпт" : "Разблокировать"}
               >
                  {!isPremium ? <Lock size={18} /> : copiedId === prompt.id ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>

            <p className="text-gray-400 text-sm mb-4 flex-1">
              {prompt.description}
            </p>

            {/* Code Snippet Preview */}
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800 relative overflow-hidden group-hover:border-gray-700 transition-colors">
               <div className={`text-xs text-gray-500 font-mono line-clamp-3 leading-relaxed whitespace-pre-wrap transition-all duration-500 ${!isPremium ? 'blur-sm select-none opacity-50' : ''}`}>
                  {prompt.content}
               </div>
               
               {/* Non-Premium Overlay */}
               {!isPremium && (
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-[1px] cursor-pointer" onClick={onUnlock}>
                       <div className="bg-gray-800/90 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform">
                           <Lock size={12} /> PRO Content
                       </div>
                   </div>
               )}
               
               {isPremium && (
                   <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none"></div>
               )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {prompt.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500">#{tag}</span>
              ))}
            </div>

          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
           <Filter size={48} className="mx-auto mb-4 opacity-20" />
           <p>По вашему запросу ничего не найдено.</p>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;