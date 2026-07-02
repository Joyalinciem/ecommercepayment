export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
