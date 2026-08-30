import { STORAGE_KEYS } from '../constants/storageKeys'
import { findInCollection, updateInCollection } from './storage'
import { normalizeDecimal, toNumber } from './numbers'
import {
  getBillOverpayment,
  getRemainingAmount,
  normalizeBill,
} from '../pages/DailyBills/dailyBillUtils'

export function getCustomerCreditBalance(customer) {
  return normalizeDecimal(customer?.creditBalance)
}

export function adjustCustomerCredit(customerId, delta) {
  if (!customerId || !delta) return

  const customer = findInCollection(STORAGE_KEYS.CUSTOMERS, customerId)
  if (!customer) return

  const nextBalance = Math.max(0, normalizeDecimal(getCustomerCreditBalance(customer) + delta))
  updateInCollection(STORAGE_KEYS.CUSTOMERS, customerId, {
    creditBalance: nextBalance,
  })
}

export function getBillCreditDelta(bill) {
  const creditUsed = toNumber(bill?.creditUsed)
  const overpay = getBillOverpayment(bill)
  return overpay - creditUsed
}

export function applyBillCreditEffects(bill) {
  const delta = getBillCreditDelta(bill)
  if (delta !== 0) {
    adjustCustomerCredit(bill.customerId, delta)
  }
}

export function reverseBillCreditEffects(bill) {
  const delta = getBillCreditDelta(bill)
  if (delta !== 0) {
    adjustCustomerCredit(bill.customerId, -delta)
  }
}

export function getCustomerSales(bills, customerId) {
  return bills
    .filter((bill) => bill.customerId === customerId)
    .map(normalizeBill)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export function getCustomerBillRemainingTotal(bills, customerId) {
  return normalizeDecimal(
    getCustomerSales(bills, customerId).reduce(
      (sum, bill) => sum + getRemainingAmount(bill),
      0,
    ),
  )
}

export function getCustomerPaymentsTotal(payments, customerId) {
  return normalizeDecimal(
    payments
      .filter((payment) => payment.customerId === customerId)
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0),
  )
}

export function getCustomerNetRemaining(bills, payments, customerId) {
  const billRemaining = getCustomerBillRemainingTotal(bills, customerId)
  const extraPayments = getCustomerPaymentsTotal(payments, customerId)
  return Math.max(0, normalizeDecimal(billRemaining - extraPayments))
}

export function getCustomerPaymentHistory(payments, customerId) {
  return payments
    .filter((payment) => payment.customerId === customerId)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export function getAvailableCreditForBill(customers, customerId, editingBill = null) {
  const customer = customers.find((item) => item.id === customerId)
  const baseCredit = getCustomerCreditBalance(customer)

  if (editingBill?.customerId === customerId) {
    return baseCredit + toNumber(editingBill.creditUsed)
  }

  return baseCredit
}
