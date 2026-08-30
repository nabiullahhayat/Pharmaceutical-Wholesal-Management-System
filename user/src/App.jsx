import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PageLoader from './components/common/PageLoader'
import MainLayout from './components/layout/MainLayout'
import AppProviders from './providers/AppProviders'
import { appRoutes } from './routes'

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/daily-sales" replace />} />
            {appRoutes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
