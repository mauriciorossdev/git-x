import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

const TEXT = 'Git X';
const MATRIX_GREEN = '#00ff41';
const FALL_DURATION = 0.6;
const STAGGER = 0.08;

const MATRIX_CHARS = '0123456789';
const MATRIX_COLUMNS = 32;
const MATRIX_LINES = 60;

function getRandomMatrixColumn(): string[] {
  return Array.from({ length: MATRIX_LINES }, () =>
    MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);

  const columns = useMemo(
    () =>
      Array.from({ length: MATRIX_COLUMNS }, (_, i) => {
        const duration = 6 + Math.random() * 8;
        return {
          id: i,
          chars: getRandomMatrixColumn(),
          delay: Math.random() * duration,
          duration,
        };
      }),
    []
  );

  useEffect(() => {
    const letters = lettersRef.current.filter(Boolean);
    if (letters.length === 0) return;

    gsap.set(letters, { y: -120, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        const hideTl = gsap.timeline({ onComplete });
        hideTl.to(containerRef.current, { opacity: 0, duration: 0.4, delay: 0.8 });
      },
    });

    tl.to(letters, {
      y: 0,
      opacity: 1,
      duration: FALL_DURATION,
      stagger: STAGGER,
      ease: 'power2.out',
    });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      aria-hidden="false"
    >
      <style>{`
        @keyframes matrix-fall {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      {/* Lluvia Matrix: columnas desfasadas, caen de arriba a abajo */}
      <div
        className="absolute inset-0 z-0 flex justify-around gap-0"
        aria-hidden
      >
        {columns.map((col) => (
          <div
            key={col.id}
            className="h-full overflow-hidden flex-shrink-0"
            style={{ width: '0.9rem' }}
          >
            <div
              className="font-mono text-[0.7rem] leading-tight"
              style={{
                color: MATRIX_GREEN,
                animation: `matrix-fall ${col.duration}s linear infinite`,
                animationDelay: `-${col.delay}s`,
              }}
            >
              {col.chars.map((c, i) => (
                <div
                  key={i}
                  style={{
                    opacity: 0.06 + (i / MATRIX_LINES) * 0.4,
                  }}
                >
                  {c}
                </div>
              ))}
              {col.chars.map((c, i) => (
                <div
                  key={`dup-${i}`}
                  style={{
                    opacity: 0.06 + (i / MATRIX_LINES) * 0.4,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="relative z-10 flex items-center justify-center gap-1">
        {TEXT.split('').map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lettersRef.current[i] = el;
            }}
            className="text-6xl md:text-8xl font-bold tracking-tight"
            style={{
              color: MATRIX_GREEN,
              /* textShadow: `0 0 10px ${MATRIX_GREEN}, 0 0 20px ${MATRIX_GREEN}, 0 0 40px ${MATRIX_GREEN}`, */
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
