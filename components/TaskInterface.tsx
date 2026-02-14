import React, { useState, useEffect } from 'react';
import { DayCurriculum, GradingResult } from '../types';
import { checkTaskSubmission } from '../services/geminiService';
import { Send, Loader2, CheckCircle, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface TaskInterfaceProps {
  data: DayCurriculum;
  onTaskComplete: (score: number, feedback: string, submission: string) => void;
  onNextDay: () => void;
  isLastDay: boolean;
  initialStatus: 'active' | 'completed';
  initialFeedback?: string;
  initialSubmission?: string;
  onShowCertificate?: () => void;
}

const TaskInterface: React.FC<TaskInterfaceProps> = ({ 
  data, 
  onTaskComplete, 
  onNextDay, 
  isLastDay,
  initialStatus,
  initialFeedback,
  initialSubmission,
  onShowCertificate
}) => {
  const [input, setInput] = useState(initialSubmission || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(
    initialFeedback ? { passed: initialStatus === 'completed', feedback: initialFeedback, score: 0 } : null
  );

  useEffect(() => {
    if (initialStatus === 'completed' && initialFeedback) {
        setResult({ passed: true, feedback: initialFeedback, score: 0 });
        setInput(initialSubmission || '');
    } else {
        setResult(null);
        setInput('');
    }
  }, [data.id, initialStatus, initialFeedback, initialSubmission]);


  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    const grade = await checkTaskSubmission(
      data.title,
      data.task,
      data.gradingCriteria,
      input
    );

    setResult(grade);
    setIsSubmitting(false);

    if (grade.passed) {
      onTaskComplete(grade.score, grade.feedback, input);
    }
  };

  return (
    <div className="mt-8 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-2xl">
      <div className="p-6 bg-gray-800/80 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">Твоё задание</h3>
        <MarkdownRenderer content={data.task} className="text-gray-300 text-sm" />
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSubmitting || (result?.passed ?? false)}
            placeholder="Напиши свой промпт здесь..."
            className="w-full h-40 bg-gray-950 text-gray-100 p-4 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
            {result?.passed ? (
                 <div className="flex items-center text-green-400 gap-2 text-sm font-medium">
                    <CheckCircle size={16} />
                    <span>Задание выполнено!</span>
                 </div>
            ) : (
                <div className="text-sm text-gray-500">
                    {input.length} символов
                </div>
            )}

            {result?.passed ? (
                isLastDay ? (
                    <button
                        onClick={onShowCertificate}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-yellow-500/20"
                    >
                        <Award size={18} /> Получить сертификат
                    </button>
                ) : (
                    <button
                        onClick={onNextDay}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Следующий день <ArrowRight size={18} />
                    </button>
                )
            ) : (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !input.trim()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                        isSubmitting || !input.trim()
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Проверка...
                        </>
                    ) : (
                        <>
                            Отправить на проверку <Send size={18} />
                        </>
                    )}
                </button>
            )}
        </div>

        {/* Feedback Section */}
        {result && (
            <div className={`mt-4 p-4 rounded-lg border ${result.passed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'} animate-in fade-in slide-in-from-top-2`}>
                <div className="flex items-start gap-3">
                    <div className={`mt-1 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-bold mb-1 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? 'Отлично!' : 'Нужна доработка'}
                        </h4>
                        <div className="text-sm text-gray-300">
                             <MarkdownRenderer content={result.feedback} />
                        </div>
                        
                        {!result.passed && (
                            <button 
                                onClick={() => setResult(null)}
                                className="mt-3 text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                            >
                                <RotateCcw size={12} /> Попробовать снова
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskInterface;
