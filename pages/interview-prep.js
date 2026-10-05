import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { analyzeAnswer } from '../utils/aiClient'
import { interviewQuestions as QUESTIONS } from '../data/interviewQuestions'

// Difficulty is colour-coded with theme-aware roles rather than the fixed topic
// accents, because these labels are small text and have to clear 4.5:1 in both
// schemes. The old map used `tertiary-fixed-dim` + `on-tertiary-fixed-variant`,
// which is dark-indigo-on-dark once the page flips to dark mode.
const DIFFICULTY = {
  Easy: { ink: 'text-secondary', fill: 'bg-secondary', level: 1 },
  Medium: { ink: 'text-tertiary', fill: 'bg-tertiary', level: 2 },
  Hard: { ink: 'text-error', fill: 'bg-error', level: 3 }
}

// Unknown difficulties fall through to the Hard styling, matching the previous
// map's default branch.
const difficultyOf = (label) => DIFFICULTY[label] || DIFFICULTY.Hard

// Topic dots are decoration only, so the fixed topic-* accents are safe here.
const TOPIC_DOTS = {
  Arrays: 'bg-topic-blue',
  'Data Structures': 'bg-topic-violet',
  'Linked Lists': 'bg-topic-amber',
  Algorithms: 'bg-topic-emerald'
}
const topicDot = (topic) => TOPIC_DOTS[topic] || 'bg-topic-cyan'

const TOPIC_COUNT = new Set(QUESTIONS.map((q) => q.topic)).size

const HOW_IT_WORKS = [
  { icon: 'list_alt', title: 'Pick a question', body: 'Choose a topic and difficulty from the bank.' },
  { icon: 'edit_note', title: 'Explain it in your words', body: 'Write the answer you would say out loud.' },
  { icon: 'insights', title: 'Get a structured critique', body: 'Strengths, gaps and a model answer.' }
]

