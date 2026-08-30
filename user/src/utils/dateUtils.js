export const gregorianToJalali = (gYear, gMonth, gDay) => {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

  let jYear
  if (gYear > 1600) {
    jYear = 979
    gYear -= 1600
  } else {
    jYear = 0
    gYear -= 621
  }

  const gy2 = gMonth > 2 ? gYear + 1 : gYear
  let days =
    365 * gYear +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gDay +
    g_d_m[gMonth - 1]

  jYear += 33 * Math.floor(days / 12053)
  days %= 12053
  jYear += 4 * Math.floor(days / 1461)
  days %= 1461

  let jMonth
  let jDay
  if (days > 365) {
    jYear += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }

  if (days < 186) {
    jMonth = 1 + Math.floor(days / 31)
    jDay = 1 + (days % 31)
  } else {
    jMonth = 7 + Math.floor((days - 186) / 30)
    jDay = 1 + ((days - 186) % 30)
  }

  return { year: jYear, month: jMonth, day: jDay }
}

export const getCurrentJalaliDate = () => {
  const now = new Date()
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export const formatJalaliDate = ({ year, month, day }) =>
  `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`

export const getTodayJalali = () => formatJalaliDate(getCurrentJalaliDate())

export const parseJalaliDate = (dateString) => {
  const parts = dateString.split('/').map((part) => Number(part.trim()))
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null
  return { year: parts[0], month: parts[1], day: parts[2] }
}

export const isValidJalaliDateString = (dateString) => {
  const parsed = parseJalaliDate(dateString)
  if (!parsed) return false
  return (
    parsed.year >= 1300 &&
    parsed.year <= 1500 &&
    parsed.month >= 1 &&
    parsed.month <= 12 &&
    parsed.day >= 1 &&
    parsed.day <= 31
  )
}

export function jalaliDateToSortValue(dateString) {
  const parsed = parseJalaliDate(dateString)
  if (!parsed) return 0
  return parsed.year * 10000 + parsed.month * 100 + parsed.day
}

export function isDateInJalaliRange(dateString, fromDate, toDate) {
  const value = jalaliDateToSortValue(dateString)
  const fromValue = jalaliDateToSortValue(fromDate)
  const toValue = jalaliDateToSortValue(toDate)
  if (!value || !fromValue || !toValue) return false
  return value >= fromValue && value <= toValue
}
