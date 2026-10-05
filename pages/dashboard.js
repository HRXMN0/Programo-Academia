import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '../context/AuthContext'
import { topics } from '../data/topics'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

// The six DSA topics used to render as six identical grey rows. Each topic now
// owns one accent that follows it across every card on this page, so a learner
// recognises "the violet one" before they read the label. Tailwind only sees
// class names it can read literally, so these are whole strings, not templates.
const TOPIC_ACCENTS = {
  'arrays': { tile: 'bg-topic-blue/10 text-topic-blue', dot: 'bg-topic-blue', bar: 'bg-topic-blue' },
  'linked-lists': { tile: 'bg-topic-violet/10 text-topic-violet', dot: 'bg-topic-violet', bar: 'bg-topic-violet' },
  'stacks-queues': { tile: 'bg-topic-amber/15 text-topic-amber', dot: 'bg-topic-amber', bar: 'bg-topic-amber' },
  'trees': { tile: 'bg-topic-emerald/10 text-topic-emerald', dot: 'bg-topic-emerald', bar: 'bg-topic-emerald' },
  'graphs': { tile: 'bg-topic-rose/10 text-topic-rose', dot: 'bg-topic-rose', bar: 'bg-topic-rose' },
  'dynamic-programming': { tile: 'bg-topic-cyan/10 text-topic-cyan', dot: 'bg-topic-cyan', bar: 'bg-topic-cyan' },
}
const DEFAULT_ACCENT = { tile: 'bg-secondary/10 text-secondary', dot: 'bg-secondary', bar: 'bg-secondary' }
const accentFor = (topicId) => TOPIC_ACCENTS[topicId] || DEFAULT_ACCENT

// Difficulty is colour-coded the same way everywhere: the tint carries the
// signal, the label stays on-surface so it clears contrast in both themes.
const DIFFICULTY_STYLES = {
  easy: { chip: 'border-topic-emerald/40 bg-topic-emerald/10', dot: 'bg-topic-emerald' },
  medium: { chip: 'border-topic-amber/40 bg-topic-amber/10', dot: 'bg-topic-amber' },
  hard: { chip: 'border-topic-rose/40 bg-topic-rose/10', dot: 'bg-topic-rose' },
}
const difficultyFor = (difficulty) => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium

// Progress ring geometry. r=52 inside a 120 viewBox leaves room for the 10px stroke.
const RING_RADIUS = 52
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

