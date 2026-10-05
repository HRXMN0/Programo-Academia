import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore'
import { db } from './firebase'
import { toKey, dayMs, generateContributions } from '../components/ContributionSkyline'

/**
 * Aggregates all user activity from Firestore into a normalized list of
 * { date: "YYYY-MM-DD", count: number } objects for the ContributionSkyline.
 *
 * It checks:
 * 1. `userData.contributions` — dedicated daily contribution tallies { [dateKey]: count }
 * 2. `userData.completedAt` — timestamps from topic completions { [topicId]: ISOString }
 * 3. `userData.quizCompletedAt` — timestamps from quiz submissions { [topicId]: ISOString }
 * 4. `userData.activityLog` — array of activity entries { type, title, timestamp }
 * 5. Optional seeded baseline so learners who just signed up still see a rich skyline
 */
export function aggregateContributions(userData, options = {}) {
  const { includeSeed = false, seed = 7 } = options
  const dateCounts = new Map()

  // 1. Optional seeded background to explore full 3D visual geometry
  if (includeSeed) {
    const endMs = Date.now()
    const baseline = generateContributions(endMs, seed)
    for (const b of baseline) {
      if (b.count > 0) {
        dateCounts.set(b.date, b.count)
      }
    }
  }

  if (!userData) {
    return Array.from(dateCounts.entries()).map(([date, count]) => ({ date, count }))
  }

  // 2. Explicit daily contributions map: { "2026-10-05": 4, ... }
  if (userData.contributions && typeof userData.contributions === 'object') {
    Object.entries(userData.contributions).forEach(([date, count]) => {
      if (typeof count === 'number' && count > 0) {
        dateCounts.set(date, (dateCounts.get(date) || 0) + count)
      }
    })
  }

  // 3. Completed topics map: { [topicId]: ISOString }
  if (userData.completedAt && typeof userData.completedAt === 'object') {
    Object.values(userData.completedAt).forEach((iso) => {
      if (!iso) return
      try {
        const key = toKey(dayMs(iso))
        dateCounts.set(key, (dateCounts.get(key) || 0) + 1)
      } catch (err) {
        // ignore malformed dates
      }
    })
  }

  // 4. Completed quizzes map: { [topicId]: ISOString }
  if (userData.quizCompletedAt && typeof userData.quizCompletedAt === 'object') {
    Object.values(userData.quizCompletedAt).forEach((iso) => {
      if (!iso) return
      try {
        const key = toKey(dayMs(iso))
        dateCounts.set(key, (dateCounts.get(key) || 0) + 1)
      } catch (err) {}
    })
  }

  // 5. Activity log array
  if (Array.isArray(userData.activityLog)) {
    userData.activityLog.forEach((item) => {
      if (item && item.timestamp) {
        try {
          const key = toKey(dayMs(item.timestamp))
          dateCounts.set(key, (dateCounts.get(key) || 0) + 1)
        } catch (err) {}
      }
    })
  }

  return Array.from(dateCounts.entries()).map(([date, count]) => ({ date, count }))
}

/**
 * Real-time contribution logger. Writes directly to Firestore user document,
 * triggering active `onSnapshot` listeners instantly across the app.
 */
export async function recordUserActivity(uid, {
  count = 1,
  type = 'practice',
  title = 'Coding Practice',
  timestamp = new Date().toISOString()
} = {}) {
  if (!uid) return false

  const todayKey = toKey(dayMs(timestamp))
  const userRef = doc(db, 'users', uid)

  const activityItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    timestamp,
    date: todayKey
  }

  try {
    await updateDoc(userRef, {
      [`contributions.${todayKey}`]: increment(count),
      activityLog: arrayUnion(activityItem),
      lastActiveAt: timestamp
    })
    return true
  } catch (error) {
    console.error('[contributions] Failed to record activity:', error)
    return false
  }
}

/**
 * Seeds sample activity records into a user's account for demonstration,
 * creating an authentic full-year skyline instantly in real time.
 */
export async function seedAccountContributions(uid, seed = 42) {
  if (!uid) return false
  const userRef = doc(db, 'users', uid)
  const now = Date.now()
  const generated = generateContributions(now, seed)

  const contributionsMap = {}
  generated.forEach((d) => {
    if (d.count > 0) {
      contributionsMap[d.date] = d.count
    }
  })

  try {
    await updateDoc(userRef, {
      contributions: contributionsMap,
      lastActiveAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('[contributions] Failed to seed contributions:', error)
    return false
  }
}
