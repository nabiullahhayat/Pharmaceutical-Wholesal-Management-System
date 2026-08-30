export function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatNumber(value) {
  return toNumber(value).toLocaleString('en-US')
}

export function calculateLineTotal(quantity, pricePerUnit) {
  return toNumber(quantity) * toNumber(pricePerUnit)
}

export function sumLineTotals(lines) {
  return lines.reduce((sum, line) => sum + toNumber(line.total), 0)
}
