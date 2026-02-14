import React, { useState, useEffect } from 'react';
import { generateDailyTask } from '../services/geminiService';
import { DayCurriculum } from '../types';
import DayContent from './DayContent';
import TaskInterface from './TaskInterface';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Bookmark } from 'lucide-react';

const INFINITE_TASK_KEY = 'prompt-master-infinite-task';

interface InfinitePracticeProps {
    onTaskComplete: (score: number) => void;
}

const InfinitePractice: React.FC<InfinitePracticeProps> = ({ onTaskComplete }) => {
    const [task, setTask] = useState<DayCurriculum | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); 

    // Load saved task on mount
    useEffect(() => {
        const saved = localStorage.getItem(INFINITE_TASK_KEY);
        if (saved) {
            try {
                setTask(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved infinite task");
            }
        }
    }, []);

    // Save task when it changes
    useEffect(() => {
        if (task) {
            localStorage.setItem(INFINITE_TASK_KEY, JSON.stringify(task));
        }
    }, [task]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const newTask = await generateDailyTask();
            setTask(newTask);
            setKey(prev => prev + 1);
        } catch (e: any) {
            console.error("Full Error Details:", e);
            setError(e?.message || 'Неизвестная ошибка при генерации задания.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setTask(null);
        localStorage.removeItem(INFINITE_TASK_KEY);
    };

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="bg-red-900/20 p-8 rounded-3xl border border-red-500/30 max-w-lg">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/20">
                        <AlertCircle className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Ой! Ошибка квоты</h2>
                    <p className="text-red-200 mb-8 text-lg opacity-80">
                        {error}
                    </p>
                    <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="text-red-600" size={20} />
                        Попробовать снова
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        Бесплатная версия Gemini имеет ограничения по количеству запросов в минуту.
                    </p>
                </div>
            </div>
        );
    }

    if (!task && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-8 rounded-3xl border border-indigo-500/30 max-w-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} />
                    </div>
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20 transform rotate-3">
                        <Sparkles className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Бесконечная практика</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Исчерпали основной курс? Наш AI-ментор готов создавать для вас уникальные, сложные челенджи каждый день.
                    </p>
                    <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className="text-indigo-600" size={20} />
                        Сгенерировать Челлендж
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                 <h3 className="text-xl font-medium text-white">AI придумывает задание...</h3>
                 <p className="text-gray-500 text-sm mt-2">Анализирую тренды и сложные кейсы</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <Bookmark size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            ∞ Daily Challenge
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Уровень: Эксперт</p>
                    </div>
                </div>
                <button 
                    onClick={handleGenerate}
                    className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Новое задание
                </button>
             </div>
             
             {task && (
                 <div className="relative">
                    <DayContent data={task} />
                    <TaskInterface 
                        key={key}
                        data={task}
                        onTaskComplete={() => {}}
                        onNextDay={handleGenerate}
                        isLastDay={false}
                        initialStatus="active"
                    />
                 </div>
             )}
        </div>
    );
};

export default InfinitePractice;
