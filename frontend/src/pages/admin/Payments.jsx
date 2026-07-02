import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function Payments() {
  const [metrics, setMetrics] = useState({ grossMerchandiseValue: 0, platformRevenue: 0, refundsPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setMetrics(response.data?.data || {});
      } catch (error) {
        console.error('Admin payments load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Payments</h1>
              <p className="mt-2 text-slate-600">Live payment gateway status and refund flow monitoring.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Payments</span>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">GMV settled</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.grossMerchandiseValue)}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Platform revenue</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : formatCurrency(metrics.platformRevenue)}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Gateway status</h2>
            <p className="mt-4 text-slate-600">Payments are updated from the backend. This page shows transaction summaries as soon as they are available.</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Refund pipeline</h2>
          <p className="mt-1 text-slate-600">Track refund requests and manage payment reconciliation.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refunds pending</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : metrics.refundsPending || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Compliance notes</p>
              <p className="mt-3 text-slate-700">Verify failed or disputed transactions manually to maintain platform trust.</p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
