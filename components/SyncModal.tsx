import React, { useState } from 'react';
import { X, Copy, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import { UserProgress } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  isPremium: boolean;
  onImport: (data: { progress: UserProgress; isPremium: boolean }) => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, progress, isPremium, onImport }) => {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importCode, setImportCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Generate Sync Code
  const syncData = { progress, isPremium };
  const syncCode = btoa(JSON.stringify(syncData));

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImport = () => {
    try {
      setError('');
      if (!importCode.trim()) return;
      
      const decoded = atob(importCode);
      const data = JSON.parse(decoded);
      
      // Basic validation
      if (!data.progress || typeof data.isPremium === 'undefined') {
        throw new Error('Invalid code format');
      }

      onImport(data);
      onClose();
      alert('Прогресс успешно восстановлен!');
    } catch (e) {
      setError('Неверный код синхронизации. Проверьте данные.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {mode === 'export' ? <Download size={20} /> : <Upload size={20} />}
            Синхронизация
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setMode('export')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'export' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Сохранить (Export)
          </button>
          <button 
            onClick={() => setMode('import')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'import' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Загрузить (Import)
          </button>
        </div>

        {mode === 'export' ? (
          <div className="space-y-4">
             <p className="text-gray-400 text-sm">
               Скопируйте этот код, чтобы перенести прогресс на другое устройство (например, из Telegram в браузер).
             </p>
             <div className="relative">
               <textarea 
                 readOnly 
                 value={syncCode}
                 className="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-indigo-500"
               />
               <button 
                 onClick={handleCopy}
                 className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition-colors"
               >
                 {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
               </button>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
               Вставьте код синхронизации, полученный на другом устройстве.
            </p>
            <textarea 
               value={importCode}
               onChange={(e) => setImportCode(e.target.value)}
               placeholder="Вставьте код здесь..."
               className="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-white resize-none focus:outline-none focus:border-indigo-500"
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                <AlertTriangle size={16} /> {error}
              </div>
            )}
            <button 
              onClick={handleImport}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Восстановить прогресс
            </button>
             <p className="text-[10px] text-center text-gray-500">
               Внимание: Текущий прогресс на этом устройстве будет заменен.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncModal;