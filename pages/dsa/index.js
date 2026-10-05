import Link from 'next/link'
import { topics } from '../../data/topics'
import { quizzes } from '../../data/quizzes'
import { useAuth } from '../../context/AuthContext'

/* Per-topic accent palette.
   Colour-coding the six DSA topics is what turns this page from a grid of
   identical grey cards into something scannable, and the same accent follows a
   topic onto its lesson page and its quiz. Class strings are spelled out in
   full because Tailwind's scanner cannot resolve `bg-topic-${key}`. */
const TOPIC_ACCENTS = {
  "arrays":              { fill: 'bg-topic-blue',    tint: 'bg-topic-blue/10',    border: 'border-topic-blue/45',    ring: 'ring-topic-blue/30' },
  "linked-lists":        { fill: 'bg-topic-violet',  tint: 'bg-topic-violet/10',  border: 'border-topic-violet/45',  ring: 'ring-topic-violet/30' },
  "stacks-queues":       { fill: 'bg-topic-amber',   tint: 'bg-topic-amber/10',   border: 'border-topic-amber/45',   ring: 'ring-topic-amber/30' },
  "trees":               { fill: 'bg-topic-emerald', tint: 'bg-topic-emerald/10', border: 'border-topic-emerald/45', ring: 'ring-topic-emerald/30' },
  "graphs":              { fill: 'bg-topic-rose',    tint: 'bg-topic-rose/10',    border: 'border-topic-rose/45',    ring: 'ring-topic-rose/30' },
  "dynamic-programming": { fill: 'bg-topic-cyan',    tint: 'bg-topic-cyan/10',    border: 'border-topic-cyan/45',    ring: 'ring-topic-cyan/30' }
}
const FALLBACK_ACCENT = { fill: 'bg-secondary', tint: 'bg-secondary/10', border: 'border-secondary/45', ring: 'ring-secondary/30' }
const accentFor = (id) => TOPIC_ACCENTS[id] || FALLBACK_ACCENT

/* The one ink that is legible on top of a solid accent fill. The six accents
   are mid-tone and saturated: white drops to 2.1:1 on amber, so a near-black
   ink is the only choice that clears 3:1 on all six, in both themes. It is
   therefore only ever paired with icons or large bold numerals — never with
   small text. */
const ACCENT_INK = 'text-on-primary-fixed'

/* Difficulty gets its own fixed scale, and the colour lives in the dot and the
   border rather than the label, so the label keeps full body contrast. */
const DIFFICULTY = {
  easy:   { label: 'Easy',   dot: 'bg-topic-emerald', chip: 'border-topic-emerald/45 bg-topic-emerald/10' },
  medium: { label: 'Medium', dot: 'bg-topic-amber',   chip: 'border-topic-amber/45 bg-topic-amber/10' },
  hard:   { label: 'Hard',   dot: 'bg-topic-rose',    chip: 'border-topic-rose/45 bg-topic-rose/10' }
}

// Progress-ring geometry.
const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const hasQuiz = (id) => Array.isArray(quizzes[id]) && quizzes[id].length > 0

// "5/15 lessons" -> { done: 5, total: 15 }. Falls back to the raw string.
const parseLessons = (raw) => {
  const match = /^\s*(\d+)\s*\/\s*(\d+)/.exec(raw || '')
  return match ? { done: Number(match[1]), total: Number(match[2]) } : null
}

