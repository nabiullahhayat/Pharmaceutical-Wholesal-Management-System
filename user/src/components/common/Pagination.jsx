import Button from '../ui/Button'

function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-brand-gold/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing {from}-{to} of {totalItems}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="min-w-16 text-center text-sm font-medium text-brand-dark">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination
