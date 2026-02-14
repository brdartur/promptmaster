import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DayContent from './components/DayContent';
import TaskInterface from './components/TaskInterface';
import Paywall from './components/Paywall';
import Certificate from './components/Certificate';
import InfinitePractice from './components/InfinitePractice';
import PromptLibrary from './components/PromptLibrary';
import PaymentModal from './components/PaymentModal';
import SyncModal from './components/SyncModal';
import { CURRICULUM } from './constants';
import { UserProgress } from './types';
import { Menu, X } from 'lucide-react';

const STORAGE_KEY = 'prompt-master-progress';
const PREMIUM_KEY = 'prompt-master-premium';
const FREE_DAYS_LIMIT = 3;

// Initial state: Day 1 unlocked, others locked
const INITIAL_PROGRESS: UserProgress = CURRICULUM.reduce((acc, day) => {
  acc[day.id] = { status: day.id === 1 ? 'active' : 'locked' };
  return acc;
}, {} as UserProgress);

const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [currentView, setCurrentView] = useState<number | 'infinite' | 'library'>(1);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Platform Integration (Telegram & VK)
  useEffect(() => {
    // 1. Initialize Telegram Mini App
    if ((window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        try {
            tg.expand(); // Request full screen
            
            // Optional: Adapt header color
            // tg.setHeaderColor('#111827'); 
        } catch (e) {
            console.log('Telegram expand failed', e);
        }
    }

    // 2. Initialize VK Mini App
    if ((window as any).vkBridge) {
        const vkBridge = (window as any).vkBridge;
        try {
            vkBridge.send('VKWebAppInit');
        } catch (e) {
            console.log('VK Init failed', e);
        }
    }
  }, []);

  // Load progress and premium status
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    const savedPremium = localStorage.getItem(PREMIUM_KEY);
    
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
        
        const lastActiveDay = Object.keys(parsed)
            .map(Number)
            .sort((a, b) => b - a)
            .find(id => parsed[id].status !== 'locked') || 1;
            
        setCurrentView(lastActiveDay);
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
    
    if (savedPremium === 'true') {
        setIsPremium(true);
    }
    
    setIsLoaded(true);
  }, []);

  // Save progress
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  // Save premium status
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem(PREMIUM_KEY, String(isPremium));
    }
  }, [isPremium, isLoaded]);

  const handleTaskComplete = (score: number, feedback: string, submission: string) => {
    // Only save progress for standard curriculum
    if (typeof currentView === 'number') {
        setProgress(prev => {
        const newProgress = { ...prev };
        
        newProgress[currentView] = {
            status: 'completed',
            score,
            feedback,
            userSubmission: submission
        };

        const nextDayId = currentView + 1;
        if (nextDayId <= CURRICULUM.length && newProgress[nextDayId].status === 'locked') {
            newProgress[nextDayId] = { status: 'active' };
        }

        return newProgress;
        });
    }
  };

  const handleNextDay = () => {
    if (typeof currentView === 'number') {
        const nextDayId = currentView + 1;
        if (nextDayId <= CURRICULUM.length) {
            setCurrentView(nextDayId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  };

  const handleSelectView = (view: number | 'infinite' | 'library') => {
    setCurrentView(view);
    setShowCertificate(false);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleUnlockPremium = () => {
      setShowPaymentModal(true);
  };
  
  const handlePaymentSuccess = () => {
      setIsPremium(true);
      setShowPaymentModal(false);
  };

  const handleImportProgress = (data: { progress: UserProgress; isPremium: boolean }) => {
    setProgress(data.progress);
    setIsPremium(data.isPremium);
    // Force reload to ensure everything is clean
    setTimeout(() => {
        window.location.reload();
    }, 500);
  };

  const currentDayData = typeof currentView === 'number' ? CURRICULUM.find(d => d.id === currentView) : null;

  // Paywall Logic
  // Note: Library is NO LONGER blocked at the top level, it handles its own locking state
  const isInfiniteBlocked = currentView === 'infinite' && !isPremium;
  const isDayBlocked = typeof currentView === 'number' && !isPremium && currentView > FREE_DAYS_LIMIT;
  
  const isPaywallVisible = isInfiniteBlocked || isDayBlocked;

  if (!isLoaded) return null;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* Modals */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        price="390 ₽"
      />
      
      <SyncModal 
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        progress={progress}
        isPremium={isPremium}
        onImport={handleImportProgress}
      />

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-gray-800 p-2 rounded-lg text-white shadow-lg border border-gray-700"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out print:hidden`}>
        <Sidebar 
          progress={progress} 
          currentDay={currentView} 
          onSelectDay={handleSelectView} 
          onOpenSync={() => setShowSyncModal(true)}
        />
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative">
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-12 md:py-12 pb-24">
          
          {showCertificate ? (
              <Certificate 
                isPremium={isPremium} 
                onUnlock={handleUnlockPremium} 
              />
          ) : isPaywallVisible ? (
             <Paywall onUnlock={handleUnlockPremium} />
          ) : currentView === 'infinite' ? (
             <InfinitePractice onTaskComplete={() => {}} />
          ) : currentView === 'library' ? (
             <PromptLibrary isPremium={isPremium} onUnlock={handleUnlockPremium} />
          ) : currentDayData ? (
             <>
                <DayContent data={currentDayData} />
                <TaskInterface 
                    data={currentDayData}
                    onTaskComplete={handleTaskComplete}
                    onNextDay={handleNextDay}
                    isLastDay={currentView === CURRICULUM.length}
                    initialStatus={progress[currentView].status as 'active' | 'completed'}
                    initialFeedback={progress[currentView].feedback}
                    initialSubmission={progress[currentView].userSubmission}
                    onShowCertificate={() => setShowCertificate(true)}
                />
             </>
          ) : null}

        </div>
      </main>
    </div>
  );
};

export default App;