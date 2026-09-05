import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection, useLocalStorage, usePagination } from '../../hooks'
import {
  applyBillCreditEffects,
  reverseBillCreditEffects,
} from '../../utils/customerUtils'
import { toNumber } from '../../utils/numbers'
import {
  applySaleStockMovements,
  reverseSaleStockMovements,
  validateSaleStock,
} from '../../utils/saleStockUtils'
import { notify } from '../../utils/toast'
import BillPreviewModal from '../../components/bill/BillPreviewModal'
import DailyBillFilters from './DailyBillFilters'
import DailyBillDetailModal from './DailyBillDetailModal'
import DailyBillModal from './DailyBillModal'
import DailyBillTable from './DailyBillTable'
import {
  compositeBillFromRecords,
  defaultFilters,
  filterAndSortBills,
  getBillLines,
  getBillNumber,
  groupRecordsForBillPreview,
  normalizeBill,
} from './dailyBillUtils'

function DailyBillsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectForBill = Boolean(location.state?.selectForBill)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [viewingBill, setViewingBill] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [previewBill, setPreviewBill] = useState(null)
  const [previewCustomer, setPreviewCustomer] = useState(null)
  const [mergedRecordCount, setMergedRecordCount] = useState(0)

  const { items, count, add, update, remove } = useCollection(STORAGE_KEYS.DAILY_BILLS, {
    add: 'Daily sale saved successfully',
    update: 'Daily sale updated successfully',
    remove: 'Daily sale deleted successfully',
  })

  const [customers, , refreshCustomers] = useLocalStorage(STORAGE_KEYS.CUSTOMERS)
  const [medicines] = useLocalStorage(STORAGE_KEYS.MEDICINES)
  const [visitors] = useLocalStorage(STORAGE_KEYS.VISITORS)
  const [medicineTypes] = useLocalStorage(STORAGE_KEYS.MEDICINE_TYPES)
  const [stockMovements, , refreshStockMovements] = useLocalStorage(STORAGE_KEYS.STOCK_MOVEMENTS)
  const { items: payments } = useCollection(STORAGE_KEYS.CUSTOMER_PAYMENTS)

  const filteredBills = useMemo(
    () => filterAndSortBills(items, filters),
    [items, filters],
  )

  const {
    page,
    totalPages,
    paginatedItems,
    goToPage,
    resetPage,
    pageSize,
    totalItems,
  } = usePagination(filteredBills, 6)

  useEffect(() => {
    resetPage()
  }, [filters, resetPage])

  const prevItemCountRef = useRef(items.length)
  useEffect(() => {
    if (items.length > prevItemCountRef.current) {
      resetPage()
    }
    prevItemCountRef.current = items.length
  }, [items.length, resetPage])

  const openCreateModal = () => {
    setEditingBill(null)
    setModalOpen(true)
  }

  const openEditModal = (bill) => {
    setViewingBill(null)
    setEditingBill(bill)
    setModalOpen(true)
  }

  const openViewModal = (bill) => {
    setViewingBill(bill)
  }

  const closeBillModal = () => {
    setModalOpen(false)
    setEditingBill(null)
  }

  const closeViewModal = () => {
    setViewingBill(null)
  }

  const handleSaveBill = (billData, recordId) => {
    const normalized = normalizeBill(billData)
    const oldBill = recordId ? items.find((bill) => bill.id === recordId) : null
    const availableCreditBase =
      customers.find((item) => item.id === normalized.customerId)?.creditBalance ?? 0
    const restoredCredit =
      oldBill?.customerId === normalized.customerId ? toNumber(oldBill.creditUsed) : 0
    const creditUsed = Math.min(
      toNumber(normalized.creditUsed),
      toNumber(availableCreditBase) + restoredCredit,
      normalized.grandTotal,
    )

    const finalBill = {
      ...normalized,
      creditUsed,
      moneyPaid: normalized.moneyPaid || normalized.paidAmount > 0,
    }

    const stockCheck = validateSaleStock(
      medicines,
      stockMovements,
      getBillLines(finalBill),
      recordId ?? null,
    )
    if (!stockCheck.valid) {
      notify.error(stockCheck.message)
      return
    }

    if (recordId && oldBill) {
      reverseBillCreditEffects(normalizeBill(oldBill))
      reverseSaleStockMovements(recordId)
    }

    applyBillCreditEffects(finalBill)

    if (recordId) {
      update(recordId, finalBill)
      applySaleStockMovements(recordId, finalBill)
      refreshCustomers()
      refreshStockMovements()
      return
    }

    const created = add(finalBill)
    applySaleStockMovements(created.id, finalBill)
    refreshCustomers()
    refreshStockMovements()
  }

  const handleDeleteBill = (billId) => {
    const bill = items.find((item) => item.id === billId)
    if (bill) {
      reverseBillCreditEffects(normalizeBill(bill))
      reverseSaleStockMovements(billId)
      refreshCustomers()
      refreshStockMovements()
    }
    remove(billId)
  }

  const handleSelectForBill = (bill) => {
    const groupedRecords = groupRecordsForBillPreview(bill, items)
    const compositeBill = compositeBillFromRecords(groupedRecords)
    if (!compositeBill) return

    const customer = customers.find((item) => item.id === compositeBill.customerId)
    setPreviewBill(compositeBill)
    setPreviewCustomer(customer ?? null)
    setMergedRecordCount(groupedRecords.length)

    if (groupedRecords.length > 1) {
      notify.info(
        `Bill #${getBillNumber(compositeBill)} — ${groupedRecords.length} sales records merged into one bill`,
      )
    }
  }

  const closePreview = () => {
    setPreviewBill(null)
    setPreviewCustomer(null)
    setMergedRecordCount(0)
  }

  const handlePreviewDownloaded = () => {
    closePreview()
    navigate('/bill', { replace: true })
  }

  const cancelSelectMode = () => {
    navigate('/bill')
  }

  return (
    <PageShell
      title="Daily Sales"
      description="Manage daily sales records for the medicine shop."
      badge={
        <span className="inline-flex rounded-full bg-brand-red/5 px-3 py-1 text-xs font-medium text-brand-red">
          {count} records
        </span>
      }
    >
      {selectForBill && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand-red/20 bg-brand-red/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-dark">Select a record to generate PDF bill</p>
            <p className="mt-1 text-sm text-gray-500">
              Click any row. All daily sales with the same bill number are merged automatically into one
              PDF bill.
            </p>
          </div>
          <Button variant="secondary" onClick={cancelSelectMode}>
            Cancel
          </Button>
        </div>
      )}

      {!selectForBill && (
        <div className="mb-5 flex justify-end">
          <Button onClick={openCreateModal}>Add Daily Sale</Button>
        </div>
      )}

      <DailyBillDetailModal
        open={Boolean(viewingBill)}
        onClose={closeViewModal}
        bill={viewingBill}
        onEdit={selectForBill ? null : openEditModal}
      />

      <DailyBillModal
        open={modalOpen}
        onClose={closeBillModal}
        onSave={handleSaveBill}
        record={editingBill}
        customers={customers}
        medicines={medicines}
        visitors={visitors}
        medicineTypes={medicineTypes}
        stockMovements={stockMovements}
        sales={items}
        payments={payments}
      />

      <BillPreviewModal
        open={Boolean(previewBill)}
        onClose={closePreview}
        bill={previewBill}
        customer={previewCustomer}
        mergedRecordCount={mergedRecordCount}
        onDownloaded={handlePreviewDownloaded}
      />

      <div className="space-y-5">
        <DailyBillFilters
          filters={filters}
          onChange={setFilters}
          onReset={setFilters}
          customers={customers}
          visitors={visitors}
          medicines={medicines}
          medicineTypes={medicineTypes}
        />

        <DailyBillTable
          bills={paginatedItems}
          onEdit={openEditModal}
          onDelete={handleDeleteBill}
          onView={openViewModal}
          selectMode={selectForBill}
          onSelect={handleSelectForBill}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>
    </PageShell>
  )
}

export default DailyBillsPage
