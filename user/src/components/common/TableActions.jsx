import { FiEdit2, FiTrash2 } from 'react-icons/fi'

function TableActions({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <button
          type="button"
          aria-label={editLabel}
          title={editLabel}
          onClick={onEdit}
          className="rounded-lg p-2 text-brand-gold transition-colors hover:bg-brand-gold/10 hover:text-brand-dark"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label={deleteLabel}
          title={deleteLabel}
          onClick={onDelete}
          className="rounded-lg p-2 text-brand-red transition-colors hover:bg-brand-red/10"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default TableActions
