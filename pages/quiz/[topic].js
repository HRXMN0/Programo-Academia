import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import { quizzes } from '../../data/quizzes'
import { topics } from '../../data/topics'
import { useAuth } from '../../context/AuthContext'

/* Per-topic accent palette — mirrors /dsa and /dsa/[slug] so a quiz is visibly
   the same colour as the lesson it came from. Class strings are spelled out in
   full because Tailwind cannot resolve `bg-topic-${key}`. */
const TOPIC_ACCENTS = {
  "arrays":              { fill: 'bg-topic-blue',    tint: 'bg-topic-blue/10',    border: 'border-topic-blue/45' },
  "linked-lists":        { fill: 'bg-topic-violet',  tint: 'bg-topic-violet/10',  border: 'border-topic-violet/45' },
  "stacks-queues":       { fill: 'bg-topic-amber',   tint: 'bg-topic-amber/10',   border: 'border-topic-amber/45' },
  "trees":               { fill: 'bg-topic-emerald', tint: 'bg-topic-emerald/10', border: 'border-topic-emerald/45' },
  "graphs":              { fill: 'bg-topic-rose',    tint: 'bg-topic-rose/10',    border: 'border-topic-rose/45' },
  "dynamic-programming": { fill: 'bg-topic-cyan',    tint: 'bg-topic-cyan/10',    border: 'border-topic-cyan/45' }
}
const FALLBACK_ACCENT = { fill: 'bg-secondary', tint: 'bg-secondary/10', border: 'border-secondary/45' }
const accentFor = (id) => TOPIC_ACCENTS[id] || FALLBACK_ACCENT

/* The only ink legible on a solid accent fill — white drops to 2.1:1 on amber.
   Paired with icons and large numerals only, never with small text. */
