import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '../../context/AuthContext'
import { cppModules } from '../../data/cppModules'

// Presentation-only lookups. data/cppModules.js stays the source of truth for what a
// module *is*; everything below only decides how it looks.
//
// The topic-* accents are theme-independent fixed hex, so the ink that sits on a solid
// accent tile is picked per accent rather than per theme: light ink on the three darker
// accents, near-black indigo on the three bright ones. Both directions clear the 3:1
// non-text contrast bar in either colour scheme.
const ACCENTS = {
  blue: { solid: 'bg-topic-blue', onSolid: 'text-white', dot: 'bg-topic-blue' },
  violet: { solid: 'bg-topic-violet', onSolid: 'text-white', dot: 'bg-topic-violet' },
  emerald: { solid: 'bg-topic-emerald', onSolid: 'text-on-tertiary-fixed', dot: 'bg-topic-emerald' },
  rose: { solid: 'bg-topic-rose', onSolid: 'text-white', dot: 'bg-topic-rose' },
  amber: { solid: 'bg-topic-amber', onSolid: 'text-on-tertiary-fixed', dot: 'bg-topic-amber' },
  cyan: { solid: 'bg-topic-cyan', onSolid: 'text-on-tertiary-fixed', dot: 'bg-topic-cyan' }
}

const ACCENT_CYCLE = ['blue', 'violet', 'emerald', 'rose', 'amber', 'cyan']

// `covers` restates the syllabus keywords already written in each module's `desc` as
// scannable chips — nothing here promises material the description does not. Unknown
// ids fall back to a cycled accent and no chips, so adding a module never breaks this.
const MODULE_META = {
  'data-types': {
    accent: 'blue',
    covers: ['Primitive types', 'Variables', 'Memory allocation', 'Constants']
  },
  'control-flow': {
    accent: 'violet',
    covers: ['if / else', 'switch', 'for loops', 'while loops']
  },
  functions: {
    accent: 'emerald',
    covers: ['Declaration', 'Parameters', 'Return types', 'Scope']
  },
  pointers: {
    accent: 'rose',
    covers: ['Memory addresses', 'Dereferencing', 'Pointer arithmetic']
  },
  'stl-basics': {
    accent: 'amber',
    covers: ['Vectors', 'Strings', 'Basic algorithms']
  }
}

const HERO_SNIPPET = `#include <iostream>

int main() {
  std::cout << "Hello, Programo!";
  return 0;
}`

