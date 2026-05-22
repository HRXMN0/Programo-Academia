import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { topics } from '../../data/topics'
import { quizzes } from '../../data/quizzes'
import { useAuth } from '../../context/AuthContext'

export default function TopicDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [copied, setCopied] = useState(false)
  const { completedTopics = [], toggleTopicCompletion, triggerTutor } = useAuth()

  // Loading State
  if (!router.isReady) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar track="dsa" />
        <main className="flex-grow flex items-center justify-center bg-surface-lowest">
          <div className="flex flex-col items-center gap-md">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-label-md text-label-md text-on-surface-variant">Loading lesson content...</p>
          </div>
        </main>
      </div>
    )
  }

  const topic = topics.find(t => t.slug === slug)

  // Topic Not Found / Empty State
  if (!topic) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-xl flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md text-center flex flex-col items-center gap-md">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary">Topic Not Found</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The topic "{slug}" does not exist in the DSA Masterclass syllabus yet.
          </p>
          <Link href="/dsa" className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded hover:bg-primary-container transition-colors shadow-sm mt-sm">
            Go to DSA Syllabus
          </Link>
        </div>
      </main>
    )
  }

  // Calculate sorted list of topics for correct prev/next navigation
  const sortedTopics = [...topics].filter(t => t.track === 'dsa').sort((a, b) => a.order - b.order)
  const currentIndex = sortedTopics.findIndex(t => t.id === topic.id)
  const prevTopic = currentIndex > 0 ? sortedTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < sortedTopics.length - 1 ? sortedTopics[currentIndex + 1] : null
  const hasQuiz = quizzes[topic.id] !== undefined

  const handleCopy = () => {
    if (topic.codeSnippet && topic.codeSnippet.code) {
      navigator.clipboard.writeText(topic.codeSnippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderCellContent = (cell, colIndex) => {
    if (colIndex === 2 && cell.includes('(')) {
      const parts = cell.split('(')
      return (
        <span>
          {parts[0]}
          <span className="text-secondary text-xs ml-2">({parts[1]}</span>
        </span>
      )
    }
    return cell
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar track="dsa" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-lowest relative">
        <div className="max-w-3xl mx-auto px-gutter py-xl pb-32">
          {/* Breadcrumb / Meta */}
          <div className="flex items-center justify-between flex-wrap gap-sm mb-lg border-b border-outline-variant pb-sm">
            <div className="flex items-center gap-sm">
              <span className="px-sm py-xs bg-surface-container-high text-on-surface-variant font-label-md text-label-md rounded text-xs">
                {topic.module}
              </span>
              <span className="text-outline-variant material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="px-sm py-xs bg-secondary-fixed-dim bg-opacity-20 text-secondary font-label-md text-label-md rounded text-xs flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                {topic.badge}
              </span>
            </div>
            
            <button 
              onClick={() => triggerTutor(`Explain the topic: "${topic.title}"`)}
              className="inline-flex items-center gap-xs px-sm py-xs bg-[#0b1f3a]/5 hover:bg-[#0b1f3a]/10 border border-[#0b1f3a]/20 text-[#0b1f3a] font-label-md text-label-md text-xs rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
              id="ask-tutor-ai-btn"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              Ask Tutor AI
            </button>
          </div>

          {/* Title */}
          <h1 className="font-display-lg text-display-lg text-primary mb-md md:font-display-lg font-headline-lg-mobile text-headline-lg-mobile flex items-center gap-sm flex-wrap">
            <span>{topic.title}</span>
            {topic && completedTopics.includes(topic.id) && (
              <span className="inline-flex items-center gap-xs px-sm py-xs bg-secondary/10 text-secondary font-label-md text-label-md text-xs rounded-full border border-secondary/35 select-none animate-fade-in">
                <span className="material-symbols-outlined text-[16px] filled">check_circle</span>
                Completed
              </span>
            )}
          </h1>

          {/* Intro Text */}
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl leading-relaxed">
            {topic.content}
          </p>

          {/* Key Concept Bento Grid */}
          {topic.concepts && topic.concepts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-xl">
              {topic.concepts.map((concept, idx) => (
                <div key={idx} className="bg-surface border border-outline-variant rounded-xl p-md">
                  <div className="w-8 h-8 rounded bg-primary-fixed-dim text-primary flex items-center justify-center mb-sm">
                    <span className="material-symbols-outlined text-[20px]">{concept.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary text-lg mb-xs">{concept.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">{concept.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Complexity Bento Grid */}
          {topic.complexity && (
            <div className="mb-xl border border-outline-variant rounded-xl p-md bg-surface">
              <h2 className="font-headline-md text-headline-md text-primary mb-md text-lg flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px] text-secondary">speed</span>
                Complexity Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-sm">
                {[
                  { label: "Access", value: topic.complexity.access },
                  { label: "Search", value: topic.complexity.search },
                  { label: "Insertion", value: topic.complexity.insertion },
                  { label: "Deletion", value: topic.complexity.deletion },
                  { label: "Space", value: topic.complexity.space, isSpace: true },
                ].map((item, idx) => (
                  <div key={idx} className={`border rounded-lg p-xs text-center flex flex-col justify-center items-center ${item.isSpace ? 'bg-secondary/5 border-secondary/20' : 'bg-surface-container-low border-outline-variant/30'}`}>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs">{item.label}</span>
                    <span className={`font-code-block font-bold text-sm ${item.isSpace ? 'text-secondary' : 'text-primary'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className="border-outline-variant mb-xl"/>

          {/* Technical Explanation / Code Block */}
          {topic.codeSnippet && (
            <>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-md text-2xl">Implementation &amp; Code</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Below is a typical implementation or syntax representation of {topic.title.split(':')[0]} in modern C++.
              </p>

              <div className="bg-[#0b0f19] rounded-xl border border-outline border-opacity-30 shadow-md mb-xl overflow-hidden">
                <div className="flex items-center justify-between px-md py-sm border-b border-outline border-opacity-10 bg-[#070b13]">
                  <div className="flex items-center gap-xs">
                    <span className="px-sm py-xs bg-primary-container text-on-primary-container font-label-md text-label-md rounded text-xs select-none">
                      {topic.codeSnippet.language.toUpperCase()}
                    </span>
                    <span className="font-code-block text-code-block text-inverse-on-surface text-xs text-opacity-70">
                      {topic.codeSnippet.fileName}
                    </span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="text-inverse-on-surface hover:text-white transition-colors flex items-center gap-xs text-xs font-label-md text-label-md bg-white bg-opacity-5 hover:bg-opacity-10 px-sm py-xs rounded border border-white border-opacity-10"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span> 
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-md overflow-x-auto">
                  <pre className="font-code-block text-code-block text-inverse-on-surface">
                    <code className={`language-${topic.codeSnippet.language}`}>
                      {topic.codeSnippet.code}
                    </code>
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* Highlighted Intuition Box */}
          {topic.intuition && (
            <div className="bg-secondary-fixed bg-opacity-10 border border-secondary border-opacity-30 rounded-xl p-lg mb-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-secondary-container text-lg mb-sm">
                    {topic.intuition.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-secondary-fixed-variant">
                    {topic.intuition.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Common Mistakes Checklist */}
          {topic.commonMistakes && topic.commonMistakes.length > 0 && (
            <div className="mb-xl bg-error-container/5 border border-error/20 rounded-xl p-lg">
              <h2 className="font-headline-md text-headline-md text-primary mb-md text-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-error text-[24px]">warning_amber</span>
                Common Pitfalls &amp; Mistakes
              </h2>
              <ul className="flex flex-col gap-sm">
                {topic.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex gap-sm items-start text-on-surface-variant font-body-md text-body-md">
                    <span className="material-symbols-outlined text-error text-[18px] mt-xs select-none">close</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Memory Layout Table */}
          {topic.table && (
            <>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-md text-2xl">
                {topic.table.title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                {topic.table.desc}
              </p>
              <div className="border border-outline-variant rounded-xl overflow-hidden mb-xl bg-surface">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        {topic.table.headers.map((h, i) => (
                          <th key={i} className="py-sm px-md font-label-md text-label-md text-on-surface-variant font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-code-block text-code-block text-sm">
                      {topic.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-outline-variant border-opacity-50 hover:bg-surface-container-lowest transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`py-sm px-md ${cIdx === 1 ? 'font-bold text-primary' : 'text-on-surface-variant opacity-70'}`}>
                              {renderCellContent(cell, cIdx)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 md:left-64 left-0 right-0 bg-surface border-t border-outline-variant p-md z-30 flex justify-between items-center shadow-[0_-4px_12px_rgba(11,31,58,0.02)]">
          {prevTopic ? (
            <Link 
              href={`/dsa/${prevTopic.slug}`} 
              className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-sm px-md rounded border border-outline-variant bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Previous
            </Link>
          ) : (
            <div className="w-10"></div>
          )}

          <div className="flex gap-sm flex-wrap">
            {topic && (
              <button 
                onClick={() => toggleTopicCompletion(topic.id)}
                className={`flex items-center gap-xs font-label-md text-label-md transition-all duration-200 py-sm px-md rounded font-medium shadow-sm active-press ${
                  completedTopics.includes(topic.id)
                    ? 'bg-secondary/10 border border-secondary text-secondary hover:bg-secondary/20'
                    : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${completedTopics.includes(topic.id) ? 'filled' : ''}`}>
                  {completedTopics.includes(topic.id) ? 'check_box' : 'check_box_outline_blank'}
                </span>
                {completedTopics.includes(topic.id) ? 'Completed' : 'Mark Complete'}
              </button>
            )}

            {hasQuiz && (
              <Link 
                href={`/quiz/${topic.id}`} 
                className="flex items-center gap-xs font-label-md text-label-md border border-secondary text-secondary hover:bg-secondary-container/10 transition-colors py-sm px-md rounded font-medium shadow-sm"
              >
                Practice Quiz
                <span className="material-symbols-outlined text-[18px]">quiz</span>
              </Link>
            )}
            {nextTopic ? (
              <Link 
                href={`/dsa/${nextTopic.slug}`} 
                className="flex items-center gap-xs font-label-md text-label-md bg-secondary text-on-secondary hover:bg-on-secondary-container transition-colors py-sm px-lg rounded font-medium shadow-sm"
              >
                Next Topic: {nextTopic.title.split(':')[0]}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : (
              <Link 
                href="/dsa" 
                className="flex items-center gap-xs font-label-md text-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors py-sm px-lg rounded font-medium shadow-sm"
              >
                Complete Syllabus
                <span className="material-symbols-outlined text-[18px]">done_all</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
