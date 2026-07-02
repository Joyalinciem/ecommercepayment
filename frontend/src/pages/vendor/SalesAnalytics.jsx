import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../../layouts/VendorLayout';

const DEFAULT_VENDOR_ID = 'vendor-demo';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

function BarChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value || 0), 1);

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Sales Analytics</h2>
      <p className="mt-2 text-slate-500">Live order volume and sales totals across recent weeks.</p>
      <div className="mt-6 h-64 overflow-hidden rounded-3xl bg-slate-50 p-4">
        <div className="flex h-full items-end gap-3">
          {data.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-3xl bg-gradient-to-t from-emerald-500 to-cyan-500"
                style={{ height: `${Math.max(((item.value || 0) / maxValue) * 100, 8)}%` }}
                title={`${item.label}: ${formatCurrency(item.value)}`}
              />
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState([]);
  const [overview, setOverview] = useState({ totalSales: 0, pendingOrders: 0, payoutHistory: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const [overviewRes, salesRes] = await Promise.all([
          axios.get(`/api/vendor/${DEFAULT_VENDOR_ID}/overview`),
          axios.get(`/api/analytics/vendor/${DEFAULT_VENDOR_ID}/sales`),
        ]);

        const salesPayload = Array.isArray(salesRes.data?.data?.data)
          ? salesRes.data.data.data
          : Array.isArray(salesRes.data?.data)
          ? salesRes.data.data
          : [];

        setOverview(overviewRes.data?.data || {});
        setSalesData(salesPayload);
      } catch (error) {
        console.error('Sales analytics load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Sales Analytics</h1>
              <p className="mt-2 text-slate-600">Track sales volume, daily conversions and recent order performance.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Live</span>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total sales</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(overview.totalSales)}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending orders</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : overview.pendingOrders || 0}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payout history</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(overview.payoutHistory)}</p>
          </div>
        </section>

        <BarChart data={salesData.slice(-8).map((item, index) => ({ label: item.label || `W${index + 1}`, value: Number(item.value || 0) }))} />
      </div>
    </VendorLayout>
  );
}
