import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { increment, doc, setDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

export default function ActivityTracker() {
  const router = useRouter()
  const { user, showToast } = useAuth()
  const lastTrackedPage = useRef(null)
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast

  useEffect(() => {
    if (!router.isReady) return
    if (!user?.uid) {
      lastTrackedPage.current = null
      return
    }

    const page = router.asPath.split(/[?#]/, 1)[0] || '/'
    if (page === '/' || page.startsWith('/login') || page.startsWith('/signup') || page === '/verify-email') {
      lastTrackedPage.current = null
      return
    }

    const trackingKey = `${user.uid}:${page}`
    if (lastTrackedPage.current === trackingKey) return
    lastTrackedPage.current = trackingKey

    const date = new Date().toISOString().slice(0, 10)
    const activityRef = doc(db, 'users', user.uid, 'activity', date)
    setDoc(activityRef, { date, count: increment(1) }, { merge: true })
      .catch(() => showToastRef.current('Unable to record your learning activity.', 'error'))
  }, [router.asPath, router.isReady, user?.uid])

  return null
}
