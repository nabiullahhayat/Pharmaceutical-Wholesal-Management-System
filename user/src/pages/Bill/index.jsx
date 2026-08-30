import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'

function BillPage() {
  const navigate = useNavigate()

  return (
    <PageShell
      title="Bill"
      description="Generate clean PDF bills from daily sales records."
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-brand-gold/25 bg-white p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red/5 text-brand-red">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-brand-dark">Create PDF Bill</h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose a daily sales record by bill number. Preview first, then download an A4 landscape PDF
          with two duplicate copies side by side on one page.
        </p>
        <Button className="mt-6" onClick={() => navigate('/daily-sales', { state: { selectForBill: true } })}>
          Select Bill
        </Button>
      </div>
    </PageShell>
  )
}

export default BillPage
