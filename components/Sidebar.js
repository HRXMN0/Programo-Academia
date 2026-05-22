import Link from 'next/link'
import { useRouter } from 'next/router'
import { topics } from '../data/topics'

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

  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-surface-container-low border-r border-outline-variant shrink-0 z-40 overflow-y-auto">
      <div className="p-base border-b border-outline-variant">
        <div className="flex items-center gap-sm mb-xs">
          <div className="w-10 h-10 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            {track === 'dsa' ? 'DM' : 'CL'}
          </div>
          <div>
            <h2 className="font-label-md text-label-md font-bold text-primary">
              {track === 'dsa' ? 'DSA Masterclass' : 'C++ Foundation'}
            </h2>
            <p className="font-code-block text-code-block text-on-surface-variant text-xs">{completionPercentage}% Completed</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-surface-container-high rounded h-1 mt-sm overflow-hidden">
          <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>
      <nav className="flex-1 py-base flex flex-col gap-xs px-base">
        {/* Overview link */}
        <Link 
          href={`/${track}`}
          className={`flex items-center gap-sm px-sm py-sm rounded-lg font-label-md text-label-md transition-all group ${
            router.pathname === `/${track}`
              ? 'bg-secondary-container text-on-secondary-container font-medium'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">dashboard</span>
          Overview
        </Link>
        
        {/* Topics/Lessons links */}
        {trackTopics.map((topic) => {
          const isCurrent = topic.slug === slug
          return (
            <Link
              key={topic.id}
              href={`/${track}/${topic.slug}`}
              className={`flex items-center gap-sm px-sm py-sm rounded-lg font-label-md text-label-md transition-all group ${
                isCurrent
                  ? 'bg-secondary-container text-on-secondary-container font-medium scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isCurrent ? 'filled text-secondary' : 'group-hover:text-primary'}`}>
                {topic.iconName || 'view_module'}
              </span>
              <span className="truncate">{topic.title.split(':')[0]}</span>
            </Link>
          )
        })}
      </nav>
      {/* Footer Action */}
      <div className="p-base border-t border-outline-variant">
        <Link 
          href={`/${track}/${trackTopics[0]?.slug}`}
          className="w-full bg-surface text-primary border border-outline-variant font-label-md text-label-md py-sm rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs"
        >
          Resume Learning
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
        </Link>
      </div>
    </aside>
  )
}
