import { useEffect, useRef, useState } from 'react'

function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select items',
  emptyMessage = 'No options available',
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue))
      return
    }
    onChange([...value, optionValue])
  }

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  return (
    <div ref={containerRef} className="relative">
      {label && <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-brand-gold/40 bg-white px-2.5 py-1.5 text-left text-sm"
      >
        <span className={selectedLabels.length ? 'text-brand-dark' : 'text-gray-400'}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-brand-gold/30 bg-white shadow-lg">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">{emptyMessage}</p>
          ) : (
            options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-brand-red/5"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4 rounded border-brand-gold/50 text-brand-red focus:ring-brand-red"
                />
                <span className="flex-1 text-left text-brand-dark">{option.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
