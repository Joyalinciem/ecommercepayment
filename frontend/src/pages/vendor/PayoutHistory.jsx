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

export default function PayoutHistory() {
  const [overview, setOverview] = useState({ payoutHistory: 0, payoutCount: 0, refundStats: { totalRequests: 0, approvedCount: 0, totalRefundAmount: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayout = async () => {
      try {
        const response = await axios.get(`/api/vendor/${DEFAULT_VENDOR_ID}/overview`);
        setOverview(response.data?.data || {});
      } catch (error) {
        console.error('Payout history load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayout();
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Payout History</h1>
              <p className="mt-2 text-slate-600">View vendor payouts, approved refunds and payment summaries.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Updated live</span>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payout total</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(overview.payoutHistory)}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payout count</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : overview.payoutCount || 0}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refund requests</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : overview.refundStats?.totalRequests || 0}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refund amount</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(overview.refundStats?.totalRefundAmount)}</p>
          </div>
        </section>

        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Payout breakdown</h2>
          <p className="mt-4 text-slate-600">Your payout history updates automatically after each settlement cycle and refund resolution.</p>
        </div>
      </div>
    </VendorLayout>
  );
}
