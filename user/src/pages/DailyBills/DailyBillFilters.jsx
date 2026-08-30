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
    <div className="rounded-2xl border border-brand-gold/25 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-brand-dark">Filters</h2>
        <Button variant="ghost" size="sm" onClick={() => onReset(defaultFilters)}>
          Clear filters
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SearchBar
          value={filters.search}
          onChange={(value) => setField('search', value)}
          placeholder="Search token, customer, visitor, medicines..."
        />
        <MultiSelect
          label="Customer"
          options={customerOptions}
          value={filters.customerIds}
          onChange={(value) => setField('customerIds', value)}
          placeholder="Filter by customers"
        />
        <MultiSelect
          label="Visitor"
          options={visitorOptions}
          value={filters.visitorIds}
          onChange={(value) => setField('visitorIds', value)}
          placeholder="Filter by visitors"
        />
        <MultiSelect
          label="Medicine"
          options={medicineOptions}
          value={filters.medicineIds}
          onChange={(value) => setField('medicineIds', value)}
          placeholder="Filter by medicines"
        />
        <MultiSelect
          label="Type"
          options={typeOptions}
          value={filters.typeIds}
          onChange={(value) => setField('typeIds', value)}
          placeholder="Filter by types"
        />
        <Input
          label="Quantity Min"
          type="number"
          min="0"
          value={filters.quantityMin}
          onChange={(event) => setField('quantityMin', event.target.value)}
        />
        <Input
          label="Quantity Max"
          type="number"
          min="0"
          value={filters.quantityMax}
          onChange={(event) => setField('quantityMax', event.target.value)}
        />
        <Input
          label="Total Min"
          type="number"
          min="0"
          value={filters.totalMin}
          onChange={(event) => setField('totalMin', event.target.value)}
        />
        <Input
          label="Total Max"
          type="number"
          min="0"
          value={filters.totalMax}
          onChange={(event) => setField('totalMax', event.target.value)}
        />
      </div>
    </div>
  )
}

export default DailyBillFilters
