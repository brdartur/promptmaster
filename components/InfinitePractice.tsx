import React, { useState } from 'react';
import { generateDailyTask } from '../services/geminiService';
import { DayCurriculum } from '../types';
import DayContent from './DayContent';
import TaskInterface from './TaskInterface';
import { Sparkles, Loader2 } from 'lucide-react';

interface InfinitePracticeProps {
    onTaskComplete: (score: number) => void;
}

const InfinitePractice: React.FC<InfinitePracticeProps> = ({ onTaskComplete }) => {
    const [task, setTask] = useState<DayCurriculum | null>(null);
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState(0); // Force reset task interface on new task

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const newTask = await generateDailyTask();
            setTask(newTask);
            setKey(prev => prev + 1);
        } catch (e) {
            console.error(e);
            alert("Не удалось сгенерировать задание. Проверьте API Key.");
        } finally {
            setLoading(false);
        }
    };

    if (!task && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-8 rounded-3xl border border-indigo-500/30 max-w-lg">
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
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    ∞ Daily Challenge
                </h1>
                <button 
                    onClick={handleGenerate}
                    className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
                >
                    Новое задание
                </button>
             </div>
             
             {task && (
                 <>
                    <DayContent data={task} />
                    <TaskInterface 
                        key={key}
                        data={task}
                        onTaskComplete={() => {}}
                        onNextDay={handleGenerate} // "Next Day" here just generates a new one
                        isLastDay={false} // Always allows "Next"
                        initialStatus="active"
                    />
                 </>
             )}
        </div>
    );
};

export default InfinitePractice;