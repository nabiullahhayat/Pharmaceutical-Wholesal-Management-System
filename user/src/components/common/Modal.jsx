import { useEffect } from 'react'

function Modal({ open, title, onClose, children, size = 'lg' }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[95vh] w-full ${sizes[size]} flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}
        dir="ltr"
      >
        <div className="flex items-center justify-between border-b border-brand-gold/25 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-brand-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-brand-red"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
