import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { analyzeAnswer } from '../utils/aiClient'

const QUESTIONS = [
  {
    id: "vector-resizing",
    title: "Vector Resizing Mechanics",
    question: "How does a dynamic array/vector resize itself when capacity is full?",
    difficulty: "Medium",
    topic: "Arrays",
    hint: "Think about memory reallocation, time complexities (amortized O(1) vs worst-case O(N)), and the capacity growth factor.",
    sampleAnswer: "A vector allocates a contiguous block of memory. When it runs out of capacity, it allocates a new block that is twice the size (or 1.5x in MSVC), copies all elements to the new block, and deletes the old block. This copy is O(N) in the worst case but results in O(1) amortized insertion time."
  },
  {
    id: "vector-vs-list",
    title: "Vector vs. List Memory Layout",
    question: "What are the main performance and memory differences between std::vector and std::list in C++?",
    difficulty: "Medium",
    topic: "Data Structures",
    hint: "Focus on memory layout (contiguous RAM block vs. scattered heap nodes), CPU cache locality, and runtime complexities for lookups, insertions, and deletions.",
    sampleAnswer: "std::vector stores elements contiguously in memory, which allows O(1) random access indexing and is CPU cache-friendly. std::list uses pointers to link scattered nodes, so random access is O(N), but insertion and deletion are O(1) once you have a pointer to the node. Vector suffers from shifting elements on insertion, whereas list suffers from cache misses due to pointer chasing."
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle Detection",
    question: "How do you detect a cycle in a singly linked list using pointers?",
    difficulty: "Easy",
    topic: "Linked Lists",
    hint: "Describe Floyd's Cycle-Finding Algorithm (Tortoise and Hare) and contrast its space/time complexity with a Hash Set approach.",
    sampleAnswer: "We can use Floyd's Tortoise and Hare algorithm. We initialize two pointers, a slow pointer moving 1 step at a time, and a fast pointer moving 2 steps. If there is a cycle, the fast pointer will eventually catch up and meet the slow pointer. Otherwise, the fast pointer will reach the end (nullptr). This takes O(N) time and O(1) auxiliary space, whereas using a Hash Set takes O(N) space."
  },
  {
    id: "recursion-vs-dp",
    title: "Recursion vs. Dynamic Programming",
    question: "What is the difference between simple recursion and dynamic programming?",
    difficulty: "Medium",
    topic: "Algorithms",
    hint: "Discuss overlapping subproblems, memoization (top-down) vs tabulation (bottom-up), and the change in time/space complexity using Fibonacci or similar examples.",
    sampleAnswer: "Recursion is a method where a function calls itself to solve smaller subproblems. Dynamic programming is an optimization over recursion that solves overlapping subproblems by storing their results in a memoization table or tabulation array, avoiding redundant calculations. For example, recursive Fibonacci takes O(2^N) time due to overlapping branches, but DP reduces it to O(N) time."
  }
]

