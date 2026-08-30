const STORAGE_EVENT = 'kb-storage-change'

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function readStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}

export function subscribeStorage(key, callback) {
  const handler = (event) => {
    if (event.detail?.key === key) callback()
  }
  window.addEventListener(STORAGE_EVENT, handler)
  return () => window.removeEventListener(STORAGE_EVENT, handler)
}

export function getCollection(key) {
  return readStorage(key, [])
}

export function setCollection(key, items) {
  writeStorage(key, items)
  return items
}

export function addToCollection(key, item) {
  const items = getCollection(key)
  const newItem = {
    ...item,
    id: item.id ?? createId(),
    createdAt: item.createdAt ?? new Date().toISOString(),
  }
  setCollection(key, [...items, newItem])
  return newItem
}

export function updateInCollection(key, id, updates) {
  const items = getCollection(key)
  const index = items.findIndex((item) => String(item.id) === String(id))
  if (index === -1) return null

  const updatedItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const nextItems = [...items]
  nextItems[index] = updatedItem
  setCollection(key, nextItems)
  return updatedItem
}

export function removeFromCollection(key, id) {
  const items = getCollection(key)
  setCollection(
    key,
    items.filter((item) => String(item.id) !== String(id)),
  )
}

export function findInCollection(key, id) {
  return getCollection(key).find((item) => String(item.id) === String(id)) ?? null
}

export function clearCollection(key) {
  localStorage.removeItem(key)
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}
