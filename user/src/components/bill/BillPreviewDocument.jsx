import { BRAND_COLORS, LOGO_PATH } from '../../constants/brand'
import {
  BILL_FONT_EN,
  BILL_PASHTO_FONT,
  BILL_SHOP_ADDRESS_EN,
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

function PhoneIcon({ size = 12, color = BRAND_COLORS.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8a15.9 15.9 0 006.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1 .4 2.1.6 3.2.6.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10.1 21.2 2.8 13.9 2.8 4.8 2.8 4.1 3.3 3.6 4 3.6h3.2c.7 0 1.2.5 1.2 1.2 0 1.1.2 2.2.6 3.2.1.4 0 .9-.3 1.2L6.6 10.8z"
        fill={color}
      />
    </svg>
  )
}

function WhatsAppIcon({ size = 12 }) {
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
    backgroundColor: BRAND_COLORS.dark,
    color: BRAND_COLORS.white,
    padding: `${layout.cellPad + 2}px 4px`,
    fontWeight: 600,
    fontSize: `${Math.max(layout.tableSize - 1, 6)}px`,
    textAlign: 'left',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: BILL_FONT_EN,
  }

  const tdStyle = {
    padding: `${layout.cellPad + 1}px 4px`,
    borderBottom: `1px solid ${BRAND_COLORS.border}`,
    fontSize: `${layout.tableSize}px`,
    verticalAlign: 'middle',
    lineHeight: 1.25,
    fontFamily: BILL_FONT_EN,
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
      }}
    >
      <thead>
        <tr>
          <th data-bill-table-head style={{ ...thStyle, width: '7%', textAlign: 'center' }}>
            #
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '40%' }}>
            Item
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '13%', textAlign: 'center' }}>
            Qty
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '20%', textAlign: 'right' }}>
            Unit Price
          </th>
          <th data-bill-table-head style={{ ...thStyle, width: '20%', textAlign: 'right' }}>
            Amount
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
            <td style={{ ...tdStyle, textAlign: 'center', color: BRAND_COLORS.muted, fontWeight: 500 }}>
              {startIndex + index + 1}
            </td>
            <td style={tdStyle}>
              <span style={{ fontWeight: 600, color: BRAND_COLORS.dark }}>
                <PashtoText>{line.medicineName ?? line.productName}</PashtoText>
              </span>
              {line.typeName ? (
                <span
                  style={{
                    display: 'block',
                    marginTop: '1px',
                    fontSize: `${Math.max(layout.tableSize - 1, 6)}px`,
                    color: BRAND_COLORS.muted,
                    fontFamily: BILL_FONT_EN,
                  }}
                >
                  {line.typeName}
                </span>
              ) : null}
            </td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>{formatNumber(line.quantity)}</td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>{formatNumber(line.pricePerUnit)}</td>
            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: BRAND_COLORS.primary }}>
              {formatNumber(line.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SummaryRow({ label, value, bold = false, accent = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '2px 0',
        fontSize: '10px',
        fontFamily: BILL_FONT_EN,
      }}
    >
      <span style={{ color: BRAND_COLORS.muted, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontWeight: bold ? 700 : 600,
          color: accent ? BRAND_COLORS.secondary : BRAND_COLORS.dark,
        }}
      >
        {value}
      </span>
    </div>
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
  const metaFontSize = layout.infoSize
  const nameFontSize = layout.titleSize + 2

  return (
    <div
      data-pdf-bill-root
      style={{
        width: `${LANDSCAPE_SLOT.widthPx}px`,
        height: `${LANDSCAPE_SLOT.heightPx}px`,
        maxHeight: `${LANDSCAPE_SLOT.heightPx}px`,
        backgroundColor: BRAND_COLORS.white,
        color: BRAND_COLORS.dark,
        fontFamily: BILL_FONT_EN,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: `1px solid ${BRAND_COLORS.border}`,
        boxShadow: '0 8px 24px rgba(20, 24, 51, 0.08)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          height: '5px',
          background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.cyan} 45%, ${BRAND_COLORS.secondary} 100%)`,
        }}
      />

      <div
        data-bill-header
        style={{
          flexShrink: 0,
          padding: `${layout.headerPad + 6}px 16px 12px`,
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #3d42a8 55%, ${BRAND_COLORS.secondary} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '30%',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                flexShrink: 0,
                width: `${layout.logoSize + 8}px`,
                height: `${layout.logoSize + 8}px`,
                borderRadius: '12px',
                backgroundColor: BRAND_COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <img
                data-bill-logo
                src={LOGO_PATH}
                alt="Logo"
                style={{
                  height: `${layout.logoSize - 4}px`,
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: `${nameFontSize}px`,
                  fontWeight: 800,
                  color: BRAND_COLORS.white,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}
              >
                {BILL_SHOP_NAME_EN}
              </p>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: `${nameFontSize - 2}px`,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.2,
                }}
              >
                <PashtoText>{BILL_SHOP_NAME_PS}</PashtoText>
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <PhoneIcon size={metaFontSize} color={BRAND_COLORS.white} />
                  <span
                    data-bill-phone
                    dir="ltr"
                    style={{
                      fontSize: `${metaFontSize}px`,
                      fontWeight: 600,
                      color: BRAND_COLORS.white,
                    }}
                  >
                    {BILL_SHOP_PHONE}
                  </span>
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(255,255,255,0.4)',
                  }}
                >
                  <WhatsAppIcon size={metaFontSize} />
                  <span
                    dir="ltr"
                    style={{
                      fontSize: `${metaFontSize}px`,
                      fontWeight: 600,
                      color: '#15803D',
                    }}
                  >
                    WhatsApp
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              flexShrink: 0,
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              minWidth: '100px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: `${metaFontSize + 2}px`,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: BRAND_COLORS.primary,
              }}
            >
              INVOICE
            </p>
            <p
              data-bill-number
              style={{
                margin: '3px 0 0',
                fontSize: `${metaFontSize + 1}px`,
                fontWeight: 700,
                color: BRAND_COLORS.dark,
              }}
            >
              #{billNumber}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: `${metaFontSize - 1}px`,
                color: BRAND_COLORS.muted,
                fontWeight: 500,
              }}
            >
              {normalizedBill.date || '—'}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: `0 16px ${layout.bodyPad}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: BRAND_COLORS.light,
              border: `1px solid ${BRAND_COLORS.border}`,
            }}
          >
            <p
              style={{
                margin: '0 0 3px',
                fontSize: `${metaFontSize - 1}px`,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: BRAND_COLORS.muted,
              }}
            >
              Bill To
            </p>
            <p
              style={{
                margin: 0,
                fontSize: `${metaFontSize + 1}px`,
                fontWeight: 700,
                color: BRAND_COLORS.dark,
              }}
            >
              <PashtoText>{normalizedBill.customerName}</PashtoText>
            </p>
            {customer?.phone && (
              <p
                dir="ltr"
                style={{
                  margin: '2px 0 0',
                  fontSize: `${metaFontSize}px`,
                  color: BRAND_COLORS.muted,
                  fontWeight: 500,
                }}
              >
                {customer.phone}
              </p>
            )}
          </div>

          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: BRAND_COLORS.white,
              border: `1px solid ${BRAND_COLORS.border}`,
            }}
          >
            <p
              style={{
                margin: '0 0 3px',
                fontSize: `${metaFontSize - 1}px`,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: BRAND_COLORS.muted,
              }}
            >
              Details
            </p>
            {normalizedBill.visitorName ? (
              <p style={{ margin: 0, fontSize: `${metaFontSize}px`, fontWeight: 600 }}>
                Visitor: <PashtoText>{normalizedBill.visitorName}</PashtoText>
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: `${metaFontSize}px`, color: BRAND_COLORS.muted }}>
                No visitor assigned
              </p>
            )}
            <p
              style={{
                margin: '2px 0 0',
                fontSize: `${metaFontSize - 1}px`,
                color: BRAND_COLORS.muted,
              }}
            >
              {lines.length} item{lines.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            gap: layout.columns > 1 ? '8px' : 0,
            overflow: 'hidden',
            borderRadius: '8px',
            border: `1px solid ${BRAND_COLORS.border}`,
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
              minWidth: '180px',
              borderRadius: '8px',
              border: `1px solid ${BRAND_COLORS.border}`,
              backgroundColor: BRAND_COLORS.light,
              padding: '8px 12px',
            }}
          >
            <SummaryRow
              label={normalizedBill.creditUsed > 0 ? 'Amount Due' : 'Grand Total'}
              value={formatNumber(grandTotal)}
              bold
              accent
            />
            {(normalizedBill.moneyPaid || normalizedBill.creditUsed > 0 || remaining > 0) && (
              <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: `1px dashed ${BRAND_COLORS.border}` }}>
                {normalizedBill.creditUsed > 0 && (
                  <SummaryRow label="Credit Applied" value={formatNumber(normalizedBill.creditUsed)} />
                )}
                <SummaryRow
                  label="Paid"
                  value={normalizedBill.moneyPaid ? formatNumber(paid) : 'Unpaid'}
                />
                {remaining > 0 && (
                  <SummaryRow label="Balance Due" value={formatNumber(remaining)} bold />
                )}
              </div>
            )}
            <p
              data-bill-total-value
              style={{
                display: 'none',
                margin: 0,
                fontSize: `${layout.infoSize + 2}px`,
                fontWeight: 700,
                color: BRAND_COLORS.secondary,
              }}
            >
              {formatNumber(grandTotal)}
            </p>
          </div>
        </div>
      </div>

      <div
        data-bill-footer
        style={{
          flexShrink: 0,
          borderTop: `1px solid ${BRAND_COLORS.border}`,
          padding: '8px 16px 10px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: BRAND_COLORS.white,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: `${metaFontSize - 1}px`,
              fontWeight: 600,
              color: BRAND_COLORS.muted,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Location
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: `${metaFontSize}px`,
              fontWeight: 500,
              color: BRAND_COLORS.dark,
            }}
          >
            {BILL_SHOP_ADDRESS_EN}
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: `${metaFontSize}px`,
              fontWeight: 600,
              textAlign: 'left',
              color: BRAND_COLORS.primary,
            }}
          >
            <PashtoText>{BILL_SHOP_ADDRESS_PS}</PashtoText>
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: `${metaFontSize - 1}px`,
              color: BRAND_COLORS.muted,
              fontStyle: 'italic',
            }}
          >
            Thank you for your business
          </p>
        </div>

        <div data-bill-signature style={{ minWidth: '150px', textAlign: 'right' }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: `${layout.infoSize}px`,
              color: BRAND_COLORS.muted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Authorized Signature
          </p>
          <div
            style={{
              marginTop: '16px',
              borderBottom: `1.5px solid ${BRAND_COLORS.dark}`,
              minWidth: '140px',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default BillPreviewDocument