export default function InterviewPrep() {
  const { showToast } = useAuth()
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0])
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q)
    setAnswer('')
    setFeedback(null)
    setError(null)
  }

  const handleFillSample = () => {
    setAnswer(selectedQuestion.sampleAnswer)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim() || loading) return

    setLoading(true)
    setError(null)
    setFeedback(null)

    try {
      const response = await analyzeAnswer(answer, selectedQuestion.question)
      setFeedback(response)
      showToast("Analysis complete! Review your feedback below. 🎯", "success")
    } catch (err) {
      setError(err.message || "Failed to analyze answer. Please try again.")
      showToast("Analysis failed. Please check your network or try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Read-only derivations for the UI. No new state, no new behaviour.
  const activeIndex = QUESTIONS.findIndex((q) => q.id === selectedQuestion.id)
  const activeDifficulty = difficultyOf(selectedQuestion.difficulty)
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const strengths = (feedback && feedback.strengths) || []
  const weaknesses = (feedback && feedback.weaknesses) || []
  const suggestions = (feedback && feedback.suggestions) || []

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg bg-background flex flex-col">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 select-none">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary-container/50 px-3 py-1.5">
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-tertiary">
            mic
          </span>
          <span className="font-label-md text-label-md text-on-tertiary-container">Practice mode</span>
        </span>

        <h1 className="font-display-lg text-headline-lg-mobile text-primary sm:text-headline-lg lg:text-display-lg">
          AI Interview Coach
        </h1>

        <p className="max-w-prose font-body-md text-body-md text-on-surface-variant">
          Assess your conceptual knowledge of C++ and DSA. Draft technical answers to common
          questions and receive instant, structured critiquing.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            { icon: 'quiz', label: `${QUESTIONS.length} questions` },
            { icon: 'category', label: `${TOPIC_COUNT} topics` },
            { icon: 'bolt', label: 'Instant feedback' }
          ].map((fact) => (
            <span key={fact.label} className="flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">
                {fact.icon}
              </span>
              <span className="font-label-md text-label-md text-on-surface">{fact.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left column: Questions list */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2 border-b border-outline-variant pb-3 select-none">
            <h2 className="font-headline-sm text-headline-sm text-primary">Technical Questions</h2>
            <span className="font-label-md text-[12px] text-on-surface-variant">
              {activeIndex + 1} / {QUESTIONS.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 lg:max-h-[560px] lg:overflow-y-auto lg:pr-2">
            {QUESTIONS.map((q, index) => {
              const isActive = q.id === selectedQuestion.id
              const difficulty = difficultyOf(q.difficulty)

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  disabled={loading}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? // Was `text-white` on `bg-primary-container` — white ink on a pale
                        // mint container, i.e. unreadable in light mode. The container's own
                        // on-* role is legible in both schemes.
                        'bg-primary-container border-primary/40 text-on-primary-container shadow-card'
                      : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface hover:border-outline-variant hover:bg-surface-container-low'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-label-md text-[12px] ${
                        isActive
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ring-outline/30 ${difficulty.ink}`}
                        >
                          {q.difficulty}
                          <span aria-hidden="true" className="flex items-center gap-0.5">
                            {[1, 2, 3].map((step) => (
                              <span
                                key={step}
                                className={`h-2.5 w-0.5 rounded-full ${
                                  step <= difficulty.level ? difficulty.fill : 'bg-outline/25'
                                }`}
                              ></span>
                            ))}
                          </span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isActive ? 'text-on-primary-container/80' : 'text-on-surface-variant'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${topicDot(q.topic)}`}
                          ></span>
                          {q.topic}
                        </span>
                      </div>

                      <h3
                        className={`font-label-md text-body-sm font-semibold leading-snug ${
                          isActive ? 'text-on-primary-container' : 'text-primary'
                        }`}
                      >
                        {q.title}
                      </h3>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right column: Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-md">
          {/* Question Details */}
          <div className="relative overflow-hidden bg-surface-container-lowest border border-outline-variant rounded-2xl p-md shadow-card">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gradient"></span>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 select-none">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">
                  help
                </span>
                <span className="font-label-md text-[12px] uppercase tracking-[0.14em] text-secondary">
                  Active Challenge
                </span>
              </span>

              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ring-outline/30 ${activeDifficulty.ink}`}
                >
                  {selectedQuestion.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${topicDot(selectedQuestion.topic)}`}
                  ></span>
                  {selectedQuestion.topic}
                </span>
              </span>
            </div>

            <h2 className="mb-4 max-w-prose font-headline-md text-headline-sm text-primary sm:text-headline-md">
              {selectedQuestion.question}
            </h2>

            <div className="rounded-xl border border-tertiary/20 bg-tertiary-container/40 p-4">
              <p className="flex gap-3 items-start font-body-sm text-body-sm text-on-surface">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[20px] text-tertiary shrink-0 select-none"
                >
                  lightbulb
                </span>
                <span>
                  <strong className="font-semibold text-on-tertiary-container">Coach Tip: </strong>
                  {selectedQuestion.hint}
                </span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md shadow-card flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="answer-input"
                className="font-label-md text-label-md text-primary select-none"
              >
                Your Explanation
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-label-md text-[12px] text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-50"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                  auto_fix_high
                </span>
                Auto-fill Sample Answer
              </button>
            </div>

            <textarea
              id="answer-input"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Explain the concept in your own words, including code syntax, complexities, or layouts where appropriate..."
              disabled={loading}
              className="w-full font-body-md text-body-sm border border-outline-variant rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary bg-surface-container-low disabled:opacity-70 text-on-background placeholder:text-on-surface-variant resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-body-sm text-[12px] text-on-surface-variant" aria-live="polite">
                {wordCount === 0
                  ? 'Aim for 60–120 words, like a spoken answer.'
                  : `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
              </span>

              <div className="flex gap-sm">
                <button
                  type="button"
                  onClick={() => setAnswer('')}
                  disabled={!answer.trim() || loading}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={!answer.trim() || loading}
                  className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 shadow-brand hover:shadow-brand-hover transition-all font-label-md text-label-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active-press"
                >
                  {loading ? (
                    <>
                      {/* border-current, not border-white: on-secondary flips to near-black
                          in dark mode and a white spinner no longer matches the label. */}
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                      ></span>
                      Analyzing Answer...
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                        analytics
                      </span>
                      Analyze Explanation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Feedback Report */}
          {error && (
            <div className="bg-error-container/50 border border-error/30 rounded-2xl p-md text-on-error-container flex gap-3 items-start animate-fade-in">
              <span aria-hidden="true" className="material-symbols-outlined text-[22px] select-none">
                error
              </span>
              <div>
                <h4 className="font-headline-sm text-body-md font-semibold">Analysis Interrupted</h4>
                <p className="font-body-sm text-body-sm">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md shadow-card animate-fade-in">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"
                ></span>
                <p className="font-label-md text-label-md text-primary">
                  Reading your explanation and scoring it against the model answer...
                </p>
              </div>
              <div className="mt-4 space-y-2" aria-hidden="true">
                <span className="block h-2.5 w-11/12 rounded-full bg-surface-container-high animate-pulse"></span>
                <span className="block h-2.5 w-9/12 rounded-full bg-surface-container-high animate-pulse"></span>
                <span className="block h-2.5 w-10/12 rounded-full bg-surface-container-high animate-pulse"></span>
              </div>
            </div>
          )}

          {/* Designed zero state, so the workspace does not simply stop after the form. */}
          {!feedback && !error && !loading && (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
              <span
                aria-hidden="true"
                className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary/10 text-secondary"
              >
                <span className="material-symbols-outlined text-[28px]">rate_review</span>
              </span>
              <h3 className="mt-4 font-headline-sm text-headline-sm text-primary">
                Your coaching report lands here
              </h3>
              <p className="mx-auto mt-1 max-w-prose font-body-sm text-body-sm text-on-surface-variant">
                Answer in your own words first — the critique is far more useful than the sample
                answer you can already read.
              </p>

              <ol className="mx-auto mt-6 grid gap-3 text-left sm:grid-cols-3">
                {HOW_IT_WORKS.map((step, index) => (
                  <li
                    key={step.title}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="grid h-6 w-6 place-items-center rounded-full bg-secondary/10 font-label-md text-[11px] text-secondary"
                      >
                        {index + 1}
                      </span>
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-[18px] text-on-surface-variant"
                      >
                        {step.icon}
                      </span>
                    </span>
                    <h4 className="mt-2 font-label-md text-label-md text-primary">{step.title}</h4>
                    <p className="font-body-sm text-[13px] leading-snug text-on-surface-variant">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {feedback && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md shadow-card space-y-md animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-4 select-none">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-secondary">
                    checklist_rtl
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    AI Evaluator Report
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-label-md text-[11px] text-secondary">
                    {strengths.length} strong
                  </span>
                  <span className="rounded-full bg-error/10 px-2.5 py-1 font-label-md text-[11px] text-error">
                    {weaknesses.length} to fix
                  </span>
                  <span className="rounded-full bg-tertiary/10 px-2.5 py-1 font-label-md text-[11px] text-tertiary">
                    {suggestions.length} tips
                  </span>
                </div>
              </div>

              {/* Three colour-coded verdicts: teal = kept, red = missed, indigo = next. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {/* Strengths */}
                <div className="overflow-hidden rounded-xl border border-secondary/25 bg-secondary-container/40">
                  <h4 className="flex items-center gap-2 border-b border-secondary/20 bg-secondary/10 px-4 py-2.5 font-label-md text-label-md text-on-secondary-container select-none">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px] filled">
                      check_circle
                    </span>
                    Strong Areas
                  </h4>
                  <ul className="space-y-2 p-4">
                    {strengths.map((str, idx) => (
                      <li
                        key={idx}
                        className="font-body-sm text-body-sm text-on-surface flex gap-2 items-start leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary select-none"
                        ></span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {strengths.length === 0 && (
                      <li className="font-body-sm text-body-sm italic text-on-surface-variant">
                        No major strengths highlighted.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="overflow-hidden rounded-xl border border-error/25 bg-error-container/40">
                  {/* Was `text-error-container text-red-800`: two competing text colours on one
                      element, the winner being a hardcoded red that never adapts to dark mode. */}
                  <h4 className="flex items-center gap-2 border-b border-error/20 bg-error/10 px-4 py-2.5 font-label-md text-label-md text-on-error-container select-none">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px] filled">
                      cancel
                    </span>
                    Omissions / Weaknesses
                  </h4>
                  <ul className="space-y-2 p-4">
                    {weaknesses.map((weak, idx) => (
                      <li
                        key={idx}
                        className="font-body-sm text-body-sm text-on-surface flex gap-2 items-start leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-error select-none"
                        ></span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {weaknesses.length === 0 && (
                      <li className="flex items-center gap-2 font-body-sm text-body-sm text-on-secondary-container">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-[18px] filled text-secondary"
                        >
                          verified
                        </span>
                        Perfect! No major weaknesses found.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-tertiary/25 bg-tertiary-container/40">
                  <h4 className="flex items-center gap-2 border-b border-tertiary/20 bg-tertiary/10 px-4 py-2.5 font-label-md text-label-md text-on-tertiary-container select-none">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px] filled">
                      lightbulb
                    </span>
                    Suggested Improvements &amp; Sample Answer
                  </h4>
                  <ul className="space-y-3 p-4">
                    {suggestions.map((sug, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span
                          aria-hidden="true"
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tertiary/15 font-label-md text-[11px] text-tertiary"
                        >
                          {idx + 1}
                        </span>
                        {/* Was `bg-white/80`, which stayed white on a dark page. */}
                        <p className="flex-1 whitespace-pre-wrap rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-4 font-body-sm text-body-sm leading-relaxed text-on-surface">
                          {sug}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
