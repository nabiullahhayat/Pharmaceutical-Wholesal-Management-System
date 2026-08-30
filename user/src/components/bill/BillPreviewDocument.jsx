import { APP_NAME, APP_SHORT_NAME } from '../../constants/app'
import { getBillLines, getBillToken, getPaidAmount, getRemainingAmount } from '../../pages/DailyBills/dailyBillUtils'
import { formatNumber } from '../../utils/numbers'
import {
  getBillLayout,
  LANDSCAPE_SLOT,
  splitLinesForColumns,
} from '../../utils/billLayoutUtils'

function ArabicText({ children, fontFamily }) {
  if (children == null || children === '') return <>—</>
  return (
    <span dir="auto" lang="ar" style={{ fontFamily }}>
      {children}
    </span>
  )
}

function MedicineTable({ lines, layout, fontFamily, startIndex = 0 }) {
  const thStyle = {
    backgroundColor: '#e60000',
    color: '#ffffff',
    textAlign: 'left',
    padding: `${layout.cellPad}px`,
    fontWeight: 600,
    fontSize: `${layout.tableSize}px`,
  }

  const thRight = { ...thStyle, textAlign: 'right' }
  const tdStyle = {
    padding: `${layout.cellPad}px`,
    borderTop: '1px solid #e5e7eb',
    fontSize: `${layout.tableSize}px`,
    verticalAlign: 'top',
    lineHeight: 1.3,
  }
  const tdRight = { ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th data-bill-table-head style={{ ...thStyle, width: '34%' }}>
            Medicine
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '22%' }}>
            Type
          </th>
          <th data-bill-table-head style={{ ...thRight, width: '12%' }}>
            Qty
          </th>
          <th data-bill-table-head style={{ ...thRight, width: '16%' }}>
            Price
          </th>
          <th data-bill-table-head style={{ ...thRight, width: '16%' }}>
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => (
          <tr
            key={`${line.medicineId ?? line.productId}-${startIndex + index}`}
            {...((startIndex + index) % 2 === 1 ? { 'data-bill-table-row-even': '' } : {})}
            style={(startIndex + index) % 2 === 1 ? { backgroundColor: '#fffbf5' } : undefined}
          >
            <td style={tdStyle}>
              <ArabicText fontFamily={fontFamily}>
                {line.medicineName ?? line.productName}
              </ArabicText>
            </td>
            <td style={tdStyle}>
              <ArabicText fontFamily={fontFamily}>{line.typeName}</ArabicText>
            </td>
            <td style={tdRight}>{formatNumber(line.quantity)}</td>
            <td style={tdRight}>{formatNumber(line.pricePerUnit)}</td>
            <td style={{ ...tdRight, fontWeight: 600 }}>{formatNumber(line.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BillPreviewDocument({ bill, customer }) {
  const token = getBillToken(bill)
  const lines = getBillLines(bill)
  const layout = getBillLayout(lines.length)
  const fontFamily = "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
  const columnChunks = splitLinesForColumns(lines, layout.columns)

  return (
    <div
      data-pdf-bill-root
      style={{
        width: `${LANDSCAPE_SLOT.widthPx}px`,
        height: `${LANDSCAPE_SLOT.heightPx}px`,
        maxHeight: `${LANDSCAPE_SLOT.heightPx}px`,
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        data-bill-header
        style={{
          backgroundColor: '#e60000',
          color: '#ffffff',
          padding: `${layout.headerPad}px 14px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: `${layout.tokenSize}px`,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          {token}
        </p>
        <p style={{ margin: 0, fontSize: `${layout.titleSize}px`, fontWeight: 700 }}>
          Sales Bill
        </p>
        <p style={{ margin: 0, fontSize: `${layout.infoSize}px` }}>
          <strong>Date: </strong>
          {bill.date || '—'}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: `${layout.bodyPad}px 12px`,
          display: 'flex',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '24%',
            minWidth: '24%',
            fontSize: `${layout.infoSize}px`,
            lineHeight: 1.35,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px' }}>
              <strong>Customer: </strong>
              <ArabicText fontFamily={fontFamily}>{bill.customerName}</ArabicText>
            </p>
            {customer?.phone && (
              <p style={{ margin: '0 0 4px' }} dir="ltr">
                <strong>Phone: </strong>
                {customer.phone}
              </p>
            )}
            {customer?.address && (
              <p style={{ margin: '0 0 4px' }}>
                <strong>Address: </strong>
                <ArabicText fontFamily={fontFamily}>{customer.address}</ArabicText>
              </p>
            )}
            {bill.visitorName && (
              <p style={{ margin: '0 0 4px' }}>
                <strong>Visitor: </strong>
                <ArabicText fontFamily={fontFamily}>{bill.visitorName}</ArabicText>
              </p>
            )}
            <p style={{ margin: 0 }}>
              <strong>Items: </strong>
              {lines.length}
            </p>
            <p style={{ margin: '4px 0 0' }}>
              <strong>Paid: </strong>
              {bill.moneyPaid ? formatNumber(getPaidAmount(bill)) : 'No'}
            </p>
            {getRemainingAmount(bill) > 0 && (
              <p style={{ margin: '4px 0 0', color: '#b45309', fontWeight: 600 }}>
                <strong>Remaining: </strong>
                {formatNumber(getRemainingAmount(bill))}
              </p>
            )}
          </div>

          <div>
            <div data-bill-total-box style={{ backgroundColor: '#fef2f2', borderRadius: '6px', padding: '6px 10px' }}>
              <p style={{ margin: 0, fontSize: `${layout.infoSize - 1}px`, color: '#6b7280' }}>
                Total Money
              </p>
              <p
                data-bill-total-value
                style={{
                  margin: '2px 0 0',
                  fontSize: `${layout.titleSize + 2}px`,
                  fontWeight: 700,
                  color: '#e60000',
                }}
              >
                {formatNumber(bill.grandTotal)}
              </p>
            </div>
            <div data-bill-footer-rule style={{ marginTop: '6px' }}>
              <p style={{ margin: 0, fontSize: `${layout.infoSize}px`, fontWeight: 700 }}>
                {APP_SHORT_NAME}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: `${layout.infoSize - 1}px`, color: '#6b7280' }}>
                <ArabicText fontFamily={fontFamily}>{APP_NAME}</ArabicText>
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            gap: layout.columns > 1 ? '8px' : 0,
            overflow: 'hidden',
          }}
        >
          {columnChunks.map((chunk, columnIndex) => (
            <div
              key={`col-${columnIndex}`}
              style={{
                flex: 1,
                minWidth: 0,
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <MedicineTable
                lines={chunk}
                layout={layout}
                fontFamily={fontFamily}
                startIndex={columnIndex === 0 ? 0 : columnChunks[0].length}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BillPreviewDocument
