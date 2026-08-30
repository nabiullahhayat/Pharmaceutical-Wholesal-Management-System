import { useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import PageShell from '../../components/common/PageShell'
import SearchBar from '../../components/common/SearchBar'
import TableActions from '../../components/common/TableActions'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Button from '../../components/ui/Button'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection, useLocalStorage } from '../../hooks'
import { notify } from '../../utils/toast'
import { calculateStockLevels, filterStockLevels, sortMovements } from './stockUtils'

const movementTypes = [
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
]

const emptyForm = () => ({
  medicineId: '',
  quantity: '',
  type: 'in',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

function StockPage() {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [medicines] = useLocalStorage(STORAGE_KEYS.MEDICINES)
  const movements = useCollection(STORAGE_KEYS.STOCK_MOVEMENTS, {
    add: 'Stock movement recorded',
    remove: 'Stock movement deleted',
  })

  const stockLevels = useMemo(
    () => calculateStockLevels(medicines, movements.items),
    [medicines, movements.items],
  )

  const filteredLevels = useMemo(
    () => filterStockLevels(stockLevels, search),
    [stockLevels, search],
  )

  const recentMovements = useMemo(
    () => sortMovements(movements.items).slice(0, 10),
    [movements.items],
  )

  const medicineMap = useMemo(
    () => medicines.reduce((map, medicine) => ({ ...map, [medicine.id]: medicine }), {}),
    [medicines],
  )

  const lowStockCount = stockLevels.filter((item) => item.quantity <= 10).length

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.medicineId) {
      notify.error('Please select a medicine')
      return
    }

    const quantity = Number(form.quantity)
    if (!quantity || quantity <= 0) {
      notify.error('Please enter a valid quantity')
      return
    }

    if (form.type === 'out') {
      const current = stockLevels.find((item) => item.medicineId === form.medicineId)
      if (current && current.quantity < quantity) {
        notify.error('Not enough stock available')
        return
      }
    }

    movements.add({
      medicineId: form.medicineId,
      quantity: String(quantity),
      type: form.type,
      date: form.date,
      notes: form.notes.trim(),
    })

    setForm(emptyForm())
  }

  const handleDeleteMovement = () => {
    if (!deleteTarget) return
    movements.remove(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <PageShell
      title="Stock"
      description="Track medicine stock levels and record stock in/out movements."
      badge={
        <span className="inline-flex rounded-full bg-brand-red/5 px-3 py-1 text-xs font-medium text-brand-red">
          {stockLevels.length} medicines · {lowStockCount} low stock
        </span>
      }
    >
      <div className="mb-5 rounded-2xl border border-brand-gold/25 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-dark">Record Stock Movement</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add stock when medicines arrive or remove stock when sold or expired.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-dark">Medicine</span>
            <select
              value={form.medicineId}
              onChange={(event) => setForm({ ...form, medicineId: event.target.value })}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-red"
            >
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            placeholder="Enter quantity"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-dark">Type</span>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              className="w-full rounded-lg border border-brand-gold/40 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-red"
            >
              {movementTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />

          <Input
            label="Notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Optional notes"
          />

          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              Save Movement
            </Button>
          </div>
        </form>
      </div>

      <div className="mb-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by medicine, company, or formula..."
        />
      </div>

      {medicines.length === 0 ? (
        <EmptyState
          title="No medicines yet"
          description="Add medicines in the Adds menu before managing stock."
        />
      ) : filteredLevels.length === 0 ? (
        <EmptyState
          title="No matching stock records"
          description="Try a different search term or add a stock movement."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-gold/25 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-red/5 text-brand-dark">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">#</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Medicine Name</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Formula</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/15">
                {filteredLevels.map((item, index) => (
                  <tr key={item.medicineId} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{item.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.formula || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.company || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          item.quantity <= 0
                            ? 'bg-red-100 text-red-700'
                            : item.quantity <= 10
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700',
                        ].join(' ')}
                      >
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentMovements.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-gold/25 bg-white">
          <div className="border-b border-brand-gold/20 px-4 py-3 sm:px-5">
            <h3 className="text-base font-semibold text-brand-dark">Recent Movements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-red/5 text-brand-dark">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Medicine</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Quantity</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Notes</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/15">
                {recentMovements.map((movement) => {
                  const medicine = medicineMap[movement.medicineId]
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 whitespace-nowrap">{movement.date || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {medicine?.name ?? 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                            movement.type === 'in'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700',
                          ].join(' ')}
                        >
                          {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{movement.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{movement.notes || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TableActions onDelete={() => setDeleteTarget(movement)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Stock Movement"
        message="Are you sure you want to delete this stock movement? Stock levels will be recalculated."
        onConfirm={handleDeleteMovement}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

export default StockPage
