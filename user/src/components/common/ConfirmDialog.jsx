import Button from '../ui/Button'
import Modal from './Modal'

function ConfirmDialog({
  open,
  title = 'Confirm delete',
  message = 'Are you sure you want to delete this record?',
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="md">
      <p className="text-sm leading-6 text-gray-600">{message}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
