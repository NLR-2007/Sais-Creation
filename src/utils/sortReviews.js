const priorityValue = (value) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : Number.MAX_SAFE_INTEGER
}

const createdAtMillis = (item) => item.createdAt?.toMillis?.() || 0

export function sortReviewsByPriority(items) {
  return [...items].sort((a, b) => {
    const priorityDifference = priorityValue(a.reviewPriority) - priorityValue(b.reviewPriority)
    if (priorityDifference !== 0) return priorityDifference
    return createdAtMillis(b) - createdAtMillis(a)
  })
}

export function nextReviewPriority(items) {
  return items.reduce((highest, item) => {
    const priority = Number(item.reviewPriority)
    return Number.isInteger(priority) && priority >= 1 ? Math.max(highest, priority) : highest
  }, 0) + 1
}
