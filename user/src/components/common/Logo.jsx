import { memo } from 'react'
import { APP_SHORT_NAME } from '../../constants/app'

function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { box: 'h-10 w-10', title: 'text-sm', subtitle: 'text-xs' },
    md: { box: 'h-14 w-14 sm:h-16 sm:w-16', title: 'text-sm sm:text-base', subtitle: 'text-xs sm:text-sm' },
    lg: { box: 'h-16 w-16', title: 'text-base', subtitle: 'text-sm' },
  }

  const config = sizes[size] ?? sizes.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${config.box} flex shrink-0 items-center justify-center`}>
        <img
          src="/BrowserLogo.png"
          alt={`${APP_SHORT_NAME} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      {showText && (
        <div className="min-w-0 text-left">
          <h2 className={`${config.title} font-bold leading-snug text-brand-dark`}>
            {APP_SHORT_NAME}
          </h2>
          <p className={`${config.subtitle} mt-0.5 text-gray-500`}>
            Medicine Shop Management
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(Logo)
