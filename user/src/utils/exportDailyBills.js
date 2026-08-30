import { isDateInJalaliRange, jalaliDateToSortValue } from './dateUtils'
import { formatNumber, toNumber } from './numbers'
import {
  areTableFiltersActive,
  filterBills,
  getBillLines,
  getBillNumber,
  getPaidAmount,
  getRemainingAmount,
} from '../pages/DailyBills/dailyBillUtils'

function billToRow(bill) {
  const lines = getBillLines(bill)
  const totalQuantity = lines.reduce((sum, line) => sum + toNumber(line.quantity), 0)

  return {
    'Bill #': getBillNumber(bill),
    Date: bill.date,
    Customer: bill.customerName,
    Visitor: bill.visitorName || '',
    Medicines: lines.map((line) => line.medicineName ?? line.productName).join(', '),
    Types: lines.map((line) => line.typeName).filter(Boolean).join(', '),
    Quantity: totalQuantity,
    Total: bill.grandTotal,
    'Credit Used': toNumber(bill.creditUsed) > 0 ? bill.creditUsed : 0,
    Paid: bill.moneyPaid ? getPaidAmount(bill) : 0,
    Remaining: getRemainingAmount(bill),
  }
}

export async function exportDailyBillsToExcel(bills, fromDate, toDate) {
  const { utils, writeFile } = await import('xlsx')

  const rows = bills.map(billToRow)
  const worksheet = utils.json_to_sheet(rows)

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
  ]

  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Daily Sales')

  const safeFrom = fromDate.replace(/\//g, '-')
  const safeTo = toDate.replace(/\//g, '-')
  writeFile(workbook, `daily-sales-${safeFrom}-to-${safeTo}.xlsx`)
}

export function prepareDailyBillsExport(allBills, tableFilters, fromDate, toDate) {
  let bills = areTableFiltersActive(tableFilters)
    ? filterBills(allBills, tableFilters)
    : allBills

  bills = bills.filter((bill) => isDateInJalaliRange(bill.date, fromDate, toDate))

  return bills.sort((a, b) => jalaliDateToSortValue(b.date) - jalaliDateToSortValue(a.date))
}

export function getExportSummary(bills) {
  const totalAmount = bills.reduce((sum, bill) => sum + bill.grandTotal, 0)
  return {
    count: bills.length,
    totalAmount: formatNumber(totalAmount),
  }
}
