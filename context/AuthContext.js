import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

const AuthContext = createContext();

// ─── Guest progress ──────────────────────────────────────────────────────────
// Anyone can browse lessons and take quizzes without an account. Their progress
// lives in localStorage under these keys and is merged into Firestore the first
// time they sign in.
const GUEST_TOPICS_KEY = 'programo-guest-completed-topics';
const GUEST_QUIZ_KEY = 'programo-guest-quiz-scores';

function readGuestProgress() {
  if (typeof window === 'undefined') {
    return { completedTopics: [], quizScores: {} };
  }

  try {
    const rawTopics = window.localStorage.getItem(GUEST_TOPICS_KEY);
    const rawQuiz = window.localStorage.getItem(GUEST_QUIZ_KEY);
    const parsedTopics = rawTopics ? JSON.parse(rawTopics) : [];
    const parsedQuiz = rawQuiz ? JSON.parse(rawQuiz) : {};

    return {
      completedTopics: Array.isArray(parsedTopics) ? parsedTopics : [],
      quizScores: parsedQuiz && typeof parsedQuiz === 'object' ? parsedQuiz : {}
    };
  } catch {
    return { completedTopics: [], quizScores: {} };
  }
}

function writeGuestProgress(completedTopics, quizScores) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(GUEST_TOPICS_KEY, JSON.stringify(completedTopics));
    window.localStorage.setItem(GUEST_QUIZ_KEY, JSON.stringify(quizScores));
  } catch {
    // Storage full or disabled (private mode) — progress just won't persist.
  }
}

function clearGuestProgress() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(GUEST_TOPICS_KEY);
    window.localStorage.removeItem(GUEST_QUIZ_KEY);
  } catch {
    // Nothing to do — the next write will overwrite anyway.
  }
}

// ─── Error messages ──────────────────────────────────────────────────────────
// Firebase throws strings like "Firebase: Error (auth/invalid-credential)." —
// fine in a console, useless in a toast. A student who mistypes a password
// reads that and concludes the page is broken, so every code we can actually
// reach gets a plain-English message instead.
//
// SILENT codes are the ones the user caused deliberately — closing the Google
// popup is not an error and must not raise a red toast.
const SILENT_AUTH_ERRORS = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled'
]);

const AUTH_ERROR_MESSAGES = {
  // Sign-in. Firebase deliberately collapses wrong-password and no-such-account
  // into invalid-credential so an attacker can't enumerate real addresses, so
  // this message can't be more specific than it is.
  'auth/invalid-credential': 'Wrong email or password. Please try again.',
  'auth/wrong-password': 'Wrong email or password. Please try again.',
  'auth/user-not-found': 'Wrong email or password. Please try again.',
  'auth/invalid-email': "That doesn't look like a valid email address.",
  'auth/missing-password': 'Please enter your password.',
  'auth/user-disabled': 'This account has been disabled. Get in touch if that seems wrong.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute, then try again.',

  // Sign-up
  'auth/email-already-in-use': 'That email already has an account — try logging in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',

  // Google popup
  'auth/popup-blocked':
    'Your browser blocked the Google sign-in window. Allow pop-ups for this site, then try again.',
  'auth/account-exists-with-different-credential':
    'You signed up with an email and password. Please log in that way instead.',

  // Ours, not theirs — worth wording so the user knows not to keep retrying.
  'auth/network-request-failed': "Can't reach the server. Check your connection and try again.",
  'auth/operation-not-allowed': "That sign-in method isn't switched on yet.",
  'auth/unauthorized-domain': "This site isn't authorised for sign-in yet.",
  'auth/invalid-api-key': 'Sign-in is misconfigured on our end. Please let us know.',
  'auth/api-key-not-valid': 'Sign-in is misconfigured on our end. Please let us know.'
};

