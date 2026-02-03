import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Stars, Quote, MoveRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Position } from './types';
import { generateLovePoem } from './services/geminiService';
import { FloatingHearts } from './components/FloatingHearts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PROPOSAL);
  const [noButtonPos, setNoButtonPos] = useState<Position>({ top: 0, left: 0 });
  const [isNoButtonAbsolute, setIsNoButtonAbsolute] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [poem, setPoem] = useState<string>("");
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sophisticated phrases
  const phrases = [
    "Yes", "Are you sure?", "Think again darling", "Don't break my heart", 
    "I'll cook for you!", "I'll give you massages", "Pretty please?", 
    "Look into your heart", "You're my favorite", "There's no other choice", 
    "Just click Yes!", "I love you!", "Say Yes!", "Forever & Always?"
  ];

  const triggerConfetti = () => {
    // Premium Gold & Red Confetti
    const colors = ['#e11d48', '#fb7185', '#ffd700', '#ffffff'];
    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleNoHover = () => {
    setYesScale((prev) => Math.min(prev + 0.2, 6)); 
    
    if (noBtnRef.current) {
      const padding = 60;
      const btnWidth = noBtnRef.current.offsetWidth;
      const btnHeight = noBtnRef.current.offsetHeight;
      
      const maxX = window.innerWidth - btnWidth - padding;
      const maxY = window.innerHeight - btnHeight - padding;
      
      const newX = Math.max(padding, Math.random() * maxX);
      const newY = Math.max(padding, Math.random() * maxY);
      
      setNoButtonPos({ left: newX, top: newY });
      setIsNoButtonAbsolute(true);
    }
  };

  const handleYesClick = async () => {
    setAppState(AppState.ACCEPTED);
    triggerConfetti();
    setIsLoadingPoem(true);
    
    // Simulate loading for effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoadingPoem(false);
    
    // Stream the poem with typing effect
    try {
      await generateLovePoem("Bini", (currentText) => {
        setPoem(currentText);
      });
    } catch (e) {
      setPoem("Bini, you are my everything. Happy Valentine's Day! ❤️");
    }
  };

  const getYesButtonText = () => {
    const index = Math.min(Math.floor((yesScale - 1) * 3), phrases.length - 1);
    return phrases[index];
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden p-6 bg-[#FDF2F8]">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <FloatingHearts />
      
      <div 
        ref={containerRef}
        className={`
          elegant-card relative z-10 w-full max-w-3xl transition-all duration-1000 ease-in-out flex flex-col items-center justify-center
          ${appState === AppState.PROPOSAL ? 'py-16 px-8 md:px-12 min-h-[500px]' : 'py-12 px-8 min-h-[600px]'}
          rounded-[2.5rem]
        `}
      >
        
        {/* PROPOSAL STATE */}
        {appState === AppState.PROPOSAL && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-700">
            
            <div className="mb-8 p-4 bg-white rounded-full shadow-lg shadow-rose-100/50">
              <Heart className="w-16 h-16 text-rose-500 fill-current animate-[pulse_3s_ease-in-out_infinite]" />
            </div>

            <div className="text-center space-y-2 mb-12">
              <p className="text-rose-400 font-medium tracking-widest text-sm uppercase">The big question</p>
              <h1 className="text-5xl md:text-7xl text-gray-800 font-serif leading-tight">
                Will you be my<br/>
                <span className="text-rose-600 italic">Valentine?</span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-600 font-serif mt-4">
                Dearest Bini
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full relative min-h-[100px]">
              <button
                onClick={handleYesClick}
                style={{ 
                  transform: `scale(${yesScale})`, 
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="group relative bg-rose-600 hover:bg-rose-700 text-white font-medium py-4 px-12 rounded-full shadow-xl shadow-rose-300/50 text-lg tracking-wide transition-all duration-300 min-w-[160px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full"></div>
                <span className="relative z-10">{getYesButtonText()}</span>
              </button>

              <button
                ref={noBtnRef}
                onMouseEnter={handleNoHover}
                onClick={handleNoHover}
                style={isNoButtonAbsolute ? {
                  position: 'fixed',
                  top: `${noButtonPos.top}px`,
                  left: `${noButtonPos.left}px`,
                  transition: 'top 0.4s ease, left 0.4s ease',
                  zIndex: 50
                } : {}}
                className="group bg-white text-gray-500 hover:text-rose-500 font-medium py-4 px-12 rounded-full border border-gray-200 hover:border-rose-200 shadow-sm hover:shadow-md text-lg tracking-wide transition-all duration-300 min-w-[160px]"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* ACCEPTED STATE */}
        {appState === AppState.ACCEPTED && (
          <div className="flex flex-col items-center w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-8 relative">
               <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
               <Stars className="w-16 h-16 text-yellow-500 fill-yellow-400 relative z-10" />
            </div>

            <h1 className="text-4xl md:text-6xl text-gray-900 font-serif mb-4 text-center">
              She said <span className="text-rose-600 italic">Yes!</span>
            </h1>
            
            <p className="text-gray-500 text-lg mb-10 text-center font-light">
              My heart is officially full. Let the celebrations begin! 🥂
            </p>

            <div className="w-full bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Quote size={18} className="text-rose-500 fill-rose-500" />
                </div>
                <span className="font-semibold text-gray-900 text-sm tracking-wide uppercase">Dedicated to Bini</span>
                <div className="h-px bg-gray-100 flex-grow ml-4"></div>
              </div>
              
              {isLoadingPoem ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-[3px] border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
                  <span className="text-rose-400 text-sm font-medium tracking-wider animate-pulse">CRAFTING YOUR LOVE POEM...</span>
                </div>
              ) : (
                <div className="prose prose-stone">
                  <p className="whitespace-pre-line text-lg md:text-xl text-gray-700 leading-relaxed font-serif text-center italic poem-text">
                    {poem}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-rose-900/40 text-xs font-bold tracking-[0.2em] uppercase">
               <span>14.02.2026</span>
               <div className="w-1 h-1 bg-rose-300 rounded-full"></div>
               <span>Valentine's Day</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;