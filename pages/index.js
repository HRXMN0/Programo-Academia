import { Fragment } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import HomeSearchBar from '../components/HomeSearchBar'
import { useAuth } from '../context/AuthContext'
import { topics } from '../data/topics'
import { cppModules } from '../data/cppModules'
import { interviewQuestions } from '../data/interviewQuestions'

// Short labels so the roadmap still fits across six nodes on a phone.
const ROADMAP_LABELS = {
  'arrays': 'Arrays',
  'linked-lists': 'Lists',
  'stacks-queues': 'Stacks',
  'trees': 'Trees',
  'graphs': 'Graphs',
  'dynamic-programming': 'DP'
}

// One accent per DSA topic, so the syllabus stops reading as six identical grey
// cards. Written out in full because Tailwind only emits class strings it can
// find literally in the source — `bg-topic-${slug}` never generates.
// Hue is always reinforcement, never the only signal: every colour-coded element
// here also carries a text label, so nothing is communicated by colour alone.
const TOPIC_ACCENTS = {
  'arrays': { tile: 'bg-topic-blue/15 text-topic-blue ring-topic-blue/30', rail: 'bg-topic-blue', hover: 'hover:border-topic-blue/50' },
  'linked-lists': { tile: 'bg-topic-violet/15 text-topic-violet ring-topic-violet/30', rail: 'bg-topic-violet', hover: 'hover:border-topic-violet/50' },
  'stacks-queues': { tile: 'bg-topic-amber/20 text-topic-amber ring-topic-amber/40', rail: 'bg-topic-amber', hover: 'hover:border-topic-amber/50' },
  'trees': { tile: 'bg-topic-emerald/15 text-topic-emerald ring-topic-emerald/30', rail: 'bg-topic-emerald', hover: 'hover:border-topic-emerald/50' },
  'graphs': { tile: 'bg-topic-rose/15 text-topic-rose ring-topic-rose/30', rail: 'bg-topic-rose', hover: 'hover:border-topic-rose/50' },
  'dynamic-programming': { tile: 'bg-topic-cyan/15 text-topic-cyan ring-topic-cyan/30', rail: 'bg-topic-cyan', hover: 'hover:border-topic-cyan/50' }
}
const TOPIC_ACCENT_FALLBACK = { tile: 'bg-secondary/15 text-secondary ring-secondary/30', rail: 'bg-secondary', hover: 'hover:border-secondary/50' }

// Difficulty badges use the container/on-container token pairs instead of the raw
// topic accents. Those pairs are guaranteed legible against each other in both
// themes, which an amber-on-white badge is not.
const DIFFICULTY_BADGES = {
  easy: 'bg-secondary-container text-on-secondary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  hard: 'bg-error-container text-on-error-container'
}

// The only language this site actually teaches. The band that used to sit on this
// page scrolled six logos under "Loved by developers, trusted by engineering
// leaders" — five of them for languages we do not cover, two of those with
// malformed paths that rendered as blobs. Honest single mark instead.
function CppMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="currentColor" aria-hidden="true">
      <path d="M117.5 73.5h-17v17h-11v-17h-17v-11h17v-17h11v17h17v11zm-52.6-39.8c-2.7-4.1-6.4-7.5-11-9.9-4.5-2.4-9.8-3.7-15.6-3.7-8.1 0-15.2 2-21.2 6.1-6.1 4.1-10.7 9.8-13.8 17.2-3.1 7.4-4.7 16.1-4.7 26.2 0 10 1.6 18.7 4.7 26.1 3.1 7.4 7.7 13.1 13.8 17.2 6.1 4.1 13.2 6.1 21.2 6.1 5.9 0 11.2-1.3 15.8-3.9 4.6-2.6 8.3-6.1 10.9-10.4l9.1 5.8c-3.6 5.8-8.7 10.4-15 13.8-6.4 3.4-13.6 5-21.6 5-10.3 0-19.3-2.5-27-7.6-7.7-5.1-13.7-12.2-17.8-21.3C1.6 92.5.5 81.7.5 69.6s1.1-22.9 3.2-32c4.1-9.1 10.1-16.2 17.8-21.3 7.7-5.1 16.7-7.6 27-7.6 7.7 0 14.8 1.6 21.1 4.9C76 17 81 21.4 84.7 27l-9.1 6.7z" />
    </svg>
  )
}