// The message to show the user, or null when the error should pass silently.
function friendlyAuthError(error) {
  const code = error?.code;

  if (code && SILENT_AUTH_ERRORS.has(code)) return null;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];

  // Unmapped: log the real code so it can be added above, and still keep the
  // raw Firebase string away from the user.
  console.error('[auth]', code || 'no code', '—', error?.message || error);
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [completedAt, setCompletedAt] = useState({});
  const [toast, setToast] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotQuestion, setChatbotQuestion] = useState(null);

  // Lets the toast timeout survive re-renders without leaking onto window.
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const triggerTutor = (question) => {
    setChatbotQuestion(question);
    setChatbotOpen(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Merge anything the visitor did before signing in into their fresh account,
  // then hand the merged set back so the caller can render it immediately.
  const mergeGuestProgress = async (uid, accountData) => {
    const guest = readGuestProgress();

    const existingTopics = accountData.completedTopics || [];
    const existingScores = accountData.quizScores || {};
    const existingCompletedAt = accountData.completedAt || {};

    const mergedTopics = Array.from(new Set([...existingTopics, ...guest.completedTopics])).filter(Boolean);

    const mergedScores = { ...existingScores };
    Object.entries(guest.quizScores).forEach(([topicId, score]) => {
      const current = mergedScores[topicId];
      if (typeof score === 'number' && (typeof current !== 'number' || score > current)) {
        mergedScores[topicId] = score;
      }
    });

    const mergedCompletedAt = { ...existingCompletedAt };
    const mergedAt = new Date().toISOString();
    guest.completedTopics.forEach((topicId) => {
      if (topicId && !mergedCompletedAt[topicId]) mergedCompletedAt[topicId] = mergedAt;
    });

    const hadGuestProgress =
      guest.completedTopics.length > 0 || Object.keys(guest.quizScores).length > 0;

    if (hadGuestProgress) {
      try {
        await setDoc(
          doc(db, 'users', uid),
          { completedTopics: mergedTopics, quizScores: mergedScores, completedAt: mergedCompletedAt },
          { merge: true }
        );
      } catch {
        // Keep the local merge so the session still looks right, even if the write failed.
      }
      clearGuestProgress();
    }

    return {
      completedTopics: mergedTopics,
      quizScores: mergedScores,
      completedAt: mergedCompletedAt,
      mergedGuestProgress: hadGuestProgress
    };
  };

  // On auth state change: fetch user doc once with getDoc (not onSnapshot)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ─── CRITICAL: Reset state synchronously BEFORE the async Firestore fetch ───
        // This prevents the previous user's completedTopics/quizScores from
        // bleeding into the new session during the getDoc round-trip.
        //
        // isLoaded goes back to false along with it, and that part is load-bearing:
        // it is the only flag that distinguishes "auth has settled, nobody is signed
        // in" from "a sign-in is in flight". Leaving it true here made every login
        // bounce — loginWithEmail pushes /dashboard, ProtectedRoute wakes up to
        // isLoaded && !isLoggedIn, and sends the user straight back to /login before
        // getDoc can resolve.
        setUser(null);
        setCompletedTopics([]);
        setQuizScores({});
        setCompletedAt({});
        setIsLoggedIn(false);
        setIsLoaded(false);

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snapshot = await getDoc(userRef);
          const accountData = snapshot.exists() ? snapshot.data() : {};
          const displayName =
            accountData.name ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'User';

          if (!snapshot.exists()) {
            // New account — create the doc. Merge flags keep this idempotent if the
            // signup form already wrote it a moment ago.
            await setDoc(
              userRef,
              {
                name: displayName,
                email: firebaseUser.email || '',
                completedTopics: [],
                quizScores: {},
                completedAt: {},
                createdAt: new Date()
              },
              { merge: true }
            );
          }

          const hydrated = await mergeGuestProgress(firebaseUser.uid, accountData);

          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: displayName,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            createdAt: accountData.createdAt || new Date()
          });
          setCompletedTopics(hydrated.completedTopics);
          setQuizScores(hydrated.quizScores);
          setCompletedAt(hydrated.completedAt);
          setIsLoggedIn(true);

          if (hydrated.mergedGuestProgress) {
            showToast('Progress saved to your account. 🎉');
          }
        } catch (error) {
          // Firestore was unreachable or the read was denied, but Firebase Auth
          // itself succeeded — so sign the user in on the strength of the auth
          // record alone. Falling through with isLoggedIn still false would leave a
          // legitimately authenticated user stuck in a /dashboard -> /login loop
          // forever; losing saved progress for one session is the smaller failure.
          console.error('[auth] signed in without saved progress —', error?.message || error);

          const guest = readGuestProgress();
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date()
          });
          setCompletedTopics(guest.completedTopics);
          setQuizScores(guest.quizScores);
          setIsLoggedIn(true);
        } finally {
          setIsLoaded(true);
        }
      } else {
        // Logged out — fall back to whatever this browser did as a guest.
        const guest = readGuestProgress();
        setUser(null);
        setIsLoggedIn(false);
        setCompletedTopics(guest.completedTopics);
        setQuizScores(guest.quizScores);
        setCompletedAt({});
        setIsLoaded(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        showToast('Please verify your email before logging in.', 'info');
        router.replace('/verify-email');
        return userCredential.user;
      }

      showToast('Logged in successfully.');
      router.replace('/dashboard');
      return userCredential.user;
    } catch (error) {
      const message = friendlyAuthError(error);
      if (message) showToast(message, 'error');
      throw error;
    }
  };

  const signupWithEmail = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      await sendEmailVerification(userCredential.user);

      // Seed the doc with the name, then let onAuthStateChanged run the canonical
      // write and the guest-progress merge. Merge:true means neither clobbers the other.
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        { name: fullName, email },
        { merge: true }
      );

      showToast('Account created! Please check your email to verify your account. 🎉');
      router.replace('/verify-email');
      return userCredential.user;
    } catch (error) {
      const message = friendlyAuthError(error);
      if (message) showToast(message, 'error');
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        showToast('Verification email resent successfully! Check your inbox.');
        return true;
      } catch (error) {
        showToast(friendlyAuthError(error) || 'Could not resend just now.', 'error');
        return false;
      }
    } else {
      showToast('User is not logged in or email is already verified.', 'error');
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', userCredential.user.uid);

      // Full shape so a Google sign-in that skips the signup form still gets a
      // complete doc. onAuthStateChanged fills in anything missing.
      await setDoc(
        userRef,
        {
          name:
            userCredential.user.displayName ||
            userCredential.user.email?.split('@')[0] ||
            'User',
          email: userCredential.user.email || '',
          completedTopics: [],
          quizScores: {},
          completedAt: {}
        },
        { merge: true }
      );

      showToast('Logged in with Google successfully.');
      router.replace('/dashboard');
      return userCredential.user;
    } catch (error) {
      // Closing the popup lands here too, and that deserves no toast at all.
      const message = friendlyAuthError(error);
      if (message) showToast(message, 'error');
      throw error;
    }
  };

  const logout = () => {
    firebaseSignOut(auth).then(() => {
      showToast('Logged out successfully.');
      router.replace('/');
    }).catch((err) => {
      showToast(friendlyAuthError(err) || 'Could not log out just now.', 'error');
    });
  };

  const toggleTopicCompletion = async (topicId) => {
    const isAlreadyCompleted = completedTopics.includes(topicId);

    // Guests: store locally so the site is usable without an account.
    if (!isLoggedIn || !user) {
      const nextTopics = isAlreadyCompleted
        ? completedTopics.filter(id => id !== topicId)
        : [...completedTopics, topicId];

      setCompletedTopics(nextTopics);
      writeGuestProgress(nextTopics, quizScores);
      showToast(
        isAlreadyCompleted
          ? 'Topic marked as incomplete.'
          : 'Marked complete — sign in to save this permanently.',
        isAlreadyCompleted ? 'success' : 'info'
      );
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();

    try {
      if (isAlreadyCompleted) {
        setCompletedTopics(prev => prev.filter(id => id !== topicId));
        setCompletedAt(prev => {
          const next = { ...prev };
          delete next[topicId];
          return next;
        });
        await updateDoc(userRef, { completedTopics: arrayRemove(topicId) });
        showToast('Topic marked as incomplete.');
      } else {
        setCompletedTopics(prev => [...prev, topicId]);
        setCompletedAt(prev => ({ ...prev, [topicId]: now }));
        await updateDoc(userRef, {
          completedTopics: arrayUnion(topicId),
          [`completedAt.${topicId}`]: now
        });
        showToast('Topic marked as completed! 🎉');
      }
    } catch {
      showToast('Failed to update progress.', 'error');
    }
  };

  const saveQuizScore = async (topicId, scorePercentage) => {
    // Guests: keep the high score for this browser only.
    if (!isLoggedIn || !user) {
      const currentScore = quizScores[topicId] || 0;
      if (scorePercentage > currentScore) {
        const nextScores = { ...quizScores, [topicId]: scorePercentage };
        setQuizScores(nextScores);
        writeGuestProgress(completedTopics, nextScores);
        showToast(`New high score: ${scorePercentage}%. Sign in to keep it. 🎯`, 'info');
      }
      return;
    }

    const currentScore = quizScores[topicId] || 0;
    if (scorePercentage > currentScore) {
      const userRef = doc(db, 'users', user.uid);
      try {
        setQuizScores(prev => ({ ...prev, [topicId]: scorePercentage }));
        await updateDoc(userRef, { [`quizScores.${topicId}`]: scorePercentage });
        showToast(`New high score saved: ${scorePercentage}%! 🎯`);
      } catch {
        showToast('Failed to save quiz score.', 'error');
      }
    }
  };

  const isTopicCompleted = (topicId) => completedTopics.includes(topicId);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isLoaded,
      completedTopics,
      quizScores,
      completedAt,
      isTopicCompleted,
      toast,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      resendVerificationEmail,
      toggleTopicCompletion,
      saveQuizScore,
      showToast,
      chatbotOpen,
      setChatbotOpen,
      chatbotQuestion,
      setChatbotQuestion,
      triggerTutor
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
