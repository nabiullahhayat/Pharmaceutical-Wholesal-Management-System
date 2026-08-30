import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection, useLocalStorage, usePagination } from '../../hooks'
import { exportDailyBillsToExcel } from '../../utils/exportDailyBills'
import BillPreviewModal from '../../components/bill/BillPreviewModal'
import DailyBillExportModal from './DailyBillExportModal'
import DailyBillFilters from './DailyBillFilters'
import DailyBillModal from './DailyBillModal'
import DailyBillTable from './DailyBillTable'
import { defaultFilters, filterBills } from './dailyBillUtils'

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

  const [customers] = useLocalStorage(STORAGE_KEYS.CUSTOMERS)
  const [medicines] = useLocalStorage(STORAGE_KEYS.MEDICINES)
  const [visitors] = useLocalStorage(STORAGE_KEYS.VISITORS)
  const [medicineTypes] = useLocalStorage(STORAGE_KEYS.MEDICINE_TYPES)

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
    if (recordId) {
      update(recordId, billData)
      return
    }
    add(billData)
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
        existingBills={items}
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
          onDelete={remove}
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
