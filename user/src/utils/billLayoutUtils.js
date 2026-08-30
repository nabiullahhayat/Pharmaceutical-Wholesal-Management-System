// A4 landscape duplicate slot: 148.5mm x 210mm (left/right halves)
export const LANDSCAPE_SLOT = {
  widthMm: 148.5,
  heightMm: 210,
  widthPx: 562,
  heightPx: 794,
}

export function getBillLayout(lineCount) {
  if (lineCount <= 6) {
    return {
      logoSize: 56,
      titleSize: 13,
      infoSize: 11,
      tableSize: 10,
      cellPad: 3,
      columns: 1,
      headerPad: 6,
      bodyPad: 8,
    }
  }

  if (lineCount <= 12) {
    return {
      logoSize: 50,
      titleSize: 12,
      infoSize: 10,
      tableSize: 9,
      cellPad: 2,
      columns: 1,
      headerPad: 5,
      bodyPad: 7,
    }
  }

  if (lineCount <= 20) {
    return {
      logoSize: 44,
      titleSize: 11,
      infoSize: 9,
      tableSize: 8,
      cellPad: 2,
      columns: 1,
      headerPad: 4,
      bodyPad: 6,
    }
  }

  return {
    logoSize: 38,
    titleSize: 10,
    infoSize: 8,
    tableSize: 7,
    cellPad: 1,
    columns: 2,
    headerPad: 4,
    bodyPad: 5,
  }
}

export function splitLinesForColumns(lines, columnCount) {
  if (columnCount <= 1 || lines.length <= 10) {
    return [lines]
  }

  const midpoint = Math.ceil(lines.length / 2)
  return [lines.slice(0, midpoint), lines.slice(midpoint)]
}
