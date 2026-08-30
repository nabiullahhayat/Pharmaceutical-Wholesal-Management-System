import { toNumber } from '../../utils/numbers'

export const defaultFilters = {
  search: '',
  customerIds: [],
  visitorIds: [],
  medicineIds: [],
  typeIds: [],
  quantityMin: '',
  quantityMax: '',
  totalMin: '',
  totalMax: '',
}

export function getBillLines(bill) {
  if (!bill) return []
  return bill.medicines ?? bill.products ?? []
}

export function getBillToken(bill) {
  if (!bill) return '—'
  return bill.token ?? bill.billNumber ?? '—'
}

function matchesRange(value, min, max) {
  const numericValue = toNumber(value)
  if (min !== '' && numericValue < toNumber(min)) return false
  if (max !== '' && numericValue > toNumber(max)) return false
  return true
}

export function areTableFiltersActive(filters) {
  return (
    filters.search.trim() !== '' ||
    filters.customerIds.length > 0 ||
    filters.visitorIds.length > 0 ||
    filters.medicineIds.length > 0 ||
    filters.typeIds.length > 0 ||
    filters.quantityMin !== '' ||
    filters.quantityMax !== '' ||
    filters.totalMin !== '' ||
    filters.totalMax !== ''
  )
}

export function filterBills(bills, filters) {
  const search = filters.search.trim().toLowerCase()

  return bills.filter((bill) => {
    if (filters.customerIds.length > 0 && !filters.customerIds.includes(bill.customerId)) {
      return false
    }

    if (filters.visitorIds.length > 0) {
      if (!bill.visitorId || !filters.visitorIds.includes(bill.visitorId)) return false
    }

    const lines = getBillLines(bill)
    const lineMedicineIds = lines.map((line) => line.medicineId ?? line.productId)

    if (filters.medicineIds.length > 0) {
      const hasMedicine = filters.medicineIds.some((medicineId) =>
        lineMedicineIds.includes(medicineId),
      )
      if (!hasMedicine) return false
    }

    if (filters.typeIds.length > 0) {
      const lineTypeIds = lines.map((line) => line.typeId).filter(Boolean)
      const hasType = filters.typeIds.some((typeId) => lineTypeIds.includes(typeId))
      if (!hasType) return false
    }

    const totalQuantity = lines.reduce((sum, line) => sum + toNumber(line.quantity), 0)

    if (!matchesRange(totalQuantity, filters.quantityMin, filters.quantityMax)) return false
    if (!matchesRange(bill.grandTotal, filters.totalMin, filters.totalMax)) return false

    if (!search) return true

    const haystack = [
      getBillToken(bill),
      bill.date,
      bill.customerName,
      bill.visitorName,
      lines.map((line) => line.medicineName ?? line.productName).join(' '),
      lines.map((line) => line.typeName).join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

export function getExistingTokens(bills) {
  return bills.map((bill) => getBillToken(bill)).filter((token) => token !== '—')
}

export function getPaidAmount(bill) {
  if (!bill) return 0
  if (!bill.moneyPaid) return 0
  return toNumber(bill.paidAmount)
}

export function getRemainingAmount(bill) {
  if (!bill) return 0
  return Math.max(0, toNumber(bill.grandTotal) - getPaidAmount(bill))
}

export function formatPaymentStatus(bill) {
  const paid = getPaidAmount(bill)
  const remaining = getRemainingAmount(bill)
  if (!bill?.moneyPaid) return { paid, remaining, label: 'Not paid' }
  if (remaining <= 0) return { paid, remaining: 0, label: 'Fully paid' }
  return { paid, remaining, label: 'Partially paid' }
}
