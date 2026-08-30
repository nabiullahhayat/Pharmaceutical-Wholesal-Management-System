import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import MultiSelect from '../../components/common/MultiSelect'
import { getTodayJalali, isValidJalaliDateString } from '../../utils/dateUtils'
import { calculateLineTotal, sumLineTotals, toNumber, formatNumber } from '../../utils/numbers'
import { generateUniqueToken } from '../../utils/tokenUtils'
import { getBillLines, getExistingTokens } from './dailyBillUtils'
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
  existingBills = [],
  record = null,
}) {
  const [date, setDate] = useState(getTodayJalali())
  const [token, setToken] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [visitorId, setVisitorId] = useState('')
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([])
  const [medicineLines, setMedicineLines] = useState({})
  const [moneyPaid, setMoneyPaid] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')

  const customerOptions = useMemo(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    [customers],
  )

  const visitorOptions = useMemo(
    () => visitors.map((visitor) => ({ value: visitor.id, label: visitor.name })),
    [visitors],
  )

  const medicineOptions = useMemo(
    () => medicines.map((medicine) => ({ value: medicine.id, label: medicine.name })),
    [medicines],
  )

  const typeOptions = useMemo(
    () => medicineTypes.map((type) => ({ value: type.id, label: type.name })),
    [medicineTypes],
  )

  const loadFromRecord = (bill) => {
    const lines = getBillLines(bill)
    setDate(bill.date)
    setToken(getBillTokenFromRecord(bill))
    setCustomerId(bill.customerId ?? '')
    setVisitorId(bill.visitorId ?? '')
    setSelectedMedicineIds(lines.map((line) => line.medicineId ?? line.productId))
    setMedicineLines(
      lines.reduce((nextLines, line) => {
        const medicineId = line.medicineId ?? line.productId
        nextLines[medicineId] = {
          typeId: line.typeId ?? '',
          quantity: String(line.quantity ?? ''),
          pricePerUnit: String(line.pricePerUnit ?? ''),
          total: line.total ?? 0,
        }
        return nextLines
      }, {}),
    )
    setMoneyPaid(Boolean(bill.moneyPaid))
    setPaidAmount(bill.moneyPaid ? String(bill.paidAmount ?? '') : '')
  }

  function getBillTokenFromRecord(bill) {
    return bill.token ?? bill.billNumber ?? ''
  }

  const resetForm = () => {
    setDate(getTodayJalali())
    setToken(generateUniqueToken(getExistingTokens(existingBills)))
    setCustomerId('')
    setVisitorId('')
    setSelectedMedicineIds([])
    setMedicineLines({})
    setMoneyPaid(false)
    setPaidAmount('')
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
    if (moneyPaid && toNumber(paidAmount) > grandTotal) {
      notify.error('Paid amount cannot be greater than total')
      return
    }

    const customer = customers.find((item) => item.id === customerId)
    const visitor = visitors.find((item) => item.id === visitorId)

    onSave(
      {
        date,
        token,
        customerId,
        customerName: customer?.name ?? '',
        visitorId: visitorId || null,
        visitorName: visitor?.name ?? '',
        medicines: lineTotals,
        grandTotal,
        moneyPaid,
        paidAmount: moneyPaid ? toNumber(paidAmount) : 0,
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
          <Input label="Token" value={token} readOnly />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-dark">Customer</span>
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-3 py-2 text-sm text-brand-dark"
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
          </label>
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-brand-dark">Visitor (Optional)</span>
            <select
              value={visitorId}
              onChange={(event) => setVisitorId(event.target.value)}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-3 py-2 text-sm text-brand-dark"
            >
              <option value="">Select visitor</option>
              {visitorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {visitors.length === 0 && (
              <span className="mt-1 block text-xs text-gray-500">
                Add visitors first in the Adds menu
              </span>
            )}
          </label>
        </div>

        <MultiSelect
          label="Medicines"
          options={medicineOptions}
          value={selectedMedicineIds}
          onChange={setSelectedMedicineIds}
          placeholder="Select medicines"
          emptyMessage="Add medicines first in the Adds menu"
        />

        {selectedMedicines.length > 0 && (
          <div className="space-y-3 rounded-xl border border-brand-gold/25 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-brand-dark">Medicine Details</h3>
            {selectedMedicines.map((medicine) => {
              const line = medicineLines[medicine.id] ?? emptyLine()
              return (
                <div
                  key={medicine.id}
                  className="rounded-lg border border-brand-gold/20 bg-white p-3"
                >
                  <p className="mb-3 text-sm font-medium text-brand-red">{medicine.name}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-brand-dark">Type</span>
                      <select
                        value={line.typeId}
                        onChange={(event) => updateLine(medicine.id, 'typeId', event.target.value)}
                        className="w-full rounded-lg border border-brand-gold/40 bg-white px-3 py-2 text-sm text-brand-dark"
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
              max={grandTotal || undefined}
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              placeholder="Enter paid amount"
            />
          )}
          {moneyPaid && paidAmount && (
            <p className="mt-2 text-sm text-gray-500">
              Remaining: {formatNumber(Math.max(0, grandTotal - toNumber(paidAmount)))}
            </p>
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
