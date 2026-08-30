import { toNumber } from './numbers'
import { getRemainingAmount } from '../pages/DailyBills/dailyBillUtils'

export function getCustomerSales(bills, customerId) {
  return bills
    .filter((bill) => bill.customerId === customerId)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export function getCustomerBillRemainingTotal(bills, customerId) {
  return getCustomerSales(bills, customerId).reduce(
    (sum, bill) => sum + getRemainingAmount(bill),
    0,
  )
}

export function getCustomerPaymentsTotal(payments, customerId) {
  return payments
    .filter((payment) => payment.customerId === customerId)
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0)
}

export function getCustomerNetRemaining(bills, payments, customerId) {
  const billRemaining = getCustomerBillRemainingTotal(bills, customerId)
  const extraPayments = getCustomerPaymentsTotal(payments, customerId)
  return Math.max(0, billRemaining - extraPayments)
}

export function getCustomerPaymentHistory(payments, customerId) {
  return payments
    .filter((payment) => payment.customerId === customerId)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}
