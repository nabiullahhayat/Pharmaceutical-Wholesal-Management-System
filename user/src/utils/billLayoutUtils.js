// A4 landscape duplicate slot: 297mm x 105mm (top/bottom halves)
export const LANDSCAPE_SLOT = {
  widthMm: 297,
  heightMm: 105,
  widthPx: 1123,
  heightPx: 397,
}

export function getBillLayout(lineCount) {
  if (lineCount <= 4) {
    return {
      tokenSize: 20,
      titleSize: 14,
      infoSize: 11,
      tableSize: 11,
      cellPad: 6,
      columns: 1,
      headerPad: 8,
      bodyPad: 10,
    }
  }

  if (lineCount <= 8) {
    return {
      tokenSize: 17,
      titleSize: 12,
      infoSize: 10,
      tableSize: 10,
      cellPad: 4,
      columns: 1,
      headerPad: 6,
      bodyPad: 8,
    }
  }

  if (lineCount <= 14) {
    return {
      tokenSize: 15,
      titleSize: 11,
      infoSize: 9,
      tableSize: 9,
      cellPad: 3,
      columns: 2,
      headerPad: 5,
      bodyPad: 6,
    }
  }

  return {
    tokenSize: 13,
    titleSize: 10,
    infoSize: 8,
    tableSize: 8,
    cellPad: 2,
    columns: 2,
    headerPad: 4,
    bodyPad: 5,
  }
}

export function splitLinesForColumns(lines, columnCount) {
  if (columnCount <= 1 || lines.length <= 6) {
    return [lines]
  }

  const midpoint = Math.ceil(lines.length / 2)
  return [lines.slice(0, midpoint), lines.slice(midpoint)]
}
