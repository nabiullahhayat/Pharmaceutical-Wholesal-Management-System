function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>}
      <input
        className={[
          'w-full rounded-lg border bg-white px-2.5 py-1.5 text-sm text-brand-dark transition-colors',
          error ? 'border-brand-red' : 'border-brand-gold/40 focus:border-brand-red',
        ].join(' ')}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-brand-red">{error}</span>}
    </label>
  )
}

export default Input
