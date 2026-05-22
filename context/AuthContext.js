import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
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

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  const [toast, setToast] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotQuestion, setChatbotQuestion] = useState(null);

  const triggerTutor = (question) => {
    setChatbotQuestion(question);
    setChatbotOpen(true);
  };

  // On auth state change: fetch user doc once with getDoc (not onSnapshot)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ─── CRITICAL: Reset state synchronously BEFORE the async Firestore fetch ───
        // This prevents the previous user's completedTopics/quizScores from
        // bleeding into the new session during the getDoc round-trip.
        setUser(null);
        setCompletedTopics([]);
        setQuizScores({});
        setIsLoggedIn(false);

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              createdAt: data.createdAt
            });
            // Use safe fallbacks — doc may exist but fields may be missing
            setCompletedTopics(data.completedTopics || []);
            setQuizScores(data.quizScores || {});
            setIsLoggedIn(true);
          } else {
            // New user — doc doesn't exist yet. Write it with clean empty arrays.
            const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            const newUserData = {
              name: displayName,
              email: firebaseUser.email || '',
              completedTopics: [],
              quizScores: {},
              createdAt: new Date()
            };
            await setDoc(userRef, newUserData);
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date()
            });
            // State is already reset to [] and {} from the synchronous reset above
            setIsLoggedIn(true);
          }
        } catch {
          // Auth setup failed — still mark as loaded to unblock UI
        } finally {
          setIsLoaded(true);
        }
      } else {
        // Logged out — wipe all user state
        setUser(null);
        setIsLoggedIn(false);
        setCompletedTopics([]);
        setQuizScores({});
        setIsLoaded(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showToast('Logged in successfully.');
      router.replace('/dashboard');
      return userCredential.user;
    } catch (error) {
      // Auto-create account if the user does not exist
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
          showToast('Account created and logged in automatically! 🎉');
          router.replace('/dashboard');
          return newUserCredential.user;
        } catch (signUpError) {
          showToast(signUpError.message, 'error');
          throw signUpError;
        }
      } else {
        showToast(error.message, 'error');
        throw error;
      }
    }
  };

  const signupWithEmail = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      // Write full user document — ensures completedTopics: [] and quizScores: {}
      // are always present in Firestore for new accounts created via the signup form.
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        name: fullName,
        email: email,
        completedTopics: [],
        quizScores: {},
        createdAt: new Date()
      });
      showToast('Account created successfully! 🎉');
      router.replace('/dashboard');
      return userCredential.user;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        email: userCredential.user.email || ''
      }, { merge: true });
      showToast('Logged in with Google successfully.');
      router.replace('/dashboard');
      return userCredential.user;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    firebaseSignOut(auth).then(() => {
      showToast('Logged out successfully.');
      router.replace('/');
    }).catch((err) => {
      showToast(err.message, 'error');
    });
  };

  const toggleTopicCompletion = async (topicId) => {
    if (!isLoggedIn || !user) {
      showToast('Please login to continue', 'info');
      setTimeout(() => { router.replace('/login'); }, 1000);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const isAlreadyCompleted = completedTopics.includes(topicId);

    try {
      if (isAlreadyCompleted) {
        setCompletedTopics(prev => prev.filter(id => id !== topicId));
        await updateDoc(userRef, { completedTopics: arrayRemove(topicId) });
        showToast('Topic marked as incomplete.');
      } else {
        setCompletedTopics(prev => [...prev, topicId]);
        await updateDoc(userRef, { completedTopics: arrayUnion(topicId) });
        showToast('Topic marked as completed! 🎉');
      }
    } catch {
      showToast('Failed to update progress.', 'error');
    }
  };

  const saveQuizScore = async (topicId, scorePercentage) => {
    if (!isLoggedIn || !user) {
      showToast('Sign in to permanently save your quiz scores.', 'info');
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

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isLoaded,
      completedTopics,
      quizScores,
      toast,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
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