const formatMinutes = (mins) => {
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export default function DsaOverview() {
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const { isLoggedIn, completedTopics = [], quizScores = {} } = useAuth()

  const dsaTopics = topics.filter(t => t.track === 'dsa')
  const totalDsaCount = dsaTopics.length
  const completedDsaCount = dsaTopics.filter(t => completedTopics.includes(t.id)).length
  const overallProgress = totalDsaCount > 0 ? Math.round((completedDsaCount / totalDsaCount) * 100) : 0

  // Presentation-only derivations for the header strip and the path states.
  const quizzesAvailable = dsaTopics.filter(t => hasQuiz(t.id)).length
  const quizzesTaken = dsaTopics.filter(t => quizScores[t.id] !== undefined).length
  const totalMinutes = dsaTopics.reduce((sum, t) => sum + (parseInt(t.estimatedTime, 10) || 0), 0)
  // "Current" is simply the first step not ticked off yet.
  const currentTopic = sortedTopics.find(t => !completedTopics.includes(t.id))
  const currentTopicId = currentTopic ? currentTopic.id : null

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-8 md:py-12">
      {/* ── Page header + progress dashboard ─────────────────────────────── */}
      <div className="grid gap-md lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center mb-8 md:mb-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary filled">route</span>
            Guided learning track
          </span>

          <h1 className="mt-4 mb-3 text-headline-lg-mobile md:text-display-lg text-primary">
            Data Structures &amp; Algorithms
          </h1>

          <p className="text-body-lg text-on-surface-variant">
            Master the foundational building blocks of efficient software. Track your progress across core algorithmic patterns and memory structures.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: 'menu_book', label: `${totalDsaCount} topics` },
              { icon: 'schedule', label: `${formatMinutes(totalMinutes)} of reading` },
              { icon: 'quiz', label: `${quizzesAvailable} practice quizzes` }
            ].map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-body-sm text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[16px]">{stat.icon}</span>
                {stat.label}
              </span>
            ))}
          </div>
        </div>

        {/* Progress panel */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r={RING_RADIUS} fill="none" strokeWidth="9" className="stroke-surface-container-high" />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="stroke-secondary transition-all duration-700 ease-out-expo"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - overallProgress / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-headline-md text-primary leading-none">{overallProgress}%</span>
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-headline-sm text-primary">Course progress</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {isLoggedIn ? (
                  <>
                    <strong className="text-on-surface font-semibold">{completedDsaCount}</strong> of {totalDsaCount} core topics complete.
                  </>
                ) : (
                  <>Sign in to track your learning progress permanently.</>
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 border border-secondary/25 px-2.5 py-1 text-[12px] font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-secondary filled">check_circle</span>
                  {completedDsaCount} done
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low border border-outline-variant px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">quiz</span>
                  {quizzesTaken}/{quizzesAvailable} quizzes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── The learning path ────────────────────────────────────────────── */}
      <div className="mb-md flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-headline-md text-primary">Your learning path</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Six modules in order — each one builds on the structures before it.
          </p>
        </div>
        <span className="text-label-md text-on-surface-variant">
          Step {Math.min(completedDsaCount + 1, totalDsaCount)} of {totalDsaCount}
        </span>
      </div>

      <ol className="flex flex-col">
        {sortedTopics.map((topic, index) => {
          const isCompleted = completedTopics.includes(topic.id)
          const quizScore = quizScores[topic.id]
          const isCurrent = topic.id === currentTopicId
          const isLast = index === sortedTopics.length - 1
          const accent = accentFor(topic.id)
          const difficulty = DIFFICULTY[topic.difficulty] || DIFFICULTY.medium
          const lessons = parseLessons(topic.lessonsCount)
          const topicHasQuiz = hasQuiz(topic.id)
          const stepLabel = String(index + 1).padStart(2, '0')

          // Use quizScore or completion to determine progress bar width
          let progressWidth = "0%"
          if (isCompleted) {
            progressWidth = "100%"
          } else if (quizScore !== undefined) {
            progressWidth = `${quizScore}%`
          } else {
            // Keep original static mock progress as fallback if guest/not started
            if (topic.id === "arrays") progressWidth = "33.3%"
            else if (topic.id === "linked-lists") progressWidth = "80%"
            else if (topic.id === "trees") progressWidth = "10%"
          }

          // Completed / current / upcoming read differently at a glance: teal
          // tick, accent-filled numeral with a halo, or a quiet grey numeral.
          const stepBadge = isCompleted
            ? 'bg-secondary text-on-secondary'
            : isCurrent
              ? `${accent.fill} ${ACCENT_INK} ring-4 ${accent.ring}`
              : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'

          return (
            <li key={topic.id} className="relative flex gap-4 sm:gap-6 pb-4">
              {/* Step rail: numeral + connector down to the next step */}
              <div className="hidden sm:flex flex-col items-center shrink-0 pt-6">
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0 transition-all ${stepBadge}`}
                  aria-hidden="true"
                >
                  {isCompleted
                    ? <span className="material-symbols-outlined filled text-[24px]">check</span>
                    : index + 1}
                </span>
                {!isLast && (
                  <span
                    className={`w-0.5 flex-1 mt-3 rounded-full ${isCompleted ? 'bg-secondary/40' : 'bg-outline-variant'}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              <Link
                href={`/dsa/${topic.slug}`}
                className={`group relative flex-1 min-w-0 overflow-hidden rounded-2xl border bg-surface-container-lowest transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover ${
                  isCurrent ? `${accent.border} shadow-lifted` : 'border-outline-variant shadow-card'
                }`}
              >
                {/* Topic accent rail — the colour code, dimmed while upcoming */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-1.5 ${isCompleted ? 'bg-secondary' : accent.fill} ${isCompleted || isCurrent ? '' : 'opacity-40'}`}
                />

                <div className="p-5 pl-7 sm:p-6 sm:pl-8">
                  <div className="flex items-start gap-4">
                    {/* Mobile carries the step numeral; the rail is hidden there */}
                    <span
                      className={`sm:hidden shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold ${stepBadge}`}
                      aria-hidden="true"
                    >
                      {isCompleted
                        ? <span className="material-symbols-outlined filled text-[22px]">check</span>
                        : index + 1}
                    </span>

                    <span className={`hidden sm:flex shrink-0 w-12 h-12 rounded-xl items-center justify-center ${accent.fill} ${ACCENT_INK}`}>
                      <span className="material-symbols-outlined filled">
                        {topic.iconName || 'view_module'}
                      </span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                          {topic.module}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline/60" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                          {topic.badge}
                        </span>
                      </div>

                      <h3 className="text-headline-sm md:text-headline-md text-primary group-hover:text-secondary transition-colors">
                        <span className="sr-only">Step {stepLabel}: </span>
                        {topic.title.split(':')[0]}
                      </h3>

                      <p className="mt-2 text-body-md text-on-surface-variant max-w-prose">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold text-on-surface ${difficulty.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} aria-hidden="true" />
                      {difficulty.label}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {topic.estimatedTime}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      {lessons ? `${lessons.done}/${lessons.total} lessons` : topic.lessonsCount}
                    </span>

                    {topicHasQuiz ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-tertiary/35 bg-tertiary/10 px-2.5 py-1 text-[12px] font-semibold text-on-surface">
                        <span className="material-symbols-outlined text-[14px]">quiz</span>
                        Quiz ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-outline-variant px-2.5 py-1 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                        Quiz coming soon
                      </span>
                    )}

                    {quizScore !== undefined && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-topic-amber/45 bg-topic-amber/10 px-2.5 py-1 text-[12px] font-semibold text-on-surface animate-fade-in">
                        <span className="material-symbols-outlined text-[14px] filled">military_tech</span>
                        Scored {quizScore}%
                      </span>
                    )}
                  </div>

                  {/* State line + progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        {isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Upcoming'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-label-md text-secondary">
                        {isCompleted ? 'Review lesson' : isCurrent ? 'Continue' : 'Start topic'}
                        <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out-expo ${isCompleted ? 'bg-secondary' : accent.fill}`}
                        style={{ width: progressWidth }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
