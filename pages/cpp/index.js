import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

export default function CppOverview() {
  const { triggerTutor } = useAuth()
  const modules = [
    {
      id: "data-types",
      title: "Data Types",
      desc: "Understand primitive types, variables, memory allocation, and constants in C++.",
      icon: "data_object",
      tag: null
    },
    {
      id: "control-flow",
      title: "Control Flow",
      desc: "Master logic with if/else conditionals, switch statements, and iterative loops (for, while).",
      icon: "route",
      tag: null
    },
    {
      id: "functions",
      title: "Functions",
      desc: "Learn to write modular, reusable code. Cover function declaration, definition, parameters, return types, and scope.",
      icon: "functions",
      tag: null,
      codeBlock: `int add(int a, int b) {
  return a + b;
}`
    },
    {
      id: "pointers",
      title: "Pointers",
      desc: "Demystify memory addresses, dereferencing, and pointer arithmetic essential for C++ proficiency.",
      icon: "ads_click",
      tag: "Core Concept"
    },
    {
      id: "stl-basics",
      title: "STL Basics",
      desc: "Introduction to the Standard Template Library. Explore vectors, strings, and basic algorithms.",
      icon: "library_books",
      tag: null
    }
  ]

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-xl px-gutter bg-surface relative overflow-hidden border-b border-outline-variant">
        {/* Decorative code pattern background */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #0b1f3a 1px, transparent 0)', 
            backgroundSize: '24px 24px' 
          }}
        ></div>
        <div className="max-w-container-max mx-auto relative z-10 flex flex-col items-start gap-md">
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
            <span className="material-symbols-outlined text-secondary text-[16px]">code</span>
            <span className="font-label-md text-label-md text-secondary">Beginner Track</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary max-w-2xl">
            Master Modern C++ Fundamentals
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Start your journey into high-performance computing. This beginner-friendly track breaks down complex concepts into structured, interactive modules designed for deep understanding.
          </p>
        </div>
      </section>

      {/* Course Content Grid */}
      <section className="py-xl px-gutter bg-background">
        <div className="max-w-container-max mx-auto">
          <div className="mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-primary">Curriculum</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Structured path to build your foundational knowledge.
            </p>
          </div>

          {/* Bento-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {modules.map((m) => {
              const isFunctions = m.id === 'functions'
              return (
                <div 
                  key={m.id}
                  className={`group bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md transition-all hover:shadow-[0_8px_16px_rgba(11,31,58,0.08)] hover:-translate-y-1 hover:border-secondary transition-all duration-300 relative overflow-hidden ${
                    isFunctions ? 'lg:row-span-2' : ''
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                  
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg z-10 ${
                    isFunctions ? 'bg-secondary/10 text-secondary' : 'bg-surface-container'
                  }`}>
                    <span className={`material-symbols-outlined text-[24px] ${isFunctions ? 'text-secondary' : 'text-primary'}`}>{m.icon}</span>
                  </div>

                  <div className="z-10 flex-grow">
                    <div className="flex items-center justify-between mb-xs">
                      <h3 className="font-headline-md text-headline-md text-primary">{m.title}</h3>
                      {m.tag && (
                        <span className="bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                          {m.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {m.desc}
                    </p>
                    
                    {m.codeBlock && (
                      <div className="bg-surface-container-low border border-outline-variant rounded p-sm mt-4 font-code-block text-code-block text-on-surface">
                        <pre className="font-code-block text-sm">
                          <code className="language-cpp">
                            <span className="text-secondary">int</span> add(<span class="text-secondary">int</span> a, <span class="text-secondary">int</span> b) &#123;<br/>
                            &nbsp;&nbsp;<span className="text-primary-container">return</span> a + b;<br/>
                            &#125;
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => triggerTutor(`Explain C++ concept: "${m.title}" - ${m.desc}`)}
                    className="flex items-center text-secondary font-label-md text-label-md mt-auto pt-md z-10 hover:gap-2 transition-all cursor-pointer text-left focus:outline-none"
                  >
                    Start Module <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
