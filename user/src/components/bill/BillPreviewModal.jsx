import { useRef, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../ui/Button'
import BillPreviewDocument from './BillPreviewDocument'
import { exportBillPreviewToPdf } from '../../utils/generateBillPdf'
import { getBillNumber } from '../../pages/DailyBills/dailyBillUtils'
import { notify } from '../../utils/toast'

function BillPreviewModal({ open, onClose, bill, customer, mergedRecordCount = 0, onDownloaded }) {
  const previewRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !bill) return

    setExporting(true)
    try {
      await exportBillPreviewToPdf(previewRef.current, getBillNumber(bill))
      notify.success(`PDF invoice downloaded for bill #${getBillNumber(bill)}`)
      onDownloaded?.()
    } catch (error) {
      console.error('PDF export failed:', error)
      notify.error('Failed to download PDF invoice. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (!bill) return null

  return (
    <Modal open={open} title="Invoice Preview" onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">
              Professional Invoice
            </p>
            <p className="mt-1 text-sm text-slate-600">
              A4 landscape PDF with two duplicate copies side by side on one page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Bill #{getBillNumber(bill)}
            </span>
            {mergedRecordCount > 1 && (
              <span className="inline-flex items-center rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-3 py-1 text-xs font-semibold text-brand-secondary">
                {mergedRecordCount} records merged
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Live Preview — One Copy Slot
          </p>
          <div ref={previewRef} className="mx-auto w-fit max-w-full">
            <BillPreviewDocument bill={bill} customer={customer} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={exporting}>
            Close
          </Button>
          <Button onClick={handleDownloadPdf} disabled={exporting}>
            {exporting ? 'Generating PDF...' : 'Download PDF Invoice'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default BillPreviewModal
