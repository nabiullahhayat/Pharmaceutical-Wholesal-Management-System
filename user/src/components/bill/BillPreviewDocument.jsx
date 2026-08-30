import { BRAND_COLORS, LOGO_PATH } from '../../constants/brand'
import {
  BILL_PASHTO_FONT,
  BILL_SHOP_ADDRESS_PS,
  BILL_SHOP_NAME_EN,
  BILL_SHOP_NAME_PS,
  BILL_SHOP_PHONE,
} from '../../constants/bill'
import {
  getBillAmountDue,
  getBillLines,
  getBillNumber,
  getPaidAmount,
  getRemainingAmount,
  normalizeBill,
} from '../../pages/DailyBills/dailyBillUtils'
import { formatNumber } from '../../utils/numbers'
import { getBillLayout, LANDSCAPE_SLOT, splitLinesForColumns } from '../../utils/billLayoutUtils'

function PashtoText({ children, style = {} }) {
  if (children == null || children === '') return <>—</>
  return (
    <span dir="rtl" lang="ps" style={{ fontFamily: BILL_PASHTO_FONT, ...style }}>
      {children}
    </span>
  )
}

function PhoneIcon({ size = 14, color = BRAND_COLORS.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8a15.9 15.9 0 006.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1 .4 2.1.6 3.2.6.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.1 21.2 2.8 13.9 2.8 4.8 2.8 4.1 3.3 3.6 4 3.6h3.2c.7 0 1.2.5 1.2 1.2 0 1.1.2 2.2.6 3.2.1.4 0 .9-.3 1.2L6.6 10.8z"
        fill={color}
      />
    </svg>
  )
}

function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C6.5 2 2 6.1 2 11.2c0 1.8.5 3.5 1.4 5L2 22l6-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm5.8 13.5c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.2-3-1-2.5-.9-4.1-3.1-4.2-3.3-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.7.8 1.8.1.1.1.3 0 .5-.1.2-.2.3-.3.4-.1.1-.2.2-.3.3-.1.1-.2.2-.1.4.1.2.5 1 1.1 1.6.8.7 1.5.9 1.7 1 .2.1.4.1.5-.1.1-.2.6-.7.8-1 .2-.2.4-.2.7-.1.3.1 1.7.8 2 .9.3.1.5.2.6.3.1.3.1 1.1-.1 1.7z"
        fill="#25D366"
      />
    </svg>
  )
}

