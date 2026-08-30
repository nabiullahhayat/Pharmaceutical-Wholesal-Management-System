import { Toaster as HotToaster } from 'react-hot-toast'
import { BRAND_COLORS } from '../../constants/brand'

const toastOptions = {
  duration: 4000,
  style: {
    background: BRAND_COLORS.white,
    color: BRAND_COLORS.dark,
    border: `1px solid color-mix(in srgb, ${BRAND_COLORS.secondary} 35%, white)`,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    maxWidth: '420px',
    direction: 'ltr',
  },
  success: {
    iconTheme: {
      primary: BRAND_COLORS.primary,
      secondary: BRAND_COLORS.white,
    },
  },
  error: {
    iconTheme: {
      primary: BRAND_COLORS.secondary,
      secondary: BRAND_COLORS.white,
    },
  },
}

function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      toastOptions={toastOptions}
    />
  )
}

export default Toaster
