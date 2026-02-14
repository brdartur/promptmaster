import React, { useState } from 'react';
import { Download, Share2, Award, Check, Copy, Zap, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName?: string;
  isPremium?: boolean;
  onUnlock?: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ userName = "Student", isPremium = false, onUnlock }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    setIsGenerating(true);
    
    // Default share data
    const shareUrl = window.location.href;
    const shareTitle = 'Сертификат PromptMaster AI';
    const shareText = `🚀 Я только что прошел 14-дневный курс по промпт-инжинирингу в PromptMaster AI! \n\nТеперь я умею управлять нейросетями: от Zero-shot до Chain of Thought.`;

    const shareData = {
        title: shareTitle,
        text: shareText,
        url: shareUrl
    };

    let file: File | null = null;

    // 1. Try to generate image
    try {
        const element = document.getElementById('certificate-view');
        if (element) {
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution for Retina displays
                backgroundColor: '#ffffff', // Ensure white background
                useCORS: true, // Allow loading external resources if needed
                logging: false,
            });
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                file = new File([blob], 'certificate.png', { type: 'image/png' });
            }
        }
    } catch (e) {
        console.error("Image generation failed", e);
    }

    // 2. Try sharing with file (Mobile/Supported browsers)
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: shareData.title,
                text: shareData.text,
            });
            setIsGenerating(false);
            return;
        } catch (e) {
            console.log("Share with file cancelled or failed, falling back to text", e);
        }
    }

    // 3. Fallback: Standard Share (Text/Link only)
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        // 4. Fallback: Clipboard
        try {
            await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Controls - Hidden when printing */}
      <div className="print:hidden w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="text-yellow-400" /> Твой сертификат
        </h2>
        
        <div className="flex items-center gap-3">
            {!isPremium && onUnlock && (
                <button 
                    onClick={onUnlock}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black px-4 py-2 rounded-lg transition-all shadow-lg font-bold mr-2"
                >
                    <Zap size={18} className="fill-black" /> Купить PRO
                </button>
            )}

            <button 
                onClick={handleShare}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg font-medium ${
                    copied 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : copied ? <Check size={18} /> : <Share2 size={18} />}
                {isGenerating ? 'Создание...' : copied ? 'Скопировано!' : 'Поделиться'}
            </button>
            
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg font-medium"
            >
                <Download size={18} /> Скачать PDF
            </button>
        </div>
      </div>

      {/* Certificate Layout */}
      <div className="bg-white text-gray-900 p-10 md:p-16 rounded-lg shadow-2xl max-w-4xl w-full aspect-[1.414/1] relative overflow-hidden border-8 border-double border-gray-200" id="certificate-view">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100 -z-10"></div>
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
        
        {/* Border Frame */}
        <div className="absolute inset-4 border-2 border-gray-800 opacity-10 pointer-events-none"></div>
        <div className="absolute inset-6 border border-gray-800 opacity-5 pointer-events-none"></div>

        {/* Content */}
        <div className="h-full flex flex-col items-center justify-between text-center relative z-10">
            
            <div className="mt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                     <div className="w-10 h-10 bg-indigo-900 text-white flex items-center justify-center rounded-lg font-bold text-xl">P</div>
                     <span className="text-indigo-900 font-bold text-xl tracking-widest uppercase">PromptMaster AI</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-2">СЕРТИФИКАТ</h1>
                <p className="text-indigo-600 font-medium tracking-[0.2em] uppercase text-sm">О прохождении курса</p>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full">
                <p className="text-gray-500 text-lg italic mb-2">Настоящим подтверждается, что</p>
                <div className="border-b-2 border-gray-300 w-2/3 mx-auto mb-2">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 pb-2 capitalize">
                        {userName || "Выдающийся Студент"}
                    </h2>
                </div>
                <p className="text-gray-500 text-lg mt-4">
                    успешно завершил(а) 14-дневную практическую программу
                </p>
                <h3 className="text-2xl font-bold text-indigo-900 mt-2">
                    "Prompt Engineering: От основ к мастерству"
                </h3>
            </div>

            <div className="w-full flex justify-between items-end mt-12 px-12">
                <div className="text-center">
                    <div className="text-lg font-serif italic text-gray-800 mb-2">Gemini 2.0</div>
                    <div className="w-32 h-px bg-gray-400 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">AI Ментор</p>
                </div>

                <div className="flex flex-col items-center">
                     <div className="w-20 h-20 mb-2 relative">
                         {/* Simple CSS seal */}
                         <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
                         <div className="absolute inset-2 border-2 border-yellow-600 rounded-full flex items-center justify-center p-1">
                             <div className="text-[10px] text-center font-bold text-yellow-800 leading-tight">
                                 OFFICIAL<br/>CERTIFIED<br/>COURSE
                             </div>
                         </div>
                     </div>
                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-center">
                    <div className="text-lg font-serif italic text-gray-800 mb-2">PromptMaster</div>
                    <div className="w-32 h-px bg-gray-400 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Платформа</p>
                </div>
            </div>
        </div>
      </div>
      
      <p className="print:hidden mt-4 text-gray-500 text-sm text-center">
         Совет: В настройках печати выберите "Сохранить как PDF" и включите "Фон (Background graphics)".
      </p>
    </div>
  );
};

export default Certificate;