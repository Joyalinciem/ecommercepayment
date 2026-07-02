export default function KPICard({ label, value, description, accent = 'emerald' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
