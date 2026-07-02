import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../../layouts/VendorLayout';
import KPICard from '../../components/dashboard/KPICard';

const DEFAULT_VENDOR_ID = 'vendor-demo';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function RevenueChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value || 0), 1);
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Revenue Chart</h2>
          <p className="mt-1 text-sm text-slate-500">Sales performance by month based on actual totals.</p>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  const [overview, setOverview] = useState({
    totalSales: 0,
    pendingOrders: 0,
    payoutHistory: 0,
    payoutCount: 0,
    topProducts: [],
    refundStats: { totalRequests: 0, approvedCount: 0, totalRefundAmount: 0 },
    sellerPerformance: { totalOrders: 0, deliveredOnTime: 0, totalEarned: 0 },
  });
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overviewRes, salesRes, revenueRes, notificationsRes] = await Promise.all([
          axios.get(`/api/vendor/${DEFAULT_VENDOR_ID}/overview`),
          axios.get(`/api/analytics/vendor/${DEFAULT_VENDOR_ID}/sales`),
          axios.get('/api/analytics/revenue'),
          axios.get(`/api/notifications/vendor/${DEFAULT_VENDOR_ID}`),
        ]);

        const salesPayload = Array.isArray(salesRes.data?.data?.data)
          ? salesRes.data.data.data
          : Array.isArray(salesRes.data?.data)
          ? salesRes.data.data
          : [];
        const revenuePayload = Array.isArray(revenueRes.data?.data?.series)
          ? revenueRes.data.data.series
          : Array.isArray(revenueRes.data?.data)
          ? revenueRes.data.data
          : [];

        setOverview(overviewRes.data?.data || {});
        setSalesData(salesPayload);
        setRevenueData(revenuePayload);
        setNotifications(notificationsRes.data?.data || []);
      } catch (error) {
        console.error('Vendor dashboard refresh failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    const intervalId = window.setInterval(loadDashboard, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Vendor Dashboard</h1>
            <p className="mt-2 text-slate-600">Track sales, reviews, payouts, and live metrics from your shop.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Auto-refreshing</span>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Today's Sales" value={formatCurrency(overview.totalSales)} />
        <KPICard label="Orders" value={overview.pendingOrders || 0} description="Pending payment or processing" />
        <KPICard label="Active Payouts" value={formatCurrency(overview.payoutHistory)} />
        <KPICard label="Refunds" value={`${overview.refundStats?.approvedCount || 0} approved`} description={`${overview.refundStats?.totalRequests || 0} requests`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Revenue breakdown</h2>
                <p className="mt-1 text-slate-500">Growth summary from order totals and vendor payouts.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">Live</div>
            </div>
            <RevenueChart data={revenueData.slice(-6).map((item, index) => ({ label: item.label || `M${index + 1}`, value: Number(item.value || 0) }))} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Seller performance</h2>
              <p className="mt-2 text-sm text-slate-500">Delivered on time and total earnings for your vendor account.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Delivered on time</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : overview.sellerPerformance?.deliveredOnTime || 0}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total earned</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(overview.sellerPerformance?.totalEarned || 0)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Top selling products</h2>
              <div className="mt-4 space-y-4">
                {(overview.topProducts || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Sales will appear here once orders are confirmed.
                  </div>
                ) : (
                  overview.topProducts.map((product, index) => (
                    <div key={`${product.productName}-${index}`} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <p className="font-semibold text-slate-900">{product.productName}</p>
                        <p className="mt-1 text-sm text-slate-500">{product.salesCount} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-slate-400">Rank #{index + 1}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Recent notifications</h2>
            <p className="mt-2 text-slate-500">Live updates for payments, orders, and refunds.</p>
            <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No notifications yet. Updates appear after activity.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id || notification.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{notification.title || 'Update'}</p>
                      <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Quick stats</h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payout count</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{overview.payoutCount || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refund total</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(overview.refundStats?.totalRefundAmount || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </VendorLayout>
  );
}
