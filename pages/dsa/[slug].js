import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { topics } from '../../data/topics'
import { quizzes } from '../../data/quizzes'
import { useAuth } from '../../context/AuthContext'

/* Per-topic accent palette — mirrors /dsa and /quiz/[topic] so a topic keeps
   the same colour identity across the whole learning flow. Class strings are
   spelled out in full because Tailwind cannot resolve `bg-topic-${key}`. */
const TOPIC_ACCENTS = {
  "arrays":              { fill: 'bg-topic-blue',    tint: 'bg-topic-blue/10',    border: 'border-topic-blue/45',    text: 'text-topic-blue' },
  "linked-lists":        { fill: 'bg-topic-violet',  tint: 'bg-topic-violet/10',  border: 'border-topic-violet/45',  text: 'text-topic-violet' },
  "stacks-queues":       { fill: 'bg-topic-amber',   tint: 'bg-topic-amber/10',   border: 'border-topic-amber/45',   text: 'text-topic-amber' },
  "trees":               { fill: 'bg-topic-emerald', tint: 'bg-topic-emerald/10', border: 'border-topic-emerald/45', text: 'text-topic-emerald' },
  "graphs":              { fill: 'bg-topic-rose',    tint: 'bg-topic-rose/10',    border: 'border-topic-rose/45',    text: 'text-topic-rose' },
  "dynamic-programming": { fill: 'bg-topic-cyan',    tint: 'bg-topic-cyan/10',    border: 'border-topic-cyan/45',    text: 'text-topic-cyan' }
}
const FALLBACK_ACCENT = { fill: 'bg-secondary', tint: 'bg-secondary/10', border: 'border-secondary/45', text: 'text-secondary' }
const accentFor = (id) => TOPIC_ACCENTS[id] || FALLBACK_ACCENT

/* The only ink legible on a solid accent fill: the accents are mid-tone, so
   white falls to 2.1:1 on amber. Paired with icons and large numerals only. */
const ACCENT_INK = 'text-on-primary-fixed'

/* `accent.text` is reserved for the deliberately-dark code panel, where every
   accent clears 8:1. It is never used on a light surface. */

const DIFFICULTY = {
  easy:   { label: 'Easy',   dot: 'bg-topic-emerald', chip: 'border-topic-emerald/45 bg-topic-emerald/10' },
  medium: { label: 'Medium', dot: 'bg-topic-amber',   chip: 'border-topic-amber/45 bg-topic-amber/10' },
  hard:   { label: 'Hard',   dot: 'bg-topic-rose',    chip: 'border-topic-rose/45 bg-topic-rose/10' }
}

/* Big-O values get a consistent traffic-light reading so a learner can rank
   the five metrics without parsing the notation first. */
const complexityTone = (value) => {
  const v = String(value || '').replace(/\s+/g, '').toUpperCase()
  if (!v || v === 'N/A') return { dot: 'bg-outline/40', label: 'not applicable' }
  if (v === 'O(1)') return { dot: 'bg-topic-emerald', label: 'constant' }
  if (v.startsWith('O(LOG')) return { dot: 'bg-topic-blue', label: 'logarithmic' }
  if (v === 'O(N)' || v === 'O(V+E)') return { dot: 'bg-topic-amber', label: 'linear' }
  return { dot: 'bg-topic-rose', label: 'expensive' }
}

