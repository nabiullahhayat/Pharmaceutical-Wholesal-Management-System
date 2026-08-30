import toast from 'react-hot-toast'

export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast(message),
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id),
  promise: (promise, messages) => toast.promise(promise, messages),
}

export function notifyAction(action, { successMessage, errorMessage }) {
  try {
    const result = action()
    if (successMessage) notify.success(successMessage)
    return result
  } catch {
    notify.error(errorMessage ?? 'Something went wrong')
    return null
  }
}
