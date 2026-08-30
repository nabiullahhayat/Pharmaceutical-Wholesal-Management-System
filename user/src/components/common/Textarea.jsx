function Textarea({ label, error, className = '', rows = 3, ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-brand-dark">{label}</span>}
      <textarea
        rows={rows}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-brand-dark transition-colors',
          error ? 'border-brand-red' : 'border-brand-gold/40 focus:border-brand-red',
        ].join(' ')}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-brand-red">{error}</span>}
    </label>
  )
}

export default Textarea
