import { memo } from 'react'
import { APP_NAME } from '../../constants/app'
import Logo from '../common/Logo'

function TopBar({ onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-gold/30 bg-white lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo size="sm" showText={false} />

        <div className="min-w-0 flex-1 px-3 text-left">
          <h1 className="truncate text-sm font-bold text-brand-dark sm:text-base">
            {APP_NAME}
          </h1>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-brand-dark hover:bg-brand-red/5 hover:text-brand-red"
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
