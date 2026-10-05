import Link from 'next/link'
import { useRouter } from 'next/router'
import { topics } from '../data/topics'

// One accent per position in the syllabus. Six topics used to render as six
// identical grey rows; now each step is instantly identifiable, and the same
// order maps to the same colour everywhere the outline appears.
const ACCENTS = [
  { spine: 'bg-topic-blue', tint: 'bg-topic-blue/10', ring: 'ring-topic-blue/30', chip: 'bg-topic-blue/20', ink: 'text-topic-blue' },
  { spine: 'bg-topic-violet', tint: 'bg-topic-violet/10', ring: 'ring-topic-violet/30', chip: 'bg-topic-violet/20', ink: 'text-topic-violet' },
  { spine: 'bg-topic-amber', tint: 'bg-topic-amber/10', ring: 'ring-topic-amber/30', chip: 'bg-topic-amber/20', ink: 'text-topic-amber' },
  { spine: 'bg-topic-emerald', tint: 'bg-topic-emerald/10', ring: 'ring-topic-emerald/30', chip: 'bg-topic-emerald/20', ink: 'text-topic-emerald' },
  { spine: 'bg-topic-rose', tint: 'bg-topic-rose/10', ring: 'ring-topic-rose/30', chip: 'bg-topic-rose/20', ink: 'text-topic-rose' },
  { spine: 'bg-topic-cyan', tint: 'bg-topic-cyan/10', ring: 'ring-topic-cyan/30', chip: 'bg-topic-cyan/20', ink: 'text-topic-cyan' }
]

// Difficulty is carried by a coloured dot rather than coloured text: amber and
// emerald ink would drop under 4.5:1 on the light surface.
const DIFFICULTY = {
  easy: { label: 'Easy', dot: 'bg-topic-emerald' },
  medium: { label: 'Medium', dot: 'bg-topic-amber' },
  hard: { label: 'Hard', dot: 'bg-topic-rose' }
}

