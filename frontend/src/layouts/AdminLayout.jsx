import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import { DashboardIcon, AnalyticsIcon, ReportsIcon, StoreIcon, ReviewIcon, PaymentIcon } from '../components/common/Icons';

const adminItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/admin/kpis', label: 'KPIs', icon: <AnalyticsIcon />, end: true },
  { to: '/admin/reports', label: 'Reports', icon: <ReportsIcon />, end: true },
  { to: '/admin/vendors', label: 'Vendor Directory', icon: <StoreIcon />, end: true },
  { to: '/admin/reviews', label: 'Reviews', icon: <ReviewIcon />, end: true },
  { to: '/admin/payments', label: 'Payments', icon: <PaymentIcon />, end: true },
];

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="mb-4 flex items-center justify-between lg:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-100 hover:bg-white/5"
          >
            ☰
          </button>
          <h1 className="text-lg font-medium">Admin</h1>
          <div />
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <Sidebar items={adminItems} />
          </div>
          <main>{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex items-start lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 p-4">
            <Sidebar items={adminItems} showClose onClose={() => setMobileOpen(false)} className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
