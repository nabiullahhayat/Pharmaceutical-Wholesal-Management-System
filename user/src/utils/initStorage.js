import { STORAGE_COLLECTION_KEYS, STORAGE_KEYS } from '../constants/storageKeys'
import { readStorage, writeStorage } from './storage'

function migrateProductsToMedicines() {
  const medicinesKey = STORAGE_KEYS.MEDICINES
  const productsKey = STORAGE_KEYS.PRODUCTS

  if (localStorage.getItem(medicinesKey) !== null) return

  const legacyProducts = readStorage(productsKey, [])
  if (legacyProducts.length > 0) {
    writeStorage(
      medicinesKey,
      legacyProducts.map((item) => ({
        ...item,
        country: item.country ?? '',
        createdDate: item.createdDate ?? '',
        expireDate: item.expireDate ?? '',
        company: item.company ?? '',
        formula: item.formula ?? '',
        price: item.price ?? '',
      })),
    )
    return
  }

  writeStorage(medicinesKey, [])
}

export function initializeStorage() {
  migrateProductsToMedicines()

  STORAGE_COLLECTION_KEYS.forEach((key) => {
    if (localStorage.getItem(key) === null) {
      writeStorage(key, [])
    }
  })
}

export function getStorageSnapshot() {
  return STORAGE_COLLECTION_KEYS.reduce((snapshot, key) => {
    snapshot[key] = readStorage(key, [])
    return snapshot
  }, {})
}
