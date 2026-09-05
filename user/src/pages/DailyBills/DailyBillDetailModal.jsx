import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import { formatNumber, toNumber } from '../../utils/numbers'
import {
  formatPaymentStatus,
  getBillAmountDue,
  getBillLines,
  getBillNumber,
  getBillOverpayment,
  getPaidAmount,
  getRemainingAmount,
} from './dailyBillUtils'

function DetailField({ label, value, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-dark">{value || '—'}</p>
    </div>
  )
}

function SummaryLine({ label, value, highlight = false, negative = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={[
          'font-semibold tabular-nums',
          highlight ? 'text-brand-secondary' : negative ? 'text-emerald-600' : 'text-brand-dark',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  )
}

function DailyBillDetailModal({ open, onClose, bill, onEdit }) {
  if (!bill) return null

  const lines = getBillLines(bill)
  const totalQuantity = lines.reduce((sum, line) => sum + toNumber(line.quantity), 0)
  const paymentStatus = formatPaymentStatus(bill)
  const creditUsed = toNumber(bill.creditUsed)
  const amountDue = getBillAmountDue(bill)
  const paidAmount = getPaidAmount(bill)
  const remaining = getRemainingAmount(bill)
  const overpayment = getBillOverpayment(bill)

  const statusStyles = {
    'Fully paid': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'Partially paid': 'bg-amber-50 text-amber-700 ring-amber-200',
    'Not paid': 'bg-slate-100 text-slate-600 ring-slate-200',
  }

  return (
    <Modal open={open} title={`Invoice Details — #${getBillNumber(bill)}`} onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">
              Sales Record
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Complete breakdown of medicines, quantities, and payment status.
            </p>
          </div>
          <span
            className={[
              'inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
              statusStyles[paymentStatus.label] ?? statusStyles['Not paid'],
            ].join(' ')}
          >
            {paymentStatus.label}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Bill Number" value={getBillNumber(bill)} />
          <DetailField label="Date" value={bill.date} />
          <DetailField label="Customer" value={bill.customerName} />
          <DetailField label="Visitor" value={bill.visitorName || '—'} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-brand-dark">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold text-right">Qty</th>
                  <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, index) => (
                  <tr key={`${line.medicineId ?? line.productId}-${index}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {line.medicineName ?? line.productName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{line.typeName || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(line.quantity)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(line.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-brand-primary">
                      {formatNumber(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-brand-dark">
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
                    {formatNumber(totalQuantity)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-brand-secondary">
                    {formatNumber(bill.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 p-4 lg:col-span-3">
            <h3 className="mb-1 text-sm font-semibold text-brand-dark">Payment Summary</h3>
            <p className="mb-3 text-xs text-slate-400">Financial breakdown for this invoice</p>
            <dl>
              <SummaryLine label="Grand Total" value={formatNumber(bill.grandTotal)} />
              {creditUsed > 0 && (
                <SummaryLine label="Credit Used" value={`− ${formatNumber(creditUsed)}`} negative />
              )}
              <SummaryLine label="Amount Due" value={formatNumber(amountDue)} />
              {bill.moneyPaid && (
                <>
                  <SummaryLine label="Paid Amount" value={formatNumber(paidAmount)} />
                  <SummaryLine
                    label="Remaining Balance"
                    value={formatNumber(remaining)}
                    highlight={remaining > 0}
                  />
                </>
              )}
              {overpayment > 0 && (
                <SummaryLine label="Credit Earned" value={formatNumber(overpayment)} negative />
              )}
              <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                <SummaryLine
                  label="Total Due"
                  value={formatNumber(remaining > 0 ? remaining : 0)}
                  highlight
                />
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-brand-dark">At a Glance</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Line Items</dt>
                <dd className="font-semibold">{lines.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total Quantity</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(totalQuantity)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Payment Received</dt>
                <dd className="font-semibold">{bill.moneyPaid ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onClose()
                onEdit(bill)
              }}
            >
              Edit Record
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default DailyBillDetailModal