export default function TopicDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [copied, setCopied] = useState(false)
  const { completedTopics = [], toggleTopicCompletion, triggerTutor } = useAuth()

  // Loading State
  if (!router.isReady) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar track="dsa" />
        <main className="flex-grow flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-md">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-label-md text-label-md text-on-surface-variant">Loading lesson content...</p>
          </div>
        </main>
      </div>
    )
  }

  const topic = topics.find(t => t.slug === slug)

  // Topic Not Found / Empty State
  if (!topic) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg flex flex-col items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card text-center flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">travel_explore</span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary">Topic not found</h1>
          <p className="text-body-md text-on-surface-variant max-w-prose">
            The topic &ldquo;{slug}&rdquo; does not exist in the DSA Masterclass syllabus yet. It may have been renamed, or it is still being written.
          </p>
          <Link
            href="/dsa"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-secondary text-on-secondary text-label-md px-5 py-3 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 transition-all active-press"
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            Go to DSA syllabus
          </Link>
        </div>
      </main>
    )
  }

  // Calculate sorted list of topics for correct prev/next navigation
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const currentIndex = sortedTopics.findIndex(t => t.id === topic.id)
  const prevTopic = currentIndex > 0 ? sortedTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < sortedTopics.length - 1 ? sortedTopics[currentIndex + 1] : null
  const hasQuiz = quizzes[topic.id] !== undefined

  // Presentation-only derivations.
  const accent = accentFor(topic.id)
  const difficulty = DIFFICULTY[topic.difficulty] || DIFFICULTY.medium
  const isCompleted = completedTopics.includes(topic.id)
  const codeLines = topic.codeSnippet && topic.codeSnippet.code ? topic.codeSnippet.code.split('\n') : []

  const handleCopy = () => {
    if (topic.codeSnippet && topic.codeSnippet.code) {
      navigator.clipboard.writeText(topic.codeSnippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderCellContent = (cell, colIndex) => {
    if (colIndex === 2 && cell.includes('(')) {
      const parts = cell.split('(')
      return (
        <span>
          {parts[0]}
          <span className="text-secondary text-xs ml-2">({parts[1]}</span>
        </span>
      )
    }
    return cell
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar track="dsa" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        {/* ── Lesson hero, tinted with the topic's own accent ─────────────── */}
        <header className={`relative border-b border-outline-variant ${accent.tint}`}>
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent.fill}`} />

          <div className="max-w-3xl mx-auto px-gutter pt-7 pb-7 md:pt-9 md:pb-8">
            {/* Breadcrumb / Meta */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
                <Link
                  href="/dsa"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant hover:text-primary hover:border-outline transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">route</span>
                  DSA
                </Link>
                <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">chevron_right</span>
                <span className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant">
                  {topic.module}
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline hidden sm:inline" aria-hidden="true">chevron_right</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[12px] font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-secondary filled">bolt</span>
                  {topic.badge}
                </span>
              </nav>

              <button
                onClick={() => triggerTutor(`Explain the topic: "${topic.title}"`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-tertiary/35 bg-tertiary/10 hover:bg-tertiary/20 text-on-tertiary-container text-label-md px-3 py-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                id="ask-tutor-ai-btn"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                Ask Tutor AI
              </button>
            </div>

            {/* Position in the path — visible ordering, not just a title */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant whitespace-nowrap">
                Step {currentIndex + 1} of {sortedTopics.length}
              </span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {sortedTopics.map((t, i) => (
                  <span
                    key={t.id}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentIndex
                        ? `w-8 ${accent.fill}`
                        : completedTopics.includes(t.id)
                          ? 'w-4 bg-secondary'
                          : 'w-4 bg-outline-variant'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="flex items-start gap-4">
              <span className={`hidden sm:flex shrink-0 w-14 h-14 rounded-2xl items-center justify-center ${accent.fill} ${ACCENT_INK} shadow-card`}>
                <span className="material-symbols-outlined filled text-[28px]">
                  {topic.iconName || 'view_module'}
                </span>
              </span>

              <div className="min-w-0">
                <h1 className="text-headline-lg-mobile md:text-display-lg text-primary">
                  {topic.title}
                </h1>

                {isCompleted && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-secondary/35 bg-secondary/10 px-3 py-1 text-label-md text-on-surface select-none animate-fade-in">
                    <span className="material-symbols-outlined text-[16px] text-secondary filled">check_circle</span>
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Lesson metadata */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold text-on-surface ${difficulty.chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} aria-hidden="true" />
                {difficulty.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {topic.estimatedTime} read
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                {topic.lessonsCount}
              </span>
              {hasQuiz && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-tertiary/35 bg-tertiary/10 px-2.5 py-1 text-[12px] font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[14px]">quiz</span>
                  Quiz available
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── Lesson body ─────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-gutter py-8 md:py-10 pb-36">
          {/* Intro Text */}
          <p className="text-body-lg text-on-surface max-w-prose">
            {topic.content}
          </p>

          {/* Key Concept Bento Grid */}
          {topic.concepts && topic.concepts.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.fill} ${ACCENT_INK}`}>
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </span>
                <h2 className="text-headline-md text-primary">Key concepts</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topic.concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${accent.tint} border ${accent.border}`}>
                      <span className="material-symbols-outlined text-[20px] text-on-surface">{concept.icon}</span>
                    </div>
                    <h3 className="text-headline-sm text-primary mb-1.5">{concept.title}</h3>
                    <p className="text-body-sm text-on-surface-variant">{concept.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Complexity Metrics */}
          {topic.complexity && (
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.fill} ${ACCENT_INK}`}>
                  <span className="material-symbols-outlined text-[20px]">speed</span>
                </span>
                <h2 className="text-headline-md text-primary">Complexity at a glance</h2>
              </div>

              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5 shadow-card">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { label: "Access", value: topic.complexity.access },
                    { label: "Search", value: topic.complexity.search },
                    { label: "Insertion", value: topic.complexity.insertion },
                    { label: "Deletion", value: topic.complexity.deletion },
                    { label: "Space", value: topic.complexity.space, isSpace: true },
                  ].map((item, idx) => {
                    const tone = complexityTone(item.value)
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 flex flex-col gap-2 ${
                          item.isSpace
                            ? 'bg-secondary/10 border-secondary/30'
                            : 'bg-surface-container-low border-outline-variant'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                          {item.label}
                        </span>
                        <span className="font-code-block text-base font-bold text-primary leading-none">
                          {item.value}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.dot}`} aria-hidden="true" />
                          {tone.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-4 pt-3 border-t border-outline-variant text-body-sm text-on-surface-variant">
                  Worst-case time complexity, with space measured for <span className="font-code-block">N</span> stored elements.
                  Green is constant, blue logarithmic, amber linear, rose heavier than linear.
                </p>
              </div>
            </section>
          )}

          {/* Technical Explanation / Code Block */}
          {topic.codeSnippet && (
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.fill} ${ACCENT_INK}`}>
                  <span className="material-symbols-outlined text-[20px]">code</span>
                </span>
                <h2 className="text-headline-md text-primary">Implementation &amp; code</h2>
              </div>

              <p className="text-body-md text-on-surface-variant max-w-prose mb-4">
                Below is a typical implementation or syntax representation of {topic.title.split(':')[0]} in modern C++.
              </p>

              {/* Deliberately dark panel — the only place raw hex belongs. */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0f19] shadow-lifted overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#070b13]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="hidden sm:flex items-center gap-1.5 shrink-0" aria-hidden="true">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
                    </span>
                    <span className={`rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-bold tracking-wider select-none ${accent.text}`}>
                      {topic.codeSnippet.language.toUpperCase()}
                    </span>
                    <span className="font-code-block text-xs text-slate-400 truncate">
                      {topic.codeSnippet.fileName}
                    </span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex font-code-block text-code-block">
                  {/* Line-number gutter. Decorative, so it stays out of the a11y
                      tree and out of anything the user selects to copy. */}
                  <div
                    aria-hidden="true"
                    className="select-none shrink-0 py-4 pl-4 pr-3 text-right text-slate-500 border-r border-white/10 tabular-nums"
                  >
                    {codeLines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 min-w-0 overflow-x-auto py-4 px-4 text-slate-100">
                    <code className={`language-${topic.codeSnippet.language}`}>
                      {topic.codeSnippet.code}
                    </code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Highlighted Intuition Box */}
          {topic.intuition && (
            <aside className="mt-10 relative overflow-hidden rounded-2xl border border-tertiary/30 bg-tertiary/10 p-5 sm:p-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-tertiary"></span>
              <div className="flex items-start gap-4 pl-2">
                <span className="shrink-0 w-11 h-11 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined filled">lightbulb</span>
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-tertiary-container">
                    Intuition
                  </span>
                  <h3 className="text-headline-sm text-primary mt-1 mb-2">
                    {topic.intuition.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant max-w-prose">
                    {topic.intuition.text}
                  </p>
                </div>
              </div>
            </aside>
          )}

          {/* Common Mistakes Checklist */}
          {topic.commonMistakes && topic.commonMistakes.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-error text-on-error">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </span>
                <h2 className="text-headline-md text-primary">Common pitfalls</h2>
              </div>

              <ol className="rounded-2xl border border-error/25 bg-error/10 divide-y divide-error/15 overflow-hidden">
                {topic.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex gap-4 items-start p-4 sm:p-5">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-error/15 text-on-error-container flex items-center justify-center text-[13px] font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-body-md text-on-surface-variant max-w-prose">{mistake}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Memory Layout Table */}
          {topic.table && (
            <section className="mt-10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.fill} ${ACCENT_INK}`}>
                  <span className="material-symbols-outlined text-[20px]">table_chart</span>
                </span>
                <h2 className="text-headline-md text-primary">{topic.table.title}</h2>
              </div>

              <p className="text-body-md text-on-surface-variant max-w-prose mb-4">
                {topic.table.desc}
              </p>

              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        {topic.table.headers.map((h, i) => (
                          <th
                            key={i}
                            scope="col"
                            className="py-3 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-code-block text-code-block">
                      {topic.table.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-3 px-4 whitespace-nowrap ${cIdx === 1 ? 'font-bold text-primary' : 'text-on-surface-variant'}`}
                            >
                              {renderCellContent(cell, cIdx)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Bottom Action Bar ───────────────────────────────────────────── */}
        <div className="fixed bottom-0 md:left-64 left-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur-sm px-4 py-3 flex justify-between items-center gap-2">
          {prevTopic ? (
            <Link
              href={`/dsa/${prevTopic.slug}`}
              aria-label={`Previous topic: ${prevTopic.title.split(':')[0]}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors py-2.5 px-3 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <div className="w-10" aria-hidden="true"></div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {topic && (
              <button
                onClick={() => toggleTopicCompletion(topic.id)}
                aria-pressed={isCompleted}
                aria-label={isCompleted ? 'Mark topic as not complete' : 'Mark topic as complete'}
                className={`inline-flex items-center gap-1.5 rounded-lg text-label-md transition-all duration-200 py-2.5 px-3 shrink-0 active-press ${
                  isCompleted
                    ? 'bg-secondary/10 border border-secondary text-on-surface hover:bg-secondary/20'
                    : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isCompleted ? 'filled text-secondary' : ''}`}>
                  {isCompleted ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span className="hidden md:inline">{isCompleted ? 'Completed' : 'Mark complete'}</span>
              </button>
            )}

            {hasQuiz ? (
              <Link
                href={`/quiz/${topic.id}`}
                aria-label="Practice quiz for this topic"
                className="inline-flex items-center gap-1.5 rounded-lg border border-tertiary/40 bg-tertiary/10 text-on-tertiary-container text-label-md hover:bg-tertiary/20 transition-colors py-2.5 px-3 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                <span className="hidden md:inline">Practice quiz</span>
              </Link>
            ) : (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-dashed border-outline-variant text-label-md text-on-surface-variant py-2.5 px-3 shrink-0 select-none"
                title="A practice quiz for this topic is still being written"
              >
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                <span className="hidden md:inline">Quiz coming soon</span>
              </span>
            )}

            {nextTopic ? (
              <Link
                href={`/dsa/${nextTopic.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-on-secondary text-label-md hover:-translate-y-0.5 shadow-brand hover:shadow-brand-hover transition-all py-2.5 px-4 min-w-0 active-press"
              >
                <span className="truncate">
                  Next<span className="hidden lg:inline">: {nextTopic.title.split(':')[0]}</span>
                </span>
                <span className="material-symbols-outlined text-[18px] shrink-0">arrow_forward</span>
              </Link>
            ) : (
              <Link
                href="/dsa"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-on-primary text-label-md hover:-translate-y-0.5 shadow-card hover:shadow-card-hover transition-all py-2.5 px-4 shrink-0 active-press"
              >
                <span className="hidden sm:inline">Complete syllabus</span>
                <span className="sm:hidden">Finish</span>
                <span className="material-symbols-outlined text-[18px]">done_all</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
