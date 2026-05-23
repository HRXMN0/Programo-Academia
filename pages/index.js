import Link from 'next/link'
import HomeSearchBar from '../components/HomeSearchBar'
export default function Home() {
  const languages = [
    { name: 'C++', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <path d="M117.5 73.5h-17v17h-11v-17h-17v-11h17v-17h11v17h17v11zm-52.6-39.8c-2.7-4.1-6.4-7.5-11-9.9-4.5-2.4-9.8-3.7-15.6-3.7-8.1 0-15.2 2-21.2 6.1-6.1 4.1-10.7 9.8-13.8 17.2-3.1 7.4-4.7 16.1-4.7 26.2 0 10 1.6 18.7 4.7 26.1 3.1 7.4 7.7 13.1 13.8 17.2 6.1 4.1 13.2 6.1 21.2 6.1 5.9 0 11.2-1.3 15.8-3.9 4.6-2.6 8.3-6.1 10.9-10.4l9.1 5.8c-3.6 5.8-8.7 10.4-15 13.8-6.4 3.4-13.6 5-21.6 5-10.3 0-19.3-2.5-27-7.6-7.7-5.1-13.7-12.2-17.8-21.3C1.6 92.5.5 81.7.5 69.6s1.1-22.9 3.2-32c4.1-9.1 10.1-16.2 17.8-21.3 7.7-5.1 16.7-7.6 27-7.6 7.7 0 14.8 1.6 21.1 4.9C76 17 81 21.4 84.7 27l-9.1 6.7z"/>
      </svg>
    )},
    { name: 'Java', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <path d="M84.7 94.4c.7 1.4.3 2.9-1.2 3.6-7.2 3.3-15.4 5.1-23.7 5.1-19.8 0-35.8-9.8-35.8-21.8 0-10.1 11.4-18.7 26.8-21l1.8.8c-12.7 2.4-21.8 9.3-21.8 17 0 9.2 13.9 16.7 30.9 16.7 6.8 0 13.4-.8 19.3-2.4 1.7-.5 3 .3 3.7 2zm15-18.8c-.8 0-1.6.4-2.1 1-5.7 6.5-16.1 10.9-27.9 10.9-18.6 0-33.8-10.9-33.8-24.3 0-12.8 13.9-23.3 31.4-24.3 1.1-.1 1.9-.9 2-2V39c-19.6 1.1-35.4 12.8-35.4 27.2 0 15.6 17.4 28.3 38.8 28.3 13 0 24.8-4.7 31.2-11.8.8-1 1-2.4.2-3.3l-4.4-3.8zM61.9 0L58.2.8c6 8.3 4 19-3.9 23-1.6.8-2.3 2.6-1.5 4.2l1.6 3.1c11.1-6.1 14.7-20.7 7.5-31.1zM110.2 60.3c-.6-1.1-1.9-1.5-3-1-3.6 1.7-8 2.6-12.5 2.6-16.4 0-29.7-11.8-29.7-26.3 0-6 2.3-11.7 6.4-16.1 1-1.1.9-2.8-.2-3.8L68 13c-6.1 6.5-9.6 15.2-9.6 24.3 0 19.5 17.8 35.3 39.7 35.3 6.6 0 13-1.4 18.5-3.9 1.1-.6 1.6-1.9 1-3l-2.4-4.8zM41.7 82.2c1.7.5 3 .3 3.7 2 .7 1.4.3 2.9-1.2 3.6-7.2 3.3-15.4 5.1-23.7 5.1-19.8 0-35.8-9.8-35.8-21.8 0-10.1 11.4-18.7 26.8-21l1.8.8c-12.7 2.4-21.8 9.3-21.8 17 0 9.2 13.9 16.7 30.9 16.7 6.8 0 13.4-.8 19.3-2.4z"/>
      </svg>
    )},
    { name: 'Python', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <path d="M64 0C28.7 0 31.6 15.5 31.6 15.5l.1 16.1h32.6v4.6H16.1S0 33.7 0 69c0 35.3 13.8 33.7 13.8 33.7h8.3v-11.6c0-17.2 14.1-17.2 14.1-17.2h28.1s13.8.3 13.8-13.3V31.6S78.4 15.5 64 15.5c-12.4 0-19.9 0-19.9 0s0-5.7 3.2-8.3C50.5 4.6 57.8 0 64 0zm-15.5 8.2c2.3 0 4.1 1.9 4.1 4.1s-1.9 4.1-4.1 4.1-4.1-1.9-4.1-4.1 1.9-4.1 4.1-4.1zm15.5 119.8c35.3 0 32.4-15.5 32.4-15.5l-.1-16.1H63.7v-4.6h48.2s16.1 2.5 16.1-32.8c0-35.3-13.8-33.7-13.8-33.7h-8.3v11.6c0 17.2-14.1 17.2-14.1 17.2H64.1s-13.8-.3-13.8 13.3v28.8s-2.1 16.1 12.3 16.1c12.4 0 19.9 0 19.9 0s0 5.7-3.2 8.3c-3.3 2.6-10.6 7.2-16.8 7.2zm15.5-8.2c-2.3 0-4.1-1.9-4.1-4.1s1.9-4.1 4.1-4.1 4.1 1.9 4.1 4.1-1.9 4.1-4.1 4.1z"/>
      </svg>
    )},
    { name: 'JavaScript', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <rect x="8" y="8" width="112" height="112" rx="18" fill="none" stroke="currentColor" strokeWidth="10"/>
        <text x="64" y="86" fill="currentColor" fontSize="54" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">JS</text>
      </svg>
    )},
    { name: 'TypeScript', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <rect x="8" y="8" width="112" height="112" rx="18" fill="none" stroke="currentColor" strokeWidth="10"/>
        <text x="64" y="86" fill="currentColor" fontSize="54" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">TS</text>
      </svg>
    )},
    { name: 'Go', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <path d="M115.3 54.8c-.8-2.9-2.3-5.5-4.5-7.7-2.2-2.2-4.9-3.8-8-5-3.1-1.1-6.5-1.7-10.2-1.7-5.1 0-9.7 1.1-13.8 3.2-4.1 2.1-7.3 5.1-9.7 9-2.3 3.9-3.5 8.4-3.5 13.5v.1c0 5 1.2 9.5 3.5 13.4 2.3 3.9 5.5 6.9 9.5 9 4.1 2.1 8.7 3.2 13.9 3.2 4.5 0 8.6-.8 12.3-2.5 3.7-1.7 6.6-4.1 8.8-7.3V67.8H88.9v7.9h18.2c-.3 2.7-1.6 5-3.8 6.8-2.2 1.8-5.3 2.7-9.4 2.7-3.9 0-7.2-1.1-9.9-3.2-2.7-2.1-4.5-5.2-5.4-9.3-.1-.4-.1-.9-.1-1.4v-.1c0-.6 0-1.1.1-1.7.9-4.1 2.7-7.2 5.5-9.3s6.1-3.2 10.1-3.2c3.5 0 6.5.8 8.8 2.4 2.3 1.6 3.9 3.8 4.6 6.6h7.7zm-60.8 1.4V56c0-5 1.2-9.5 3.5-13.4s5.5-6.9 9.5-9 8.7-3.2 13.9-3.2 9.7 1.1 13.8 3.2 7.3 5.1 9.7 9c2.3 3.9 3.5 8.4 3.5 13.5v.1c0 5-1.2 9.5-3.5 13.4-2.3 3.9-5.5 6.9-9.5 9-4.1 2.1-8.7 3.2-13.9 3.2s-9.7-1.1-13.8-3.2-7.3-5.1-9.7-9c-2.3-3.8-3.5-8.3-3.5-13.4zm7.9.1c0 3.7 1.1 6.8 3.2 9.2 2.1 2.4 5.1 3.6 8.9 3.6s6.8-1.2 8.9-3.6 3.2-5.5 3.2-9.2v-.1c0-3.7-1.1-6.8-3.2-9.2s-5.1-3.6-8.9-3.6-6.8 1.2-8.9 3.6c-2.2 2.4-3.2 5.5-3.2 9.2v.1z"/>
      </svg>
    )},
    { name: 'Rust', icon: (
      <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 128 128" fill="currentColor">
        <path d="M119.8 62.4l-3-4.8 4-4-5-2.7 1.2-5.5-5.6-1.1.8-5.6-5.6-.4-.3-5.7-5.4.9-1.4-5.5-5 .2-2.5-5.1-4.4 1.4-3.5-4.5-3.5 2.5-4.5-3.5-2.5 3.5-5-2.5-1.4 4.5-5.1-1.4-1.2 5-5.5-.2-.3 5.6-5.6.4.8 5.6-5.6 1.1 1.2 5.5-5 2.7 4 4-3 4.8 5 3.8-2 5.3 5.4.9.4 5.7c-4 3-4.1 4.5-4.1 4.5h8.3s.1-1.5 4.1-4.5l-.4-5.7-5.4-.9 2-5.3-5-3.8 3-4.8-4-4 5-2.7-1.2-5.5 5.6-1.1-.8-5.6 5.6-.4.3-5.7 5.4-.9 1.4-5.5 5-.2 2.5-5.1 4.4-1.4 3.5-4.5 3.5-2.5 4.5-3.5 2.5-3.5 5 2.5 1.4-4.5 5.1 1.4 1.2-5 5.5.2.3-5.6 5.6-.4-.8-5.6 5.6-1.1-1.2-5.5 5-2.7-4-4 3-4.8-5-3.8 2-5.3-5.4-.9-.4-5.7c4-3 4.1-4.5 4.1-4.5h-8.3s-.1 1.5-4.1 4.5l.4 5.7 5.4.9-2 5.3 5 3.8zM64 24a40 40 0 110 80 40 40 0 010-80z"/>
      </svg>
    )}
  ];

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Decorative Background Patterns & Corner Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <main className="relative z-10 w-full max-w-container-max mx-auto px-gutter animate-fade-in">
        {/* Hero Section */}
        <section className="relative py-xl flex flex-col items-center justify-center text-center min-h-[60vh] overflow-visible">
          {/* Soft Radial Glow behind Hero content */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,107,92,0.03)_0%,transparent_60%)] pointer-events-none z-0"></div>
          
          {/* Tiny floating decorative dots in background */}
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-secondary animate-pulse opacity-60 filter blur-[1px]"></div>
          <div className="absolute bottom-[25%] right-[12%] w-3 h-3 rounded-full bg-primary animate-pulse opacity-40 filter blur-[2px] [animation-delay:1s]"></div>
          <div className="absolute top-[60%] left-[8%] w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping opacity-35"></div>

          {/* Container Wrapper */}
          <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 relative z-10 flex flex-col items-center gap-lg text-center">
            {/* Search Bar Component */}
            <HomeSearchBar />

            <span className="relative bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-sm py-xs rounded-full inline-block border border-outline-variant">
              {/* Pulsing indicator badge */}
              <span className="absolute -left-1 -top-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              Structured for Success
            </span>

            <h1 className="font-display-lg text-display-lg md:text-5xl lg:text-display-lg text-primary tracking-tight font-bold">
              Master DSA with <span className="bg-gradient-to-r from-secondary via-[#008d7c] to-[#0b1f3a] dark:from-secondary-fixed dark:to-primary-fixed bg-clip-text text-transparent">Clarity</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Structured learning paths designed for modern engineers. Master patterns, not just problems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-sm w-full sm:w-auto justify-center items-center">
              <Link href="/dsa" className="w-full sm:w-[240px] bg-secondary text-on-secondary font-label-md text-label-md px-4 py-3 rounded shadow-[0_0_20px_rgba(0,107,92,0.2)] dark:shadow-[0_0_20px_rgba(104,250,222,0.15)] transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/90 active:scale-[0.98] flex items-center justify-center">
                Start Learning
              </Link>
              <Link href="/dsa" className="w-full sm:w-[240px] border border-primary/80 dark:border-primary-fixed/80 text-primary dark:text-primary-fixed bg-transparent font-label-md text-label-md px-4 py-3 rounded transition-all duration-300 hover:scale-[1.02] hover:border-primary dark:hover:border-primary-fixed hover:bg-surface-container-low dark:hover:bg-surface-high hover:shadow-[0_0_15px_rgba(11,31,58,0.06)] active:scale-[0.98] flex items-center justify-center">
                Explore Curriculum
              </Link>
            </div>
          </div>
        </section>

        {/* See How It Works Section */}
        <section className="py-16 md:py-24 border-t border-outline-variant relative overflow-visible z-10">
          {/* Ultra-Subtle Top Transition Fade */}
          <div className="bg-gradient-to-b from-background via-surface-container-lowest/[0.01] to-background h-8 w-full absolute -top-4 left-0 pointer-events-none z-10"></div>
          
          <div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 relative z-10 flex flex-col">
            
            {/* Left-Aligned Header Block */}
            <div className="flex flex-col items-start text-left gap-xs mb-12 relative z-10 max-w-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                See How It Works
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Interactive code intuition, guided curriculum, and real-time skill tracking.
              </p>
            </div>

            {/* Grid Layout (Tighter gap) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Code Editor */}
              <div className="relative">
                {/* Faint Glow Backdrop */}
                <div className="absolute -inset-4 bg-secondary/[0.02] rounded-2xl blur-3xl pointer-events-none z-0"></div>
                
                {/* Code Editor Card */}
                <div className="relative z-10 bg-[#0D1117] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_rgba(0,107,92,0.15)] hover:border-secondary/25 rounded-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#161b22]">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                      <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
                    </div>
                    <div className="text-xs text-outline/50 dark:text-outline/40 font-mono tracking-wide">
                      binary_search.cpp
                    </div>
                    <div className="w-12"></div>
                  </div>
                  <div className="p-6 overflow-x-auto no-scrollbar">
                    <pre className="font-mono text-xs md:text-sm text-[#F8F8F2] leading-relaxed tracking-normal scrollbar-none">
                      <code>
                        <span className="text-[#6272A4] block mb-2">// Time Complexity: O(log N) | Space Complexity: O(1)</span>
                        <span className="text-[#FF79C6]">int</span> <span className="text-[#50FA7B]">binarySearch</span>(<span className="text-[#8BE9FD]">int</span> arr[], <span className="text-[#8BE9FD]">int</span> l, <span className="text-[#8BE9FD]">int</span> r, <span className="text-[#8BE9FD]">int</span> x) {"{"}
                        {"\n"}{"  "}<span className="text-[#FF79C6]">while</span> (l &lt;= r) {"{"}
                        {"\n"}{"    "}<span className="text-[#FF79C6]">int</span> mid = l + (r - l) / <span className="text-[#BD93F9]">2</span>;
                        {"\n"}
                        {"\n"}{"    "}<span className="text-[#FF79C6]">if</span> (arr[mid] == x)
                        {"\n"}{"      "}<span className="text-[#FF79C6]">return</span> mid;
                        {"\n"}
                        {"\n"}{"    "}<span className="text-[#FF79C6]">if</span> (arr[mid] &lt; x)
                        {"\n"}{"      "}l = mid + <span className="text-[#BD93F9]">1</span>;
                        {"\n"}{"    "}<span className="text-[#FF79C6]">else</span>
                        {"\n"}{"      "}r = mid - <span className="text-[#BD93F9]">1</span>;
                        {"\n"}{"  "}{"}"}
                        {"\n"}{"  "}<span className="text-[#FF79C6]">return</span> -<span className="text-[#BD93F9]">1</span>;
                        {"\n"}{"}"}
                      </code>
                    </pre>
                    {/* Try it Live Interactive Button */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <Link href="/compiler" className="bg-secondary/10 hover:bg-secondary/25 border border-secondary/30 text-secondary font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(0,107,92,0.4)] backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(0,107,92,0.8)]"></span>
                        Try it Live
                        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Code Caption */}
                <div className="text-xs text-on-surface-variant/70 mt-4 pl-1 border-l-2 border-secondary/40 font-body-sm relative z-10">
                  Write clean C++ solutions with instant syntactic visual feedback and pattern recognition.
                </div>
              </div>

              {/* Right Column: Stacked Cards */}
              <div className="flex flex-col gap-8">
                
                {/* Card 1: Roadmap Card */}
                <div className="bg-[#0D1117] border border-white/10 rounded-xl p-6 shadow-xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 text-white flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold tracking-[0.1em] uppercase text-outline/60">Guided Curriculum</span>
                    <span className="text-xs text-secondary font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      DSA Roadmap
                    </span>
                  </div>
                  
                  {/* Nodes Flow */}
                  <div className="flex items-center justify-between gap-1.5 w-full py-2">
                    {/* Arrays */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-secondary/25 border border-secondary/60 text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,107,92,0.1)]">
                        <span className="material-symbols-outlined filled text-[17px]">check_circle</span>
                      </div>
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Arrays</span>
                    </div>
                    
                    {/* Line */}
                    <div className="flex-1 h-[2px] bg-secondary/60 min-w-[12px] md:min-w-[20px] -mt-5"></div>

                    {/* Trees */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-secondary/25 border border-secondary/60 text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,107,92,0.1)]">
                        <span className="material-symbols-outlined filled text-[17px]">check_circle</span>
                      </div>
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Trees</span>
                    </div>

                    {/* Line */}
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-secondary/60 to-secondary/80 min-w-[12px] md:min-w-[20px] -mt-5"></div>

                    {/* Graphs */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 relative">
                      <div className="w-10 h-10 rounded-full bg-[#0D1117] border-2 border-secondary text-secondary flex items-center justify-center shadow-[0_0_15px_rgba(0,107,92,0.3)] animate-active-pulse">
                        <span className="material-symbols-outlined text-[16px]">explore</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-secondary uppercase tracking-wider">Graphs</span>
                    </div>

                    {/* Line */}
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-secondary/80 to-white/10 min-w-[12px] md:min-w-[20px] -mt-5"></div>

                    {/* DP */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-40">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/15 text-outline flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                      </div>
                      <span className="text-[11px] font-bold text-outline uppercase tracking-wider">DP</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-outline-variant/60 w-full my-1"></div>

                {/* Card 2: Progress Tracker Card */}
                <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-secondary/[0.03] border border-outline-variant rounded-xl p-6 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,107,92,0.1)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                      DSA Path Mastery: 65% Completed
                    </h3>
                    <span className="text-sm font-semibold text-secondary/90 tracking-wide mt-1">
                      18 / 28 Modules Completed
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full bg-surface-container-high dark:bg-surface-container rounded-full h-3 border border-outline-variant/10 overflow-hidden p-[2px]">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary via-secondary-fixed to-[#008d7c] rounded-full shadow-[0_0_12px_rgba(0,107,92,0.35)]"
                      style={{ width: '65%' }}
                    ></div>
                  </div>

                  {/* Next Milestone Tag */}
                  <div className="text-xs text-on-surface-variant/80 font-medium flex items-center gap-1.5 mt-3">
                    <span className="material-symbols-outlined text-sm text-secondary animate-pulse">flag</span>
                    Next Milestone: Graphs
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Learning Paths Section (Bento Grid Style) */}
        <section className="py-xl border-t border-outline-variant relative z-10">
          <div className="flex flex-col gap-xl">
            <div className="flex flex-col gap-sm border-l-4 border-secondary pl-sm">
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">Learning Paths</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Curated roadmaps designed to take you from foundational syntax to advanced algorithmic problem solving.
              </p>
            </div>

            {/* Horizontal Auto-Scrolling Carousel */}
            <div className="relative w-full overflow-hidden py-10 my-8 pointer-events-auto select-none border-y border-outline-variant bg-[radial-gradient(circle_at_center,rgba(0,107,92,0.03)_0%,transparent_75%)]">
              <style>{`
                @keyframes marquee-scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                .animate-marquee {
                  display: flex;
                  width: max-content;
                  animation: marquee-scroll 25s linear infinite;
                }
                .animate-marquee:hover {
                  animation-play-state: paused;
                }
              `}</style>
              
              {/* Centered Heading Label Above Logos */}
              <div className="text-center font-label-md text-[11px] md:text-[12px] text-on-surface-variant/50 dark:text-outline/40 tracking-[0.15em] uppercase mb-lg font-bold">
                Loved by developers. Trusted by engineering leaders.
              </div>

              <div className="relative w-full">
                {/* Fade Edges Gradient Overlays (Left/Right) for Premium Feel */}
                <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

                 {/* Scroll Container */}
                <div className="w-full overflow-x-auto scrollbar-none flex">
                  <div className="animate-marquee flex gap-16 md:gap-28 py-xs items-center">
                    {/* First list */}
                    {languages.map((lang, idx) => (
                      <div 
                        key={`list1-${idx}`} 
                        className="flex items-center gap-4 text-on-surface-variant/80 dark:text-outline/70 hover:text-primary dark:hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {lang.icon}
                        <span className="font-label-md text-base md:text-lg font-bold tracking-wide">
                          {lang.name}
                        </span>
                      </div>
                    ))}
                    {/* Second identical list for loop */}
                    {languages.map((lang, idx) => (
                      <div 
                        key={`list2-${idx}`} 
                        className="flex items-center gap-4 text-on-surface-variant/80 dark:text-outline/70 hover:text-primary dark:hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {lang.icon}
                        <span className="font-label-md text-base md:text-lg font-bold tracking-wide">
                          {lang.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Path 1 */}
              <Link href="/cpp" className="bg-surface-container-lowest border border-outline-variant hover:border-secondary/40 rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_16px_32px_rgba(11,31,58,0.08)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <span className="material-symbols-outlined text-secondary text-4xl">data_object</span>
                <div className="flex flex-col gap-sm">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">C++ Mastery</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Deep dive into modern C++ syntax, memory management, and OOP principles. Build a rock-solid foundation.
                  </p>
                </div>
                <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                  <span className="font-label-md text-label-md">12 Modules</span>
                  <span className="material-symbols-outlined group-hover:text-secondary group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </Link>
              {/* Path 2 */}
              <Link href="/dsa" className="bg-surface-container-lowest border border-outline-variant hover:border-secondary/40 rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_16px_32px_rgba(11,31,58,0.08)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <span className="material-symbols-outlined text-secondary text-4xl">account_tree</span>
                <div className="flex flex-col gap-sm">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">Data Structures</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Master arrays, linked lists, trees, and graphs. Understand the 'why' behind algorithmic efficiency.
                  </p>
                </div>
                <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                  <span className="font-label-md text-label-md">24 Modules</span>
                  <span className="material-symbols-outlined group-hover:text-secondary group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </Link>
              {/* Path 3 */}
              <Link href="/interview-prep" className="bg-surface-container-lowest border border-outline-variant hover:border-secondary/40 rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_16px_32px_rgba(11,31,58,0.08)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <span className="material-symbols-outlined text-secondary text-4xl">work</span>
                <div className="flex flex-col gap-sm">
                  <h3 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">Interview Prep</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Pattern-based problem solving targeted for top tech company interviews. Practice with real-world scenarios.
                  </p>
                </div>
                <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                  <span className="font-label-md text-label-md">18 Modules</span>
                  <span className="material-symbols-outlined group-hover:text-secondary group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-xl border-t border-outline-variant relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            <div className="flex flex-col gap-lg">
              <div className="flex flex-col gap-xs border-l-4 border-secondary pl-sm">
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">Why Programo?</h2>
              </div>
              <div className="flex flex-col gap-md">
                <div className="flex gap-md items-start group">
                  <div className="p-sm bg-surface-container-high rounded flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary animate-pulse">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-xs font-bold tracking-tight">Code Intuition</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">We focus on building a mental model for problem solving, not just memorizing syntax.</p>
                  </div>
                </div>
                <div className="flex gap-md items-start group">
                  <div className="p-sm bg-surface-container-high rounded flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary">map</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-xs font-bold tracking-tight">Structured Roadmaps</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Eliminate decision fatigue. Our linear paths guide you exactly on what to learn next.</p>
                  </div>
                </div>
                <div className="flex gap-md items-start group">
                  <div className="p-sm bg-surface-container-high rounded flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-xs font-bold tracking-tight">Live Practice</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Apply concepts immediately in our built-in coding environments to solidify understanding.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract Interactive Element */}
            <div className="bg-surface-container-lowest border border-outline-variant hover:border-secondary/30 rounded-xl p-lg h-96 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-high via-surface-container-lowest to-surface-container-lowest opacity-50 pointer-events-none"></div>
              <div className="flex justify-between items-center border-b border-outline-variant pb-sm mb-md relative z-10">
                <div className="flex gap-xs">
                  <div className="w-3 h-3 rounded-full bg-error opacity-50"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary opacity-50"></div>
                  <div className="w-3 h-3 rounded-full bg-outline opacity-50"></div>
                </div>
                <span className="font-code-block text-code-block text-on-surface-variant">main.cpp</span>
              </div>
              <div className="font-code-block text-code-block text-on-surface-variant flex-grow relative z-10">
                <span className="text-primary opacity-70">#include</span> &lt;iostream&gt;<br/>
                <span className="text-primary opacity-70">#include</span> &lt;vector&gt;<br/><br/>
                <span className="text-secondary">int</span> <span className="text-primary">main</span>() &#123;<br/>
                &nbsp;&nbsp;<span className="text-secondary">std::vector</span>&lt;<span className="text-secondary">int</span>&gt; path = &#123;<span className="text-secondary-container text-on-secondary-container px-1 rounded">1</span>, <span className="text-secondary-container text-on-secondary-container px-1 rounded">2</span>, <span className="text-secondary-container text-on-secondary-container px-1 rounded">3</span>&#125;;<br/>
                &nbsp;&nbsp;<span className="text-outline italic">// Master the fundamentals</span><br/>
                &nbsp;&nbsp;<span className="text-secondary">return</span> <span className="text-secondary-container text-on-secondary-container px-1 rounded">0</span>;<br/>
                &#125;
              </div>
              <button className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded w-fit self-end mt-md hover:bg-primary-container transition-all hover:scale-105 active:scale-95 duration-200 relative z-10 flex items-center gap-xs shadow-[0_0_15px_rgba(11,31,58,0.1)]">
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Run Code
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
