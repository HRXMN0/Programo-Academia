import { useState, useEffect } from 'react';

const placeholders = [
  "Search 'C++ Basics'...",
  "Search 'Dynamic Programming'...",
  "Search 'Binary Trees'...",
  "Search 'Graph Algorithms'...",
  "Search 'Interview Questions'..."
];

// Colour-coded so the shortcuts read as topics, not as three identical words.
const popularTopics = [
  { label: 'Arrays', dot: 'bg-topic-blue' },
  { label: 'Trees', dot: 'bg-topic-emerald' },
  { label: 'Dynamic Programming', dot: 'bg-topic-violet' }
];

export default function HomeSearchBar() {
  const [currentText, setCurrentText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const fullText = placeholders[placeholderIndex];

      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(40); // Faster when deleting
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(80); // Normal typing speed
      }

      if (!isDeleting && currentText === fullText) {
        setTypingSpeed(2000); // Pause at end before deleting
        setIsDeleting(true);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setTypingSpeed(500); // Pause before typing new word
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, placeholderIndex, typingSpeed]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 md:mb-8 relative group z-20">
      {/* Kicker — small, wide-tracked and quiet, so the bar below it wins. */}
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-outline-variant" />
        <p className="font-label-md text-label-md text-[11px] md:text-xs uppercase tracking-[0.18em] text-on-surface-variant">
          What do you want to learn today?
        </p>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-outline-variant" />
      </div>

      {/* Search Bar Container — the page's primary entry point, so it carries
          real elevation and a proper focus ring instead of a hairline. */}
      <div className="relative flex items-center gap-2 md:gap-3 bg-surface-container-lowest border border-outline-variant rounded-2xl md:rounded-full p-2 pl-2.5 md:pl-3 shadow-card transition-all duration-300 focus-within:border-secondary/60 focus-within:shadow-lifted focus-within:ring-4 focus-within:ring-secondary/20">
        <span className="grid place-items-center h-9 w-9 md:h-11 md:w-11 shrink-0 rounded-full bg-secondary/10 text-secondary">
          <span className="material-symbols-outlined text-[20px] md:text-[24px]">search</span>
        </span>

        <div className="flex-1 relative flex items-center h-11 md:h-12 min-w-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Search topics"
            className="peer w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface font-body-lg text-base md:text-lg placeholder-transparent z-10 relative p-0 m-0"
            placeholder="Search topics..."
          />
          {/* Custom Placeholder with typing effect */}
          {!inputValue && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 font-body-lg text-base md:text-lg flex items-center z-0 whitespace-nowrap overflow-hidden transition-opacity duration-200 peer-focus:opacity-0">
              {currentText}
              <span className="w-[2px] h-5 md:h-6 bg-secondary ml-1 animate-[pulse_1s_ease-in-out_infinite]"></span>
            </div>
          )}
        </div>

        <button
          aria-label="Search"
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary h-11 md:h-12 px-4 md:px-7 rounded-full font-label-md text-label-md text-sm md:text-base font-bold shadow-brand hover:shadow-brand-hover hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-200"
        >
          <span className="hidden md:inline">Search</span>
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
        </button>
      </div>

      {/* Popular shortcuts as colour-coded chips. */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
        <span className="font-label-md text-label-md text-[11px] uppercase tracking-wider text-on-surface-variant/80">
          Popular
        </span>
        {popularTopics.map((topic) => (
          <span
            key={topic.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-body-sm text-body-sm text-xs text-on-surface-variant cursor-pointer transition-all duration-200 hover:border-secondary/50 hover:text-on-surface hover:shadow-card"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${topic.dot}`} aria-hidden="true" />
            {topic.label}
          </span>
        ))}
      </div>
    </div>
  );
}
