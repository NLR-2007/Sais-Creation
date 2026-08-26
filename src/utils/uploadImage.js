import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'
import compressImage from './compressImage'

// Storage defaults to "private, max-age=0", so every visitor re-downloaded every
// photo on every page view. Object names carry a timestamp and are never rewritten
// in place, so they are safe to cache permanently.
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

export default async function uploadImage(file, folder) {
  const compressed = await compressImage(file)
  const storageRef = ref(storage, `${folder}/${Date.now()}_${compressed.name}`)
  await uploadBytes(storageRef, compressed, {
    contentType: compressed.type,
    cacheControl: CACHE_CONTROL,
  })
  return getDownloadURL(storageRef)
}
