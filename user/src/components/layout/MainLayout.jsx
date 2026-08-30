import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import { useMobileMenu } from '../../hooks'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function MainLayout() {
  const { isOpen, open, close } = useMobileMenu()

  return (
    <div className="min-h-screen bg-brand-light" dir="ltr">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={isOpen} onClose={close} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuOpen={open} />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default memo(MainLayout)
