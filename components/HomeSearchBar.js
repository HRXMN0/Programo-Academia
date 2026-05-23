import { useState, useEffect } from 'react';

const placeholders = [
  "Search 'C++ Basics'...",
  "Search 'Dynamic Programming'...",
  "Search 'Binary Trees'...",
  "Search 'Graph Algorithms'...",
  "Search 'Interview Questions'..."
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
    <div className="w-full max-w-2xl mx-auto mb-8 md:mb-12 relative group z-20">
      {/* Decorative Text above Search Bar */}
      <p className="mb-4 text-sm md:text-base text-on-surface-variant font-label-md tracking-wider uppercase opacity-80 flex items-center justify-center gap-2">
        <span className="w-8 h-[1px] bg-outline-variant"></span>
        What do you want to learn today?
        <span className="w-8 h-[1px] bg-outline-variant"></span>
      </p>

      {/* Search Bar Container */}
      <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-full pl-6 pr-2 py-2 shadow-sm transition-all duration-300 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary/50">
        <span className="material-symbols-outlined text-on-surface-variant text-2xl mr-3 opacity-70">search</span>
        
        <div className="flex-1 relative flex items-center h-12">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="peer w-full bg-transparent border-none outline-none focus:ring-0 text-on-surface font-body-lg text-base md:text-lg placeholder-transparent z-10 relative p-0 m-0"
            placeholder="Search topics..."
          />
          {/* Custom Placeholder with typing effect */}
          {!inputValue && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40 font-body-lg text-base md:text-lg flex items-center z-0 whitespace-nowrap overflow-hidden transition-opacity duration-200 peer-focus:opacity-0">
              {currentText}
              <span className="w-[2px] h-5 md:h-6 bg-secondary/70 ml-1 animate-[pulse_1s_ease-in-out_infinite]"></span>
            </div>
          )}
        </div>
        
        <button className="ml-2 bg-gradient-to-r from-secondary to-[#008d7c] text-on-secondary px-6 md:px-8 py-3 rounded-full font-label-md text-sm md:text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_4px_14px_0_rgba(0,107,92,0.39)] hover:shadow-[0_6px_20px_rgba(0,107,92,0.23)] flex items-center gap-2">
          Search
          <span className="material-symbols-outlined text-[18px] hidden md:block">arrow_forward</span>
        </button>
      </div>

      {/* Decorative Text below Search Bar */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm text-on-surface-variant/70 font-body-sm">
        <span>Popular:</span>
        <span className="hover:text-primary cursor-pointer transition-colors border-b border-dashed border-outline-variant hover:border-primary">Arrays</span>
        <span className="hover:text-primary cursor-pointer transition-colors border-b border-dashed border-outline-variant hover:border-primary">Trees</span>
        <span className="hover:text-primary cursor-pointer transition-colors border-b border-dashed border-outline-variant hover:border-primary">Dynamic Programming</span>
      </div>
    </div>
  );
}
