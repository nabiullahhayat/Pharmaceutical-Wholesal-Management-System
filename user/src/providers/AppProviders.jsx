import Toaster from '../components/common/Toaster'

function AppProviders({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export default AppProviders
