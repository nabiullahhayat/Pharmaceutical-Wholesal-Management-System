import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../common/Logo'
import { menuItems } from '../../config/navigation'

const NavItem = memo(function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      title={item.description}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          isActive
            ? 'bg-white text-brand-primary shadow-sm'
            : 'text-white/75 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
              isActive
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'bg-white/10 text-white group-hover:bg-white/15',
            ].join(' ')}
          >
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
})

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <Logo variant="dark" size="sm" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Menu
        </p>
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-xs text-white/40">Medicine Shop System</p>
      </div>
    </>
  )
}

function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden h-screen w-[15.5rem] shrink-0 bg-brand-primary lg:sticky lg:top-0 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,15.5rem)] flex-col bg-brand-primary shadow-2xl">
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

export default memo(Sidebar)
