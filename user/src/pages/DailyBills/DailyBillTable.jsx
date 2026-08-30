import ConfirmDialog from '../../components/common/ConfirmDialog'
import TableActions from '../../components/common/TableActions'
import { formatNumber, toNumber } from '../../utils/numbers'
import { getBillLines, getBillToken, getPaidAmount, getRemainingAmount } from './dailyBillUtils'
import { useState } from 'react'

function DailyBillTable({ bills, onEdit, onDelete, selectMode = false, onSelect }) {
  const [deleteTarget, setDeleteTarget] = useState(null)

  if (bills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-gold/40 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-brand-dark">No sales records found</p>
        <p className="mt-2 text-sm text-gray-500">
          {selectMode
            ? 'No records match your filters. Try clearing filters or add a daily sale first.'
            : 'Add a daily sale or adjust your filters.'}
        </p>
      </div>
    )
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleRowClick = (bill) => {
    if (!selectMode || !onSelect) return
    onSelect(bill)
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-brand-gold/25 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-red/5 text-brand-dark">
              <tr>
                <th className="px-4 py-3 font-semibold">Token</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Visitor</th>
                <th className="px-4 py-3 font-semibold">Medicines</th>
                <th className="px-4 py-3 font-semibold">Types</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                {!selectMode && <th className="px-4 py-3 font-semibold">Actions</th>}
                {selectMode && <th className="px-4 py-3 font-semibold">Select</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/15">
              {bills.map((bill) => {
                const lines = getBillLines(bill)
                const totalQuantity = lines.reduce((sum, line) => sum + toNumber(line.quantity), 0)
                const medicineNames = lines
                  .map((line) => line.medicineName ?? line.productName)
                  .join(', ')
                const typeNames = lines.map((line) => line.typeName).filter(Boolean).join(', ')

                return (
                  <tr
                    key={bill.id}
                    onClick={() => handleRowClick(bill)}
                    className={[
                      'hover:bg-gray-50/80',
                      selectMode ? 'cursor-pointer hover:bg-brand-red/5' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{getBillToken(bill)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{bill.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{bill.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{bill.visitorName || '—'}</td>
                    <td className="px-4 py-3 min-w-40">{medicineNames}</td>
                    <td className="px-4 py-3 min-w-32">{typeNames || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatNumber(totalQuantity)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-red">
                      {formatNumber(bill.grandTotal)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {bill.moneyPaid ? formatNumber(getPaidAmount(bill)) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getRemainingAmount(bill) > 0 ? (
                        <span className="font-medium text-amber-700">
                          {formatNumber(getRemainingAmount(bill))}
                        </span>
                      ) : (
                        formatNumber(0)
                      )}
                    </td>
                    {!selectMode && (
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                        <TableActions
                          onEdit={() => onEdit(bill)}
                          onDelete={() => setDeleteTarget(bill)}
                        />
                      </td>
                    )}
                    {selectMode && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white">
                          Preview Bill
                        </span>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Daily Sale"
        message={`Are you sure you want to delete sale token ${getBillToken(deleteTarget)}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default DailyBillTable
