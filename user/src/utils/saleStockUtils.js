import { STORAGE_KEYS } from '../constants/storageKeys'
import { getBillLines } from '../pages/DailyBills/dailyBillUtils'
import {
  addToCollection,
  getCollection,
  setCollection,
} from './storage'
import { calculateStockLevels } from '../pages/Stock/stockUtils'
import { toNumber } from './numbers'

export function getStockLevelMap(medicines, movements, excludeSaleId = null) {
  const filteredMovements = excludeSaleId
    ? movements.filter((movement) => movement.saleId !== excludeSaleId)
    : movements

  return calculateStockLevels(medicines, filteredMovements).reduce(
    (map, item) => ({ ...map, [item.medicineId]: item.quantity }),
    {},
  )
}

export function getMedicinesWithStock(medicines, movements, excludeSaleId = null) {
  const stockMap = getStockLevelMap(medicines, movements, excludeSaleId)
  return medicines.filter((medicine) => (stockMap[medicine.id] ?? 0) > 0)
}

export function validateSaleStock(medicines, movements, billLines, excludeSaleId = null) {
  const stockMap = getStockLevelMap(medicines, movements, excludeSaleId)
  const requirements = billLines.reduce((map, line) => {
    const medicineId = line.medicineId ?? line.productId
    map[medicineId] = (map[medicineId] ?? 0) + toNumber(line.quantity)
    return map
  }, {})

  for (const [medicineId, requiredQty] of Object.entries(requirements)) {
    const available = stockMap[medicineId] ?? 0
    const medicine = medicines.find((item) => item.id === medicineId)
    const name = medicine?.name ?? 'Medicine'

    if (available <= 0) {
      return {
        valid: false,
        message: `${name} is out of stock. Add stock first before selling.`,
      }
    }

    if (requiredQty > available) {
      return {
        valid: false,
        message: `Not enough stock for ${name}. Available: ${available}, requested: ${requiredQty}.`,
      }
    }
  }

  return { valid: true }
}

export function removeSaleStockMovements(saleId) {
  const movements = getCollection(STORAGE_KEYS.STOCK_MOVEMENTS)
  const nextMovements = movements.filter((movement) => movement.saleId !== saleId)

  if (nextMovements.length !== movements.length) {
    setCollection(STORAGE_KEYS.STOCK_MOVEMENTS, nextMovements)
  }
}

export function applySaleStockMovements(saleId, bill) {
  removeSaleStockMovements(saleId)

  const lines = getBillLines(bill)
  lines.forEach((line) => {
    const medicineId = line.medicineId ?? line.productId
    const quantity = toNumber(line.quantity)
    if (!medicineId || quantity <= 0) return

    addToCollection(STORAGE_KEYS.STOCK_MOVEMENTS, {
      medicineId,
      quantity: String(quantity),
      type: 'out',
      date: bill.date || new Date().toISOString().split('T')[0],
      notes: bill.billNumber ? `Sale bill #${bill.billNumber}` : 'Daily sale',
      saleId,
    })
  })
}

export function reverseSaleStockMovements(saleId) {
  removeSaleStockMovements(saleId)
}
