export default function DiffBadge({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <span className={`mb-1 text-[10px] font-semibold uppercase tracking-widest sm:text-xs ${color}`}>
        {label}
      </span>
      <span className="text-2xl font-bold sm:text-3xl">{count}</span>
    </div>
  )
}