import React from 'react';
import { Lock, CheckCircle2, Zap, ShieldCheck, Infinity, TrendingUp, Database } from 'lucide-react';

interface PaywallProps {
  onUnlock: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onUnlock }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-indigo-500/30 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden text-center">
        
        {/* Background glow */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-indigo-600/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
          <Lock className="text-white" size={32} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">PRO Подписка</h2>
        <p className="text-gray-400 mb-8">
          Курс — это только начало. Оформите подписку, чтобы получить доступ к базе шаблонов и бесконечной практике.
        </p>

        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 text-left space-y-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-400 shrink-0" size={20} />
            <span className="text-gray-200">Доступ ко всем 14 урокам курса</span>
          </div>
          <div className="flex items-center gap-3">
            <Infinity className="text-purple-400 shrink-0" size={20} />
            <span className="text-gray-200 font-bold">Бесконечные ежедневные задания (AI)</span>
          </div>
          <div className="flex items-center gap-3">
            <Database className="text-yellow-400 shrink-0" size={20} />
            <span className="text-gray-200 font-bold">База из 60 золотых промптов</span>
          </div>
           <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400 shrink-0" size={20} />
            <span className="text-gray-200">Регулярные обновления программы</span>
          </div>
        </div>

        <div className="mb-8 relative">
             {/* Tag */}
            <div className="absolute -top-3 right-0 left-0 mx-auto w-max bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                ЛУЧШИЙ ВЫБОР
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-4xl font-bold text-white">390 ₽</span>
                <span className="text-gray-400 text-lg">/ мес</span>
            </div>
            <p className="text-indigo-400 text-sm font-medium">Отмена в любой момент.</p>
        </div>

        <button 
          onClick={onUnlock}
          className="w-full py-4 bg-[#635BFF] hover:bg-[#5851df] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
        >
          <Zap className="fill-white" size={20} />
          Оформить подписку
        </button>
        
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
           <ShieldCheck size={14} />
           <span>Secured by Stripe</span>
        </div>

      </div>
    </div>
  );
};

export default Paywall;