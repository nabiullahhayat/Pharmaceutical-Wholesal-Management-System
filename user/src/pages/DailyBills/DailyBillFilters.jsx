import Input from '../../components/common/Input'
import MultiSelect from '../../components/common/MultiSelect'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/ui/Button'
import { defaultFilters } from './dailyBillUtils'

function DailyBillFilters({
  filters,
  onChange,
  onReset,
  customers,
  visitors,
  medicines,
  medicineTypes,
}) {
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }))
  const visitorOptions = visitors.map((visitor) => ({
    value: visitor.id,
    label: visitor.name,
  }))
  const medicineOptions = medicines.map((medicine) => ({
    value: medicine.id,
    label: medicine.name,
  }))
  const typeOptions = medicineTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }))

  const setField = (field, value) => {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="rounded-xl border border-brand-gold/20 bg-white p-3">
      <div className="flex flex-wrap items-end gap-2 lg:flex-nowrap">
        <div className="w-full min-w-[160px] flex-[1.4] lg:w-auto">
          <span className="mb-1 block text-xs font-medium text-gray-500">Search</span>
          <SearchBar
            value={filters.search}
            onChange={(value) => setField('search', value)}
            placeholder="Search table..."
          />
        </div>

        <div className="min-w-[120px] flex-1">
          <MultiSelect
            label="Customer"
            options={customerOptions}
            value={filters.customerIds}
            onChange={(value) => setField('customerIds', value)}
            placeholder="All"
          />
        </div>

        <div className="min-w-[120px] flex-1">
          <MultiSelect
            label="Visitor"
            options={visitorOptions}
            value={filters.visitorIds}
            onChange={(value) => setField('visitorIds', value)}
            placeholder="All"
          />
        </div>

        <div className="min-w-[120px] flex-1">
          <MultiSelect
            label="Medicine"
            options={medicineOptions}
            value={filters.medicineIds}
            onChange={(value) => setField('medicineIds', value)}
            placeholder="All"
          />
        </div>

        <div className="min-w-[100px] flex-1">
          <MultiSelect
            label="Type"
            options={typeOptions}
            value={filters.typeIds}
            onChange={(value) => setField('typeIds', value)}
            placeholder="All"
          />
        </div>

        <div className="w-24 shrink-0">
          <Input
            label="Quantity"
            type="number"
            min="0"
            value={filters.quantity}
            onChange={(event) => setField('quantity', event.target.value)}
            placeholder="All"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-end"
          onClick={() => onReset(defaultFilters)}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}

export default DailyBillFilters