// Deliberately dark in both themes — a code panel that flips to light loses the editor
// look that makes a snippet read as a snippet. The raw hex is intentional and stays
// confined to this component.
function CodePanel({ title, code, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-lifted ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.05] px-4 py-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#f87171]"></span>
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]"></span>
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#34d399]"></span>
        <span className="ml-2 truncate font-code-block text-[12px] text-[#94a3b8]">{title}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-code-block text-code-block text-[#e2e8f0]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function CppOverview() {
  const { triggerTutor } = useAuth()

  // Honest progress, derived from the same flag the cards read. Today this is 0 of 5;
  // it climbs on its own as modules flip `lessonReady` to true.
  const totalModules = cppModules.length
  const publishedLessons = cppModules.filter((m) => m.lessonReady).length
  const publishedPct = totalModules ? Math.round((publishedLessons / totalModules) * 100) : 0

  return (
    <main className="flex-grow">
      <Head>
        <title>C++ Fundamentals — Programo Academia</title>
        <meta
          name="description"
          content={`Learn modern C++ from the ground up across ${cppModules.length} guided modules: data types, control flow, functions, pointers and the STL.`}
        />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-outline-variant bg-surface px-gutter py-md sm:py-lg">
        {/* Decorative grid. Token-driven (and therefore theme-aware) at an opacity that
            actually renders, rather than the old 2-5% hex wash that cost DOM and drew
            nothing. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-fade"
          style={{ backgroundSize: '32px 32px' }}
        ></div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
        ></div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent"
        ></div>

        <div className="relative z-10 mx-auto grid max-w-container-max items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-secondary">
                code
              </span>
              <span className="font-label-md text-label-md text-secondary">Beginner Track</span>
            </div>

            <h1 className="font-display-lg text-headline-lg-mobile text-primary sm:text-headline-lg lg:text-display-lg">
              Master Modern C++ Fundamentals
            </h1>

            <p className="max-w-prose font-body-lg text-body-md text-on-surface-variant sm:text-body-lg">
              Start your journey into high-performance computing. This beginner-friendly track
              breaks down complex concepts into structured, interactive modules designed for deep
              understanding.
            </p>

            {/* Course facts, so the promise is concrete before anyone scrolls. */}
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                { icon: 'view_module', label: `${totalModules} modules` },
                { icon: 'psychology', label: 'AI tutor on every topic' },
                { icon: 'school', label: 'No prior experience needed' }
              ].map((fact) => (
                <div key={fact.label} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px] text-secondary"
                  >
                    {fact.icon}
                  </span>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd className="font-label-md text-label-md text-on-surface">{fact.label}</dd>
                </div>
              ))}
            </dl>

            <div className="flex w-full flex-col gap-sm pt-xs sm:w-auto sm:flex-row">
              <Link
                href="/compiler"
                className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 font-label-md text-label-md text-on-secondary shadow-brand transition-all hover:bg-secondary/90 hover:shadow-brand-hover active-press"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  terminal
                </span>
                Open the C++ Compiler
              </Link>
              <Link
                href="/dsa"
                className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-3 font-label-md text-label-md text-on-surface transition-all hover:border-secondary/60 hover:bg-surface-container-low hover:text-secondary"
              >
                Continue to DSA
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Illustrative snippet — sets the tone of the track without pretending to be
              a lesson or a runnable editor. */}
          <CodePanel title="main.cpp" code={HERO_SNIPPET} className="hidden lg:block" />
        </div>
      </section>

      {/* Course Content Grid */}
      <section className="bg-background px-gutter py-lg">
        <div className="mx-auto max-w-container-max">
          <div className="mb-8 flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              <span className="font-label-md text-label-md uppercase tracking-[0.16em] text-secondary">
                The roadmap
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile text-primary sm:text-headline-lg">
                Curriculum
              </h2>
              <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
                {cppModules.length} modules to build your foundational knowledge, in the order we
                recommend learning them.
              </p>
            </div>

            {/* Say plainly what these cards do today, so nobody clicks expecting a lesson page. */}
            <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <span className="font-label-md text-label-md text-on-surface">
                  Written lessons published
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {publishedLessons}
                  <span className="text-on-surface-variant">/{totalModules}</span>
                </span>
              </div>
              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high"
                role="progressbar"
                aria-valuenow={publishedPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Written lessons published"
              >
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{ width: `${publishedPct}%` }}
                ></div>
              </div>
              <p className="mt-3 flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined shrink-0 text-[18px] text-secondary"
                >
                  info
                </span>
                <span>
                  Written lessons are still in progress. Every module below already opens the AI
                  tutor with that topic loaded, so you can ask questions and get worked examples on
                  demand.
                </span>
              </p>
            </div>
          </div>

          {/* Numbered roadmap. The module carrying a code sample gets the wide slot, which
              also keeps a 5-item list from leaving a hole in the last row. */}
          <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {cppModules.map((m, index) => {
              const isFeatured = Boolean(m.codeBlock)
              const meta = MODULE_META[m.id] || {}
              const accent = ACCENTS[meta.accent] || ACCENTS[ACCENT_CYCLE[index % ACCENT_CYCLE.length]]
              const covers = meta.covers || []
              const stepNumber = String(index + 1).padStart(2, '0')

              return (
                <article
                  key={m.id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
                    isFeatured ? 'lg:col-span-2' : ''
                  }`}
                >
                  {/* Colour-coded rail: the fastest way to tell six modules apart. */}
                  <span aria-hidden="true" className={`block h-1.5 w-full ${accent.solid}`}></span>

                  <div
                    className={`flex flex-1 flex-col gap-4 p-5 sm:p-md ${
                      isFeatured ? 'lg:flex-row lg:items-start lg:gap-8' : ''
                    }`}
                  >
                    <div className={`flex flex-1 flex-col gap-4 ${isFeatured ? 'lg:max-w-xl' : ''}`}>
                      <div className="flex items-start gap-4">
                        <span
                          aria-hidden="true"
                          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${accent.solid} ${accent.onSolid}`}
                        >
                          <span className="material-symbols-outlined text-[28px]">{m.icon}</span>
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-label-md text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                              Module {stepNumber}
                            </span>
                            {m.tag && (
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {m.tag}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-headline-md text-headline-sm text-primary sm:text-headline-md">
                            {m.title}
                          </h3>
                        </div>
                      </div>

                      <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
                        {m.desc}
                      </p>

                      {covers.length > 0 && (
                        <div>
                          <h4 className="font-label-md text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
                            What this covers
                          </h4>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {covers.map((item) => (
                              <li
                                key={item}
                                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 font-label-md text-[12px] text-on-surface-variant"
                              >
                                <span
                                  aria-hidden="true"
                                  className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                                ></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Every module is tutor-backed today. Once a module has a real lesson page,
                          lessonReady flips to true and this becomes a link instead. */}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/70 pt-4">
                        {m.lessonReady && m.slug ? (
                          <Link
                            href={`/cpp/${m.slug}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 font-label-md text-label-md text-on-secondary transition-all hover:bg-secondary/90"
                          >
                            Start Module
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                              arrow_forward
                            </span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => triggerTutor(`Explain the C++ topic "${m.title}" for a beginner. ${m.desc} Include a short annotated code example and one common mistake to avoid.`)}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2.5 font-label-md text-label-md text-secondary transition-all hover:bg-secondary hover:text-on-secondary active-press"
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                              psychology
                            </span>
                            Explain with AI Tutor
                          </button>
                        )}

                        {!m.lessonReady && (
                          <span className="inline-flex items-center gap-1.5 font-label-md text-[12px] text-on-surface-variant">
                            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>
                            Written lesson soon
                          </span>
                        )}
                      </div>
                    </div>

                    {isFeatured && (
                      <CodePanel
                        title={`${m.title.toLowerCase().replace(/\s+/g, '-')}.cpp`}
                        code={m.codeBlock}
                        className="w-full lg:max-w-md lg:shrink-0"
                      />
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* Closing strip. Links only to destinations this page already points at. */}
          <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="material-symbols-outlined mt-0.5 text-[22px] text-secondary"
              >
                rocket_launch
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Learn it, then type it
                </h3>
                <p className="max-w-prose font-body-sm text-body-sm text-on-surface-variant">
                  Concepts stick once you compile them. Try every snippet in the browser compiler,
                  then take the same fundamentals into the DSA track.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-sm sm:flex-row">
              <Link
                href="/compiler"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 font-label-md text-label-md text-on-secondary transition-all hover:bg-secondary/90"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  terminal
                </span>
                Compiler
              </Link>
              <Link
                href="/dsa"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2.5 font-label-md text-label-md text-on-surface transition-all hover:border-secondary/60 hover:text-secondary"
              >
                DSA track
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
