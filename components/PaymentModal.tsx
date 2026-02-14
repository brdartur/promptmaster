import React, { useState, useEffect } from 'react';
import { X, Lock, CreditCard, CheckCircle, ShieldCheck, Loader2, Zap, Send } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  price: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, price }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'telegram' | 'vk'>('web');

  // Detect Platform
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.Telegram?.WebApp?.initData) {
            setPlatform('telegram');
        } 
        // @ts-ignore
        else if (window.vkBridge?.isWebView()) {
            setPlatform('vk');
        } else {
            setPlatform('web');
        }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);

    try {
        if (platform === 'vk') {
            // VK Payment Logic
            // @ts-ignore
            const vkBridge = window.vkBridge;
            
            // Example: Buying an item with ID 'item_id_1'
            // You need to configure this in VK Developers console
            await vkBridge.send('VKWebAppOpenPayForm', {
                app_id: Number(process.env.VK_APP_ID || 0), // Your VK App ID
                action: 'pay-to-service',
                params: {
                    amount: 390, // Amount in Rubles
                    description: 'Подписка PromptMaster PRO',
                    action_name: 'pay'
                }
            })
            .then((data: any) => {
                if (data.status === true || data.result === true) {
                    handleSuccess();
                } else {
                    alert("Оплата отменена");
                    setLoading(false);
                }
            })
            .catch((error: any) => {
                console.error(error);
                // For demo purposes in development, we simulate success if bridge fails
                // In production, remove this fallback!
                handleSuccess(); 
            });

        } else if (platform === 'telegram') {
            // Telegram Payment Logic
            // In a real app, you fetch an invoice link from your backend bot
            // const invoiceLink = await fetch('/api/create-invoice').then(res => res.json());
            
            // For now, we use a timeout to simulate the interaction
            // @ts-ignore
            const tg = window.Telegram.WebApp;
            
            // tg.openInvoice(invoiceLink, (status) => { ... });
            
            setTimeout(() => {
                 handleSuccess();
            }, 1500);

        } else {
            // Web Logic (Stripe Simulation)
            setTimeout(() => {
                handleSuccess();
            }, 2000);
        }
    } catch (e) {
        console.error("Payment failed", e);
        setLoading(false);
    }
  };

  const handleSuccess = () => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Zap size={16} className="text-yellow-400" />
            <span className="tracking-wide">Upgrade to PRO</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Оплата успешна!</h3>
              <p className="text-gray-400">Спасибо за подписку. Доступ открыт.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                 <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Стоимость подписки</p>
                 <div className="text-4xl font-bold text-white">{price} <span className="text-lg text-gray-500 font-normal">/ навсегда</span></div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 space-y-3">
                 <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                    <span>Доступ к базе промптов</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                    <span>Генератор бесконечных задач</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 shrink-0" />
                    <span>Сертификат о прохождении</span>
                 </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${
                    platform === 'vk' 
                    ? 'bg-[#0077FF] hover:bg-[#0066DD] text-white shadow-blue-500/20' 
                    : platform === 'telegram'
                    ? 'bg-[#24A1DE] hover:bg-[#2090C5] text-white shadow-cyan-500/20'
                    : 'bg-[#635BFF] hover:bg-[#5851df] text-white shadow-indigo-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Обработка...
                  </>
                ) : (
                  <>
                     {platform === 'vk' && <span className="font-bold">Оплатить через VK Pay</span>}
                     {platform === 'telegram' && <span className="font-bold flex items-center gap-2"><Send size={18} /> Оплатить (Stars)</span>}
                     {platform === 'web' && <span className="font-bold flex items-center gap-2"><CreditCard size={18} /> Оплатить картой</span>}
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                 <ShieldCheck size={12} />
                 <span className="opacity-70">
                    {platform === 'vk' ? 'Защищено VK Payments' : platform === 'telegram' ? 'Защищено Telegram Payments' : 'Безопасная оплата картой'}
                 </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;