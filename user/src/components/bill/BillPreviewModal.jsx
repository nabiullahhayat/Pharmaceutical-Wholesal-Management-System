import { useRef, useState } from 'react'
import Modal from '../common/Modal'
import Button from '../ui/Button'
import BillPreviewDocument from './BillPreviewDocument'
import { exportBillPreviewToPdf } from '../../utils/generateBillPdf'
import { getBillNumber } from '../../pages/DailyBills/dailyBillUtils'
import { notify } from '../../utils/toast'

function BillPreviewModal({ open, onClose, bill, customer, onDownloaded }) {
  const previewRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !bill) return

    setExporting(true)
    try {
      await exportBillPreviewToPdf(previewRef.current, getBillNumber(bill))
      notify.success(`PDF bill downloaded for bill #${getBillNumber(bill)}`)
      onDownloaded?.()
    } catch (error) {
      console.error('PDF export failed:', error)
      notify.error('Failed to download PDF bill. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (!bill) return null

  return (
    <Modal open={open} title="Bill Preview" onClose={onClose} size="xl">
      <div className="space-y-5">
        <p className="text-sm text-gray-500">
          Portrait-style bill slot (50% page width, full height). PDF downloads as A4 landscape
          with two duplicate copies side by side — left and right.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-brand-gold/25 bg-gray-100 p-4">
          <p className="mb-3 text-center text-xs font-medium text-gray-500">
            Preview — one duplicate slot (left or right half of A4 landscape page)
          </p>
          <div ref={previewRef} className="mx-auto w-fit max-w-full">
            <BillPreviewDocument bill={bill} customer={customer} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-brand-gold/20 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={exporting}>
            Close
          </Button>
          <Button onClick={handleDownloadPdf} disabled={exporting}>
            {exporting ? 'Exporting PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default BillPreviewModal
