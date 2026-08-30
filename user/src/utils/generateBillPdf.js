import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { LANDSCAPE_SLOT } from './billLayoutUtils'
import { BRAND_COLORS } from '../constants/brand'

const PDF_COLORS = {
  primary: BRAND_COLORS.primary,
  secondary: BRAND_COLORS.secondary,
  dark: BRAND_COLORS.dark,
  primaryLight: BRAND_COLORS.primaryLight,
  secondaryLight: BRAND_COLORS.secondaryLight,
  white: BRAND_COLORS.white,
  goldLight: BRAND_COLORS.light,
}

const CAPTURE_DPI = 600
const MIN_CAPTURE_SCALE = 6
const MM_TO_IN = 1 / 25.4

function sanitizeToken(token) {
  const safe = String(token ?? 'bill')
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '')
  return safe || 'bill'
}

function mmToPx(mm, dpi = CAPTURE_DPI) {
  return Math.round(mm * MM_TO_IN * dpi)
}

function applyPdfSafeStyles(clonedRoot) {
  clonedRoot.style.backgroundColor = PDF_COLORS.white
  clonedRoot.style.color = PDF_COLORS.dark
  clonedRoot.style.boxShadow = 'none'
  clonedRoot.style.overflow = 'hidden'

  clonedRoot.querySelectorAll('*').forEach((node) => {
    node.style.boxShadow = 'none'
  })

  const header = clonedRoot.querySelector('[data-bill-header]')
  if (header) {
    header.style.backgroundColor = PDF_COLORS.white
    header.style.color = PDF_COLORS.dark
  }

  const footer = clonedRoot.querySelector('[data-bill-footer]')
  if (footer) {
    footer.style.backgroundColor = PDF_COLORS.white
    footer.style.color = PDF_COLORS.dark
  }

  clonedRoot.querySelectorAll('[data-bill-table-head]').forEach((node) => {
    node.style.backgroundColor = PDF_COLORS.primary
    node.style.color = PDF_COLORS.white
  })

  clonedRoot.querySelectorAll('[data-bill-table-row-even]').forEach((node) => {
    node.style.backgroundColor = PDF_COLORS.goldLight
  })

  clonedRoot.querySelectorAll('[data-bill-total-box]').forEach((node) => {
    node.style.backgroundColor = PDF_COLORS.primaryLight
  })

  clonedRoot.querySelectorAll('[data-bill-total-value]').forEach((node) => {
    node.style.color = PDF_COLORS.secondary
  })
}

function applyFinalScaleToFit(element, maxWidthPx, maxHeightPx) {
  const widthScale = maxWidthPx / element.scrollWidth
  const heightScale = maxHeightPx / element.scrollHeight
  const scale = Math.min(1, widthScale, heightScale)

  if (scale >= 0.999) return

  element.style.transform = `scale(${scale})`
  element.style.transformOrigin = 'top left'
  element.style.width = `${maxWidthPx / scale}px`
  element.style.height = `${maxHeightPx / scale}px`
}

async function waitForPreviewReady(element) {
  const fontLoads = [
    document.fonts.load('400 16px "Noto Naskh Arabic"'),
    document.fonts.load('700 16px "Noto Naskh Arabic"'),
    document.fonts.load('400 16px "Noto Sans Arabic"'),
    document.fonts.load('700 16px "Noto Sans Arabic"'),
  ]

  await Promise.allSettled(fontLoads)

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })

  element.scrollIntoView({ block: 'center' })
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportBillPreviewToPdf(previewElement, token) {
  if (!previewElement) {
    throw new Error('Preview element not found')
  }

  const filename = `bill-${sanitizeToken(token)}.pdf`
  const billRoot = previewElement.querySelector('[data-pdf-bill-root]') ?? previewElement

  await waitForPreviewReady(billRoot)

  const marginMm = 2
  const slotWidthMm = LANDSCAPE_SLOT.widthMm
  const slotHeightMm = LANDSCAPE_SLOT.heightMm
  const printableWidthMm = slotWidthMm - marginMm * 2
  const printableHeightMm = slotHeightMm - marginMm * 2

  const targetCaptureWidth = LANDSCAPE_SLOT.widthPx
  const captureScale = Math.max(MIN_CAPTURE_SCALE, mmToPx(slotWidthMm) / targetCaptureWidth)

  const canvas = await html2canvas(billRoot, {
    scale: captureScale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: PDF_COLORS.white,
    logging: false,
    imageTimeout: 15000,
    scrollX: 0,
    scrollY: 0,
    width: LANDSCAPE_SLOT.widthPx,
    height: LANDSCAPE_SLOT.heightPx,
    windowWidth: LANDSCAPE_SLOT.widthPx,
    windowHeight: LANDSCAPE_SLOT.heightPx,
    onclone: (_doc, element) => {
      applyPdfSafeStyles(element)
      element.style.width = `${LANDSCAPE_SLOT.widthPx}px`
      element.style.height = `${LANDSCAPE_SLOT.heightPx}px`
      element.style.maxHeight = `${LANDSCAPE_SLOT.heightPx}px`
      applyFinalScaleToFit(element, LANDSCAPE_SLOT.widthPx, LANDSCAPE_SLOT.heightPx)
    },
  })

  if (!canvas.width || !canvas.height) {
    throw new Error('Could not capture bill preview')
  }

  const imgData = canvas.toDataURL('image/png', 1.0)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: false,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const halfWidth = pageWidth / 2

  const leftX = marginMm
  const rightX = halfWidth + marginMm

  pdf.addImage(
    imgData,
    'PNG',
    leftX,
    marginMm,
    printableWidthMm,
    printableHeightMm,
    undefined,
    'SLOW',
  )
  pdf.addImage(
    imgData,
    'PNG',
    rightX,
    marginMm,
    printableWidthMm,
    printableHeightMm,
    undefined,
    'SLOW',
  )

  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.2)
  pdf.setLineDashPattern([2, 2], 0)
  pdf.line(halfWidth, marginMm, halfWidth, pageHeight - marginMm)

  triggerBlobDownload(pdf.output('blob'), filename)
}
