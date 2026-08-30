import { memo } from 'react'
import Logo from '../common/Logo'

function TopBar({ onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-primary/20 bg-brand-primary lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo size="sm" showText={false} variant="dark" />

        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default memo(TopBar)
