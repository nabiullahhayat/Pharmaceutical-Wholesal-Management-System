import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection, useLocalStorage, usePagination } from '../../hooks'
import { exportDailyBillsToExcel } from '../../utils/exportDailyBills'
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
import DailyBillExportModal from './DailyBillExportModal'
import DailyBillFilters from './DailyBillFilters'
import DailyBillModal from './DailyBillModal'
import DailyBillTable from './DailyBillTable'
import { defaultFilters, filterBills, getBillLines, normalizeBill } from './dailyBillUtils'

function DailyBillsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectForBill = Boolean(location.state?.selectForBill)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const [previewBill, setPreviewBill] = useState(null)
  const [previewCustomer, setPreviewCustomer] = useState(null)

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

  const filteredBills = useMemo(
    () => filterBills(items, filters),
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

  const handleExport = async (bills, fromDate, toDate) => {
    await exportDailyBillsToExcel(bills, fromDate, toDate)
  }

  const openCreateModal = () => {
    setEditingBill(null)
    setModalOpen(true)
  }

  const openEditModal = (bill) => {
    setEditingBill(bill)
    setModalOpen(true)
  }

  const closeBillModal = () => {
    setModalOpen(false)
    setEditingBill(null)
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
    const customer = customers.find((item) => item.id === bill.customerId)
    setPreviewBill(bill)
    setPreviewCustomer(customer ?? null)
  }

  const closePreview = () => {
    setPreviewBill(null)
    setPreviewCustomer(null)
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
            <p className="mt-1 text-sm text-gray-500">Click any row below to preview the bill, then download as PDF.</p>
          </div>
          <Button variant="secondary" onClick={cancelSelectMode}>
            Cancel
          </Button>
        </div>
      )}

      {!selectForBill && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setExportModalOpen(true)}>
            Export to Excel
          </Button>
          <Button onClick={openCreateModal}>Add Daily Sale</Button>
        </div>
      )}

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
      />

      <BillPreviewModal
        open={Boolean(previewBill)}
        onClose={closePreview}
        bill={previewBill}
        customer={previewCustomer}
        onDownloaded={handlePreviewDownloaded}
      />

      <DailyBillExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        allBills={items}
        tableFilters={filters}
        onExport={handleExport}
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