export default function InterviewPrep() {
  const { isLoggedIn, showToast } = useAuth()
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

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl bg-background flex flex-col">
      {/* Page Header */}
      <div className="mb-lg select-none">
        <h1 className="font-display-lg text-display-lg text-primary mb-xs">
          AI Interview Coach
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Assess your conceptual knowledge of C++ and DSA. Draft technical answers to common questions and receive instant, structured critiquing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left column: Questions list */}
        <div className="lg:col-span-4 flex flex-col gap-sm">
          <h2 className="font-headline-md text-headline-md text-primary text-base font-semibold px-xs py-2 select-none border-b border-outline-variant">
            Technical Questions
          </h2>
          <div className="flex flex-col gap-xs max-h-[500px] overflow-y-auto pr-xs">
            {QUESTIONS.map((q) => {
              const isActive = q.id === selectedQuestion.id
              const difficultyColors = 
                q.difficulty === 'Easy' ? 'bg-secondary/10 text-secondary' :
                q.difficulty === 'Medium' ? 'bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant' :
                'bg-error-container/30 text-error'

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  disabled={loading}
                  className={`w-full text-left p-sm rounded-xl border transition-all ${
                    isActive
                      ? 'bg-primary-container border-primary text-white shadow-sm'
                      : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface hover:bg-surface-container-low'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <div className="flex justify-between items-start gap-xs mb-xs">
                    <span className={`text-[10px] font-bold px-sm py-0.5 rounded-full ${difficultyColors}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-outline tracking-wider">
                      {q.topic}
                    </span>
                  </div>
                  <h3 className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-primary'}`}>
                    {q.title}
                  </h3>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right column: Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-md">
          {/* Question Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center gap-xs mb-xs select-none">
              <span className="material-symbols-outlined text-secondary text-sm">help</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-secondary">Active Challenge</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary text-lg mb-sm">
              {selectedQuestion.question}
            </h2>
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-sm">
              <p className="text-xs font-medium text-on-surface-variant flex gap-xs items-start">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 select-none">lightbulb</span>
                <span><strong>Coach Tip: </strong>{selectedQuestion.hint}</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <label htmlFor="answer-input" className="text-xs font-semibold text-primary select-none">
                Your Explanation
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                disabled={loading}
                className="text-[11px] font-medium text-secondary hover:text-on-secondary-container hover:underline disabled:opacity-50"
              >
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
              className="w-full text-xs font-semibold font-body-md border border-outline-variant rounded-lg p-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary bg-surface-container-lowest disabled:bg-surface-container-low disabled:opacity-70 text-on-background"
            />

            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setAnswer('')}
                disabled={!answer.trim() || loading}
                className="px-md py-xs rounded border border-outline-variant hover:bg-surface-container-low transition-colors text-xs font-semibold text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!answer.trim() || loading}
                className="px-lg py-xs rounded bg-secondary text-on-secondary hover:bg-on-secondary-container transition-all text-xs font-semibold shadow-sm flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed active-press"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Answer...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    Analyze Explanation
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback Report */}
          {error && (
            <div className="bg-error-container/10 border border-error/30 rounded-xl p-md text-error flex gap-xs items-start animate-fade-in">
              <span className="material-symbols-outlined text-[20px] select-none">error</span>
              <div className="text-xs">
                <h4 className="font-semibold mb-xs">Analysis Interrupted</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {feedback && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm space-y-md animate-fade-in">
              <div className="flex items-center gap-xs select-none">
                <span className="material-symbols-outlined text-secondary">checklist_rtl</span>
                <h3 className="font-headline-md text-headline-md text-primary text-base font-semibold">
                  AI Evaluator Report
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {/* Strengths */}
                <div className="border border-secondary/20 bg-secondary/5 rounded-xl p-sm">
                  <h4 className="text-xs font-bold text-secondary flex items-center gap-xs mb-xs select-none">
                    <span className="material-symbols-outlined text-[16px] filled">check_circle</span>
                    Strong Areas
                  </h4>
                  <ul className="space-y-xs">
                    {feedback.strengths && feedback.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs font-semibold text-on-surface-variant flex gap-xs items-start leading-relaxed">
                        <span className="text-secondary select-none font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {(!feedback.strengths || feedback.strengths.length === 0) && (
                      <li className="text-xs font-semibold text-outline-variant italic">No major strengths highlighted.</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="border border-error/20 bg-error-container/5 rounded-xl p-sm">
                  <h4 className="text-xs font-bold text-error-container text-red-800 flex items-center gap-xs mb-xs select-none">
                    <span className="material-symbols-outlined text-[16px] filled">cancel</span>
                    Omissions / Weaknesses
                  </h4>
                  <ul className="space-y-xs">
                    {feedback.weaknesses && feedback.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-xs font-semibold text-on-surface-variant flex gap-xs items-start leading-relaxed">
                        <span className="text-error select-none font-bold">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {(!feedback.weaknesses || feedback.weaknesses.length === 0) && (
                      <li className="text-xs font-semibold text-secondary italic">Perfect! No major weaknesses found.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="border border-outline-variant/60 bg-surface-container-low rounded-xl p-sm">
                  <h4 className="text-xs font-bold text-primary flex items-center gap-xs mb-xs select-none">
                    <span className="material-symbols-outlined text-[16px] text-primary">lightbulb</span>
                    Suggested Improvements &amp; Sample Answer
                  </h4>
                  <ul className="space-y-sm">
                    {feedback.suggestions.map((sug, idx) => (
                      <li key={idx} className="text-xs font-semibold text-on-surface-variant leading-relaxed">
                        <p className="bg-white/80 border border-outline-variant/20 rounded p-sm whitespace-pre-wrap">
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
