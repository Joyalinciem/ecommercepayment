import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/checkout', label: 'Payments' },
  { to: '/dashboard', label: 'Vendor Dashboard' },
  { to: '/customer/reviews', label: 'Reviews' },
  { to: '/admin/dashboard', label: 'Admin' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 h-16">
        <NavLink to="/" className="text-2xl font-bold text-slate-900 hover:text-emerald-600">
          Marketplace
        </NavLink>
        <nav className="flex flex-nowrap items-center gap-3 overflow-x-auto text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition-all duration-200 ${
                  isActive ? 'bg-emerald-600 text-white shadow' : 'hover:bg-slate-100 hover:text-slate-900'
                }`
              }
              style={{ whiteSpace: 'nowrap' }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
