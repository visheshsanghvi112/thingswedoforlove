import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  size: number;
  blur: number;
  opacity: number;
}

export const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const newHearts: Heart[] = [];
    // Background Layer (smaller, slower, more blurred)
    for (let i = 0; i < 15; i++) {
      newHearts.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 10,
        delay: Math.random() * 5,
        size: 10 + Math.random() * 20,
        blur: 2 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.2
      });
    }
    // Foreground Layer (larger, faster, clearer)
    for (let i = 15; i < 25; i++) {
      newHearts.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 5,
        delay: Math.random() * 5,
        size: 20 + Math.random() * 30,
        blur: Math.random() * 1,
        opacity: 0.2 + Math.random() * 0.3
      });
    }
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-rose-300 transform will-change-transform"
          style={{
            left: `${heart.left}%`,
            bottom: '-10%',
            fontSize: `${heart.size}px`,
            filter: `blur(${heart.blur}px)`,
            opacity: heart.opacity,
            animation: `floatUp ${heart.animationDuration}s linear infinite`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          ❤
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-120vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
