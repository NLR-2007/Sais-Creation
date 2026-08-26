import { getDocs } from 'firebase/firestore'

// The products collection alone is over a megabyte, and it was refetched in full
// every time a visitor moved between the collection, a product and back. Results are
// held in memory for the browsing session so only the first visit pays for them.
// Admin screens deliberately bypass this and read live data.

const TTL_MS = 5 * 60 * 1000

const cache = new Map()

export function cachedDocs(key, buildQuery) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise

  // Stored before it resolves, so concurrent callers share one network request.
  const promise = getDocs(buildQuery())
    .then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    .catch((err) => {
      cache.delete(key)
      throw err
    })

  cache.set(key, { at: Date.now(), promise })
  return promise
}

export function clearCache(key) {
  if (key) cache.delete(key)
  else cache.clear()
}
