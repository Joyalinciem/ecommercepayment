import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import KPICard from '../../components/dashboard/KPICard';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ grossMerchandiseValue: 0, platformRevenue: 0, activeVendors: 0, monthlyActiveUsers: 0, refundsPending: 0 });
  const [flagged, setFlagged] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let reviewStream = null;

    const loadAdmin = async () => {
      try {
        const [dashboardRes, flaggedRes, topSellersRes] = await Promise.all([
          axios.get('/api/admin/dashboard'),
          axios.get('/api/review-moderation/pending'),
          axios.get('/api/admin/top-sellers'),
        ]);

        setMetrics(dashboardRes.data?.data || {});
        setFlagged(flaggedRes.data?.data || []);
        setTopSellers(topSellersRes.data?.data || []);
      } catch (err) {
        console.error('Admin dashboard failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();

    if (typeof EventSource !== 'undefined') {
      reviewStream = new EventSource('/api/review-moderation/stream');
      reviewStream.addEventListener('reviewModerationUpdate', () => loadAdmin());
      reviewStream.addEventListener('connected', () => console.debug('Admin review moderation SSE connected'));
      reviewStream.addEventListener('error', (event) => {
        console.warn('Admin review moderation SSE error', event);
        if (reviewStream.readyState === EventSource.CLOSED) {
          reviewStream.close();
        }
      });
    }

    return () => {
      if (reviewStream) {
        reviewStream.close();
      }
    };
  }, []);

  const approveFlag = async (id) => {
    try {
      await axios.post(`/api/review-moderation/${id}/approve`);
      setFlagged((prev) => prev.filter((review) => review._id !== id));
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const rejectFlag = async (id) => {
    try {
      await axios.post(`/api/review-moderation/${id}/reject`);
      setFlagged((prev) => prev.filter((review) => review._id !== id));
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-900 p-6 shadow-sm text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Super Admin Dashboard</h1>
              <p className="mt-2 text-slate-300">Monitor platform health, review flags, and manage new vendor onboarding.</p>
            </div>
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-950">Live metrics</span>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="GMV" value={formatCurrency(metrics.grossMerchandiseValue)} />
          <KPICard label="Platform revenue" value={formatCurrency(metrics.platformRevenue)} />
          <KPICard label="Active vendors" value={metrics.activeVendors || 0} />
          <KPICard label="Monthly active users" value={metrics.monthlyActiveUsers || 0} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Review Moderation</h2>
              <p className="mt-1 text-sm text-slate-700">Approve or reject flagged reviews raised by customers.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Pending: {loading ? '…' : flagged.length}</div>
          </div>
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading moderation queue…</p>
            ) : flagged.length === 0 ? (
              <p className="text-slate-500">No flagged reviews at the moment.</p>
            ) : (
              flagged.map((review) => (
                <div key={review._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Order {review.orderId}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{review.title || 'Product review'}</p>
                      <p className="mt-1 text-sm text-slate-600">Rating: {review.rating} / 5</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => approveFlag(review._id)} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                        Approve
                      </button>
                      <button onClick={() => rejectFlag(review._id)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        Reject
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{review.body || review.comment || 'No review body available.'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Top sellers</h2>
              <p className="mt-1 text-sm text-slate-600">High-performing vendors by revenue impact.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Count: {loading ? '…' : topSellers.length}</div>
          </div>
          <div className="mt-6 space-y-4">
            {topSellers.length === 0 ? (
              <p className="text-slate-500">Top seller analytics will appear once sales data is available.</p>
            ) : (
              topSellers.map((seller) => (
                <div key={seller.vendorId} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Vendor ID</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{seller.vendorId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Revenue</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">₹{seller.totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Sales count</p>
                      <p className="mt-2 text-slate-900 font-medium">{seller.salesCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Estimated profit</p>
                      <p className="mt-2 text-slate-900 font-medium">₹{seller.estimatedProfit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
