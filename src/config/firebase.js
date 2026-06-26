import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyAxhXSId8aAXOeqfkWwyeeNlEd3bn_DdcU",
  authDomain: "decor-by-saiscreations-l-ffacd.firebaseapp.com",
  projectId: "decor-by-saiscreations-l-ffacd",
  storageBucket: "decor-by-saiscreations-l-ffacd.firebasestorage.app",
  messagingSenderId: "127013948766",
  appId: "1:127013948766:web:bbea3962621c559b6a13cf",
  measurementId: "G-QZ6PNRKHVV",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app, 'asia-south1')
export default app
