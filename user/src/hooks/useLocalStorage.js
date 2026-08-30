import { useCallback, useEffect, useRef, useState } from 'react'
import { getCollection, subscribeStorage, writeStorage } from '../utils/storage'

const EMPTY_ARRAY = []

export function useLocalStorage(key, initialValue = EMPTY_ARRAY) {
  const initialRef = useRef(initialValue)

  const [items, setItems] = useState(() => {
    const stored = getCollection(key)
    return stored.length > 0 ? stored : initialRef.current
  })

  useEffect(() => {
    const sync = () => {
      const stored = getCollection(key)
      setItems(stored.length > 0 ? stored : initialRef.current)
    }

    sync()
    return subscribeStorage(key, sync)
  }, [key])

  const setItemsAndPersist = useCallback(
    (value) => {
      setItems((current) => {
        const nextValue = typeof value === 'function' ? value(current) : value
        writeStorage(key, nextValue)
        return nextValue
      })
    },
    [key],
  )

  const refresh = useCallback(() => {
    const stored = getCollection(key)
    setItems(stored.length > 0 ? stored : initialRef.current)
  }, [key])

  return [items, setItemsAndPersist, refresh]
}
