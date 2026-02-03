import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, Stars, Quote, MoveRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Position } from './types';
import { generateLovePoem } from './services/geminiService';
import { FloatingHearts } from './components/FloatingHearts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [noButtonPos, setNoButtonPos] = useState<Position>({ top: 0, left: 0 });
  const [isNoButtonAbsolute, setIsNoButtonAbsolute] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [poem, setPoem] = useState<string>("");
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 85 });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [reachedHouse, setReachedHouse] = useState<'yes' | 'no' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [heartsCollected, setHeartsCollected] = useState(0);
  const [collectibles, setCollectibles] = useState<Array<{id: number, x: number, y: number, collected: boolean}>>([]);
  const [showParticles, setShowParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const heartsNeeded = 5;
  
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

  const handleNoHover = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior for touch events
    if (e && 'touches' in e) {
      e.preventDefault();
    }
    
    setYesScale((prev) => Math.min(prev + 0.2, 6)); 
    
    if (noBtnRef.current) {
      // Smaller padding on mobile for better use of screen space
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 20 : 60;
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

  // Initialize game collectibles
  useEffect(() => {
    if (appState === AppState.GAME && collectibles.length === 0) {
      const hearts = [
        { id: 1, x: 25, y: 60, collected: false },
        { id: 2, x: 50, y: 55, collected: false },
        { id: 3, x: 75, y: 60, collected: false },
        { id: 4, x: 35, y: 40, collected: false },
        { id: 5, x: 65, y: 40, collected: false },
      ];
      setCollectibles(hearts);
    }
  }, [appState]);

  // Game physics loop
  useEffect(() => {
    if (appState !== AppState.GAME) return;

    const gameLoop = setInterval(() => {
      setPlayerPos(prev => {
        let newX = prev.x + playerVelocity.x;
        let newY = prev.y + playerVelocity.y;

        // Boundaries
        newX = Math.max(8, Math.min(92, newX));
        newY = Math.max(12, Math.min(88, newY));

        // Check collectibles
        setCollectibles(prevCollectibles => {
          return prevCollectibles.map(heart => {
            if (!heart.collected && 
                Math.abs(heart.x - newX) < 5 && 
                Math.abs(heart.y - newY) < 5) {
              setHeartsCollected(h => h + 1);
              setShowParticles(p => [...p, { id: Date.now(), x: heart.x, y: heart.y }]);
              setTimeout(() => {
                setShowParticles(p => p.filter(particle => particle.id !== Date.now()));
              }, 800);
              return { ...heart, collected: true };
            }
            return heart;
          });
        });

        // Check if reached Yes house (only if all hearts collected)
        if (newX < 30 && newY < 22 && heartsCollected >= heartsNeeded && !reachedHouse) {
          setReachedHouse('yes');
          setTimeout(() => setAppState(AppState.PROPOSAL), 2000);
        }
        
        // NO house area - blocked by obstacles
        const obstacles = [
          { x: 75, y: 30, w: 15, h: 8 },
          { x: 70, y: 20, w: 10, h: 8 },
        ];
        
        obstacles.forEach(obs => {
          if (newX > obs.x - obs.w/2 && newX < obs.x + obs.w/2 &&
              newY > obs.y - obs.h/2 && newY < obs.y + obs.h/2) {
            // Push back
            newX = prev.x;
            newY = prev.y;
            setPlayerVelocity({ x: 0, y: 0 });
          }
        });

        return { x: newX, y: newY };
      });

      // Damping
      setPlayerVelocity(prev => ({
        x: prev.x * 0.85,
        y: prev.y * 0.85
      }));
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [appState, playerVelocity, heartsCollected, reachedHouse]);

  // Keyboard controls
  useEffect(() => {
    if (appState !== AppState.GAME) return;

    const keys: {[key: string]: boolean} = {};
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      
      const speed = 1.2;
      let vx = 0;
      let vy = 0;

      if (keys['arrowleft'] || keys['a']) vx -= speed;
      if (keys['arrowright'] || keys['d']) vx += speed;
      if (keys['arrowup'] || keys['w']) vy -= speed;
      if (keys['arrowdown'] || keys['s']) vy += speed;

      setPlayerVelocity({ x: vx, y: vy });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
      
      const speed = 1.2;
      let vx = 0;
      let vy = 0;

      if (keys['arrowleft'] || keys['a']) vx -= speed;
      if (keys['arrowright'] || keys['d']) vx += speed;
      if (keys['arrowup'] || keys['w']) vy -= speed;
      if (keys['arrowdown'] || keys['s']) vy += speed;

      setPlayerVelocity({ x: vx, y: vy });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [appState]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (appState === AppState.GAME && containerRef.current && (e.buttons === 1 || isDragging)) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetX = ((e.clientX - rect.left) / rect.width) * 100;
      const targetY = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Smooth movement towards mouse
      const dx = (targetX - playerPos.x) * 0.15;
      const dy = (targetY - playerPos.y) * 0.15;
      setPlayerVelocity({ x: dx, y: dy });
    }
  };

  const handleMouseDown = () => {
    if (appState === AppState.GAME) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (appState === AppState.GAME && containerRef.current) {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const targetX = ((touch.clientX - rect.left) / rect.width) * 100;
      const targetY = ((touch.clientY - rect.top) / rect.height) * 100;
      
      // Smooth movement towards touch
      const dx = (targetX - playerPos.x) * 0.15;
      const dy = (targetY - playerPos.y) * 0.15;
      setPlayerVelocity({ x: dx, y: dy });
    }
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
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className={`
          elegant-card relative z-10 w-full max-w-3xl transition-all duration-1000 ease-in-out flex flex-col items-center justify-center
          ${appState === AppState.PROPOSAL ? 'py-16 px-8 md:px-12 min-h-[500px]' : 'py-12 px-8 min-h-[600px]'}
          rounded-[2.5rem]
        `}
      >
        
        {/* LANDING STATE */}
        {appState === AppState.LANDING && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-700">
            <div className="mb-8 p-4 bg-white rounded-full shadow-lg shadow-rose-100/50">
              <Heart className="w-16 h-16 text-rose-500 fill-current animate-[pulse_3s_ease-in-out_infinite]" />
            </div>

            <div className="text-center space-y-2 mb-12">
              <p className="text-rose-400 font-medium tracking-widest text-sm uppercase">Hey Bini!</p>
              <h1 className="text-4xl md:text-6xl text-gray-800 font-serif leading-tight">
                Choose Your<br/>
                <span className="text-rose-600 italic">Adventure</span>
              </h1>
              <p className="text-gray-600 text-lg mt-4">How do you want to receive my question?</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
              <button
                onClick={() => setAppState(AppState.GAME)}
                className="group relative bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-medium py-6 px-8 rounded-2xl shadow-xl shadow-purple-300/50 text-lg tracking-wide transition-all duration-300 overflow-hidden flex-1"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-y-full duration-500 transition-transform"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  <span>Play a Game</span>
                  <span className="text-xs opacity-80">Catch hearts first!</span>
                </div>
              </button>

              <button
                onClick={() => setAppState(AppState.PROPOSAL)}
                className="group relative bg-rose-600 hover:bg-rose-700 text-white font-medium py-6 px-8 rounded-2xl shadow-xl shadow-rose-300/50 text-lg tracking-wide transition-all duration-300 overflow-hidden flex-1"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-y-full duration-500 transition-transform"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <MoveRight className="w-8 h-8" />
                  <span>Direct Question</span>
                  <span className="text-xs opacity-80">Skip to the ask!</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* GAME STATE */}
        {appState === AppState.GAME && (
          <div className="flex flex-col items-center w-full h-[580px] relative">
            <div className="text-center mb-3">
              <h2 className="text-2xl md:text-3xl text-gray-800 font-serif mb-1">
                Collect Hearts to <span className="text-rose-600">Unlock Love</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                  <span className="font-bold text-rose-600">{heartsCollected}/{heartsNeeded}</span>
                  <span className="text-sm text-gray-600">Hearts</span>
                </div>
              </div>
              {heartsCollected < heartsNeeded && (
                <p className="text-xs text-gray-500 mt-1">Collect all hearts to unlock the YES house</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${(heartsCollected / heartsNeeded) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Game Area */}
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl overflow-hidden border-4 border-rose-300 shadow-2xl select-none">
              
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, #ec4899 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>

              {/* YES House - Left Top */}
              <div className={`absolute top-4 left-8 md:left-12 flex flex-col items-center transition-all duration-500 ${
                heartsCollected >= heartsNeeded ? 'scale-110 animate-bounce' : 'opacity-50 grayscale'
              }`}>
                <div className="text-6xl md:text-7xl mb-1">{heartsCollected >= heartsNeeded ? '🏰' : '🔒'}</div>
                <div className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm shadow-lg ${
                  heartsCollected >= heartsNeeded ? 'bg-rose-600 text-white' : 'bg-gray-400 text-gray-200'
                }`}>
                  {heartsCollected >= heartsNeeded ? 'YES UNLOCKED 💕' : 'Locked'}
                </div>
                {heartsCollected >= heartsNeeded && (
                  <div className="text-xs text-rose-600 mt-1 font-bold animate-pulse">Enter here!</div>
                )}
              </div>

              {/* NO House - Right Top (Blocked) */}
              <div className="absolute top-4 right-8 md:right-12 flex flex-col items-center opacity-40">
                <div className="text-6xl md:text-7xl mb-1">🏚️</div>
                <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full font-bold text-xs md:text-sm shadow-lg">
                  BLOCKED 🚫
                </div>
              </div>

              {/* Obstacles blocking NO path */}
              <div className="absolute top-[20%] right-[25%] text-4xl opacity-70">🪨</div>
              <div className="absolute top-[30%] right-[20%] text-5xl opacity-70">🧱</div>

              {/* Collectible Hearts */}
              {collectibles.map(heart => (
                !heart.collected && (
                  <div
                    key={heart.id}
                    className="absolute text-3xl md:text-4xl animate-pulse transition-all duration-300 hover:scale-125"
                    style={{
                      left: `${heart.x}%`,
                      top: `${heart.y}%`,
                      transform: 'translate(-50%, -50%)',
                      filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.8))'
                    }}
                  >
                    💖
                  </div>
                )
              ))}

              {/* Particle effects */}
              {showParticles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute text-2xl animate-ping"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  ✨
                </div>
              ))}

              {/* Guiding path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity: 0.2}}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#ec4899', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#f43f5e', stopOpacity: 0.3}} />
                  </linearGradient>
                </defs>
                <path d="M 50% 90% Q 30% 65% 25% 50% T 18% 22%" 
                  stroke="url(#pathGradient)" 
                  strokeWidth="25" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="15,10" />
              </svg>

              {/* Player Character */}
              <div
                className="absolute text-4xl md:text-5xl transition-all duration-100 z-30"
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                }}
              >
                {reachedHouse === 'yes' ? '🎊' : '💃'}
              </div>

              {/* Success message */}
              {reachedHouse === 'yes' && (
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 to-pink-500/30 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-700">
                  <div className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-rose-400">
                    <div className="text-6xl mb-4">🎉💕✨</div>
                    <p className="text-4xl md:text-5xl font-bold text-rose-600 mb-3">You Found Love!</p>
                    <p className="text-lg md:text-xl text-gray-700">Preparing something special...</p>
                  </div>
                </div>
              )}

              {/* Controls hint */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold shadow-xl">
                <span className="hidden md:inline">⌨️ WASD/Arrows or</span> 🖱️ Drag to move
              </div>
            </div>
          </div>
        )}

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
                className="group relative bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-8 md:py-4 md:px-12 rounded-full shadow-xl shadow-rose-300/50 text-base md:text-lg tracking-wide transition-all duration-300 min-w-[140px] md:min-w-[160px] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full"></div>
                <span className="relative z-10">{getYesButtonText()}</span>
              </button>

              <button
                ref={noBtnRef}
                onMouseEnter={handleNoHover}
                onTouchStart={(e) => handleNoHover(e)}
                onClick={(e) => handleNoHover(e)}
                style={isNoButtonAbsolute ? {
                  position: 'fixed',
                  top: `${noButtonPos.top}px`,
                  left: `${noButtonPos.left}px`,
                  transition: 'top 0.4s ease, left 0.4s ease',
                  zIndex: 50
                } : {}}
                className="group bg-white text-gray-500 active:text-rose-500 hover:text-rose-500 font-medium py-3 px-8 md:py-4 md:px-12 rounded-full border border-gray-200 active:border-rose-200 hover:border-rose-200 shadow-sm active:shadow-md hover:shadow-md text-base md:text-lg tracking-wide transition-all duration-300 min-w-[140px] md:min-w-[160px] touch-none select-none"
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