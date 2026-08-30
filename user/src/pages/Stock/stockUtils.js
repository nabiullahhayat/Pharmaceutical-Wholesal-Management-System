export function calculateStockLevels(medicines, movements) {
  const levels = medicines.reduce((map, medicine) => {
    map[medicine.id] = {
      medicineId: medicine.id,
      name: medicine.name,
      company: medicine.company,
      formula: medicine.formula,
      quantity: 0,
    }
    return map
  }, {})

  movements.forEach((movement) => {
    if (!levels[movement.medicineId]) return
    const amount = Number(movement.quantity) || 0
    if (movement.type === 'out') {
      levels[movement.medicineId].quantity -= amount
    } else {
      levels[movement.medicineId].quantity += amount
    }
  })

  return Object.values(levels)
}

export function filterStockLevels(levels, search) {
  const query = search.trim().toLowerCase()
  if (!query) return levels

  return levels.filter((item) =>
    [item.name, item.company, item.formula]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
}

export function sortMovements(movements) {
  return [...movements].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt).getTime()
    const dateB = new Date(b.date || b.createdAt).getTime()
    return dateB - dateA
  })
}
