import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Reports() {
  const [metrics, setMetrics] = useState({ grossMerchandiseValue: 0, platformRevenue: 0, totalOrders: 0, activeVendors: 0, refundsPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setMetrics(response.data?.data || {});
      } catch (error) {
        console.error('Admin reports load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Reports</h1>
              <p className="mt-2 text-slate-600">Marketplace summary reports for sales, vendors, and refunds.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Report view</span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-xl font-semibold">Top-level summary</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">GMV</p>
                <p className="mt-2 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.grossMerchandiseValue)}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Platform revenue</p>
                <p className="mt-2 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.platformRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Pending status</h2>
            <div className="mt-6 space-y-4 text-slate-700">
              <p>Total orders: {loading ? '—' : metrics.totalOrders || 0}</p>
              <p>Vendors active: {loading ? '—' : metrics.activeVendors || 0}</p>
              <p>Refunds pending: {loading ? '—' : metrics.refundsPending || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
