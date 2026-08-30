function PageShell({ title, description, children, badge }) {
  return (
    <section className="rounded-2xl border border-brand-gold/25 bg-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 border-b border-brand-gold/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 sm:text-base">{description}</p>
          )}
        </div>
        {badge}
      </div>
      {children}
    </section>
  )
}

export default PageShell
