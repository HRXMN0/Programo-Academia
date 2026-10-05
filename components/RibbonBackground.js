import React from 'react';

/* Purely decorative page backdrop (auth screens sit on top of it).
   The old version painted six full-bleed marquee bands built from ~420 spans,
   which fought the card in front of them and cost a small fortune in DOM.
   This keeps the brand marquee idea but spends it where it reads: two slim
   ribbons over an ambient glow and a blueprint grid that is masked away from
   the centre of the screen, so whatever sits on top always stays legible. */

const BRAND_WORDS = ['Programo Academia', 'Learn by building', 'Programo Academia', 'Code every day'];
const CONCEPT_WORDS = ['Arrays', 'Recursion', 'Big-O', 'Graphs', 'Pointers', 'Dynamic Programming'];

// The scroll-left / scroll-right keyframes translate by -50%, so the track has
// to hold exactly two identical copies of the list for the loop to be seamless.
function Marquee({ words, direction }) {
  return (
    <div
      className={`flex w-max ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'} motion-reduce:animate-none`}
      style={{ animationDuration: '90s' }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 whitespace-nowrap">
          {words.map((word, idx) => (
            <span
              key={`${copy}-${idx}`}
              className="mx-6 flex items-center gap-6 text-[13px] md:text-[15px] font-semibold uppercase tracking-[0.22em]"
            >
              {word}
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RibbonBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Ambient brand light — two soft blooms rather than a flat wash. */}
      <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-secondary/20 dark:bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-48 -right-24 h-[32rem] w-[32rem] rounded-full bg-tertiary/20 dark:bg-tertiary/10 blur-3xl" />

      {/* Blueprint grid, faded out of the middle so the card in front of it
          never has to compete with a texture. */}
      <div
        className="absolute inset-0 bg-grid-fade opacity-90 dark:opacity-50"
        style={{
          backgroundSize: '56px 56px',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 30%, black 85%)',
          maskImage: 'radial-gradient(ellipse at center, transparent 30%, black 85%)',
        }}
      />

      {/* Ribbon 1 — brand wordmark, tilted up. Held at half strength so it
          reads as texture, never as content competing for attention. */}
      <div className="absolute left-[-15%] top-[14%] w-[130%] -rotate-[7deg] rounded-full bg-secondary-container text-on-secondary-container opacity-50 dark:opacity-30 py-2.5 overflow-hidden shadow-inset-hairline">
        <Marquee words={BRAND_WORDS} direction="left" />
      </div>

      {/* Ribbon 2 — the syllabus itself, tilted down. */}
      <div className="absolute left-[-15%] bottom-[16%] w-[130%] rotate-[7deg] rounded-full bg-tertiary-container text-on-tertiary-container opacity-50 dark:opacity-30 py-2.5 overflow-hidden shadow-inset-hairline">
        <Marquee words={CONCEPT_WORDS} direction="right" />
      </div>
    </div>
  );
}
