import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db, functions } from '../config/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, addDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

const AuthContext = createContext(null)
const googleProvider = new GoogleAuthProvider()

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminVerified, setAdminVerified] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setUserProfile({ uid: firebaseUser.uid, ...snap.data() })
          } else {
            setUserProfile({ uid: firebaseUser.uid, name: firebaseUser.displayName || '', email: firebaseUser.email || '', role: 'user' })
          }
        } catch {
          setUserProfile(null)
        }
      } else {
        setUser(null)
        setUserProfile(null)
        setAdminVerified(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) {
      setUserProfile({ uid: cred.user.uid, ...snap.data() })
    }
    return cred.user
  }

  const loginWithMobile = async (phone, password) => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('phone', '==', phone))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('No account found with this mobile number')
    const userData = snap.docs[0].data()
    if (!userData.email) throw new Error('No email linked to this account. Please login with email.')
    const cred = await signInWithEmailAndPassword(auth, userData.email, password)
    setUserProfile({ uid: cred.user.uid, ...userData })
    return cred.user
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const snap = await getDoc(doc(db, 'users', result.user.uid))
    if (snap.exists()) {
      setUserProfile({ uid: result.user.uid, ...snap.data() })
    } else {
      const profile = {
        name: result.user.displayName || '',
        email: result.user.email || '',
        phone: '',
        countryCode: '',
        address: '',
        role: 'user',
        createdAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', result.user.uid), profile)
      setUserProfile({ uid: result.user.uid, ...profile })
      await addDoc(collection(db, 'orders'), {
        customerName: result.user.displayName || '',
        customerEmail: result.user.email || '',
        customerPhone: '',
        customerAddress: '',
        items: [],
        status: 'new',
        sentVia: 'registration',
        createdAt: serverTimestamp(),
      })
    }
    return result.user
  }

  const registerWithEmail = async ({ name, email, password, phone, countryCode, address }) => {
    const authEmail = email || `${countryCode.replace('+', '')}${phone}@user.saiscreation.local`
    const cred = await createUserWithEmailAndPassword(auth, authEmail, password)
    await updateProfile(cred.user, { displayName: name })
    const profile = {
      name,
      email: email || '',
      phone,
      countryCode,
      address,
      role: 'user',
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), profile)
    setUserProfile({ uid: cred.user.uid, ...profile })
    await addDoc(collection(db, 'orders'), {
      customerName: name,
      customerEmail: email || '',
      customerPhone: `${countryCode}${phone}`,
      customerAddress: address,
      items: [],
      status: 'new',
      sentVia: 'registration',
      createdAt: serverTimestamp(),
    })
    return cred.user
  }

  // Admin-only Telegram OTP 2FA
  const sendAdminOtp = async () => {
    const fn = httpsCallable(functions, 'sendAdminTelegramOtp')
    const result = await fn({ uid: user?.uid })
    return result.data
  }

  const verifyAdminOtp = async (otp) => {
    const fn = httpsCallable(functions, 'verifyAdminTelegramOtp')
    const result = await fn({ uid: user?.uid, otp })
    if (result.data.success) {
      setAdminVerified(true)
    }
    return result.data
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
    setAdminVerified(false)
  }

  const isAdmin = userProfile?.role === 'admin'
  const isAdminFullyVerified = isAdmin && adminVerified

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    adminVerified,
    isAdminFullyVerified,
    loginWithEmail,
    loginWithMobile,
    loginWithGoogle,
    registerWithEmail,
    sendAdminOtp,
    verifyAdminOtp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
