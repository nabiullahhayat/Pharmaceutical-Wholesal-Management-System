import { lazy } from 'react'

export const appRoutes = [
  {
    path: 'daily-sales',
    Component: lazy(() => import('../pages/DailyBills')),
  },
  {
    path: 'daily-bills',
    Component: lazy(() => import('../pages/DailyBills')),
  },
  {
    path: 'customers',
    Component: lazy(() => import('../pages/Customers')),
  },
  {
    path: 'bill',
    Component: lazy(() => import('../pages/Bill')),
  },
  {
    path: 'stock',
    Component: lazy(() => import('../pages/Stock')),
  },
  {
    path: 'adds',
    Component: lazy(() => import('../pages/Adds')),
  },
]
