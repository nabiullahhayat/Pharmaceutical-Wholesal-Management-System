import { normalizeDecimal, subtractNumbers, toNumber } from '../../utils/numbers'

export const defaultFilters = {
  search: '',
  customerIds: [],
  visitorIds: [],
  medicineIds: [],
  typeIds: [],
  quantity: '',
}

export function getBillLines(bill) {
  if (!bill) return []
  return bill.medicines ?? bill.products ?? []
}

export function normalizeBill(bill) {
  const medicines = getBillLines(bill)

  return {
    ...bill,
    medicines,
    date: bill?.date ?? '',
    customerId: bill?.customerId ?? '',
    customerName: bill?.customerName ?? '',
    visitorId: bill?.visitorId ?? null,
    visitorName: bill?.visitorName ?? '',
    grandTotal: normalizeDecimal(bill?.grandTotal),
    creditUsed: normalizeDecimal(bill?.creditUsed),
    moneyPaid: Boolean(bill?.moneyPaid),
    paidAmount: normalizeDecimal(bill?.paidAmount),
    billNumber: bill?.billNumber ?? '',
  }
}

export function getBillNumber(bill) {
  if (!bill) return '—'
  return bill.billNumber?.trim() || '—'
}

export function normalizeBillNumber(value) {
  return String(value ?? '').trim()
}

export function getRecordsByBillNumber(billNumber, allRecords) {
  const target = normalizeBillNumber(billNumber)
  if (!target) return []

  return (Array.isArray(allRecords) ? allRecords : [])
    .map(normalizeBill)
    .filter((item) => normalizeBillNumber(item.billNumber) === target)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export function groupRecordsForBillPreview(record, allRecords) {
  const matches = getRecordsByBillNumber(record?.billNumber, allRecords)
  if (matches.length > 0) return matches
  return record ? [normalizeBill(record)] : []
}

export function compositeBillFromRecords(records) {
  if (!records?.length) return null

  const normalized = records.map(normalizeBill)
  const first = normalized[0]
  const medicines = normalized.flatMap((record) => getBillLines(record))

  const grandTotal = normalizeDecimal(
    normalized.reduce((sum, record) => sum + toNumber(record.grandTotal), 0),
  )
  const creditUsed = normalizeDecimal(
    normalized.reduce((sum, record) => sum + toNumber(record.creditUsed), 0),
  )
  const paidAmount = normalizeDecimal(
    normalized.reduce(
      (sum, record) => sum + (record.moneyPaid ? toNumber(record.paidAmount) : 0),
      0,
    ),
  )

  return normalizeBill({
    ...first,
    medicines,
    grandTotal,
    creditUsed,
    paidAmount,
    moneyPaid: paidAmount > 0 || creditUsed > 0,
  })
}

export function getPaidAmount(bill) {
  if (!bill?.moneyPaid) return 0
  return normalizeDecimal(bill.paidAmount)
}

export function getBillAmountDue(bill) {
  if (!bill) return 0
  return Math.max(0, normalizeDecimal(subtractNumbers(bill.grandTotal, bill.creditUsed)))
}

export function getBillOverpayment(bill) {
  if (!bill) return 0
  const paid = getPaidAmount(bill)
  const amountDue = getBillAmountDue(bill)
  return Math.max(0, normalizeDecimal(paid - amountDue))
}

export function getRemainingAmount(bill) {
  if (!bill) return 0
  const amountDue = getBillAmountDue(bill)
  const paid = getPaidAmount(bill)
  return Math.max(0, normalizeDecimal(amountDue - paid))
}

export function areTableFiltersActive(filters) {
  return (
    filters.search.trim() !== '' ||
    filters.customerIds.length > 0 ||
    filters.visitorIds.length > 0 ||
    filters.medicineIds.length > 0 ||
    filters.typeIds.length > 0 ||
    filters.quantity !== ''
  )
}

export function filterBills(bills, filters) {
  const search = filters.search.trim().toLowerCase()

  return bills.map(normalizeBill).filter((bill) => {
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

    if (filters.quantity !== '' && totalQuantity !== toNumber(filters.quantity)) return false

    if (!search) return true

    const paidAmount = getPaidAmount(bill)
    const remainingAmount = getRemainingAmount(bill)

    const haystack = [
      getBillNumber(bill),
      bill.date,
      bill.customerName,
      bill.visitorName,
      lines.map((line) => line.medicineName ?? line.productName).join(' '),
      lines.map((line) => line.typeName).join(' '),
      String(totalQuantity),
      String(bill.grandTotal),
      bill.moneyPaid ? String(paidAmount) : 'not paid',
      String(remainingAmount),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

export function sortDailyBillsNewestFirst(bills) {
  return [...bills].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime()
    const bTime = new Date(b.createdAt ?? 0).getTime()
    if (aTime !== bTime) return bTime - aTime
    return String(b.id ?? '').localeCompare(String(a.id ?? ''))
  })
}

export function filterAndSortBills(bills, filters) {
  return sortDailyBillsNewestFirst(filterBills(bills, filters))
}

export function formatPaymentStatus(bill) {
  const paid = getPaidAmount(bill)
  const remaining = getRemainingAmount(bill)
  if (!bill?.moneyPaid) return { paid, remaining, label: 'Not paid' }
  if (remaining <= 0) return { paid, remaining: 0, label: 'Fully paid' }
  return { paid, remaining, label: 'Partially paid' }
}
