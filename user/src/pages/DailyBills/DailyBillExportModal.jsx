import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { getTodayJalali, isValidJalaliDateString, jalaliDateToSortValue } from '../../utils/dateUtils'
import { areTableFiltersActive } from './dailyBillUtils'
import { getExportSummary, prepareDailyBillsExport } from '../../utils/exportDailyBills'
import { notify } from '../../utils/toast'

function DailyBillExportModal({ open, onClose, allBills, tableFilters, onExport }) {
  const [fromDate, setFromDate] = useState(getTodayJalali())
  const [toDate, setToDate] = useState(getTodayJalali())
  const [exporting, setExporting] = useState(false)

  const filtersActive = areTableFiltersActive(tableFilters)

  const previewBills = useMemo(() => {
    if (!isValidJalaliDateString(fromDate) || !isValidJalaliDateString(toDate)) return []
    return prepareDailyBillsExport(allBills, tableFilters, fromDate, toDate)
  }, [allBills, tableFilters, fromDate, toDate])

  const summary = getExportSummary(previewBills)

  const handleExport = async () => {
    if (!isValidJalaliDateString(fromDate) || !isValidJalaliDateString(toDate)) {
      notify.error('Please enter valid solar dates')
      return
    }

    if (jalaliDateToSortValue(fromDate) > jalaliDateToSortValue(toDate)) {
      notify.error('From date cannot be after to date')
      return
    }

    if (previewBills.length === 0) {
      notify.error('No records found for this export')
      return
    }

    setExporting(true)
    try {
      await onExport(previewBills, fromDate, toDate)
      notify.success(`Exported ${previewBills.length} daily sale records`)
      onClose()
    } catch {
      notify.error('Failed to export Excel file')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal open={open} title="Export to Excel" onClose={onClose} size="md">
      <div className="space-y-5">
        <div className="rounded-xl border border-brand-gold/25 bg-brand-gold/5 px-4 py-3 text-sm text-brand-dark">
          {filtersActive ? (
            <p>
              Table filters are active. Export will use filtered data within the selected date range.
            </p>
          ) : (
            <p>
              No table filters active. Export will include all records within the selected date range.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="From Date (Solar)"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            placeholder="1405/06/01"
          />
          <Input
            label="To Date (Solar)"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            placeholder="1405/06/30"
          />
        </div>

        <div className="rounded-xl border border-brand-gold/25 px-4 py-3 text-sm">
          <p className="text-gray-500">Records ready to export</p>
          <p className="mt-1 text-lg font-semibold text-brand-dark">
            {summary.count} bills · Total {summary.totalAmount}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-brand-gold/20 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DailyBillExportModal
