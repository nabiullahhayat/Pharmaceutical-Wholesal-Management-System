import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/common/PageShell'
import Button from '../../components/ui/Button'
import { LOGO_PATH } from '../../constants/brand'

const features = [
  {
    title: 'Select from Daily Sales',
    description: 'Pick any sales record by bill number from your daily sales list.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: 'Auto-Merge Records',
    description: 'All sales with the same bill number are combined into one invoice.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Export A4 PDF',
    description: 'Download a clean, international-style invoice with two copies on one page.',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

function BillPage() {
  const navigate = useNavigate()

  return (
    <PageShell
      title="Invoice Generator"
      description="Create professional PDF invoices from your daily sales records."
    >
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#3d42a8] to-brand-secondary px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute right-8 top-8 h-20 w-20 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute bottom-6 right-1/3 h-12 w-12 rounded-full border border-white/10" />

            <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
              <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/95 p-3 shadow-lg shadow-black/10 sm:mb-0 sm:mr-6">
                <img src={LOGO_PATH} alt="ROHED ARABZAI" className="h-full w-full object-contain" />
              </div>
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Generate PDF Invoice</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                  Select a daily sales record, preview your invoice, and download a print-ready A4
                  landscape PDF with duplicate copies on one page.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white"
              >
                <div className="mb-3 inline-flex rounded-xl bg-brand-primary/10 p-2.5 text-brand-primary">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-brand-dark">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-6 py-6 text-center sm:px-8">
            <Button
              className="min-w-[200px]"
              onClick={() => navigate('/daily-sales', { state: { selectForBill: true } })}
            >
              Select Sales Record
            </Button>
            <p className="mt-3 text-xs text-slate-400">
              You will be redirected to Daily Sales to choose a bill
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

export default BillPage
