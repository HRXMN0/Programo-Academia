import Link from 'next/link'
import { topics } from '../../data/topics'
import { useAuth } from '../../context/AuthContext'

export default function DsaOverview() {
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const { isLoggedIn, completedTopics = [], quizScores = {} } = useAuth()

  const dsaTopics = topics.filter(t => t.track === 'dsa')
  const totalDsaCount = dsaTopics.length
  const completedDsaCount = dsaTopics.filter(t => completedTopics.includes(t.id)).length
  const overallProgress = totalDsaCount > 0 ? Math.round((completedDsaCount / totalDsaCount) * 100) : 0

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl">
      {/* Page Header */}
      <div className="mb-lg max-w-2xl">
        <h1 className="font-display-lg text-display-lg text-primary mb-sm">Data Structures &amp; Algorithms</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Master the foundational building blocks of efficient software. Track your progress across core algorithmic patterns and memory structures.
        </p>
      </div>

      {/* Progress Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-sm">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary text-base">Course Progress</h2>
            <p className="text-sm text-on-surface-variant">
              {isLoggedIn ? (
                <>You have completed <strong>{completedDsaCount}</strong> of <strong>{totalDsaCount}</strong> core topics.</>
              ) : (
                <>Sign in to track your learning progress permanently.</>
              )}
            </p>
          </div>
          <span className="font-headline-md text-headline-md text-secondary text-2xl font-bold self-start sm:self-center">
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-500 ease-out" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {sortedTopics.map((topic) => {
          const isCompleted = completedTopics.includes(topic.id)
          const quizScore = quizScores[topic.id]

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

          return (
            <Link 
              key={topic.id} 
              href={`/dsa/${topic.slug}`}
              className="group block bg-surface-container-lowest border border-outline-variant rounded-xl p-md hover:shadow-[0_8px_16px_rgba(11,31,58,0.08)] hover:-translate-y-1 hover:border-secondary transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
                <div className="h-full bg-secondary transition-all duration-300" style={{ width: progressWidth }}></div>
              </div>
              <div className="flex items-start justify-between mb-sm mt-xs gap-xs">
                <div className="bg-surface-container-low p-sm rounded-lg text-primary">
                  <span className="material-symbols-outlined filled">
                    {topic.iconName || 'view_module'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-xs justify-end items-center max-w-[80%]">
                  {isCompleted && (
                    <span className="font-label-md text-label-md bg-secondary/10 text-secondary border border-secondary/20 px-sm py-xs rounded-full flex items-center gap-xs text-[10px] font-bold select-none whitespace-nowrap animate-fade-in">
                      <span className="material-symbols-outlined text-[12px] filled">check_circle</span>
                      Completed
                    </span>
                  )}
                  {quizScore !== undefined && (
                    <span className="font-label-md text-label-md bg-primary-fixed text-on-primary-fixed border border-outline-variant/35 px-sm py-xs rounded-full flex items-center gap-xs text-[10px] font-bold select-none whitespace-nowrap animate-fade-in">
                      <span className="material-symbols-outlined text-[12px] text-amber-600 filled">military_tech</span>
                      Quiz: {quizScore}%
                    </span>
                  )}
                  <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-sm py-xs rounded-full text-[10px] whitespace-nowrap">
                    {topic.lessonsCount || '0/10 lessons'}
                  </span>
                </div>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-xs group-hover:text-secondary transition-colors">
                {topic.title.split(':')[0]}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
                {topic.description}
              </p>

              {/* Enhanced Data Footer */}
              <div className="mt-md pt-sm border-t border-outline-variant border-opacity-50 flex items-center justify-between text-xs">
                <span className={`px-sm py-xs rounded font-semibold text-[10px] border uppercase tracking-wider ${
                  topic.difficulty === 'easy' 
                    ? 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50' 
                    : topic.difficulty === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                }`}>
                  {topic.difficulty}
                </span>
                <span className="flex items-center gap-xs text-on-surface-variant opacity-80 text-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {topic.estimatedTime}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
