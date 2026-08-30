export function toNumber(value) {
  if (value === '' || value == null) return 0
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const normalized = String(value).trim().replace(/,/g, '')
  if (normalized === '' || normalized === '-') return 0

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeDecimal(value) {
  const num = toNumber(value)
  if (!Number.isFinite(num)) return 0
  if (Number.isInteger(num)) return num
  return Number.parseFloat(num.toPrecision(12))
}

export function toDecimalInputValue(value) {
  if (value === '' || value == null) return ''
  const num = normalizeDecimal(value)
  if (!Number.isFinite(num)) return ''
  if (num === 0) return '0'
  if (Number.isInteger(num)) return String(num)
  return num
    .toFixed(10)
    .replace(/(\.\d*?[1-9])0+$/u, '$1')
    .replace(/\.0+$/u, '')
}

export function subtractNumbers(a, b) {
  return normalizeDecimal(toNumber(a) - toNumber(b))
}

export function formatNumber(value) {
  const num = normalizeDecimal(value)
  if (!Number.isFinite(num)) return '0'
  if (Number.isInteger(num)) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  const decimalString = Number.isInteger(num)
    ? String(num)
    : num
        .toFixed(10)
        .replace(/(\.\d*?[1-9])0+$/u, '$1')
        .replace(/\.0+$/u, '')
  const [integerPart, fractionPart] = decimalString.split('.')
  const formattedInteger = Number(integerPart).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })
  return fractionPart ? `${formattedInteger}.${fractionPart}` : formattedInteger
}

export function calculateLineTotal(quantity, pricePerUnit) {
  return normalizeDecimal(toNumber(quantity) * toNumber(pricePerUnit))
}

export function sumLineTotals(lines) {
  return normalizeDecimal(lines.reduce((sum, line) => sum + toNumber(line.total), 0))
}
