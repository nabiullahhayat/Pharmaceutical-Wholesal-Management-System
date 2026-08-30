import { useCallback } from 'react'
import {
  addToCollection,
  removeFromCollection,
  setCollection,
  updateInCollection,
} from '../utils/storage'
import { notify } from '../utils/toast'
import { useLocalStorage } from './useLocalStorage'

const defaultMessages = {
  add: 'Saved successfully',
  update: 'Updated successfully',
  remove: 'Deleted successfully',
}

export function useCollection(storageKey, messages = {}) {
  const mergedMessages = { ...defaultMessages, ...messages }
  const [items, , refresh] = useLocalStorage(storageKey)

  const add = useCallback(
    (item) => {
      const created = addToCollection(storageKey, item)
      refresh()
      notify.success(mergedMessages.add)
      return created
    },
    [storageKey, refresh, mergedMessages.add],
  )

  const update = useCallback(
    (id, updates) => {
      const updated = updateInCollection(storageKey, id, updates)
      if (!updated) {
        notify.error('Item not found')
        return null
      }
      refresh()
      notify.success(mergedMessages.update)
      return updated
    },
    [storageKey, refresh, mergedMessages.update],
  )

  const remove = useCallback(
    (id) => {
      removeFromCollection(storageKey, id)
      refresh()
      notify.success(mergedMessages.remove)
    },
    [storageKey, refresh, mergedMessages.remove],
  )

  const replaceAll = useCallback(
    (nextItems) => {
      setCollection(storageKey, nextItems)
      refresh()
    },
    [storageKey, refresh],
  )

  return {
    items,
    count: items.length,
    add,
    update,
    remove,
    replaceAll,
    refresh,
  }
}
