import { useState } from 'react'
import NameCrudPanel from '../../components/common/NameCrudPanel'
import PageShell from '../../components/common/PageShell'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { useCollection } from '../../hooks'

const tabs = [
  { id: 'customers', label: 'Customer' },
  { id: 'medicines', label: 'Medicine' },
  { id: 'visitors', label: 'Visitor' },
  { id: 'types', label: 'Type' },
]

const customerFields = [
  {
    key: 'name',
    label: 'Customer Name',
    placeholder: 'Enter customer name',
    required: true,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    placeholder: '0700123456',
    type: 'tel',
  },
  {
    key: 'address',
    label: 'Address',
    placeholder: 'Enter address',
  },
]

const medicineFields = [
  {
    key: 'name',
    label: 'Medicine Name',
    placeholder: 'Enter medicine name',
    required: true,
  },
  {
    key: 'formula',
    label: 'Formula',
    placeholder: 'Enter formula',
  },
  {
    key: 'company',
    label: 'Company',
    placeholder: 'Enter company name',
  },
]

const visitorFields = [
  {
    key: 'name',
    label: 'Visitor Name',
    placeholder: 'Enter visitor name',
    required: true,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    placeholder: '0700123456',
    type: 'tel',
  },
]

const typeFields = [
  {
    key: 'name',
    label: 'Type Name',
    placeholder: 'e.g. Tablet, Capsule',
    required: true,
  },
]

function AddsPage() {
  const [activeTab, setActiveTab] = useState('customers')

  const customers = useCollection(STORAGE_KEYS.CUSTOMERS, {
    add: 'Customer added successfully',
    update: 'Customer updated successfully',
    remove: 'Customer deleted successfully',
  })

  const medicines = useCollection(STORAGE_KEYS.MEDICINES, {
    add: 'Medicine added successfully',
    update: 'Medicine updated successfully',
    remove: 'Medicine deleted successfully',
  })

  const visitors = useCollection(STORAGE_KEYS.VISITORS, {
    add: 'Visitor added successfully',
    update: 'Visitor updated successfully',
    remove: 'Visitor deleted successfully',
  })

  const types = useCollection(STORAGE_KEYS.MEDICINE_TYPES, {
    add: 'Type added successfully',
    update: 'Type updated successfully',
    remove: 'Type deleted successfully',
  })

  const totalCount = customers.count + medicines.count + visitors.count + types.count

  const activePanel = {
    customers: (
      <NameCrudPanel
        title="Customers"
        description="Add and manage customer records."
        addLabel="Add Customer"
        fields={customerFields}
        columns={[
          { key: 'name', label: 'Customer Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'address', label: 'Address' },
        ]}
        items={customers.items}
        onAdd={customers.add}
        onUpdate={customers.update}
        onRemove={customers.remove}
        emptyTitle="No customers yet"
        emptyDescription="Add customers here to use them across the system."
      />
    ),
    medicines: (
      <NameCrudPanel
        title="Medicines"
        description="Add and manage medicines available in the shop."
        addLabel="Add Medicine"
        fields={medicineFields}
        columns={[
          { key: 'name', label: 'Medicine Name' },
          { key: 'formula', label: 'Formula' },
          { key: 'company', label: 'Company' },
        ]}
        items={medicines.items}
        onAdd={medicines.add}
        onUpdate={medicines.update}
        onRemove={medicines.remove}
        emptyTitle="No medicines yet"
        emptyDescription="Add medicines here to use them in billing and stock."
      />
    ),
    visitors: (
      <NameCrudPanel
        title="Visitors"
        description="Add and manage visitor records."
        addLabel="Add Visitor"
        fields={visitorFields}
        columns={[
          { key: 'name', label: 'Visitor Name' },
          { key: 'phone', label: 'Phone' },
        ]}
        items={visitors.items}
        onAdd={visitors.add}
        onUpdate={visitors.update}
        onRemove={visitors.remove}
        emptyTitle="No visitors yet"
        emptyDescription="Add visitors here to use them across the system."
      />
    ),
    types: (
      <NameCrudPanel
        title="Types"
        description="Add medicine types such as Tablet, Capsule, and others."
        addLabel="Add Type"
        fields={typeFields}
        columns={[{ key: 'name', label: 'Type Name' }]}
        items={types.items}
        onAdd={types.add}
        onUpdate={types.update}
        onRemove={types.remove}
        emptyTitle="No types yet"
        emptyDescription="Add types like Tablet, Capsule, Syrup, and more."
      />
    ),
  }[activeTab]

  return (
    <PageShell
      title="Adds"
      description="Manage customers, medicines, visitors, and medicine types."
      badge={
        <span className="inline-flex rounded-full bg-brand-red/5 px-3 py-1 text-xs font-medium text-brand-red">
          {totalCount} records
        </span>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-brand-red text-white'
                : 'border border-brand-gold/40 text-brand-dark hover:bg-brand-gold/10',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activePanel}
    </PageShell>
  )
}

export default AddsPage