export default function Sidebar({ track = 'dsa' }) {
  const router = useRouter()
  const { slug } = router.query

  // Filter topics for the current track and sort by order
  const trackTopics = topics
    .filter(t => t.track === track)
    .sort((a, b) => a.order - b.order)

  // Find index of the active topic to calculate progress
  const activeIndex = trackTopics.findIndex(t => t.slug === slug)

  // Dynamic progress calculation: if active, progress includes current topic
  const completionPercentage = (activeIndex >= 0 && trackTopics.length > 0)
    ? Math.round(((activeIndex + 1) / trackTopics.length) * 100)
    : 0

  // Rough runtime for the whole track, straight off the lesson metadata.
  const totalMinutes = trackTopics.reduce((sum, t) => sum + (parseInt(t.estimatedTime, 10) || 0), 0)

  const isOverview = router.pathname === `/${track}`

  return (
    <aside className="hidden md:flex flex-col h-full w-72 bg-surface-container-low border-r border-outline-variant shrink-0 z-40 overflow-y-auto">
      {/* Track header */}
      <div className="p-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-inset-hairline">
            <span className="material-symbols-outlined filled text-[22px]">
              {track === 'dsa' ? 'account_tree' : 'code'}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-headline-sm text-headline-sm text-base text-primary truncate">
              {track === 'dsa' ? 'DSA Masterclass' : 'C++ Foundation'}
            </h2>
            <p className="font-body-sm text-body-sm text-xs text-on-surface-variant">
              {trackTopics.length} {trackTopics.length === 1 ? 'lesson' : 'lessons'}
              {totalMinutes > 0 && <> · ~{totalMinutes} min</>}
            </p>
          </div>
        </div>

        {/* Progress panel — a percentage on its own says nothing, so it is
            paired with the step count it comes from. */}
        <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-label-md text-label-md text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
              Progress
            </span>
            <span className="font-code-block text-code-block text-xs font-bold text-secondary">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-500 ease-out-expo"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="mt-2 font-body-sm text-body-sm text-[11px] text-on-surface-variant">
            {activeIndex >= 0
              ? `Lesson ${activeIndex + 1} of ${trackTopics.length}`
              : 'Not started — pick a lesson below'}
          </p>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 flex flex-col gap-1">
        {/* Overview link */}
        <Link
          href={`/${track}`}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-all group ${
            isOverview
              ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-card'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${isOverview ? 'filled' : 'group-hover:text-secondary transition-colors'}`}>dashboard</span>
          Overview
        </Link>

        <p className="px-3 pt-4 pb-2 font-label-md text-label-md text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/80">
          Course outline
        </p>

        {/* Topics/Lessons links */}
        {trackTopics.map((topic, index) => {
          const isCurrent = topic.slug === slug
          const isDone = activeIndex > -1 && index < activeIndex
          const accent = ACCENTS[index % ACCENTS.length]
          const difficulty = DIFFICULTY[topic.difficulty] || null

          return (
            <Link
              key={topic.id}
              href={`/${track}/${topic.slug}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg font-label-md text-label-md transition-all group ${
                isCurrent
                  ? `${accent.tint} ring-1 ${accent.ring} text-on-surface font-semibold shadow-card`
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {/* Colour spine: the topic's identity, and the "you are here" mark. */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-200 ${accent.spine} ${
                  isCurrent ? 'h-7 opacity-100' : 'h-4 opacity-0 group-hover:opacity-60'
                }`}
                aria-hidden="true"
              />

              {/* Step chip: done → check, current → filled, upcoming → number. */}
              <span
                className={`shrink-0 grid place-items-center h-7 w-7 rounded-lg text-[12px] font-bold transition-colors ${
                  isCurrent
                    ? `${accent.chip} text-on-surface`
                    : isDone
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {isDone
                  ? <span className="material-symbols-outlined filled text-[16px]" aria-hidden="true">check</span>
                  : index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate leading-tight">{topic.title.split(':')[0]}</span>
                <span className="mt-0.5 flex items-center gap-1.5 font-body-sm text-body-sm text-[11px] font-normal text-on-surface-variant">
                  <span className={`material-symbols-outlined text-[13px] leading-none ${accent.ink}`} aria-hidden="true">
                    {topic.iconName || 'view_module'}
                  </span>
                  {topic.estimatedTime && <span className="truncate">{topic.estimatedTime}</span>}
                  {difficulty && (
                    <>
                      <span className="opacity-50">·</span>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${difficulty.dot}`} aria-hidden="true" />
                      <span className="truncate">{difficulty.label}</span>
                    </>
                  )}
                </span>
              </span>
            </Link>
          )
        })}

        {/* Designed zero state instead of a silently empty column. */}
        {trackTopics.length === 0 && (
          <div className="mx-1 mt-2 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-4 text-center">
            <span className="material-symbols-outlined text-[24px] text-secondary" aria-hidden="true">rocket_launch</span>
            <p className="mt-1 font-label-md text-label-md text-sm text-on-surface">Lessons on the way</p>
            <p className="mt-1 font-body-sm text-body-sm text-xs text-on-surface-variant">
              This track is being written right now. The DSA Masterclass is ready to go in the meantime.
            </p>
            <Link
              href="/dsa"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-1.5 font-label-md text-label-md text-xs text-secondary hover:bg-secondary/20 transition-colors"
            >
              Browse DSA
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Action */}
      {trackTopics.length > 0 && (
        <div className="p-3 border-t border-outline-variant bg-surface-container-low">
          <Link
            href={`/${track}/${trackTopics[0]?.slug}`}
            className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-2.5 rounded-lg shadow-brand hover:shadow-brand-hover active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined filled text-[18px]" aria-hidden="true">play_arrow</span>
            Resume Learning
          </Link>
        </div>
      )}
    </aside>
  )
}
