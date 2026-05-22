import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import { quizzes } from '../../data/quizzes'
import { topics } from '../../data/topics'
import { useAuth } from '../../context/AuthContext'

export default function QuizPage() {
  const router = useRouter()
  const { topic: topicId } = router.query
  const { saveQuizScore } = useAuth()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  if (!router.isReady) return null

  const topicQuestions = quizzes[topicId]
  const topicData = topics.find(t => t.id === topicId)

  // Handle fallback if no quiz is found
  if (!topicQuestions || topicQuestions.length === 0) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md text-center flex flex-col items-center gap-md">
          <div className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">quiz</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary">No Quiz Available</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            There is no quiz configured for this topic yet. Go back to study the content or explore other sections.
          </p>
          <div className="flex gap-sm">
            {topicData && (
              <Link href={`/dsa/${topicData.slug}`} className="bg-secondary text-on-secondary font-label-md text-label-md px-lg py-sm rounded hover:bg-on-secondary-container transition-colors shadow-sm">
                Back to Topic
              </Link>
            )}
            <Link href="/dsa" className="border border-primary text-primary font-label-md text-label-md px-lg py-sm rounded hover:bg-surface-container-low transition-colors">
              Syllabus Overview
            </Link>
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
    let badgeColor = "bg-error-container text-error"

    if (scorePercentage === 100) {
      resultTitle = "Perfect Score! 🏆"
      resultMessage = "Incredible work! You have fully mastered these structural patterns and are ready for the next challenge."
      resultIcon = "emoji_events"
      badgeColor = "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
    } else if (passed) {
      resultTitle = "Passed! 🎉"
      resultMessage = "Great job! You have demonstrated a solid understanding of this topic's concepts."
      resultIcon = "check_circle"
      badgeColor = "bg-secondary-container text-on-secondary-container border border-secondary/20"
    }

    return (
      <main className="flex-grow flex items-center justify-center p-gutter bg-background min-h-[80vh]">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col gap-lg items-center text-center shadow-sm animate-fade-in">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${passed ? 'bg-secondary/10 text-secondary' : 'bg-error-container text-error'}`}>
            <span className="material-symbols-outlined text-5xl">
              {resultIcon}
            </span>
          </div>

          <div className="flex flex-col gap-xs">
            <span className={`px-sm py-xs rounded text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
              {scorePercentage}% Score
            </span>
            <h1 className="font-display-lg text-display-lg text-primary mt-sm">{resultTitle}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold text-primary">{totalQuestions}</span> questions.
            </p>
          </div>

          {/* Results Score Bar */}
          <div className="w-full bg-surface-container-high rounded h-2 overflow-hidden max-w-xs mt-xs">
            <div className={`h-full ${passed ? 'bg-secondary' : 'bg-error'}`} style={{ width: `${scorePercentage}%` }}></div>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            {resultMessage}
          </p>

          <div className="flex gap-sm w-full md:w-auto justify-center mt-md">
            <button 
              onClick={handleRetake} 
              className="border border-outline-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md px-lg py-sm rounded text-primary flex items-center justify-center gap-xs hover-lift active-press"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              Retake Quiz
            </button>
            {topicData && (
              <Link 
                href={`/dsa/${topicData.slug}`} 
                className="bg-secondary text-on-secondary hover:bg-on-secondary-container transition-colors font-label-md text-label-md px-lg py-sm rounded font-medium shadow-sm flex items-center justify-center gap-xs hover-lift active-press"
              >
                Back to Lesson
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow flex items-center justify-center p-gutter bg-background min-h-[80vh]">
      {/* Key is set to currentIdx so that changing questions triggers a fresh animate-fade-in */}
      <div 
        key={currentIdx} 
        className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col gap-lg shadow-sm animate-fade-in"
      >
        {/* Animated Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5 overflow-hidden rounded-full mb-xs">
          <div 
            className="bg-secondary h-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Quiz Header / Progress */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-base">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-xs">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <span className="inline-block bg-surface-container px-sm py-xs rounded text-xs font-label-md text-on-surface-variant capitalize">
            {topicData ? topicData.title.split(':')[0] : 'DSA Topic'}
          </span>
        </div>

        {/* Question */}
        <div className="flex flex-col gap-md">
          <h1 className="font-headline-lg text-headline-lg text-primary md:text-2xl text-xl font-semibold leading-snug">
            {currentQuestion.question}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Select the correct option below.</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = selectedOption === key
            const isCorrectAnswer = currentQuestion.answer === key
            
            // Set option card styling based on submission state
            let cardStyle = "border-outline-variant hover:shadow-[0px_4px_12px_rgba(11,31,58,0.05)] hover:border-secondary/40 bg-surface-container-lowest"
            let iconStyle = "border-outline-variant"
            let iconContent = null

            if (isSubmitted) {
              if (isCorrectAnswer) {
                cardStyle = "border-secondary bg-secondary/5 ring-1 ring-secondary/20"
                iconStyle = "bg-secondary border-secondary text-on-secondary"
                iconContent = "check"
              } else if (isSelected) {
                cardStyle = "border-error bg-error-container/10 ring-1 ring-error/20"
                iconStyle = "bg-error border-error text-on-error"
                iconContent = "close"
              } else {
                cardStyle = "border-outline-variant opacity-60 pointer-events-none"
              }
            } else if (isSelected) {
              cardStyle = "border-secondary ring-2 ring-secondary/20 bg-secondary/5"
              iconStyle = "border-secondary bg-secondary text-on-secondary"
              iconContent = "check"
            }

            return (
              <label 
                key={key} 
                className={`option-card cursor-pointer relative group block transition-all active-press ${isSubmitted ? 'pointer-events-none' : ''}`}
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
                <div className={`h-full border rounded p-md flex items-center gap-md transition-all duration-200 ${cardStyle}`}>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${iconStyle}`}>
                    {iconContent && <span className="material-symbols-outlined text-[14px]">{iconContent}</span>}
                  </div>
                  <span className="font-code-block text-code-block text-on-background text-sm">{value}</span>
                </div>
              </label>
            )
          })}
        </div>

        {/* Actions & Feedback */}
        <div className="flex flex-col gap-md pt-base border-t border-outline-variant">
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`font-label-md text-label-md px-xl py-sm rounded w-full md:w-auto self-end transition-all shadow-sm font-medium hover-lift active-press ${
                selectedOption 
                  ? 'bg-secondary text-on-secondary hover:bg-on-secondary-container hover:shadow-md cursor-pointer' 
                  : 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="bg-secondary text-on-secondary hover:bg-on-secondary-container font-label-md text-label-md px-xl py-sm rounded w-full md:w-auto self-end transition-colors font-medium shadow-sm hover-lift active-press"
            >
              {currentIdx + 1 < totalQuestions ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}

          {/* Correct/Incorrect Explanation Card */}
          {isSubmitted && (
            <div className={`rounded p-md border mt-sm animate-fade-in flex gap-sm items-start ${
              selectedOption === currentQuestion.answer 
                ? 'border-secondary/30 bg-secondary/5 text-on-secondary-fixed-variant' 
                : 'border-error/30 bg-error-container/5 text-on-error-container'
            }`}>
              <span className={`material-symbols-outlined ${selectedOption === currentQuestion.answer ? 'text-secondary' : 'text-error'}`}>
                {selectedOption === currentQuestion.answer ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h4 className="font-bold font-label-md text-label-md mb-xs">
                  {selectedOption === currentQuestion.answer ? 'Correct!' : 'Incorrect Answer'}
                </h4>
                <p className="font-body-md text-body-md leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
