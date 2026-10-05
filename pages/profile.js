import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import ContributionSkyline from '../components/ContributionSkyline'
import { aggregateContributions, recordUserActivity, seedAccountContributions } from '../lib/contributions'
import { topics } from '../data/topics'

const PALETTE_OPTIONS = [
  { id: 'programo', name: 'Programo Teal', color: '#14b8a6' },
  { id: 'github', name: 'GitHub Classic', color: '#26a641' },
  { id: 'ocean', name: 'Ocean Blue', color: '#2a8fd1' },
  { id: 'ember', name: 'Ember Orange', color: '#f06b3a' },
  { id: 'grape', name: 'Grape Purple', color: '#8b5cf6' },
  { id: 'halloween', name: 'Halloween', color: '#fe9600' },
  { id: 'mono', name: 'Monochrome', color: '#737373' },
]

const HEIGHT_PRESETS = [
  { label: 'Normal (1x)', value: 1.0 },
  { label: 'Elevated (1.4x)', value: 1.4 },
  { label: 'Skyscrapers (1.8x)', value: 1.8 },
]

export default function ProfilePage() {
  const router = useRouter()
  const {
    user,
    completedTopics: authCompletedTopics = [],
    quizScores: authQuizScores = {},
    completedAt: authCompletedAt = {},
    recordActivity,
    showToast,
    logout
  } = useAuth()

  // Real-time user document state from Firestore
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    completedTopics: authCompletedTopics,
    quizScores: authQuizScores,
    completedAt: authCompletedAt,
    contributions: {},
    activityLog: [],
    createdAt: user?.createdAt || null
  })
  const [isLiveConnected, setIsLiveConnected] = useState(false)

  // Customization & display controls
  const [selectedPalette, setSelectedPalette] = useState('programo')
  const [heightScale, setHeightScale] = useState(1.4)
  const [includeBaselineSeed, setIncludeBaselineSeed] = useState(false)
  const [selectedCell, setSelectedCell] = useState(null)
  const [isLogging, setIsLogging] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Profile Edit modal / state
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayNameInput, setDisplayNameInput] = useState(user?.name || '')
  const [isSavingName, setIsSavingName] = useState(false)

  // Real-time Firestore subscription on `users/{uid}`
  useEffect(() => {
    if (!user?.uid) return

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setUserData(data)
        setIsLiveConnected(true)
        if (data.name && !isEditingName) {
          setDisplayNameInput(data.name)
        }
      }
    }, (error) => {
      console.error('[profile] real-time snapshot error:', error)
      setIsLiveConnected(false)
    })

    return () => unsubscribe()
  }, [user?.uid, isEditingName])

  // Deterministic user seed derived from user.uid for optional baseline filler
  const userSeed = useMemo(() => {
    if (!user?.uid) return 42
    let hash = 0
    for (let i = 0; i < user.uid.length; i++) {
      hash = (hash << 5) - hash + user.uid.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }, [user?.uid])

  // Aggregate contributions in real-time from Firestore data
  const contributionData = useMemo(() => {
    return aggregateContributions(userData, {
      includeSeed: includeBaselineSeed,
      seed: userSeed
    })
  }, [userData, includeBaselineSeed, userSeed])

  // Calculate live stats
  const totalContributions = useMemo(() => {
    return contributionData.reduce((acc, curr) => acc + (curr.count || 0), 0)
  }, [contributionData])

  const totalDsaCount = topics.filter(t => t.track === 'dsa').length
  const completedDsaCount = (userData.completedTopics || []).length
  const quizEntries = Object.entries(userData.quizScores || {})
  const attemptedQuizCount = quizEntries.length
  const averageQuizScore = attemptedQuizCount > 0
    ? Math.round(quizEntries.reduce((acc, [, score]) => acc + score, 0) / attemptedQuizCount)
    : 0

  // Quick activity logger to demonstrate live real-time updates
  const handleLogActivity = async (actionTitle = 'Solved Practice Problem') => {
    if (!user?.uid) return
    setIsLogging(true)
    try {
      const ok = await recordUserActivity(user.uid, {
        count: 1,
        type: 'practice',
        title: actionTitle,
        timestamp: new Date().toISOString()
      })
      if (ok) {
        showToast(`Logged activity: "${actionTitle}" (+1) 🎉`)
      } else {
        // Fallback to auth recordActivity
        await recordActivity(1, actionTitle)
      }
    } catch (err) {
      showToast('Could not record activity.', 'error')
    } finally {
      setIsLogging(false)
    }
  }

  // Seed full year of authentic demo data into the user's Firestore profile
  const handleSeedDemoData = async () => {
    if (!user?.uid) return
    if (!window.confirm('Populate a full year of realistic coding activity into your account? This will update your real-time 3D skyline!')) return
    setIsSeeding(true)
    try {
      const ok = await seedAccountContributions(user.uid, userSeed)
      if (ok) {
        showToast('Sample yearly contributions populated in real time! 🚀')
      } else {
        showToast('Failed to seed contributions.', 'error')
      }
    } catch (err) {
      showToast('Error seeding contributions.', 'error')
    } finally {
      setIsSeeding(false)
    }
  }

  // Update Display Name
  const handleSaveDisplayName = async (e) => {
    e.preventDefault()
    if (!displayNameInput.trim() || !user?.uid) return

    setIsSavingName(true)
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayNameInput.trim() })
      }
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { name: displayNameInput.trim() })
      showToast('Profile name updated!')
      setIsEditingName(false)
    } catch (err) {
      console.error(err)
      showToast('Failed to update name.', 'error')
    } finally {
      setIsSavingName(false)
    }
  }

  // Formatter for dates
  const formatDate = (val) => {
    if (!val) return '—'
    const date = val.toDate ? val.toDate() : new Date(val)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Find activities for selected cell date
  const selectedDayActivities = useMemo(() => {
    if (!selectedCell?.date) return []
    const out = []
    // Check completed topics on that date
    if (userData.completedAt) {
      Object.entries(userData.completedAt).forEach(([topicId, iso]) => {
        if (iso && iso.startsWith(selectedCell.date)) {
          const t = topics.find(item => item.id === topicId)
          out.push({
            type: 'topic',
            title: t?.title || `Completed Topic: ${topicId}`,
            time: new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
      })
    }
    // Check activity log
    if (Array.isArray(userData.activityLog)) {
      userData.activityLog.forEach((item) => {
        if (item.date === selectedCell.date || (item.timestamp && item.timestamp.startsWith(selectedCell.date))) {
          out.push({
            type: item.type || 'activity',
            title: item.title || 'Coding Session',
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
      })
    }
    return out
  }, [selectedCell, userData])

  return (
    <main className="flex-grow w-full bg-background px-gutter py-8 md:py-10">
      <Head>
        <title>Programo Academia — Profile & Activity Skyline</title>
        <meta name="description" content="View your live activity skyline, learning streaks, and continuous coding progress." />
      </Head>

      <div className="max-w-container-max mx-auto space-y-8 animate-fade-in">
        {/* Profile Hero Header Card */}
        <section className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card md:p-8">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-brand-gradient"></div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"></div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* User Details */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-secondary text-on-secondary text-2xl font-bold flex items-center justify-center overflow-hidden ring-4 ring-secondary/20 shadow-brand">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={userData.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{(userData.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
                {/* Live Real-time status badge */}
                <span
                  title={isLiveConnected ? "Real-time sync active" : "Syncing..."}
                  className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface-container-lowest ${isLiveConnected ? 'bg-topic-emerald' : 'bg-topic-amber'}`}
                />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-md text-[11px] font-bold text-on-secondary-container">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    Learner Profile
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-topic-emerald">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-topic-emerald opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-topic-emerald"></span>
                    </span>
                    Live Sync Active
                  </span>
                </div>

                {isEditingName ? (
                  <form onSubmit={handleSaveDisplayName} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1 text-on-surface font-semibold text-lg focus:border-secondary focus:outline-none"
                      placeholder="Enter name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSavingName}
                      className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-on-secondary shadow-brand hover:bg-secondary/90 transition-all"
                    >
                      {isSavingName ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="rounded-lg border border-outline-variant px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container-high transition-all"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary truncate">
                      {userData.name || 'Learner'}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors"
                      title="Edit display name"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    <span className="truncate">{user?.email}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Member since {formatDate(user?.createdAt || userData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md text-on-surface hover:border-secondary/50 hover:bg-secondary/5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
              </Link>
              <Link
                href="/dsa"
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md text-on-surface hover:border-secondary/50 hover:bg-secondary/5 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                DSA Syllabus
              </Link>
              <Link
                href="/compiler"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 font-label-md text-label-md text-on-secondary shadow-brand hover:bg-secondary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                Open Compiler
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4 border-t border-outline-variant pt-6">
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]">insights</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Activity</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                {totalContributions}
                <span className="ml-1 text-xs font-normal text-on-surface-variant">events</span>
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4">
              <div className="flex items-center gap-2 text-topic-emerald">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Syllabus Mastered</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                {completedDsaCount}
                <span className="ml-1 text-xs font-normal text-on-surface-variant">/ {totalDsaCount} topics</span>
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4">
              <div className="flex items-center gap-2 text-topic-blue">
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quizzes Taken</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                {attemptedQuizCount}
                <span className="ml-1 text-xs font-normal text-on-surface-variant">attempted</span>
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4">
              <div className="flex items-center gap-2 text-topic-amber">
                <span className="material-symbols-outlined text-[20px]">grade</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quiz Average</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                {attemptedQuizCount > 0 ? `${averageQuizScore}%` : '—'}
                <span className="ml-1 text-xs font-normal text-on-surface-variant">{attemptedQuizCount > 0 ? 'score' : 'none yet'}</span>
              </p>
            </div>
          </div>
        </section>

        {/* CONTRIBUTION SKYLINE SECTION — FRONT & CENTER */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-2xl">location_city</span>
                  Contribution Skyline
                </h2>
                <span className="rounded-full bg-secondary/10 text-secondary font-semibold text-xs px-2.5 py-0.5">
                  Real-time 3D
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                Your year of learning visualized as an isometric 3D skyline that seamlessly folds into a flat heatmap. Drag to orbit, hover for details.
              </p>
            </div>

            {/* Live Test & Seed Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleLogActivity('Solved Practice Problem')}
                disabled={isLogging}
                className="inline-flex items-center gap-1.5 rounded-xl bg-topic-emerald px-3.5 py-2 font-label-md text-xs font-semibold text-white shadow-sm hover:bg-topic-emerald/90 transition-all active:scale-95 disabled:opacity-50"
                title="Logs a real-time activity event to Firebase instantly"
              >
                <span className="material-symbols-outlined text-[16px]">add_task</span>
                {isLogging ? 'Logging...' : '+1 Solved Problem'}
              </button>

              <button
                type="button"
                onClick={() => handleLogActivity('Ran C++ Code in Compiler')}
                disabled={isLogging}
                className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2 font-label-md text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50"
                title="Logs a code run activity event"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                +1 Run Code
              </button>

              <button
                type="button"
                onClick={handleSeedDemoData}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3.5 py-2 font-label-md text-xs font-semibold text-secondary hover:bg-secondary/20 transition-all active:scale-95 disabled:opacity-50"
                title="Populates full-year authentic history into your account"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                {isSeeding ? 'Seeding...' : 'Populate Year Data'}
              </button>
            </div>
          </div>

          {/* Skyline Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-xs">
            {/* Palette Picker */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">palette</span>
                Theme:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {PALETTE_OPTIONS.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setSelectedPalette(pal.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-all ${
                      selectedPalette === pal.id
                        ? 'bg-surface-container-lowest font-semibold text-on-surface shadow-sm ring-1 ring-secondary'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.color }} />
                    <span className="hidden sm:inline">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Height Scale & Baseline Mode */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-on-surface-variant font-semibold">Height:</span>
                {HEIGHT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setHeightScale(p.value)}
                    className={`rounded-md px-2 py-0.5 transition-colors ${
                      heightScale === p.value
                        ? 'bg-secondary text-on-secondary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-on-surface-variant select-none border-l border-outline-variant pl-3">
                <input
                  type="checkbox"
                  checked={includeBaselineSeed}
                  onChange={(e) => setIncludeBaselineSeed(e.target.checked)}
                  className="rounded border-outline-variant text-secondary focus:ring-secondary/40"
                />
                <span>Demo Baseline</span>
              </label>
            </div>
          </div>

          {/* THE SKYLINE COMPONENT */}
          <div className="relative">
            <ContributionSkyline
              data={contributionData}
              palette={selectedPalette}
              heightScale={heightScale}
              defaultView="3d"
              orbit={true}
              showStats={true}
              showLegend={true}
              showToggle={true}
              unit="activity"
              unitPlural="activities"
              onCellClick={(cell) => setSelectedCell(cell)}
              title={
                <span className="flex items-center gap-2">
                  <span className="font-bold text-primary">{totalContributions}</span>
                  <span>contributions recorded in the last year</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-topic-emerald animate-pulse" title="Live data" />
                </span>
              }
              footer={
                <span className="flex flex-wrap items-center gap-3 text-xs">
                  <span>🖱️ <strong>Drag</strong> to orbit 3D view</span>
                  <span>•</span>
                  <span>🔄 <strong>Double click</strong> to reset camera</span>
                  <span>•</span>
                  <span>⌨️ <strong>Arrow keys</strong> to navigate days</span>
                </span>
              }
            />
          </div>

          {/* Selected Day Inspector */}
          {selectedCell && (
            <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">event_available</span>
                  <h4 className="font-semibold text-on-surface">
                    Activity on {new Date(selectedCell.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h4>
                  <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs font-bold text-on-secondary-container">
                    {selectedCell.count} {selectedCell.count === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                {selectedDayActivities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedDayActivities.map((act, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs text-on-surface">
                        <span className="material-symbols-outlined text-[14px] text-topic-emerald">check_circle</span>
                        <span>{act.title}</span>
                        <span className="text-[10px] text-on-surface-variant">({act.time})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    {selectedCell.count > 0 ? 'Contributions registered on this day.' : 'No recorded activity on this date.'}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLogActivity(`Added Activity on ${selectedCell.date}`)}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-on-secondary shadow-brand hover:bg-secondary/90 transition-all"
                >
                  + Add Activity Here
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-high transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Learning History & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Completed Topics */}
          <div className="lg:col-span-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">history_edu</span>
                Recent Learning Milestones
              </h3>
              <Link href="/dsa" className="text-xs font-semibold text-secondary hover:underline">
                View All Syllabus →
              </Link>
            </div>

            {userData.completedTopics && userData.completedTopics.length > 0 ? (
              <div className="divide-y divide-outline-variant/60">
                {userData.completedTopics.slice(0, 6).map((topicId) => {
                  const topic = topics.find(t => t.id === topicId)
                  const completedDate = userData.completedAt?.[topicId]
                  return (
                    <div key={topicId} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-topic-emerald/10 text-topic-emerald">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {topic?.title || topicId}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Module: {topic?.module || 'Core DSA'} • {topic?.difficulty || 'General'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        {completedDate ? formatDate(completedDate) : 'Completed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">menu_book</span>
                <p className="mt-2 text-sm font-semibold text-on-surface">No completed topics yet</p>
                <p className="text-xs text-on-surface-variant mt-1">Start learning a topic from the syllabus to see your activity populate in real time.</p>
                <Link
                  href="/dsa"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-on-secondary shadow-brand hover:bg-secondary/90 transition-all"
                >
                  Start DSA Syllabus
                </Link>
              </div>
            )}
          </div>

          {/* Account Details & Quick Preferences */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card space-y-4">
            <h3 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-4">
              <span className="material-symbols-outlined text-secondary">manage_accounts</span>
              Account Information
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Email Verification</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user?.emailVerified ? 'bg-topic-emerald/15 text-topic-emerald' : 'bg-topic-amber/15 text-topic-amber'}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {user?.emailVerified ? 'check_circle' : 'pending'}
                  </span>
                  {user?.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">User ID</span>
                <span className="font-mono text-xs text-on-surface-variant max-w-[140px] truncate" title={user?.uid}>
                  {user?.uid}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">Sync State</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-topic-emerald">
                  <span className="h-2 w-2 rounded-full bg-topic-emerald animate-pulse"></span>
                  Connected
                </span>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-2">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-error/30 bg-error/5 py-2.5 text-xs font-semibold text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