const ACCENT_INK = 'text-on-primary-fixed'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// Progress-ring geometry for the result screen.
const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// Big-O style answers read better in the mono face; prose answers do not.
const isCodeLike = (value) => /^O\s*\(/i.test(String(value).trim())

export default function QuizPage() {
  const router = useRouter()
  const { topic: topicId } = router.query
  const { saveQuizScore } = useAuth()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  if (!router.isReady) {
    return (
      <main className="flex-grow flex items-center justify-center px-gutter py-lg">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading quiz"></div>
      </main>
    )
  }

  const topicQuestions = quizzes[topicId]
  const topicData = topics.find(t => t.id === topicId)
  const accent = accentFor(topicId)
  const topicLabel = topicData ? topicData.title.split(':')[0] : 'DSA Topic'

  // Handle fallback if no quiz is found
  if (!topicQuestions || topicQuestions.length === 0) {
    // Only three of the six topics have questions written so far — say so, and
    // point at the ones that are actually ready instead of dead-ending.
    const readyQuizzes = topics.filter(
      t => t.track === 'dsa' && Array.isArray(quizzes[t.id]) && quizzes[t.id].length > 0
    )

    return (
      <main className="flex-grow w-full px-gutter py-8 md:py-12">
        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card overflow-hidden animate-fade-in">
          <span aria-hidden="true" className={`block h-1.5 ${accent.fill}`} />

          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border ${accent.tint} ${accent.border}`}>
                <span className="material-symbols-outlined text-[28px] text-on-surface">hourglass_top</span>
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  {topicLabel}
                </span>
                <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mt-1">
                  This quiz is still being written
                </h1>
              </div>
            </div>

            <p className="mt-5 text-body-lg text-on-surface-variant max-w-prose">
              There is no quiz configured for this topic yet. Go back to study the content or explore other sections — the questions land here as soon as they are ready.
            </p>

            {readyQuizzes.length > 0 && (
              <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <h2 className="text-label-md text-on-surface-variant uppercase tracking-[0.12em] text-[11px] font-bold mb-3">
                  Quizzes ready to take now
                </h2>
                <div className="flex flex-wrap gap-2">
                  {readyQuizzes.map(t => {
                    const tAccent = accentFor(t.id)
                    return (
                      <Link
                        key={t.id}
                        href={`/quiz/${t.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface hover:border-secondary hover:shadow-card transition-all"
                      >
                        <span className={`w-2 h-2 rounded-full ${tAccent.fill}`} aria-hidden="true" />
                        {t.title.split(':')[0]}
                        <span className="text-on-surface-variant font-normal">
                          {quizzes[t.id].length} Q
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {topicData && (
                <Link
                  href={`/dsa/${topicData.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary text-on-secondary text-label-md px-5 py-3 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 transition-all active-press"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Back to topic
                </Link>
              )}
              <Link
                href="/dsa"
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface px-5 py-3 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">route</span>
                Syllabus overview
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const currentQuestion = topicQuestions[currentIdx]
  const totalQuestions = topicQuestions.length

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return // Ensure an option is selected and not already submitted

    const isCorrect = selectedOption === currentQuestion.answer
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    setIsSubmitted(true)
  }

  const handleNext = () => {
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx(prev => prev + 1)
      setSelectedOption(null)
      setIsSubmitted(false)
    } else {
      const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
      saveQuizScore(topicId, scorePercentage)
      setShowResults(true)
    }
  }

  const handleRetake = () => {
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsSubmitted(false)
    setScore(0)
    setShowResults(false)
  }

  // Calculate progress percentage
  const progressPercent = totalQuestions > 0 ? ((currentIdx + (isSubmitted ? 1 : 0)) / totalQuestions) * 100 : 0

  if (showResults) {
    const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    const passed = scorePercentage >= 70

    // Custom summary messages based on performance
    let resultTitle = "Review Needed"
    let resultMessage = "Keep studying the lesson materials and try again to master these core concepts."
    let resultIcon = "sentiment_dissatisfied"
    let badgeColor = "border-error/40 bg-error/10"
    let badgeDot = "bg-error"
    let ringStroke = "stroke-error"
    let iconChip = "bg-error text-on-error"

    if (scorePercentage === 100) {
      resultTitle = "Perfect Score! 🏆"
      resultMessage = "Incredible work! You have fully mastered these structural patterns and are ready for the next challenge."
      resultIcon = "emoji_events"
      badgeColor = "border-topic-amber/45 bg-topic-amber/10"
      badgeDot = "bg-topic-amber"
      ringStroke = "stroke-topic-amber"
      iconChip = `bg-topic-amber ${ACCENT_INK}`
    } else if (passed) {
      resultTitle = "Passed! 🎉"
      resultMessage = "Great job! You have demonstrated a solid understanding of this topic's concepts."
      resultIcon = "check_circle"
      badgeColor = "border-secondary/40 bg-secondary/10"
      badgeDot = "bg-secondary"
      ringStroke = "stroke-secondary"
      iconChip = "bg-secondary text-on-secondary"
    }

    return (
      <main className="flex-grow w-full px-gutter py-8 md:py-12">
        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lifted overflow-hidden animate-fade-in">
          <span aria-hidden="true" className={`block h-1.5 ${accent.fill}`} />

          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              {topicLabel} &middot; Practice quiz
            </span>

            {/* Score ring */}
            <div className="relative w-32 h-32 mt-5">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r={RING_RADIUS} fill="none" strokeWidth="9" className="stroke-surface-container-high" />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className={`${ringStroke} transition-all duration-700 ease-out-expo`}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - scorePercentage / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-headline-lg text-primary leading-none">{scorePercentage}%</span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">score</span>
              </div>
              <span className={`absolute bottom-0 right-0 w-11 h-11 rounded-full flex items-center justify-center shadow-card ${iconChip}`}>
                <span className="material-symbols-outlined filled text-[24px]">{resultIcon}</span>
              </span>
            </div>

            <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mt-6">{resultTitle}</h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold text-on-surface ${badgeColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} aria-hidden="true" />
                {passed ? 'Passed' : 'Below 70% pass mark'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-[12px] font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[14px] text-secondary filled">check_circle</span>
                {score} correct
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-[12px] font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[14px]">help</span>
                {totalQuestions} questions
              </span>
            </div>

            <p className="mt-5 text-body-lg text-on-surface-variant max-w-prose">
              {resultMessage}
            </p>

            <div className="mt-7 pt-6 border-t border-outline-variant w-full flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetake}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface px-5 py-3 hover:bg-surface-container-high transition-colors hover-lift active-press"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                Retake quiz
              </button>

              {topicData && (
                <Link
                  href={`/dsa/${topicData.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-on-secondary text-label-md px-5 py-3 shadow-brand hover:shadow-brand-hover transition-all hover-lift active-press"
                >
                  Back to lesson
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              )}

              <Link
                href="/dsa"
                className="inline-flex items-center justify-center gap-2 rounded-lg text-label-md text-on-surface-variant px-5 py-3 hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">route</span>
                Syllabus
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full px-gutter py-8 md:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* ── Quiz header: which topic am I being tested on ───────────────── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accent.fill} ${ACCENT_INK}`}>
              <span className="material-symbols-outlined filled">
                {topicData && topicData.iconName ? topicData.iconName : 'quiz'}
              </span>
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                Practice quiz
              </span>
              <h1 className="text-headline-sm md:text-headline-md text-primary truncate">{topicLabel}</h1>
            </div>
          </div>

          {topicData && (
            <Link
              href={`/dsa/${topicData.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span className="hidden sm:inline">Back to lesson</span>
            </Link>
          )}
        </div>

        {/* Key is set to currentIdx so that changing questions triggers a fresh animate-fade-in */}
        <div
          key={currentIdx}
          className="rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-card overflow-hidden animate-fade-in"
        >
          {/* Continuous progress across the whole question set */}
          <div className="h-1.5 w-full bg-surface-container-high" aria-hidden="true">
            <div
              className={`h-full ${accent.fill} transition-all duration-500 ease-out-expo`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Question counter + per-question step dots */}
            <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant whitespace-nowrap">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {topicQuestions.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i < currentIdx
                          ? 'w-4 bg-secondary'
                          : i === currentIdx
                            ? `w-8 ${accent.fill}`
                            : 'w-4 bg-surface-container-high'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 text-[12px] font-semibold text-on-surface tabular-nums">
                <span className="material-symbols-outlined text-[14px] text-secondary filled">check_circle</span>
                {score} correct
              </span>
            </div>

            {/* Question */}
            <div className="mt-6">
              <h2 className="text-headline-md md:text-headline-lg text-primary">
                {currentQuestion.question}
              </h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Select the correct option below.
              </p>
            </div>

            {/* Options */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(currentQuestion.options).map(([key, value], optIdx) => {
                const isSelected = selectedOption === key
                const isCorrectAnswer = currentQuestion.answer === key

                /* Four visually distinct states. "Selected but not graded yet"
                   uses indigo so it can never be mistaken for the green of a
                   graded-correct answer. */
                let cardStyle = 'border-outline-variant bg-surface-container-lowest hover:border-secondary/50 hover:shadow-card'
                let badgeStyle = 'border-outline-variant bg-surface-container-low text-on-surface-variant'
                let badgeContent = OPTION_LETTERS[optIdx] || String(optIdx + 1)
                let statusLabel = null

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    cardStyle = 'border-topic-emerald bg-topic-emerald/10 ring-2 ring-topic-emerald/25'
                    badgeStyle = `border-topic-emerald bg-topic-emerald ${ACCENT_INK}`
                    badgeContent = <span className="material-symbols-outlined text-[18px]">check</span>
                    statusLabel = isSelected ? 'Correct — your answer' : 'Correct answer'
                  } else if (isSelected) {
                    cardStyle = 'border-error bg-error/10 ring-2 ring-error/25'
                    badgeStyle = 'border-error bg-error text-on-error'
                    badgeContent = <span className="material-symbols-outlined text-[18px]">close</span>
                    statusLabel = 'Your answer'
                  } else {
                    cardStyle = 'border-outline-variant bg-surface-container-lowest opacity-60'
                  }
                } else if (isSelected) {
                  cardStyle = 'border-tertiary bg-tertiary/10 ring-2 ring-tertiary/25'
                  badgeStyle = 'border-tertiary bg-tertiary text-on-tertiary'
                }

                return (
                  <label
                    key={key}
                    className={`block cursor-pointer transition-all active-press ${isSubmitted ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name="quiz-option"
                      value={key}
                      checked={isSelected}
                      onChange={() => setSelectedOption(key)}
                      className="peer sr-only"
                      disabled={isSubmitted}
                    />
                    {/* The real radio is visually hidden, so its focus ring has
                        to be forwarded onto the card the user actually sees. */}
                    <div className={`h-full rounded-xl border p-4 flex items-start gap-3 transition-all duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary ${cardStyle}`}>
                      <span
                        className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-[13px] font-bold transition-colors ${badgeStyle}`}
                        aria-hidden="true"
                      >
                        {badgeContent}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-on-surface ${isCodeLike(value) ? 'font-code-block text-code-block' : 'text-body-md'}`}>
                          {value}
                        </span>
                        {statusLabel && (
                          <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                            {statusLabel}
                          </span>
                        )}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Correct/Incorrect Explanation Card */}
            {isSubmitted && (
              <div
                className={`mt-5 rounded-xl border p-4 sm:p-5 flex gap-3 items-start animate-fade-in ${
                  selectedOption === currentQuestion.answer
                    ? 'border-topic-emerald/40 bg-topic-emerald/10'
                    : 'border-error/40 bg-error/10'
                }`}
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    selectedOption === currentQuestion.answer
                      ? `bg-topic-emerald ${ACCENT_INK}`
                      : 'bg-error text-on-error'
                  }`}
                >
                  <span className="material-symbols-outlined filled text-[20px]">
                    {selectedOption === currentQuestion.answer ? 'check_circle' : 'cancel'}
                  </span>
                </span>
                <div className="min-w-0">
                  <h3 className="text-headline-sm text-primary mb-1">
                    {selectedOption === currentQuestion.answer ? 'Correct!' : 'Incorrect Answer'}
                  </h3>
                  <p className="text-body-md text-on-surface-variant max-w-prose">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-body-sm text-on-surface-variant">
                {isSubmitted
                  ? currentIdx + 1 < totalQuestions
                    ? `${totalQuestions - currentIdx - 1} question${totalQuestions - currentIdx - 1 === 1 ? '' : 's'} to go.`
                    : 'That was the last question.'
                  : 'Pick an option, then submit to see the explanation.'}
              </p>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg text-label-md px-6 py-3 transition-all shrink-0 ${
                    selectedOption
                      ? 'bg-secondary text-on-secondary shadow-brand hover:shadow-brand-hover cursor-pointer hover-lift active-press'
                      : 'bg-surface-container-high text-on-surface-variant opacity-60 cursor-not-allowed'
                  }`}
                >
                  Submit answer
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-on-secondary text-label-md px-6 py-3 shadow-brand hover:shadow-brand-hover transition-all shrink-0 hover-lift active-press"
                >
                  {currentIdx + 1 < totalQuestions ? 'Next question' : 'Finish quiz'}
                  <span className="material-symbols-outlined text-[18px]">
                    {currentIdx + 1 < totalQuestions ? 'arrow_forward' : 'flag'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
