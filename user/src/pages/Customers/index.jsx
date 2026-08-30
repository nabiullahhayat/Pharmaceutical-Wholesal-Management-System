import { useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection, useLocalStorage } from '../../hooks'
import { getTodayJalali, isValidJalaliDateString } from '../../utils/dateUtils'
import {
  getCustomerNetRemaining,
  getCustomerPaymentHistory,
  getCustomerSales,
} from '../../utils/customerUtils'
import {
  getBillToken,
  getPaidAmount,
  getRemainingAmount,
} from '../DailyBills/dailyBillUtils'
import { formatNumber, toNumber } from '../../utils/numbers'
import { notify } from '../../utils/toast'

function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(getTodayJalali())
  const [paymentNotes, setPaymentNotes] = useState('')

  const [customers] = useLocalStorage(STORAGE_KEYS.CUSTOMERS)
  const [sales] = useLocalStorage(STORAGE_KEYS.DAILY_BILLS)
  const payments = useCollection(STORAGE_KEYS.CUSTOMER_PAYMENTS, {
    add: 'Payment recorded successfully',
    remove: 'Payment removed successfully',
  })

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  )

  const customerSales = useMemo(
    () => (selectedCustomerId ? getCustomerSales(sales, selectedCustomerId) : []),
    [sales, selectedCustomerId],
  )

  const paymentHistory = useMemo(
    () =>
      selectedCustomerId ? getCustomerPaymentHistory(payments.items, selectedCustomerId) : [],
    [payments.items, selectedCustomerId],
  )

  const netRemaining = useMemo(
    () =>
      selectedCustomerId
        ? getCustomerNetRemaining(sales, payments.items, selectedCustomerId)
        : 0,
    [sales, payments.items, selectedCustomerId],
  )

  const handleRecordPayment = () => {
    if (!selectedCustomerId) return

    if (!isValidJalaliDateString(paymentDate)) {
      notify.error('Please enter a valid solar date')
      return
    }

    const amount = toNumber(paymentAmount)
    if (!amount || amount <= 0) {
      notify.error('Please enter a valid payment amount')
      return
    }

    if (amount > netRemaining) {
      notify.error(`Payment cannot exceed remaining balance (${formatNumber(netRemaining)})`)
      return
    }

    payments.add({
      customerId: selectedCustomerId,
      amount: String(amount),
      date: paymentDate,
      notes: paymentNotes.trim(),
    })

    setPaymentAmount('')
    setPaymentNotes('')
    setPaymentDate(getTodayJalali())
  }

  return (
    <PageShell
      title="Customers"
      description="View customer profiles, sales history, and remaining balances."
      badge={
        <span className="inline-flex rounded-full bg-brand-red/5 px-3 py-1 text-xs font-medium text-brand-red">
          {customers.length} customers
        </span>
      }
    >
      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add customers in the Adds menu first."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-brand-gold/25 bg-white p-3">
            <h2 className="mb-3 px-2 text-sm font-semibold text-brand-dark">All Customers</h2>
            <div className="max-h-[70vh] space-y-1 overflow-y-auto">
              {customers.map((customer) => {
                const remaining = getCustomerNetRemaining(sales, payments.items, customer.id)
                const isActive = customer.id === selectedCustomerId

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={[
                      'w-full rounded-xl px-3 py-3 text-left transition-colors',
                      isActive
                        ? 'bg-brand-red/10 text-brand-red'
                        : 'hover:bg-gray-50 text-brand-dark',
                    ].join(' ')}
                  >
                    <p className="font-medium">{customer.name}</p>
                    {customer.phone && (
                      <p className="mt-0.5 text-xs text-gray-500">{customer.phone}</p>
                    )}
                    {remaining > 0 && (
                      <p className="mt-1 text-xs font-semibold text-amber-700">
                        Remaining: {formatNumber(remaining)}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-gold/25 bg-white p-4 sm:p-5">
            {!selectedCustomer ? (
              <EmptyState
                title="Select a customer"
                description="Choose a customer from the list to view their profile and sales history."
              />
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-brand-dark">{selectedCustomer.name}</h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {selectedCustomer.phone && <p>Phone: {selectedCustomer.phone}</p>}
                    {selectedCustomer.address && <p>Address: {selectedCustomer.address}</p>}
                  </div>
                </div>

                {netRemaining > 0 && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-800">
                      This customer has remaining money
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-900">
                      {formatNumber(netRemaining)}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-brand-gold/25 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-brand-dark">Pay Remaining Balance</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Payment Amount"
                      type="number"
                      min="0"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      placeholder="Enter amount"
                    />
                    <Input
                      label="Date (Solar)"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                    />
                  </div>
                  <Input
                    className="mt-3"
                    label="Notes"
                    value={paymentNotes}
                    onChange={(event) => setPaymentNotes(event.target.value)}
                    placeholder="Optional notes"
                  />
                  <Button
                    className="mt-3"
                    onClick={handleRecordPayment}
                    disabled={netRemaining <= 0}
                  >
                    Record Payment
                  </Button>
                  {netRemaining <= 0 && (
                    <p className="mt-2 text-xs text-gray-500">No remaining balance to pay.</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-brand-dark">Daily Sales History</h3>
                  {customerSales.length === 0 ? (
                    <p className="text-sm text-gray-500">No sales records for this customer yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-brand-gold/25">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-brand-red/5 text-brand-dark">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Token</th>
                            <th className="px-3 py-2 font-semibold">Date</th>
                            <th className="px-3 py-2 font-semibold">Total</th>
                            <th className="px-3 py-2 font-semibold">Paid</th>
                            <th className="px-3 py-2 font-semibold">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gold/15">
                          {customerSales.map((sale) => {
                            const remaining = getRemainingAmount(sale)
                            return (
                              <tr key={sale.id} className="hover:bg-gray-50/80">
                                <td className="px-3 py-2 whitespace-nowrap font-medium">
                                  {getBillToken(sale)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">{sale.date}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  {formatNumber(sale.grandTotal)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  {sale.moneyPaid ? formatNumber(getPaidAmount(sale)) : '—'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  {remaining > 0 ? (
                                    <span className="font-medium text-amber-700">
                                      {formatNumber(remaining)}
                                    </span>
                                  ) : (
                                    formatNumber(0)
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {paymentHistory.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-brand-dark">Balance Payments</h3>
                    <div className="overflow-x-auto rounded-xl border border-brand-gold/25">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-brand-red/5 text-brand-dark">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Date</th>
                            <th className="px-3 py-2 font-semibold">Amount</th>
                            <th className="px-3 py-2 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gold/15">
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-3 py-2 whitespace-nowrap">{payment.date}</td>
                              <td className="px-3 py-2 whitespace-nowrap font-medium text-green-700">
                                {formatNumber(payment.amount)}
                              </td>
                              <td className="px-3 py-2">{payment.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default CustomersPage
