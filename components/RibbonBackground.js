import React from 'react';

export default function RibbonBackground() {
  const words = Array(35).fill("Programo Academia");

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20"
    >
      {/* Ribbon 1: top: 10%, rotate: +15deg, scroll-left */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[10%] py-3 flex items-center overflow-hidden z-[1] bg-primary-container text-on-primary-container rounded-full"
        style={{ transform: 'rotate(15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-left 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ribbon 2: top: 25%, rotate: -15deg, scroll-right */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[25%] py-3 flex items-center overflow-hidden z-[2] bg-secondary-container text-on-secondary-container rounded-full"
        style={{ transform: 'rotate(-15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-right 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ribbon 3: top: 45%, rotate: +15deg, scroll-left */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[45%] py-3 flex items-center overflow-hidden z-[1] bg-primary text-on-primary rounded-full"
        style={{ transform: 'rotate(15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-left 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ribbon 4: top: 60%, rotate: -15deg, scroll-right */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[60%] py-3 flex items-center overflow-hidden z-[2] bg-secondary text-on-secondary rounded-full"
        style={{ transform: 'rotate(-15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-right 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ribbon 5: top: 75%, rotate: +15deg, scroll-left */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[75%] py-3 flex items-center overflow-hidden z-[1] bg-surface-container-highest text-primary rounded-full"
        style={{ transform: 'rotate(15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-left 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ribbon 6: top: 90%, rotate: -15deg, scroll-right */}
      <div 
        className="absolute w-[300%] left-[-25%] top-[90%] py-3 flex items-center overflow-hidden z-[2] bg-secondary-container text-on-secondary-container rounded-full"
        style={{ transform: 'rotate(-15deg)' }}
      >
        <div 
          className="flex whitespace-nowrap text-[24px] font-bold tracking-[0.1em] uppercase"
          style={{ animation: 'scroll-right 40s linear infinite' }}
        >
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap">
            {words.map((word, idx) => (
              <span key={idx} className="mx-8">
                {word} •
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
