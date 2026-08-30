import ConfirmDialog from '../../components/common/ConfirmDialog'
import TableActions from '../../components/common/TableActions'
import { formatNumber, toNumber } from '../../utils/numbers'
import {
  getBillLines,
  getBillNumber,
  getPaidAmount,
  getRemainingAmount,
} from './dailyBillUtils'
import { useState } from 'react'

function CellText({ children, title }) {
  return (
    <span className="block truncate" title={title ?? children}>
      {children}
    </span>
  )
}

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
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-brand-red/5 text-brand-dark">
            <tr>
              <th className="w-[9%] px-2 py-2 font-semibold">Bill #</th>
              <th className="w-[10%] px-2 py-2 font-semibold">Date</th>
              <th className="w-[12%] px-2 py-2 font-semibold">Customer</th>
              <th className="w-[10%] px-2 py-2 font-semibold">Visitor</th>
              <th className="w-[19%] px-2 py-2 font-semibold">Medicines</th>
              <th className="w-[11%] px-2 py-2 font-semibold">Types</th>
              <th className="w-[5%] px-2 py-2 font-semibold text-right">Qty</th>
              <th className="w-[7%] px-2 py-2 font-semibold text-right">Total</th>
              <th className="w-[6%] px-2 py-2 font-semibold text-right">Paid</th>
              <th className="w-[7%] px-2 py-2 font-semibold text-right">Rem.</th>
              {!selectMode && <th className="w-[9%] px-2 py-2 font-semibold">Actions</th>}
              {selectMode && <th className="w-[9%] px-2 py-2 font-semibold">Select</th>}
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
                  <td className="px-2 py-2 font-medium">
                    <CellText>{getBillNumber(bill)}</CellText>
                  </td>
                  <td className="px-2 py-2">
                    <CellText>{bill.date}</CellText>
                  </td>
                  <td className="px-2 py-2">
                    <CellText title={bill.customerName}>{bill.customerName}</CellText>
                  </td>
                  <td className="px-2 py-2">
                    <CellText title={bill.visitorName}>{bill.visitorName || '—'}</CellText>
                  </td>
                  <td className="px-2 py-2">
                    <CellText title={medicineNames}>{medicineNames}</CellText>
                  </td>
                  <td className="px-2 py-2">
                    <CellText title={typeNames}>{typeNames || '—'}</CellText>
                  </td>
                  <td className="px-2 py-2 text-right">{formatNumber(totalQuantity)}</td>
                  <td className="px-2 py-2 text-right font-medium text-brand-red">
                    {formatNumber(bill.grandTotal)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {bill.moneyPaid ? formatNumber(getPaidAmount(bill)) : '—'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {getRemainingAmount(bill) > 0 ? (
                      <span className="font-medium text-amber-700">
                        {formatNumber(getRemainingAmount(bill))}
                      </span>
                    ) : (
                      formatNumber(0)
                    )}
                  </td>
                  {!selectMode && (
                    <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                      <TableActions
                        onEdit={() => onEdit(bill)}
                        onDelete={() => setDeleteTarget(bill)}
                      />
                    </td>
                  )}
                  {selectMode && (
                    <td className="px-2 py-2">
                      <span className="inline-flex rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-white">
                        Preview
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Daily Sale"
        message={`Are you sure you want to delete bill ${getBillNumber(deleteTarget)}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default DailyBillTable
