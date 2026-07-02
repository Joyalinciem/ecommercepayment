import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../layouts/VendorLayout';

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
    <div className="mt-4 h-56 rounded-2xl bg-white p-4">
      <div className="flex h-full items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-cyan-500 transition-all"
              style={{ height: `${Math.max(((item.value || 0) / maxValue) * 100, 8)}%` }}
              title={`${item.label}: ${formatCurrency(item.value)}`}
            />
            <span className="text-xs font-medium text-slate-500">{item.label}</span>
            <span className="text-[11px] text-slate-400">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }) {
  const width = 560;
  const height = 220;
  const padding = 20;
  const maxValue = Math.max(...data.map((item) => item.value || 0), 1);
  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - ((item.value || 0) / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" />
        <polyline fill="none" stroke="#0f766e" strokeWidth="3" points={points} />
        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
          const y = height - padding - ((item.value || 0) / maxValue) * (height - padding * 2);
          return (
            <g key={item.label}>
              <circle cx={x} cy={y} r="5" fill="#14b8a6" />
              <text x={x} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748b">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
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
    let notificationsSource = null;
    let overviewSource = null;
    let intervalId = null;

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
        console.error('Dashboard refresh failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    if (typeof EventSource !== 'undefined') {
      overviewSource = new EventSource(`/api/vendor/${DEFAULT_VENDOR_ID}/overview/stream`);
      overviewSource.addEventListener('vendorUpdate', () => loadDashboard());
      overviewSource.addEventListener('connected', () => console.debug('Vendor overview SSE connected'));
      overviewSource.addEventListener('error', (event) => {
        console.warn('Vendor overview SSE error', event);
        if (overviewSource.readyState === EventSource.CLOSED) {
          overviewSource.close();
        }
      });

      notificationsSource = new EventSource(`/api/notifications/vendor/${DEFAULT_VENDOR_ID}/stream`);
      notificationsSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data);
          setNotifications((prev) => [notification, ...prev.filter((item) => item._id !== notification._id)].slice(0, 20));
        } catch (err) {
          console.error('Invalid notification payload', err);
        }
      });
      notificationsSource.addEventListener('connected', () => console.debug('Notifications SSE connected'));
      notificationsSource.addEventListener('error', (event) => {
        console.warn('Notifications SSE error', event);
        if (notificationsSource.readyState === EventSource.CLOSED) {
          notificationsSource.close();
        }
      });
    }

    intervalId = window.setInterval(loadDashboard, 10000);
    return () => {
      if (overviewSource) {
        overviewSource.close();
      }
      if (notificationsSource) {
        notificationsSource.close();
      }
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <VendorLayout>
      <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Vendor Dashboard</h1>
          <p className="mt-2 text-slate-600">Live sales, payout, and vendor activity overview.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Auto-refreshing
        </span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Total sales</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : formatCurrency(overview.totalSales || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Pending orders</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : overview.pendingOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Payout history</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : formatCurrency(overview.payoutHistory || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Refund requests</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : overview.refundStats?.totalRequests || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Approved</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : overview.refundStats?.approvedCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Total refund amount</p>
          <p className="mt-3 text-2xl font-semibold">{loading ? '—' : formatCurrency(overview.refundStats?.totalRefundAmount || 0)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Orders delivered</p>
          <p className="mt-3 text-3xl font-semibold">{loading ? '—' : overview.sellerPerformance?.deliveredOnTime || 0}</p>
          <p className="mt-2 text-xs text-slate-600">Out of {overview.sellerPerformance?.totalOrders || 0} total</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">On-time delivery rate</p>
          <p className="mt-3 text-3xl font-semibold">
            {loading ? '—' : ((overview.sellerPerformance?.deliveredOnTime || 0) / Math.max(overview.sellerPerformance?.totalOrders || 1, 1) * 100).toFixed(0)}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm uppercase tracking-wide text-slate-500">Total earned</p>
          <p className="mt-3 text-3xl font-semibold">{loading ? '—' : formatCurrency(overview.sellerPerformance?.totalEarned || 0)}</p>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Revenue chart</h2>
              <p className="mt-2 text-slate-600">Bar chart for recent sales and line graph for revenue trends.</p>
            </div>
          </div>
          <BarChart data={salesData} />
          <LineChart data={revenueData} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Most selling products</h2>
                <p className="mt-2 text-slate-600">Live ranking of your best-performing items.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 max-h-56 overflow-y-auto">
              {(overview.topProducts || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No sales yet. Product rankings will appear here automatically after payments are confirmed.
                </div>
              ) : (
                (overview.topProducts || []).map((product, index) => (
                  <div key={`${product.productName}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="font-medium text-slate-800">{product.productName}</p>
                      <p className="text-sm text-slate-500">{product.salesCount} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-slate-400">Rank #{index + 1}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="mt-2 text-slate-600">Real-time in-app notification stream for vendor events.</p>
            <div className="mt-4 space-y-3 max-h-56 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No notifications yet. Successful payments will appear here automatically.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id || notification.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-800">{notification.title || 'Vendor update'}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
    </VendorLayout>
  );
}
