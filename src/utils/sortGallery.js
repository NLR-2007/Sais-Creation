const priorityValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.MAX_SAFE_INTEGER
}

const newestFirst = (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)

export function sortGalleryByPortfolioPriority(items) {
  return [...items].sort((a, b) => {
    const difference = priorityValue(a.portfolioPriority) - priorityValue(b.portfolioPriority)
    return difference || newestFirst(a, b)
  })
}

export function getHomeGalleryImages(items, limit = 9) {
  const selected = items.filter((item) => item.showOnHome === true)
  if (selected.length === 0) return [...items].sort(newestFirst).slice(0, limit)

  return [...selected]
    .sort((a, b) => {
      const difference = priorityValue(a.homePriority) - priorityValue(b.homePriority)
      return difference || newestFirst(a, b)
    })
    .slice(0, limit)
}
