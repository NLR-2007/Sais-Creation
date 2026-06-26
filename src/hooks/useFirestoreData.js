import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore'

export function useProducts(defaultProducts) {
  const [products, setProducts] = useState(defaultProducts)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (snap.size > 0) {
          setProducts(snap.docs.map((d, i) => ({
            id: d.id,
            ...d.data(),
            numId: i + 1,
          })))
        }
      } catch { /* Firestore not configured — use defaults */ }
      setLoaded(true)
    }
    fetch()
  }, [])

  return { products, loaded }
}

export function useGallery(defaultGallery) {
  const [gallery, setGallery] = useState(defaultGallery)

  useEffect(() => {
    async function fetch() {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (snap.size > 0) {
          setGallery(snap.docs.map((d, i) => ({
            id: d.id,
            ...d.data(),
            numId: i + 1,
          })))
        }
      } catch { /* use defaults */ }
    }
    fetch()
  }, [])

  return gallery
}

export function useTestimonials(defaultTestimonials) {
  const [testimonials, setTestimonials] = useState(defaultTestimonials)

  useEffect(() => {
    async function fetch() {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (snap.size > 0) {
          setTestimonials(snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })))
        }
      } catch { /* use defaults */ }
    }
    fetch()
  }, [])

  return testimonials
}

export function useSiteContent(sectionId) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', sectionId))
        if (snap.exists()) setContent(snap.data())
      } catch { /* use defaults */ }
    }
    fetch()
  }, [sectionId])

  return content
}
