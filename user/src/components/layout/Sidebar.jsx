import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../common/Logo'
import { menuItems } from '../../config/navigation'

const NavItem = memo(function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group flex items-center rounded-xl px-3 py-3 text-sm transition-colors',
          isActive
            ? 'border-l-4 border-brand-red bg-brand-red/5 text-brand-red'
            : 'text-gray-700 hover:bg-gray-50 hover:text-brand-dark',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={
              isActive
                ? 'mr-3 text-brand-red'
                : 'mr-3 text-gray-400 group-hover:text-brand-gold'
            }
          >
            {item.icon}
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">{item.label}</div>
            <div
              className={`mt-0.5 text-xs ${
                isActive ? 'text-brand-red/70' : 'text-gray-500'
              }`}
            >
              {item.description}
            </div>
          </div>
          {isActive && <div className="ml-1 h-2 w-2 rounded-full bg-brand-red" />}
        </>
      )}
    </NavLink>
  )
})

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="border-b border-brand-gold/30 px-4 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  )
}

function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 border-r border-brand-gold/30 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-white shadow-xl">
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

export default memo(Sidebar)
