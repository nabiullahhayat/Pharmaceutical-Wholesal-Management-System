import { Toaster as HotToaster } from 'react-hot-toast'

const toastOptions = {
  duration: 4000,
  style: {
    background: '#ffffff',
    color: '#1a1a1a',
    border: '1px solid rgba(253, 184, 19, 0.35)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    maxWidth: '420px',
    direction: 'ltr',
  },
  success: {
    iconTheme: {
      primary: '#e60000',
      secondary: '#ffffff',
    },
  },
  error: {
    iconTheme: {
      primary: '#e60000',
      secondary: '#ffffff',
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
