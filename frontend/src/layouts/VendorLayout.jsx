import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import { HomeIcon, AnalyticsIcon, RevenueIcon, WalletIcon, ReviewIcon, BellIcon } from '../components/common/Icons';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <HomeIcon />, end: true },
  { to: '/dashboard/sales', label: 'Sales Analytics', icon: <AnalyticsIcon />, end: true },
  { to: '/dashboard/revenue', label: 'Revenue Charts', icon: <RevenueIcon />, end: true },
  { to: '/dashboard/payouts', label: 'Payout History', icon: <WalletIcon />, end: true },
  { to: '/dashboard/reviews', label: 'Reviews', icon: <ReviewIcon />, end: true },
  { to: '/dashboard/notifications', label: 'Notifications', icon: <BellIcon />, end: true },
];

export default function VendorLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="mb-4 flex items-center justify-between lg:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-200"
          >
            ☰
          </button>
          <h1 className="text-lg font-medium">Vendor Dashboard</h1>
          <div />
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <Sidebar items={menuItems} />
          </div>
          <main>{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex items-start lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 p-4">
            <Sidebar items={menuItems} showClose onClose={() => setMobileOpen(false)} className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