export default function Dashboard() {
  const router = useRouter()
  const {
    user,
    completedTopics: authCompletedTopics = [],
    quizScores: authQuizScores = {},
    completedAt: authCompletedAt = {}
  } = useAuth()

  // Local state — seeded from AuthContext, kept fresh by onSnapshot
  const [completedTopics, setCompletedTopics] = useState(authCompletedTopics || [])
  const [quizScores, setQuizScores] = useState(authQuizScores || {})
  const [completedAt, setCompletedAt] = useState(authCompletedAt || {})

  // Real-time listener scoped only to dashboard page
  useEffect(() => {
    if (!user?.uid) return

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setCompletedTopics(data.completedTopics || [])
        setQuizScores(data.quizScores || {})
        setCompletedAt(data.completedAt || {})
      }
    })

    return () => unsubscribe()
  }, [user?.uid])


  // Progress metrics
  const dsaTopics = topics.filter(t => t.track === 'dsa')
  const totalDsaCount = dsaTopics.length
  const completedDsaCount = dsaTopics.filter(t => (completedTopics || []).includes(t.id)).length
  const overallProgress = totalDsaCount > 0 ? Math.round((completedDsaCount / totalDsaCount) * 100) : 0

  // Smart next-topic recommendation (first uncompleted topic in syllabus order)
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const nextTopic = sortedTopics.find(t => !(completedTopics || []).includes(t.id)) || null

  // Most recently completed topic. completedTopics is a Firestore array built with
  // arrayUnion, so its order says nothing about recency — the completedAt map does.
  // Topics finished before we started stamping have no entry, so they rank behind
  // any stamped topic and fall back to array order among themselves.
  const lastCompletedTopicId = (() => {
    const ids = completedTopics || []
    if (ids.length === 0) return null

    const stamped = ids.filter(id => completedAt?.[id])
    if (stamped.length === 0) return ids[ids.length - 1]

    return stamped.reduce((latest, id) =>
      new Date(completedAt[id]) > new Date(completedAt[latest]) ? id : latest
    )
  })()
  const lastCompletedTopic = lastCompletedTopicId ? topics.find(t => t.id === lastCompletedTopicId) : null

  // Quiz analytics
  const quizEntries = Object.entries(quizScores || {})
  const attemptedQuizCount = quizEntries.length
  const totalScoreSum = quizEntries.reduce((sum, [_, score]) => sum + score, 0)
  const averageQuizScore = attemptedQuizCount > 0 ? Math.round(totalScoreSum / attemptedQuizCount) : 0
  // Purely derived, for the stat strip: a quiz counts as "aced" at 80% or better.
  const acedQuizCount = quizEntries.filter(([_, score]) => score >= 80).length

  // A learner with nothing on the board gets the designed onboarding state
  // instead of a card that just says "nothing here yet".
  const isNewLearner = completedDsaCount === 0 && attemptedQuizCount === 0

  const getScoreColorClass = (score, isAttempted = true) => {
    if (!isAttempted) return 'bg-surface-container-high text-on-surface-variant border border-outline-variant/60'
    if (score >= 80) return 'bg-topic-emerald/10 text-on-surface border border-topic-emerald/40'
    if (score >= 50) return 'bg-topic-amber/15 text-on-surface border border-topic-amber/40'
    return 'bg-error/10 text-on-surface border border-error/40'
  }

  // Matching fill for the thin bars that sit under each score badge.
  const getScoreBarClass = (score) => {
    if (score >= 80) return 'bg-topic-emerald'
    if (score >= 50) return 'bg-topic-amber'
    return 'bg-error'
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Stat strip. Whole class strings again — these are read by Tailwind's scanner.
  const stats = [
    {
      key: 'topics',
      icon: 'task_alt',
      label: 'Topics completed',
      value: `${completedDsaCount}`,
      suffix: `/ ${totalDsaCount}`,
      hint: 'Core DSA syllabus',
      tile: 'bg-topic-emerald/10 text-topic-emerald',
    },
    {
      key: 'quizzes',
      icon: 'quiz',
      label: 'Quizzes taken',
      value: `${attemptedQuizCount}`,
      suffix: `/ ${totalDsaCount}`,
      hint: 'One per topic',
      tile: 'bg-topic-blue/10 text-topic-blue',
    },
    {
      key: 'average',
      icon: 'trending_up',
      label: 'Average score',
      value: attemptedQuizCount > 0 ? `${averageQuizScore}` : '—',
      suffix: attemptedQuizCount > 0 ? '%' : '',
      hint: attemptedQuizCount > 0 ? 'Across attempted quizzes' : 'Take a quiz to start',
      tile: 'bg-topic-violet/10 text-topic-violet',
    },
    {
      key: 'aced',
      icon: 'workspace_premium',
      label: 'Quizzes aced',
      value: `${acedQuizCount}`,
      suffix: acedQuizCount === 1 ? 'quiz' : 'quizzes',
      hint: 'Scored 80% or higher',
      tile: 'bg-topic-amber/15 text-topic-amber',
    },
  ]

  return (
    <main className="flex-grow w-full bg-background px-gutter py-8 md:py-10">
      <Head>
        <title>Programo Academia - Dashboard</title>
      </Head>

      <div className="max-w-container-max mx-auto space-y-6 animate-fade-in">
        {/* Welcome Section — greeting on the left, the reward (progress ring) on the right */}
        <section className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card">
          {/* One deliberate, actually-visible accent instead of 3% decorative fog */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gradient"></div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>

          <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-full bg-secondary text-on-secondary text-xl font-bold flex items-center justify-center overflow-hidden ring-2 ring-secondary/30 ring-offset-2 ring-offset-surface-container-lowest shadow-brand">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{(user.name || user.email || 'Learner').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-label-md text-[11px] uppercase tracking-[0.16em] text-secondary font-bold">
                  Your dashboard
                </p>
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-0.5 truncate">
                  Hi, {user.name || 'Learner'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] leading-none">mail</span>
                    <span className="truncate">{user.email}</span>
                  </span>
                  {user.createdAt && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] leading-none">calendar_today</span>
                      Member since {formatTimestamp(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse items-stretch gap-5 sm:flex-row sm:items-center md:gap-8">
              <div className="flex gap-3">
                <Link
                  href="/dsa"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-label-md text-label-md text-on-secondary shadow-brand transition-all duration-200 hover:bg-secondary/90 hover:shadow-brand-hover active-press"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">menu_book</span>
                  Syllabus
                </Link>
                <Link
                  href="/interview-prep"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2.5 font-label-md text-label-md text-on-surface transition-all duration-200 hover:border-secondary/50 hover:bg-secondary/5 hover:text-secondary active-press"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">record_voice_over</span>
                  Interview Coach
                </Link>
              </div>

              {/* Progress ring: the single number a learner comes here to see */}
              <div className="flex items-center gap-4 sm:border-l sm:border-outline-variant sm:pl-8">
                <div className="relative h-28 w-28 shrink-0">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-28 w-28 -rotate-90"
                    role="img"
                    aria-label={`${overallProgress} percent of the DSA syllabus complete`}
                  >
                    <circle
                      cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="10"
                      className="stroke-surface-container-high"
                    />
                    <circle
                      cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="10" strokeLinecap="round"
                      className="stroke-secondary transition-all duration-700 ease-out-expo"
                      strokeDasharray={RING_LENGTH}
                      strokeDashoffset={RING_LENGTH * (1 - overallProgress / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-md text-headline-md text-primary leading-none">{overallProgress}%</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">done</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="font-label-md text-label-md text-on-surface">Syllabus progress</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    <strong className="text-primary">{completedDsaCount}</strong> of {totalDsaCount} core topics
                  </p>
                  {nextTopic && (
                    <p className="mt-1 text-xs text-outline">{totalDsaCount - completedDsaCount} left to go</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </p>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.tile}`}>
                  <span className="material-symbols-outlined text-[20px] leading-none filled">{stat.icon}</span>
                </span>
              </div>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg-mobile text-primary leading-none">{stat.value}</span>
                {stat.suffix && (
                  <span className="text-sm font-semibold text-on-surface-variant">{stat.suffix}</span>
                )}
              </p>
              <p className="mt-1.5 text-xs text-outline">{stat.hint}</p>
            </div>
          ))}
        </section>

        {/* Content Split: Recommendation / Activity vs Module map */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / Middle: Smart recommendation and recent activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Next-Topic Suggestion */}
            <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card">
              {nextTopic ? (
                <>
                  <div aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${accentFor(nextTopic.id).bar}`}></div>
                  <div className="p-6 pl-7 md:p-7 md:pl-8">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-label-md text-label-md flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                        <span className="material-symbols-outlined text-[16px] leading-none">school</span>
                        Pick up where you left off
                      </h2>
                      <span className="shrink-0 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                        Step {nextTopic.order} of {totalDsaCount}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start gap-4">
                      <span className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:flex ${accentFor(nextTopic.id).tile}`}>
                        <span className="material-symbols-outlined text-[28px] leading-none">{nextTopic.iconName}</span>
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-headline-md text-headline-md text-primary">
                          {nextTopic.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface">
                            <span className={`h-1.5 w-1.5 rounded-full ${accentFor(nextTopic.id).dot}`}></span>
                            {nextTopic.module}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize text-on-surface ${difficultyFor(nextTopic.difficulty).chip}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${difficultyFor(nextTopic.difficulty).dot}`}></span>
                            {nextTopic.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px] leading-none">schedule</span>
                            {nextTopic.estimatedTime}
                          </span>
                          {nextTopic.lessonsCount && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px] leading-none">list_alt</span>
                              {nextTopic.lessonsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 max-w-prose font-body-md text-body-md text-on-surface-variant">
                      {nextTopic.description}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 border-t border-outline-variant pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-outline">
                        {completedDsaCount === 0
                          ? 'Your first module — start here.'
                          : `${completedDsaCount} of ${totalDsaCount} topics behind you.`}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dsa/${nextTopic.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2.5 font-label-md text-label-md text-on-secondary shadow-brand transition-all duration-200 hover:bg-secondary/90 hover:shadow-brand-hover active-press"
                        >
                          Start module
                          <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
                        </Link>
                        <Link
                          href={`/quiz/${nextTopic.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md text-on-surface transition-all duration-200 hover:border-secondary/50 hover:bg-secondary/5 hover:text-secondary active-press"
                        >
                          <span className="material-symbols-outlined text-[18px] leading-none">quiz</span>
                          Quiz
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative p-8 text-center">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-secondary/10 blur-3xl"></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 text-secondary ring-4 ring-secondary/10">
                      <span className="material-symbols-outlined text-[32px] leading-none filled select-none">emoji_events</span>
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary">You've completed all topics!</h3>
                    <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
                      Excellent work. Continue practicing your explanations and coding logic with our Interactive Technical Interview Coach.
                    </p>
                    <Link
                      href="/interview-prep"
                      className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-label-md text-label-md text-on-secondary shadow-brand transition-all duration-200 hover:bg-secondary/90 hover:shadow-brand-hover active-press"
                    >
                      Open Interview Prep
                      <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity — or, for a brand-new learner, a designed "start here" */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
              <h3 className="font-label-md text-label-md flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] leading-none">
                  {lastCompletedTopic ? 'history' : 'rocket_launch'}
                </span>
                {lastCompletedTopic ? 'Recent activity' : 'Start here'}
              </h3>

              {lastCompletedTopic ? (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accentFor(lastCompletedTopic.id).tile}`}>
                      <span className="material-symbols-outlined text-[20px] leading-none filled">check_circle</span>
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-primary">
                        {lastCompletedTopic.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        Marked completed in {lastCompletedTopic.module}
                        {completedAt?.[lastCompletedTopicId] && (
                          <> • {formatTimestamp(completedAt[lastCompletedTopicId])}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dsa/${lastCompletedTopic.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-on-surface transition-all duration-200 hover:border-secondary/50 hover:text-secondary sm:self-center"
                  >
                    Review material
                    <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
                    {isNewLearner
                      ? 'Nothing on the board yet — and that is exactly where every engineer starts. Three steps and your dashboard fills up.'
                      : 'No completed topics yet. Finish a module and it will show up here with the date you cleared it.'}
                  </p>
                  <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { n: 1, icon: 'menu_book', title: 'Read a topic', desc: 'Concepts, code and complexity in one page.' },
                      { n: 2, icon: 'task_alt', title: 'Mark it complete', desc: 'Your progress ring fills as you go.' },
                      { n: 3, icon: 'quiz', title: 'Take the quiz', desc: 'Score 80%+ to ace the topic.' },
                    ].map((step) => (
                      <li key={step.n} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-on-secondary">
                            {step.n}
                          </span>
                          <span className="material-symbols-outlined text-[18px] leading-none text-secondary">{step.icon}</span>
                        </div>
                        <p className="mt-2 font-label-md text-label-md text-on-surface">{step.title}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{step.desc}</p>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={nextTopic ? `/dsa/${nextTopic.slug}` : '/dsa'}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-5 py-2.5 font-label-md text-label-md text-on-secondary shadow-brand transition-all duration-200 hover:bg-secondary/90 hover:shadow-brand-hover active-press"
                  >
                    {nextTopic ? `Open ${nextTopic.title}` : 'Browse the syllabus'}
                    <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Module map + quiz breakdown */}
          <div className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
            <h3 className="font-label-md text-label-md flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] leading-none">quiz</span>
              Quiz breakdown
            </h3>

            {/* Average score summary — a headline number, not a footnote */}
            <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-label-md text-label-md text-on-surface">Average score</p>
                <span className={`rounded-full px-3 py-1 font-headline-sm text-headline-sm ${getScoreColorClass(averageQuizScore, attemptedQuizCount > 0)}`}>
                  {attemptedQuizCount > 0 ? `${averageQuizScore}%` : 'N/A'}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out-expo ${
                    attemptedQuizCount > 0 ? getScoreBarClass(averageQuizScore) : 'bg-outline-variant'
                  }`}
                  style={{ width: `${attemptedQuizCount > 0 ? averageQuizScore : 0}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">
                {attemptedQuizCount > 0 ? (
                  <>Across <strong className="text-on-surface">{attemptedQuizCount}</strong> attempted quiz{attemptedQuizCount > 1 ? 'zes' : ''} • {acedQuizCount} aced</>
                ) : (
                  <>No quizzes attempted yet. Take a topic quiz to evaluate your retention!</>
                )}
              </p>
            </div>

            <ul className="mt-4 flex flex-col divide-y divide-outline-variant">
              {dsaTopics.map((topic) => {
                const quizScore = (quizScores || {})[topic.id]
                const accent = accentFor(topic.id)
                const isCompleted = (completedTopics || []).includes(topic.id)

                return (
                  <li key={topic.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.tile}`}>
                        <span className="material-symbols-outlined text-[18px] leading-none">{topic.iconName}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-body-md text-sm font-semibold text-primary">
                          <span className="truncate">{topic.title}</span>
                          {isCompleted && (
                            <span
                              className="material-symbols-outlined shrink-0 text-[15px] leading-none text-topic-emerald filled"
                              title="Topic completed"
                              aria-label="Topic completed"
                              role="img"
                            >
                              check_circle
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}></span>
                          {topic.module}
                        </p>
                      </div>
                    </div>

                    {quizScore !== undefined ? (
                      <div className="flex w-16 shrink-0 flex-col items-end gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getScoreColorClass(quizScore)}`}>
                          {quizScore}%
                        </span>
                        <span className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
                          <span
                            className={`block h-full rounded-full ${getScoreBarClass(quizScore)}`}
                            style={{ width: `${quizScore}%` }}
                          ></span>
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={`/quiz/${topic.slug}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-semibold text-secondary transition-all duration-200 hover:border-secondary/50 hover:bg-secondary/5"
                      >
                        Take quiz
                        <span className="material-symbols-outlined text-[14px] leading-none">play_arrow</span>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
