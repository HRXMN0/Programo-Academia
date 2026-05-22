import React from 'react';

export default function RibbonBackground() {
  // Generate a long repeating string to ensure it covers the width of the diagonal ribbons (180vw) without gaps.
  const text = "PROGRAMO ACADEMIA  •  ".repeat(15);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Light gradient overlay above ribbons to soften contrast and ensure supreme form readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/95 pointer-events-none z-[3]" />

      {/* Ribbon 1: Soft Teal, Left-to-Right */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[8%] py-3.5 bg-secondary/10 border-y border-secondary/10 rounded-[9999px] -rotate-[6deg] flex items-center overflow-hidden blur-[0.5px] z-[1]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-on-secondary-container/20 uppercase">
          <div className="flex animate-scroll-right gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>

      {/* Ribbon 2: Light Gray, Right-to-Left */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[24%] py-3.5 bg-surface-container-highest/20 border-y border-outline-variant/10 rounded-[9999px] rotate-[10deg] flex items-center overflow-hidden blur-[0.5px] z-[1]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-outline/25 uppercase">
          <div className="flex animate-scroll-left gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>

      {/* Ribbon 3: Muted Dark Gray, Left-to-Right */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[42%] py-3.5 bg-on-surface/5 border-y border-outline/5 rounded-[9999px] -rotate-[10deg] flex items-center overflow-hidden blur-[0.5px] z-[2]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-on-surface-variant/15 uppercase">
          <div className="flex animate-scroll-right gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>

      {/* Ribbon 4: Soft Teal, Right-to-Left (hidden on mobile, showing 4 ribbons on small screens) */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[58%] py-3.5 bg-secondary/10 border-y border-secondary/10 rounded-[9999px] rotate-[6deg] hidden md:flex items-center overflow-hidden blur-[0.5px] z-[1]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-on-secondary-container/20 uppercase">
          <div className="flex animate-scroll-left gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>

      {/* Ribbon 5: Light Gray, Left-to-Right (hidden on mobile, showing 4 ribbons on small screens) */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[74%] py-3.5 bg-surface-container-highest/20 border-y border-outline-variant/10 rounded-[9999px] -rotate-[14deg] hidden md:flex items-center overflow-hidden blur-[0.5px] z-[2]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-outline/25 uppercase">
          <div className="flex animate-scroll-right gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>

      {/* Ribbon 6: Muted Dark Gray, Right-to-Left */}
      <div 
        className="absolute w-[180vw] left-[-40vw] top-[88%] py-3.5 bg-on-surface/5 border-y border-outline/5 rounded-[9999px] rotate-[8deg] flex items-center overflow-hidden blur-[0.5px] z-[1]"
      >
        <div className="flex whitespace-nowrap text-[11px] font-semibold tracking-[0.25em] text-on-surface-variant/15 uppercase">
          <div className="flex animate-scroll-left gap-4">
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
