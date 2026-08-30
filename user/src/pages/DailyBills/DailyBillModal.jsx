import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import MultiSelect from '../../components/common/MultiSelect'
import { getTodayJalali, isValidJalaliDateString } from '../../utils/dateUtils'
import {
  calculateLineTotal,
  formatNumber,
  normalizeDecimal,
  sumLineTotals,
  toDecimalInputValue,
  toNumber,
} from '../../utils/numbers'
import { getAvailableCreditForBill } from '../../utils/customerUtils'
import { getStockLevelMap } from '../../utils/saleStockUtils'
import {
  getBillAmountDue,
  getBillLines,
  getRemainingAmount,
} from './dailyBillUtils'
import { notify } from '../../utils/toast'

const emptyLine = () => ({
  typeId: '',
  quantity: '',
  pricePerUnit: '',
  total: 0,
})

function DailyBillModal({
  open,
  onClose,
  onSave,
  customers,
  medicines,
  visitors,
  medicineTypes,
  stockMovements = [],
  record = null,
}) {
  const [date, setDate] = useState(getTodayJalali())
  const [billNumber, setBillNumber] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [visitorId, setVisitorId] = useState('')
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([])
  const [medicineLines, setMedicineLines] = useState({})
  const [moneyPaid, setMoneyPaid] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [creditUsed, setCreditUsed] = useState('')

  const customerOptions = useMemo(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    [customers],
  )

  const visitorOptions = useMemo(
    () => visitors.map((visitor) => ({ value: visitor.id, label: visitor.name })),
    [visitors],
  )

  const stockMap = useMemo(
    () => getStockLevelMap(medicines, stockMovements, record?.id ?? null),
    [medicines, stockMovements, record],
  )

  const medicineOptions = useMemo(() => {
    const inStock = medicines.filter((medicine) => (stockMap[medicine.id] ?? 0) > 0)
    if (!record) {
      return inStock.map((medicine) => ({
        value: medicine.id,
        label: `${medicine.name} (${stockMap[medicine.id]} in stock)`,
      }))
    }

    const currentIds = getBillLines(record).map((line) => line.medicineId ?? line.productId)
    const merged = [...inStock]
    currentIds.forEach((medicineId) => {
      if (!merged.some((medicine) => medicine.id === medicineId)) {
        const medicine = medicines.find((item) => item.id === medicineId)
        if (medicine) merged.push(medicine)
      }
    })

    return merged.map((medicine) => ({
      value: medicine.id,
      label: `${medicine.name} (${stockMap[medicine.id] ?? 0} in stock)`,
    }))
  }, [medicines, stockMap, record])

  const typeOptions = useMemo(
    () => medicineTypes.map((type) => ({ value: type.id, label: type.name })),
    [medicineTypes],
  )

  const availableCredit = useMemo(
    () => (customerId ? getAvailableCreditForBill(customers, customerId, record) : 0),
    [customers, customerId, record],
  )

  const loadFromRecord = (bill) => {
    const lines = getBillLines(bill)
    setDate(bill.date)
    setBillNumber(bill.billNumber ?? '')
    setCustomerId(bill.customerId ?? '')
    setVisitorId(bill.visitorId ?? '')
    setSelectedMedicineIds(lines.map((line) => line.medicineId ?? line.productId))
    setMedicineLines(
      lines.reduce((nextLines, line) => {
        const medicineId = line.medicineId ?? line.productId
        nextLines[medicineId] = {
          typeId: line.typeId ?? '',
          quantity: toDecimalInputValue(line.quantity),
          pricePerUnit: toDecimalInputValue(line.pricePerUnit),
          total: line.total ?? 0,
        }
        return nextLines
      }, {}),
    )
    setMoneyPaid(Boolean(bill.moneyPaid))
    setPaidAmount(bill.moneyPaid ? toDecimalInputValue(bill.paidAmount) : '')
    setCreditUsed(toNumber(bill.creditUsed) > 0 ? toDecimalInputValue(bill.creditUsed) : '')
  }

  const resetForm = () => {
    setDate(getTodayJalali())
    setBillNumber('')
    setCustomerId('')
    setVisitorId('')
    setSelectedMedicineIds([])
    setMedicineLines({})
    setMoneyPaid(false)
    setPaidAmount('')
    setCreditUsed('')
  }

  useEffect(() => {
    if (!open) return
    if (record) {
      loadFromRecord(record)
      return
    }
    resetForm()
  }, [open, record])

  useEffect(() => {
    setMedicineLines((prev) => {
      const next = { ...prev }
      selectedMedicineIds.forEach((medicineId) => {
        if (!next[medicineId]) next[medicineId] = emptyLine()
      })
      Object.keys(next).forEach((medicineId) => {
        if (!selectedMedicineIds.includes(medicineId)) delete next[medicineId]
      })
      return next
    })
  }, [selectedMedicineIds])

  useEffect(() => {
    if (!open || record) return
    setCreditUsed('')
  }, [customerId, open, record])

  const selectedMedicines = useMemo(
    () => medicines.filter((medicine) => selectedMedicineIds.includes(medicine.id)),
    [medicines, selectedMedicineIds],
  )

  const lineTotals = selectedMedicines.map((medicine) => {
    const line = medicineLines[medicine.id] ?? emptyLine()
    const type = medicineTypes.find((item) => item.id === line.typeId)
    return {
      medicineId: medicine.id,
      medicineName: medicine.name,
      typeId: line.typeId,
      typeName: type?.name ?? '',
      quantity: toNumber(line.quantity),
      pricePerUnit: toNumber(line.pricePerUnit),
      total: calculateLineTotal(line.quantity, line.pricePerUnit),
    }
  })

  const grandTotal = sumLineTotals(lineTotals)
  const creditUsedAmount = Math.min(toNumber(creditUsed), availableCredit, grandTotal)
  const paidValue = moneyPaid ? toNumber(paidAmount) : 0
  const creditEarned = Math.max(0, paidValue - getBillAmountDue({
    grandTotal,
    creditUsed: creditUsedAmount,
    moneyPaid: moneyPaid || paidValue > 0,
    paidAmount: paidValue,
  }))

  const previewBill = useMemo(
    () => ({
      grandTotal,
      creditUsed: creditUsedAmount,
      moneyPaid: moneyPaid || paidValue > 0,
      paidAmount: paidValue,
    }),
    [grandTotal, creditUsedAmount, moneyPaid, paidValue],
  )

  const updateLine = (medicineId, field, value) => {
    setMedicineLines((prev) => {
      const current = prev[medicineId] ?? emptyLine()
      const nextLine = { ...current, [field]: value }
      nextLine.total = calculateLineTotal(nextLine.quantity, nextLine.pricePerUnit)
      return { ...prev, [medicineId]: nextLine }
    })
  }

  const handleSave = () => {
    if (!isValidJalaliDateString(date)) {
      notify.error('Please enter a valid solar date (1405/06/07)')
      return
    }
    if (!billNumber.trim()) {
      notify.error('Please enter a bill number')
      return
    }
    if (!customerId) {
      notify.error('Please select a customer')
      return
    }
    if (selectedMedicineIds.length === 0) {
      notify.error('Please select at least one medicine')
      return
    }

    const hasInvalidLine = lineTotals.some(
      (line) => !line.typeId || !line.quantity || !line.pricePerUnit,
    )
    if (hasInvalidLine) {
      notify.error('Please fill type, quantity, and price for every medicine')
      return
    }
    if (moneyPaid && !String(paidAmount).trim()) {
      notify.error('Please enter the paid amount')
      return
    }
    if (toNumber(creditUsed) > availableCredit) {
      notify.error(`Credit used cannot exceed available balance (${formatNumber(availableCredit)})`)
      return
    }
    if (toNumber(creditUsed) > grandTotal) {
      notify.error('Credit used cannot exceed bill total')
      return
    }

    const customer = customers.find((item) => item.id === customerId)
    const visitor = visitors.find((item) => item.id === visitorId)

    onSave(
      {
        date,
        billNumber: billNumber.trim(),
        customerId,
        customerName: customer?.name ?? '',
        visitorId: visitorId || null,
        visitorName: visitor?.name ?? '',
        medicines: lineTotals.map((line) => ({
          ...line,
          quantity: normalizeDecimal(line.quantity),
          pricePerUnit: normalizeDecimal(line.pricePerUnit),
          total: normalizeDecimal(line.total),
        })),
        grandTotal: normalizeDecimal(grandTotal),
        creditUsed: normalizeDecimal(creditUsedAmount),
        moneyPaid: moneyPaid || paidValue > 0,
        paidAmount: normalizeDecimal(paidValue),
      },
      record?.id ?? null,
    )
    onClose()
  }

  return (
    <Modal open={open} title={record ? 'Edit Daily Sale' : 'Add Daily Sale'} onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Date (Solar)"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            placeholder="1405/06/07"
          />
          <Input
            label="Bill Number"
            value={billNumber}
            onChange={(event) => setBillNumber(event.target.value)}
            placeholder="Enter bill number"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Customer</span>
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-2.5 py-1.5 text-sm text-brand-dark"
            >
              <option value="">Select customer</option>
              {customerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <span className="mt-1 block text-xs text-gray-500">
                Add customers first in the Adds menu
              </span>
            )}
            {customerId && availableCredit > 0 && (
              <span className="mt-1 block text-xs font-medium text-green-700">
                Available credit: {formatNumber(availableCredit)}
              </span>
            )}
          </label>
          <label className="block sm:col-span-2 lg:col-span-4">
            <span className="mb-1 block text-xs font-medium text-gray-500">Visitor (Optional)</span>
            <select
              value={visitorId}
              onChange={(event) => setVisitorId(event.target.value)}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-2.5 py-1.5 text-sm text-brand-dark"
            >
              <option value="">Select visitor</option>
              {visitorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <MultiSelect
          label="Medicines"
          options={medicineOptions}
          value={selectedMedicineIds}
          onChange={setSelectedMedicineIds}
          placeholder="Select medicines"
          emptyMessage="Add stock first — no medicines available to sell."
        />

        {medicineOptions.length === 0 && (
          <p className="text-sm text-amber-700">
            No medicines in stock. Add stock in the Stock menu before creating a sale.
          </p>
        )}

        {selectedMedicines.length > 0 && (
          <div className="space-y-3 rounded-xl border border-brand-gold/25 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-brand-dark">Medicine Details</h3>
            {selectedMedicines.map((medicine) => {
              const line = medicineLines[medicine.id] ?? emptyLine()
              const availableStock = stockMap[medicine.id] ?? 0
              return (
                <div
                  key={medicine.id}
                  className="rounded-lg border border-brand-gold/20 bg-white p-3"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-brand-red">{medicine.name}</p>
                    <span
                      className={[
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        availableStock <= 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700',
                      ].join(' ')}
                    >
                      In stock: {formatNumber(availableStock)}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-500">Type</span>
                      <select
                        value={line.typeId}
                        onChange={(event) => updateLine(medicine.id, 'typeId', event.target.value)}
                        className="w-full rounded-lg border border-brand-gold/40 bg-white px-2.5 py-1.5 text-sm text-brand-dark"
                      >
                        <option value="">Select type</option>
                        {typeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      label="Quantity"
                      type="number"
                      min="0"
                      max={availableStock > 0 ? availableStock : undefined}
                      value={line.quantity}
                      onChange={(event) => updateLine(medicine.id, 'quantity', event.target.value)}
                    />
                    <Input
                      label="Price"
                      type="number"
                      min="0"
                      value={line.pricePerUnit}
                      onChange={(event) =>
                        updateLine(medicine.id, 'pricePerUnit', event.target.value)
                      }
                    />
                    <Input
                      label="Total"
                      value={formatNumber(calculateLineTotal(line.quantity, line.pricePerUnit))}
                      readOnly
                    />
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between rounded-lg bg-brand-red/5 px-4 py-3 text-sm font-semibold text-brand-dark">
              <span>Total Money</span>
              <span>{formatNumber(grandTotal)}</span>
            </div>
          </div>
        )}

        {customerId && availableCredit > 0 && grandTotal > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <Input
              label="Use Customer Credit"
              type="number"
              min="0"
              max={Math.min(availableCredit, grandTotal)}
              value={creditUsed}
              onChange={(event) => setCreditUsed(event.target.value)}
              placeholder={`Up to ${formatNumber(Math.min(availableCredit, grandTotal))}`}
            />
            <p className="mt-2 text-xs text-green-800">
              Available credit: {formatNumber(availableCredit)}
              {creditUsedAmount > 0 && (
                <>
                  {' · '}
                  Amount due after credit: {formatNumber(getBillAmountDue(previewBill))}
                </>
              )}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-brand-gold/25 p-4">
          <p className="mb-3 text-sm font-medium text-brand-dark">Did the money get paid?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMoneyPaid(true)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                moneyPaid
                  ? 'bg-brand-red text-white'
                  : 'border border-brand-gold/40 text-brand-dark'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setMoneyPaid(false)
                setPaidAmount('')
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                !moneyPaid
                  ? 'bg-brand-red text-white'
                  : 'border border-brand-gold/40 text-brand-dark'
              }`}
            >
              No
            </button>
          </div>
          {moneyPaid && (
            <Input
              className="mt-3"
              label="Paid Amount"
              type="number"
              min="0"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              placeholder="Enter paid amount"
            />
          )}
          {(creditUsedAmount > 0 || moneyPaid) && grandTotal > 0 && (
            <div className="mt-3 space-y-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {creditUsedAmount > 0 && <p>Credit used: {formatNumber(creditUsedAmount)}</p>}
              <p>Amount due: {formatNumber(getBillAmountDue(previewBill))}</p>
              {moneyPaid && (
                <>
                  <p>Remaining on bill: {formatNumber(getRemainingAmount(previewBill))}</p>
                  {creditEarned > 0 && (
                    <p className="font-medium text-green-700">
                      Extra {formatNumber(creditEarned)} will be saved as customer credit
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-brand-gold/20 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{record ? 'Update' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default DailyBillModal
