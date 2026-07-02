import { NavLink } from 'react-router-dom';

export default function Sidebar({ items = [], className = '', showClose, onClose }) {
  return (
    <aside className={`sticky top-16 self-start h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Menu</p>
        {showClose ? (
          <button aria-label="Close menu" onClick={onClose} className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        ) : null}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200 ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