export default function Home() {
  const { completedTopics = [], isLoaded } = useAuth()

  const dsaTopics = topics.filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)

  // Only trust progress once auth/localStorage has resolved. Before that the server
  // renders an empty set and so must the first client pass, or React reports a
  // hydration mismatch.
  const done = isLoaded ? new Set(completedTopics) : new Set()
  const completedCount = dsaTopics.filter(t => done.has(t.id)).length
  const progressPct = dsaTopics.length > 0
    ? Math.round((completedCount / dsaTopics.length) * 100)
    : 0
  const nextTopic = dsaTopics.find(t => !done.has(t.id)) || null

  const roadmap = dsaTopics.map(t => ({
    id: t.id,
    slug: t.slug,
    label: ROADMAP_LABELS[t.id] || t.title,
    // Full title and icon carried through so a node can announce itself properly
    // and show what it actually is, instead of a padlock — nothing here is locked.
    title: t.title,
    icon: t.iconName,
    status: done.has(t.id)
      ? 'done'
      : nextTopic && t.id === nextTopic.id
        ? 'active'
        : 'upcoming'
  }))

  // Counted from the same modules the curriculum pages render, so these numbers
  // can never drift away from what is actually published.
  const heroStats = [
    { icon: 'account_tree', value: dsaTopics.length, label: 'DSA topics' },
    { icon: 'data_object', value: cppModules.length, label: 'C++ modules' },
    { icon: 'quiz', value: interviewQuestions.length, label: 'interview questions' },
    { icon: 'verified', value: 'Free', label: 'no sign-up, ever' }
  ]

  return (
    <div className="relative w-full overflow-hidden bg-background">
      <Head>
        <title>Programo Academia — Learn C++ and DSA with Clarity</title>
        <meta
          name="description"
          content="Free, structured lessons in C++ and data structures & algorithms, with an in-browser compiler, topic quizzes and an AI tutor. Browse everything without an account."
        />
      </Head>

      {/* Decorative field. The previous version layered a 3%-alpha grid and two
          500px glows at 5% opacity — invisible at every screen brightness, but
          still three DOM nodes. These are tuned to actually read. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[620px] bg-grid-fade bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_50%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-32 -top-24 z-0 h-[420px] w-[420px] rounded-full bg-secondary/25 blur-3xl dark:bg-secondary/20" />
      <div className="pointer-events-none absolute -right-32 top-4 z-0 h-[380px] w-[380px] rounded-full bg-tertiary/20 blur-3xl dark:bg-tertiary/15" />

      <main className="relative z-10 mx-auto w-full max-w-container-max animate-fade-in px-gutter pb-16">

        {/* ── Hero ─────────────────────────────────────────────────────────────
            Was min-h-[60vh] + py-xl around ~200px of content, so the fold read as
            an empty page. Now it is sized by its content. */}
        <section className="flex flex-col items-center pb-10 pt-8 text-center md:pb-14 md:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest/80 px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-card backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary"></span>
            </span>
            Built for students starting from zero
          </span>

          <h1 className="mt-6 max-w-4xl font-display-lg text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl lg:leading-[1.03]">
            Master C++ and DSA with{' '}
            <span className="inline-block bg-gradient-to-r from-secondary to-tertiary bg-clip-text pb-[0.08em] text-transparent dark:from-secondary-fixed dark:to-tertiary-fixed-dim">
              clarity
            </span>
          </h1>

          <p className="mt-5 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            Structured lessons, an in-browser compiler and topic quizzes — one language,
            taught properly. Read every page without making an account.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/dsa"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-4 font-label-md text-base font-bold text-on-secondary shadow-brand transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-brand-hover active:translate-y-0"
            >
              Start learning free
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
            <Link
              href="/dsa"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-7 py-4 font-label-md text-base font-semibold text-on-surface shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-secondary/60 hover:text-primary hover:shadow-card-hover active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">list_alt</span>
              Browse the syllabus
            </Link>
          </div>

          {/* Three honest promises, not a testimonial wall. */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body-sm text-body-sm text-on-surface-variant">
            {['No account required to read', 'In-browser C++ compiler', 'Every lesson free, forever'].map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined filled text-[16px] text-secondary">check_circle</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 w-full">
            <HomeSearchBar />
          </div>

          {/* Real numbers, straight from the data files — this band replaces the
              scrolling logo marquee that claimed six languages we do not teach. */}
          <div className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest/80 shadow-card backdrop-blur-sm">
            <dl className="grid grid-cols-2 sm:grid-cols-4">
              {heroStats.map((stat, idx) => {
                // Hairlines only where two tiles actually sit side by side: the
                // grid reflows from two columns to four, so the rules do too.
                const separators = [
                  '',
                  'border-l border-outline-variant',
                  'border-t border-outline-variant sm:border-l sm:border-t-0',
                  'border-l border-t border-outline-variant sm:border-t-0'
                ]
                return (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center gap-1 px-3 py-5 ${separators[idx] || ''}`}
                  >
                    <span className="material-symbols-outlined order-1 text-[20px] text-secondary">{stat.icon}</span>
                    {/* dt before dd keeps the list valid; `order` puts the number on top. */}
                    <dt className="order-3 font-body-sm text-body-sm text-on-surface-variant">{stat.label}</dt>
                    <dd className="order-2 font-headline-md text-headline-md text-primary">{stat.value}</dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <CppMark className="h-4 w-4 shrink-0 text-secondary" />
            Every example on this site is written in modern C++.
          </p>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="border-t border-outline-variant py-12 md:py-16">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-[0.14em] text-secondary">
              <span className="h-px w-6 bg-secondary/60"></span>
              How it works
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-primary md:text-headline-lg">
              Read it, run it, then prove you know it
            </h2>
            <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
              Each topic pairs the intuition with runnable C++ and a complexity table, and your
              progress is tracked as you go — no account, it stays on this device.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Code panel. Deliberately dark in both themes: the contrast against
                the page is the point, so raw hex is allowed to live in here. */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117] shadow-lifted transition-shadow duration-300 hover:shadow-card-hover">
                <div className="flex items-center gap-3 border-b border-white/10 bg-[#161B22] px-4 py-3">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F56]"></span>
                    <span className="h-3 w-3 rounded-full bg-[#FFBD2E]"></span>
                    <span className="h-3 w-3 rounded-full bg-[#27C93F]"></span>
                  </div>
                  <span className="flex-1 text-center font-mono text-xs tracking-wide text-[#8B949E]">
                    binary_search.cpp
                  </span>
                  <span className="rounded-full border border-secondary-fixed/30 bg-secondary-fixed/10 px-2.5 py-1 font-mono text-[11px] text-secondary-fixed">
                    O(log N)
                  </span>
                </div>

                <div className="no-scrollbar overflow-x-auto p-5 md:p-6">
                  <pre className="scrollbar-none font-mono text-xs leading-relaxed tracking-normal text-[#F8F8F2] md:text-sm">
                    <code>
                      <span className="mb-2 block text-[#7F8DB8]">// Time Complexity: O(log N) | Space Complexity: O(1)</span>
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
                </div>

                {/* Was absolutely positioned inside the scroll container, so it slid
                    away with the code. It is a real footer bar now. */}
                <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0B0F16] px-4 py-3">
                  <span className="font-mono text-[11px] text-[#8B949E]">halves the search space every step</span>
                  <Link
                    href="/compiler"
                    className="group inline-flex items-center gap-2 rounded-lg border border-secondary-fixed/30 bg-secondary-fixed/10 px-3.5 py-2 font-mono text-xs text-secondary-fixed transition-colors duration-200 hover:bg-secondary-fixed/20"
                  >
                    <span className="h-2 w-2 rounded-full bg-secondary-fixed"></span>
                    Try it live
                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <p className="mt-4 border-l-2 border-secondary/50 pl-3 font-body-sm text-body-sm text-on-surface-variant">
                Every snippet on the site is complete, compilable C++ — open it in the compiler
                and change it while the idea is still fresh.
              </p>
            </div>

            {/* Right rail: this visitor's own progress, then the three steps. */}
            <div className="flex flex-col gap-6 lg:col-span-5">

              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">Your DSA path</h3>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                      {completedCount} of {dsaTopics.length} topics complete
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-secondary/10 px-2.5 py-1 font-headline-sm text-headline-sm text-secondary">
                    {progressPct}%
                  </span>
                </div>

                <div
                  className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="DSA topics completed"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700 ease-out-expo"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                {/* Node flow — derived from the real syllabus and this visitor's own
                    progress, so the card can never disagree with /dsa. */}
                <div className="no-scrollbar mt-5 flex items-start justify-between gap-1 overflow-x-auto">
                  {roadmap.map((node, idx) => (
                    <Fragment key={node.id}>
                      {idx > 0 && (
                        <div
                          className={`mt-[17px] h-0.5 min-w-[10px] flex-1 rounded-full ${
                            node.status === 'upcoming' ? 'bg-outline-variant' : 'bg-secondary/50'
                          }`}
                        ></div>
                      )}

                      <Link
                        href={`/dsa/${node.slug}`}
                        aria-label={`${node.title} — ${node.status === 'done' ? 'completed' : node.status === 'active' ? 'up next' : 'not started'}`}
                        className="group flex shrink-0 flex-col items-center gap-1.5"
                      >
                        {node.status === 'done' && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-brand">
                            <span className="material-symbols-outlined filled text-[18px]">check</span>
                          </span>
                        )}
                        {node.status === 'active' && (
                          <span className="flex h-9 w-9 animate-active-pulse items-center justify-center rounded-full bg-secondary/10 text-secondary ring-2 ring-secondary">
                            <span className="material-symbols-outlined text-[18px]">{node.icon}</span>
                          </span>
                        )}
                        {node.status === 'upcoming' && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant transition-colors group-hover:text-secondary">
                            <span className="material-symbols-outlined text-[18px]">{node.icon}</span>
                          </span>
                        )}
                        <span
                          className={`whitespace-nowrap text-[11px] font-semibold tracking-wide ${
                            node.status === 'upcoming' ? 'text-on-surface-variant' : 'text-secondary'
                          }`}
                        >
                          {node.label}
                        </span>
                      </Link>
                    </Fragment>
                  ))}
                </div>

                {/* Designed zero / done states rather than a line of grey text. */}
                {nextTopic ? (
                  <Link
                    href={`/dsa/${nextTopic.slug}`}
                    className="group mt-5 flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3 transition-colors duration-200 hover:border-secondary/50 hover:bg-secondary/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-label-md text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                        {completedCount > 0 ? 'Next up' : 'Start here'}
                      </span>
                      <span className="block truncate font-body-md text-body-md font-semibold text-primary">
                        {nextTopic.title}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-container-high px-2.5 py-1 font-body-sm text-body-sm text-on-surface-variant">
                      {nextTopic.estimatedTime}
                    </span>
                  </Link>
                ) : (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-3">
                    <span className="material-symbols-outlined filled text-[22px] text-secondary">workspace_premium</span>
                    <span className="font-body-md text-body-md font-semibold text-primary">
                      All {dsaTopics.length} topics complete — nice work.
                    </span>
                  </div>
                )}
              </div>

              {/* Numbered steps: the loop the whole site is built around. */}
              <ol className="divide-y divide-outline-variant rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 shadow-card">
                {[
                  { n: '01', title: 'Read the concept', body: 'Intuition first, then the complexity table and the mistakes people actually make.' },
                  { n: '02', title: 'Run the code', body: 'Open any snippet in the in-browser compiler and break it on purpose.' },
                  { n: '03', title: 'Check yourself', body: `Topic quizzes plus ${interviewQuestions.length} interview questions with worked answers.` }
                ].map(step => (
                  <li key={step.n} className="flex gap-4 py-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-mono text-xs font-bold text-secondary ring-1 ring-secondary/25">
                      {step.n}
                    </span>
                    <span>
                      <span className="block font-body-md text-body-md font-semibold text-primary">{step.title}</span>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>

            </div>
          </div>
        </section>

        {/* ── Learning paths ───────────────────────────────────────────────── */}
        <section className="border-t border-outline-variant py-12 md:py-16">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-[0.14em] text-secondary">
              <span className="h-px w-6 bg-secondary/60"></span>
              Learning paths
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-primary md:text-headline-lg">
              Three tracks, one sensible order
            </h2>
            <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
              Learn the language, then the structures built with it, then rehearse explaining both
              out loud. Take them in order or jump straight to what you need.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Path 1 — C++ */}
            <Link
              href="/cpp"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-topic-blue/40 hover:shadow-card-hover"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-topic-blue"></span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-topic-blue/15 text-topic-blue ring-1 ring-topic-blue/30">
                <CppMark className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-headline-md text-headline-md text-primary">C++ Foundations</h3>
              <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                Types, control flow, functions, pointers and the STL — the language you will write
                every algorithm in.
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {cppModules.slice(0, 4).map(m => (
                  <li
                    key={m.id}
                    className="rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-body-sm text-body-sm text-on-surface-variant"
                  >
                    {m.title}
                  </li>
                ))}
                {cppModules.length > 4 && (
                  <li className="rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-body-sm text-body-sm text-on-surface-variant">
                    +{cppModules.length - 4} more
                  </li>
                )}
              </ul>
              <div className="mt-auto flex w-full items-center justify-between border-t border-outline-variant pt-4 text-on-surface-variant">
                <span className="font-label-md text-label-md">{cppModules.length} modules</span>
                <span className="material-symbols-outlined transition-all group-hover:translate-x-1 group-hover:text-topic-blue">arrow_forward</span>
              </div>
            </Link>

            {/* Path 2 — DSA. Filled in the brand colour so one card in the row is
                unambiguously the recommended starting point. */}
            <Link
              href="/dsa"
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-secondary p-6 text-on-secondary shadow-brand transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-brand-hover"
            >
              <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-on-secondary/10 transition-transform duration-500 group-hover:scale-150"></span>
              <span className="relative flex items-center justify-between gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-on-secondary/15 ring-1 ring-on-secondary/25">
                  <span className="material-symbols-outlined text-[26px]">account_tree</span>
                </span>
                <span className="rounded-full bg-on-secondary/20 px-2.5 py-1 font-label-md text-[11px] font-bold uppercase tracking-[0.1em]">
                  Start here
                </span>
              </span>
              <h3 className="relative mt-4 font-headline-md text-headline-md">Data Structures &amp; Algorithms</h3>
              <p className="relative mt-2 font-body-sm text-body-sm text-on-secondary/90">
                Arrays through dynamic programming, each with the trade-off that makes it worth
                knowing — not just the syntax.
              </p>
              <ul className="relative mt-4 flex flex-wrap gap-1.5">
                {dsaTopics.slice(0, 4).map(t => (
                  <li
                    key={t.id}
                    className="rounded-full bg-on-secondary/15 px-2.5 py-1 font-body-sm text-body-sm"
                  >
                    {ROADMAP_LABELS[t.id] || t.title}
                  </li>
                ))}
                {dsaTopics.length > 4 && (
                  <li className="rounded-full bg-on-secondary/15 px-2.5 py-1 font-body-sm text-body-sm">
                    +{dsaTopics.length - 4} more
                  </li>
                )}
              </ul>
              <div className="relative mt-auto flex w-full items-center justify-between border-t border-on-secondary/25 pt-4">
                <span className="font-label-md text-label-md">{dsaTopics.length} topics</span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </Link>

            {/* Path 3 — Interview prep */}
            <Link
              href="/interview-prep"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-tertiary/40 hover:shadow-card-hover"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-tertiary"></span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary ring-1 ring-tertiary/30">
                <span className="material-symbols-outlined text-[26px]">forum</span>
              </span>
              <h3 className="mt-4 font-headline-md text-headline-md text-primary">Interview Prep</h3>
              <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                The questions that keep coming back, each with a hint first and a full sample answer
                after you have tried.
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {interviewQuestions.slice(0, 3).map(q => (
                  <li
                    key={q.id}
                    className="rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-body-sm text-body-sm text-on-surface-variant"
                  >
                    {q.topic}
                  </li>
                ))}
                <li className="rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-body-sm text-body-sm text-on-surface-variant">
                  hints + answers
                </li>
              </ul>
              <div className="mt-auto flex w-full items-center justify-between border-t border-outline-variant pt-4 text-on-surface-variant">
                <span className="font-label-md text-label-md">{interviewQuestions.length} questions</span>
                <span className="material-symbols-outlined transition-all group-hover:translate-x-1 group-hover:text-tertiary">arrow_forward</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── The DSA syllabus, colour-coded ───────────────────────────────── */}
        <section className="border-t border-outline-variant py-12 md:py-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <span className="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-[0.14em] text-secondary">
                <span className="h-px w-6 bg-secondary/60"></span>
                What you will actually learn
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile text-primary md:text-headline-lg">
                The {dsaTopics.length} DSA topics, in order
              </h2>
              <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
                Each one carries its difficulty, a realistic reading time and the complexity that
                defines it. Colours stay consistent everywhere the topic appears.
              </p>
            </div>
            <Link
              href="/dsa"
              className="group inline-flex shrink-0 items-center gap-1.5 font-label-md text-label-md text-secondary transition-colors hover:text-primary"
            >
              See the full syllabus
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dsaTopics.map(topic => {
              const accent = TOPIC_ACCENTS[topic.id] || TOPIC_ACCENT_FALLBACK
              const isDone = done.has(topic.id)
              // Search cost is what people compare structures on; DP and graphs
              // list it as N/A, so fall back to the space cost there.
              const complexity = topic.complexity?.search && topic.complexity.search !== 'N/A'
                ? { label: 'search', value: topic.complexity.search }
                : { label: 'space', value: topic.complexity?.space }

              return (
                <Link
                  key={topic.id}
                  href={`/dsa/${topic.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 pt-6 shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover ${accent.hover}`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 ${accent.rail}`}></span>

                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accent.tile}`}>
                      <span className="material-symbols-outlined text-[22px]">{topic.iconName}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-on-surface-variant">
                      {String(topic.order).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-4 font-headline-sm text-headline-sm text-primary">{topic.title}</h3>
                  <p className="mt-1.5 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
                    {topic.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-1 font-label-md text-[12px] font-semibold capitalize ${DIFFICULTY_BADGES[topic.difficulty] || 'bg-surface-container-high text-on-surface-variant'}`}>
                      {topic.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-2.5 py-1 font-body-sm text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {topic.estimatedTime}
                    </span>
                    {complexity.value && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-2.5 py-1 font-mono text-[12px] text-on-surface-variant">
                        {complexity.label} {complexity.value}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-secondary">
                        <span className="material-symbols-outlined filled text-[16px]">check_circle</span>
                        Completed
                      </span>
                    ) : (
                      <span className="font-label-md text-label-md text-on-surface-variant">{topic.badge}</span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant transition-all group-hover:translate-x-1 group-hover:text-secondary">arrow_forward</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Why Programo ─────────────────────────────────────────────────── */}
        <section className="border-t border-outline-variant py-12 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-[0.14em] text-secondary">
                <span className="h-px w-6 bg-secondary/60"></span>
                Why Programo
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile text-primary md:text-headline-lg">
                Understanding, not memorising
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                {[
                  {
                    icon: 'psychology',
                    tile: 'bg-tertiary/15 text-tertiary ring-tertiary/25',
                    title: 'Code intuition',
                    body: 'Every topic starts with why the structure exists and what it trades away — the mental model comes before the syntax.'
                  },
                  {
                    icon: 'map',
                    tile: 'bg-secondary/15 text-secondary ring-secondary/25',
                    title: 'Structured roadmaps',
                    body: 'No decision fatigue. The path is linear, ordered and always tells you the single next thing to open.'
                  },
                  {
                    icon: 'terminal',
                    tile: 'bg-topic-blue/15 text-topic-blue ring-topic-blue/25',
                    title: 'Live practice',
                    body: 'Compile and run C++ in the browser while the concept is still fresh, without installing a toolchain.'
                  }
                ].map(feature => (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-outline-variant hover:bg-surface-container-lowest"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${feature.tile}`}>
                      <span className="material-symbols-outlined text-[22px]">{feature.icon}</span>
                    </span>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">{feature.title}</h3>
                      <p className="mt-0.5 max-w-prose font-body-md text-body-md text-on-surface-variant">{feature.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second dark code panel, matching the first: code always sits on a
                dark field on this page, in both themes. */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117] shadow-lifted">
              <div className="flex items-center gap-3 border-b border-white/10 bg-[#161B22] px-4 py-3">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F56]"></span>
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E]"></span>
                  <span className="h-3 w-3 rounded-full bg-[#27C93F]"></span>
                </div>
                <span className="flex-1 text-center font-mono text-xs tracking-wide text-[#8B949E]">main.cpp</span>
                <span className="w-12"></span>
              </div>

              <div className="p-5 font-mono text-xs leading-relaxed text-[#F8F8F2] md:p-6 md:text-sm">
                <span className="text-[#FF79C6]">#include</span> &lt;iostream&gt;<br />
                <span className="text-[#FF79C6]">#include</span> &lt;vector&gt;<br /><br />
                <span className="text-[#8BE9FD]">int</span> <span className="text-[#50FA7B]">main</span>() &#123;<br />
                &nbsp;&nbsp;<span className="text-[#8BE9FD]">std::vector</span>&lt;<span className="text-[#8BE9FD]">int</span>&gt; path = &#123;
                {/* Was `text-secondary-container text-on-secondary-container` — two
                    text colours on one element, so the highlight never rendered.
                    The first was meant to be the background. */}
                <span className="rounded-sm bg-secondary-container px-1 text-on-secondary-container">1</span>,{' '}
                <span className="rounded-sm bg-secondary-container px-1 text-on-secondary-container">2</span>,{' '}
                <span className="rounded-sm bg-secondary-container px-1 text-on-secondary-container">3</span>&#125;;<br />
                &nbsp;&nbsp;<span className="italic text-[#7F8DB8]">// Master the fundamentals</span><br />
                &nbsp;&nbsp;<span className="text-[#FF79C6]">return</span>{' '}
                <span className="rounded-sm bg-secondary-container px-1 text-on-secondary-container">0</span>;<br />
                &#125;
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0B0F16] px-4 py-3">
                <span className="font-mono text-[11px] text-[#8B949E]">compiled in the browser</span>
                {/* Was bg-primary with hover:bg-primary-container: in light mode that
                    hover swapped a near-black fill for a pale mint one while the label
                    stayed white, so the button read as blank on hover. */}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary shadow-brand transition-all duration-200 hover:brightness-110 hover:shadow-brand-hover active:scale-95"
                >
                  <span className="material-symbols-outlined filled text-[16px]">play_arrow</span>
                  Run code
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing call to action ───────────────────────────────────────── */}
        <section className="pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-10 text-center text-on-secondary shadow-lifted md:px-12 md:py-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-on-secondary/10"></div>
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-on-secondary/10"></div>
            <h2 className="relative font-headline-lg text-headline-lg-mobile md:text-headline-lg">
              Start with Arrays. Ten minutes.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl font-body-md text-body-md text-on-secondary/90">
              No sign-up, no paywall, no trial. Open the first topic and see whether this explains
              it better than the last thing you read.
            </p>
            <div className="relative mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dsa"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-on-secondary px-7 py-4 font-label-md text-base font-bold text-secondary transition-transform duration-200 ease-out-expo hover:-translate-y-0.5"
              >
                Open the syllabus
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
              </Link>
              <Link
                href="/compiler"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-on-secondary/40 px-7 py-4 font-label-md text-base font-semibold text-on-secondary transition-colors duration-200 hover:bg-on-secondary/15"
              >
                <span className="material-symbols-outlined text-[20px]">terminal</span>
                Try the compiler
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
