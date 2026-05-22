import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '../context/AuthContext'
import { topics } from '../data/topics'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Dashboard() {
  const router = useRouter()
  const { isLoggedIn, isLoaded, user, completedTopics: authCompletedTopics = [], quizScores: authQuizScores = {} } = useAuth()

  // Local state — seeded from AuthContext, kept fresh by onSnapshot
  const [completedTopics, setCompletedTopics] = useState(authCompletedTopics || [])
  const [quizScores, setQuizScores] = useState(authQuizScores || {})

  // Real-time listener scoped only to dashboard page
  useEffect(() => {
    if (!user?.uid) return

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setCompletedTopics(data.completedTopics || [])
        setQuizScores(data.quizScores || {})
      }
    })

    return () => unsubscribe()
  }, [user?.uid])

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoaded, isLoggedIn, router])

  if (!isLoaded || !isLoggedIn) {
    const loadingMessage = (isLoaded && !isLoggedIn) ? "Redirecting..." : "Loading your dashboard...";
    return (
      <main className="flex-grow flex items-center justify-center bg-background min-h-[70vh]">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-md text-label-md text-on-surface-variant animate-pulse">{loadingMessage}</p>
        </div>
      </main>
    )
  }

  // Progress metrics
  const dsaTopics = topics.filter(t => t.track === 'dsa')
  const totalDsaCount = dsaTopics.length
  const completedDsaCount = dsaTopics.filter(t => (completedTopics || []).includes(t.id)).length
  const overallProgress = totalDsaCount > 0 ? Math.round((completedDsaCount / totalDsaCount) * 100) : 0

  // Smart next-topic recommendation (first uncompleted topic in syllabus order)
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const nextTopic = sortedTopics.find(t => !(completedTopics || []).includes(t.id)) || null

  // Last completed topic (the last item added to the completedTopics array)
  const lastCompletedTopicId = (completedTopics || []).length > 0 ? (completedTopics || [])[(completedTopics || []).length - 1] : null
  const lastCompletedTopic = lastCompletedTopicId ? topics.find(t => t.id === lastCompletedTopicId) : null

  // Quiz analytics
  const quizEntries = Object.entries(quizScores || {})
  const attemptedQuizCount = quizEntries.length
  const totalScoreSum = quizEntries.reduce((sum, [_, score]) => sum + score, 0)
  const averageQuizScore = attemptedQuizCount > 0 ? Math.round(totalScoreSum / attemptedQuizCount) : 0

  const getScoreColorClass = (score, isAttempted = true) => {
    if (!isAttempted) return 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
    if (score >= 80) return 'bg-secondary/10 text-secondary border border-secondary/20'
    if (score >= 50) return 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
    return 'bg-error/10 text-error border border-error/20'
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <main className="flex-grow w-full bg-background px-gutter py-xl">
      <Head>
        <title>Programo Academia - Dashboard</title>
      </Head>

      <div className="max-w-container-max mx-auto space-y-md">
        {/* Welcome Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-low rounded-bl-full -z-0"></div>
          <div className="flex items-center gap-sm z-10">
            <div className="h-16 w-16 border border-secondary-fixed-dim rounded-full shadow-inner bg-primary text-on-primary text-xl font-bold flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name || 'User'} className="h-full w-full object-cover" />
              ) : (
                <span>{(user.name || user.email || 'Learner').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary">
                Hi, {user.name || 'Learner'}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {user.email}
              </p>
              {user.createdAt && (
                <p className="text-xs text-outline mt-1 flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  Member since {formatTimestamp(user.createdAt)}
                </p>
              )}
            </div>
          </div>
          <div className="z-10 flex gap-sm">
            <Link href="/dsa" className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-sm">
              Syllabus
            </Link>
            <Link href="/interview-prep" className="border border-outline-variant text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-low hover:text-primary font-label-md text-label-md px-md py-sm rounded-lg transition-all font-semibold">
              Interview Coach
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* DSA Progress Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col justify-between gap-sm relative">
            <div>
              <div className="flex items-center justify-between mb-sm">
                <h2 className="font-headline-md text-headline-md text-primary text-base flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary">analytics</span>
                  Syllabus Progress
                </h2>
                <span className="font-headline-md text-headline-md text-secondary text-2xl font-bold">
                  {overallProgress}%
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-md">
                You have completed <strong>{completedDsaCount}</strong> of <strong>{totalDsaCount}</strong> core topics.
              </p>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500 ease-out" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Performance Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col justify-between gap-sm relative">
            <div>
              <div className="flex items-center justify-between mb-sm">
                <h2 className="font-headline-md text-headline-md text-primary text-base flex items-center gap-xs">
                  <span className="material-symbols-outlined text-amber-600 filled">military_tech</span>
                  Quiz Performance
                </h2>
                <span className={`font-headline-md text-headline-md text-2xl font-bold px-3 py-1 rounded-full ${getScoreColorClass(averageQuizScore, attemptedQuizCount > 0)}`}>
                  {attemptedQuizCount > 0 ? `${averageQuizScore}%` : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {attemptedQuizCount > 0 ? (
                  <>Average score across <strong>{attemptedQuizCount}</strong> attempted quiz{attemptedQuizCount > 1 ? 'zes' : ''}.</>
                ) : (
                  <>No quizzes attempted yet. Take a topic quiz to evaluate your retention!</>
                )}
              </p>
            </div>
            {attemptedQuizCount > 0 && (
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    averageQuizScore >= 80 ? 'bg-secondary' : averageQuizScore >= 50 ? 'bg-amber-500' : 'bg-error'
                  }`}
                  style={{ width: `${averageQuizScore}%` }}
                ></div>
              </div>
            )}
          </div>
        </section>

        {/* Content Split: Recommendation vs Quiz Performance */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          {/* Left / Middle: Recent Activity and Smart Recommendation */}
          <div className="lg:col-span-2 space-y-md">
            {/* Smart Next-Topic Suggestion */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col gap-sm">
              <h3 className="font-label-md text-label-md text-secondary tracking-wider uppercase font-bold flex items-center gap-xs text-xs">
                <span className="material-symbols-outlined text-[16px]">school</span>
                Smart Recommendation
              </h3>
              {nextTopic ? (
                <div className="flex flex-col gap-sm">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary text-lg">
                      {nextTopic.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium bg-surface-container-low inline-block px-2 py-0.5 rounded">
                      {nextTopic.module} • {nextTopic.difficulty}
                    </p>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    {nextTopic.description}
                  </p>
                  <div className="pt-sm border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs text-outline">Estimated time: {nextTopic.estimatedTime}</span>
                    <Link href={`/dsa/${nextTopic.slug}`} className="text-secondary font-label-md text-label-md hover:gap-2 flex items-center gap-xs font-semibold cursor-pointer">
                      Start Module <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-md text-center flex flex-col items-center gap-sm">
                  <span className="material-symbols-outlined text-4xl text-secondary select-none">emoji_events</span>
                  <h4 className="font-headline-md text-headline-md text-primary text-base">You've completed all topics!</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm max-w-md">
                    Excellent work. Continue practicing your explanations and coding logic with our Interactive Technical Interview Coach.
                  </p>
                  <Link href="/interview-prep" className="bg-secondary text-on-secondary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-secondary/90 transition-all font-semibold shadow-sm mt-sm">
                    Open Interview Prep
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col gap-sm">
              <h3 className="font-label-md text-label-md text-outline tracking-wider uppercase font-bold flex items-center gap-xs text-xs">
                <span className="material-symbols-outlined text-[16px]">history</span>
                Recent Activity
              </h3>
              {lastCompletedTopic ? (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-sm">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary text-base">
                      {lastCompletedTopic.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Marked completed in {lastCompletedTopic.module}
                    </p>
                  </div>
                  <Link href={`/dsa/${lastCompletedTopic.slug}`} className="text-primary font-label-md text-label-md hover:underline flex items-center gap-xs font-semibold self-start sm:self-center">
                    Review Material <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic py-base">
                  No completed topics yet. Your recently completed modules will appear here.
                </p>
              )}
            </div>
          </div>

          {/* Right: Quiz breakdown */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col gap-sm">
            <h3 className="font-label-md text-label-md text-primary tracking-wider uppercase font-bold flex items-center gap-xs text-xs mb-xs">
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              Quiz Breakdown
            </h3>
            {dsaTopics.map((topic) => {
              const quizScore = (quizScores || {})[topic.id]
              return (
                <div key={topic.id} className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-b-0">
                  <div className="max-w-[70%]">
                    <p className="font-body-md text-sm font-semibold text-primary truncate">
                      {topic.title}
                    </p>
                    <p className="text-[10px] text-on-surface-variant uppercase font-medium mt-0.5">
                      {topic.module}
                    </p>
                  </div>
                  {quizScore !== undefined ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColorClass(quizScore)}`}>
                      {quizScore}%
                    </span>
                  ) : (
                    <Link href={`/quiz/${topic.slug}`} className="text-xs text-secondary hover:underline font-semibold flex items-center gap-xs">
                      Take Quiz <span className="material-symbols-outlined text-[12px]">play_arrow</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