function MedicineTable({ lines, layout, startIndex = 0 }) {
  const thStyle = {
    backgroundColor: BRAND_COLORS.primary,
    color: BRAND_COLORS.white,
    padding: `${layout.cellPad}px 2px`,
    fontWeight: 700,
    fontSize: `${layout.tableSize}px`,
    textAlign: 'center',
    border: `1px solid ${BRAND_COLORS.primary}`,
    lineHeight: 1.15,
  }

  const tdStyle = {
    padding: `${layout.cellPad}px 2px`,
    border: `1px solid ${BRAND_COLORS.border}`,
    fontSize: `${layout.tableSize}px`,
    verticalAlign: 'middle',
    lineHeight: 1.15,
    textAlign: 'center',
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontFamily: BILL_PASHTO_FONT,
      }}
    >
      <thead>
        <tr>
          <th data-bill-table-head style={{ ...thStyle, width: '8%' }}>
            #
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '38%' }}>
            Name
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '14%' }}>
            Qty
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '20%' }}>
            Price
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '20%' }}>
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => (
          <tr
            key={`${line.medicineId ?? line.productId}-${startIndex + index}`}
            {...((startIndex + index) % 2 === 1 ? { 'data-bill-table-row-even': '' } : {})}
            style={
              (startIndex + index) % 2 === 1 ? { backgroundColor: BRAND_COLORS.light } : undefined
            }
          >
            <td style={{ ...tdStyle, fontWeight: 600 }}>{startIndex + index + 1}</td>
            <td style={tdStyle}>
              <PashtoText>{line.medicineName ?? line.productName}</PashtoText>
              {line.typeName ? (
                <span
                  style={{
                    display: 'block',
                    marginTop: '1px',
                    fontSize: `${Math.max(layout.tableSize - 1, 6)}px`,
                    color: BRAND_COLORS.muted,
                  }}
                >
                  {line.typeName}
                </span>
              ) : null}
            </td>
            <td style={tdStyle}>{formatNumber(line.quantity)}</td>
            <td style={tdStyle}>{formatNumber(line.pricePerUnit)}</td>
            <td style={{ ...tdStyle, fontWeight: 700 }}>{formatNumber(line.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BillPreviewDocument({ bill, customer }) {
  const normalizedBill = normalizeBill(bill)
  const billNumber = getBillNumber(normalizedBill)
  const lines = getBillLines(normalizedBill)
  const layout = getBillLayout(lines.length)
  const columnChunks = splitLinesForColumns(lines, layout.columns)
  const remaining = getRemainingAmount(normalizedBill)
  const paid = getPaidAmount(normalizedBill)
  const amountDue = getBillAmountDue(normalizedBill)
  const grandTotal = normalizedBill.creditUsed > 0 ? amountDue : normalizedBill.grandTotal

  const metaFontSize = layout.infoSize + 1
  const nameFontSize = layout.titleSize + 10
  const iconSize = metaFontSize + 2

  return (
    <div
      data-pdf-bill-root
      style={{
        width: `${LANDSCAPE_SLOT.widthPx}px`,
        height: `${LANDSCAPE_SLOT.heightPx}px`,
        maxHeight: `${LANDSCAPE_SLOT.heightPx}px`,
        backgroundColor: BRAND_COLORS.white,
        color: BRAND_COLORS.dark,
        fontFamily: BILL_PASHTO_FONT,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${BRAND_COLORS.primary}`,
      }}
    >
      <div
        data-bill-header
        style={{
          flexShrink: 0,
          borderBottom: `3px solid ${BRAND_COLORS.primary}`,
          padding: `${layout.headerPad + 2}px 14px 8px`,
          textAlign: 'center',
          backgroundColor: BRAND_COLORS.white,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '4px',
          }}
        >
          <img
            data-bill-logo
            src={LOGO_PATH}
            alt="Logo"
            style={{
              height: `${layout.logoSize}px`,
              width: 'auto',
              maxWidth: `${layout.logoSize * 1.4}px`,
              objectFit: 'contain',
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: `${nameFontSize}px`,
                fontWeight: 800,
                color: BRAND_COLORS.primary,
                letterSpacing: '0.03em',
                lineHeight: 1.15,
              }}
            >
              {BILL_SHOP_NAME_EN}
            </p>
            <p
              style={{
                margin: '3px 0 0',
                fontSize: `${nameFontSize - 2}px`,
                fontWeight: 700,
                color: BRAND_COLORS.secondary,
                lineHeight: 1.2,
              }}
            >
              <PashtoText>{BILL_SHOP_NAME_PS}</PashtoText>
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            margin: '4px 0',
          }}
        >
          <PhoneIcon size={iconSize} />
          <WhatsAppIcon size={iconSize} />
          <span
            data-bill-phone
            dir="ltr"
            style={{
              fontSize: `${metaFontSize}px`,
              fontWeight: 600,
              color: BRAND_COLORS.dark,
              letterSpacing: '0.03em',
            }}
          >
            {BILL_SHOP_PHONE}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: `${metaFontSize}px`,
            fontWeight: 600,
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: `1px dashed ${BRAND_COLORS.border}`,
          }}
        >
          <span>
            <strong>Date: </strong>
            {normalizedBill.date || '—'}
          </span>
          <span data-bill-number>
            <strong>Bill #: </strong>
            {billNumber}
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: `${layout.bodyPad}px 12px 6px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            fontSize: `${metaFontSize}px`,
            lineHeight: 1.3,
            flexShrink: 0,
            padding: '5px 8px',
            borderRadius: '6px',
            backgroundColor: BRAND_COLORS.light,
            border: `1px solid ${BRAND_COLORS.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px 16px',
          }}
        >
          <span>
            <strong>Customer: </strong>
            <PashtoText>{normalizedBill.customerName}</PashtoText>
          </span>
          {customer?.phone && (
            <span dir="ltr">
              <strong>Phone: </strong>
              {customer.phone}
            </span>
          )}
          {normalizedBill.visitorName && (
            <span>
              <strong>Visitor: </strong>
              <PashtoText>{normalizedBill.visitorName}</PashtoText>
            </span>
          )}
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            gap: layout.columns > 1 ? '6px' : 0,
            overflow: 'hidden',
          }}
        >
          {columnChunks.map((chunk, columnIndex) => (
            <div key={`col-${columnIndex}`} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <MedicineTable
                lines={chunk}
                layout={layout}
                startIndex={columnIndex === 0 ? 0 : columnChunks[0].length}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            data-bill-total-box
            style={{
              backgroundColor: BRAND_COLORS.primaryLight,
              border: `1px solid ${BRAND_COLORS.primary}`,
              borderRadius: '6px',
              padding: '4px 10px',
              textAlign: 'right',
              minWidth: '130px',
            }}
          >
            <p style={{ margin: 0, fontSize: `${layout.infoSize}px`, color: BRAND_COLORS.muted }}>
              {normalizedBill.creditUsed > 0 ? 'Amount Due' : 'Grand Total'}
            </p>
            <p
              data-bill-total-value
              style={{
                margin: '1px 0 0',
                fontSize: `${layout.infoSize + 2}px`,
                fontWeight: 700,
                color: BRAND_COLORS.secondary,
              }}
            >
              {formatNumber(grandTotal)}
            </p>
            {(normalizedBill.moneyPaid || normalizedBill.creditUsed > 0 || remaining > 0) && (
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: `${layout.infoSize - 1}px`,
                  color: BRAND_COLORS.muted,
                }}
              >
                {normalizedBill.creditUsed > 0 && (
                  <>Credit: {formatNumber(normalizedBill.creditUsed)} · </>
                )}
                Paid: {normalizedBill.moneyPaid ? formatNumber(paid) : 'No'}
                {remaining > 0 && <> · Remaining: {formatNumber(remaining)}</>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        data-bill-footer
        style={{
          flexShrink: 0,
          borderTop: `2px solid ${BRAND_COLORS.primary}`,
          padding: '8px 14px 10px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: `${metaFontSize}px`,
            fontWeight: 600,
            textAlign: 'right',
            color: BRAND_COLORS.dark,
            flex: 1,
          }}
        >
          <PashtoText>{BILL_SHOP_ADDRESS_PS}</PashtoText>
        </p>

        <div data-bill-signature style={{ minWidth: '180px', textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: `${layout.infoSize}px` }}>Signature</p>
          <div
            style={{
              marginTop: '14px',
              borderBottom: `1.5px solid ${BRAND_COLORS.dark}`,
              minWidth: '160px',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default BillPreviewDocument
