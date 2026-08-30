import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from './ConfirmDialog'
import EmptyState from './EmptyState'
import Input from './Input'
import Modal from './Modal'
import TableActions from './TableActions'
import { notify } from '../../utils/toast'

function buildInitialForm(fields) {
  return fields.reduce((form, field) => {
    form[field.key] = ''
    return form
  }, {})
}

function NameCrudPanel({
  title,
  description,
  fields,
  columns,
  items,
  onAdd,
  onUpdate,
  onRemove,
  addLabel,
  emptyTitle = 'No records yet',
  emptyDescription = 'Add your first record using the form above.',
}) {
  const [form, setForm] = useState(() => buildInitialForm(fields))
  const [editingRecord, setEditingRecord] = useState(null)
  const [editForm, setEditForm] = useState(() => buildInitialForm(fields))
  const [deleteTarget, setDeleteTarget] = useState(null)

  const resetForm = () => setForm(buildInitialForm(fields))

  const validateForm = (values) => {
    for (const field of fields) {
      if (field.required && !String(values[field.key] ?? '').trim()) {
        notify.error(`${field.label} is required`)
        return false
      }
    }
    return true
  }

  const buildPayload = (values) =>
    fields.reduce((payload, field) => {
      payload[field.key] = String(values[field.key] ?? '').trim()
      return payload
    }, {})

  const handleAdd = (event) => {
    event.preventDefault()
    if (!validateForm(form)) return
    onAdd(buildPayload(form))
    resetForm()
  }

  const openEdit = (record) => {
    setEditingRecord(record)
    setEditForm(
      fields.reduce((nextForm, field) => {
        nextForm[field.key] = record[field.key] ?? ''
        return nextForm
      }, {}),
    )
  }

  const closeEdit = () => {
    setEditingRecord(null)
    setEditForm(buildInitialForm(fields))
  }

  const handleUpdate = () => {
    if (!editingRecord || !validateForm(editForm)) return
    onUpdate(editingRecord.id, buildPayload(editForm))
    closeEdit()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    onRemove(deleteTarget.id)
    setDeleteTarget(null)
  }

  const tableColumns = useMemo(
    () => [{ key: '__index', label: '#' }, ...columns, { key: '__actions', label: 'Actions' }],
    [columns],
  )

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-gold/25 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-dark">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>

        <form onSubmit={handleAdd} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              value={form[field.key]}
              onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
              placeholder={field.placeholder}
              type={field.type ?? 'text'}
            />
          ))}
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              {addLabel ?? `Add ${title.slice(0, -1)}`}
            </Button>
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-gold/25 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-red/5 text-brand-dark">
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/15">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80">
                    {tableColumns.map((column) => {
                      if (column.key === '__index') {
                        return (
                          <td key={column.key} className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {index + 1}
                          </td>
                        )
                      }

                      if (column.key === '__actions') {
                        return (
                          <td key={column.key} className="px-4 py-3 whitespace-nowrap">
                            <TableActions
                              onEdit={() => openEdit(item)}
                              onDelete={() => setDeleteTarget(item)}
                            />
                          </td>
                        )
                      }

                      const value = item[column.key]
                      return (
                        <td key={column.key} className="px-4 py-3 whitespace-nowrap">
                          {column.render ? column.render(value, item) : value || '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(editingRecord)}
        title={`Edit ${title.slice(0, -1)}`}
        onClose={closeEdit}
        size="md"
      >
        <div className="space-y-4">
          {fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              value={editForm[field.key]}
              onChange={(event) => setEditForm({ ...editForm, [field.key]: event.target.value })}
              placeholder={field.placeholder}
              type={field.type ?? 'text'}
            />
          ))}
          <div className="flex flex-col-reverse gap-3 border-t border-brand-gold/20 pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${title.slice(0, -1)}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default NameCrudPanel
