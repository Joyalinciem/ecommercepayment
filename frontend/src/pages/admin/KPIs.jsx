import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function KPIs() {
  const [metrics, setMetrics] = useState({ grossMerchandiseValue: 0, platformRevenue: 0, activeVendors: 0, monthlyActiveUsers: 0, refundsPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setMetrics(response.data?.data || {});
      } catch (error) {
        console.error('Admin KPI load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Admin KPIs</h1>
              <p className="mt-2 text-slate-600">Marketplace performance metrics in one place.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Live</span>
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">GMV</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.grossMerchandiseValue)}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Platform revenue</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.platformRevenue)}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active vendors</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : metrics.activeVendors || 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Monthly active users</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : metrics.monthlyActiveUsers || 0}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
