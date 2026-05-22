import Link from 'next/link'

export default function Home() {
  return (
    <main className="w-full max-w-container-max mx-auto px-gutter">
      {/* Hero Section */}
      <section className="py-xl flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="max-w-3xl flex flex-col items-center gap-lg">
          <span className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-sm py-xs rounded-full inline-block border border-outline-variant">
            Structured for Success
          </span>
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
            Master DSA with Clarity
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Structured learning paths designed for modern engineers. Master patterns, not just problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm pt-sm">
            <Link href="/dsa" className="bg-secondary text-on-secondary font-label-md text-label-md px-xl py-sm rounded transition-shadow hover:shadow-[0px_4px_12px_rgba(11,31,58,0.15)] flex items-center justify-center">
              Start Learning
            </Link>
            <Link href="/dsa" className="border border-primary text-primary bg-transparent font-label-md text-label-md px-xl py-sm rounded hover:bg-surface-container-low transition-colors flex items-center justify-center">
              Explore Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Paths Section (Bento Grid Style) */}
      <section className="py-xl border-t border-outline-variant">
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-sm">
            <h2 className="font-headline-lg text-headline-lg text-primary">Learning Paths</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Curated roadmaps designed to take you from foundational syntax to advanced algorithmic problem solving.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Path 1 */}
            <Link href="/cpp" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_4px_12px_rgba(11,31,58,0.05)] transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <span className="material-symbols-outlined text-secondary text-4xl">data_object</span>
              <div className="flex flex-col gap-sm">
                <h3 className="font-headline-md text-headline-md text-primary">C++ Mastery</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Deep dive into modern C++ syntax, memory management, and OOP principles. Build a rock-solid foundation.
                </p>
              </div>
              <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                <span className="font-label-md text-label-md">12 Modules</span>
                <span className="material-symbols-outlined group-hover:text-secondary transition-colors">arrow_forward</span>
              </div>
            </Link>
            {/* Path 2 */}
            <Link href="/dsa" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_4px_12px_rgba(11,31,58,0.05)] transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <span className="material-symbols-outlined text-secondary text-4xl">account_tree</span>
              <div className="flex flex-col gap-sm">
                <h3 className="font-headline-md text-headline-md text-primary">Data Structures</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Master arrays, linked lists, trees, and graphs. Understand the 'why' behind algorithmic efficiency.
                </p>
              </div>
              <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                <span className="font-label-md text-label-md">24 Modules</span>
                <span className="material-symbols-outlined group-hover:text-secondary transition-colors">arrow_forward</span>
              </div>
            </Link>
            {/* Path 3 */}
            <Link href="/interview-prep" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md hover:shadow-[0px_4px_12px_rgba(11,31,58,0.05)] transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <span className="material-symbols-outlined text-secondary text-4xl">work</span>
              <div className="flex flex-col gap-sm">
                <h3 className="font-headline-md text-headline-md text-primary">Interview Prep</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Pattern-based problem solving targeted for top tech company interviews. Practice with real-world scenarios.
                </p>
              </div>
              <div className="mt-auto pt-md flex items-center justify-between border-t border-outline-variant text-on-surface-variant w-full">
                <span className="font-label-md text-label-md">18 Modules</span>
                <span className="material-symbols-outlined group-hover:text-secondary transition-colors">arrow_forward</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-xl border-t border-outline-variant">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <div className="flex flex-col gap-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary">Why Programo?</h2>
            <div className="flex flex-col gap-md">
              <div className="flex gap-md items-start">
                <div className="p-sm bg-surface-container-high rounded flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary mb-xs">Code Intuition</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">We focus on building a mental model for problem solving, not just memorizing syntax.</p>
                </div>
              </div>
              <div className="flex gap-md items-start">
                <div className="p-sm bg-surface-container-high rounded flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">map</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary mb-xs">Structured Roadmaps</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Eliminate decision fatigue. Our linear paths guide you exactly on what to learn next.</p>
                </div>
              </div>
              <div className="flex gap-md items-start">
                <div className="p-sm bg-surface-container-high rounded flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">terminal</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary mb-xs">Live Practice</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Apply concepts immediately in our built-in coding environments to solidify understanding.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract Interactive Element */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg h-96 flex flex-col justify-between shadow-sm relative overflow-hidden">
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
              &nbsp;&nbsp;<span className="text-secondary">std::vector</span>&lt;<span class="text-secondary">int</span>&gt; path = &#123;<span className="text-secondary-container text-on-secondary-container px-1 rounded">1</span>, <span className="text-secondary-container text-on-secondary-container px-1 rounded">2</span>, <span className="text-secondary-container text-on-secondary-container px-1 rounded">3</span>&#125;;<br/>
              &nbsp;&nbsp;<span className="text-outline italic">// Master the fundamentals</span><br/>
              &nbsp;&nbsp;<span className="text-secondary">return</span> <span className="text-secondary-container text-on-secondary-container px-1 rounded">0</span>;<br/>
              &#125;
            </div>
            <button className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded w-fit self-end mt-md hover:bg-primary-container transition-colors relative z-10 flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Run Code
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
