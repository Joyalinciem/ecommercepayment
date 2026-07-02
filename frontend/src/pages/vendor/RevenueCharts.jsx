import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../../layouts/VendorLayout';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

function LineChart({ data }) {
  const width = 560;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(...data.map((item) => item.value || 0), 1);
  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - ((item.value || 0) / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-6 rounded-3xl bg-slate-50 p-6 shadow-sm">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" />
          <polyline fill="none" stroke="#0f766e" strokeWidth="3" points={points} />
          {data.map((item, index) => {
            const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
            const y = height - padding - ((item.value || 0) / maxValue) * (height - padding * 2);
            return (
              <g key={item.label}>
                <circle cx={x} cy={y} r="5" fill="#14b8a6" />
                <text x={x} y={height - 6} textAnchor="middle" fontSize="11" fill="#64748b">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function RevenueCharts() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const revenueRes = await axios.get('/api/analytics/revenue');
        const revenuePayload = Array.isArray(revenueRes.data?.data?.series)
          ? revenueRes.data.data.series
          : Array.isArray(revenueRes.data?.data)
          ? revenueRes.data.data
          : [];
        setRevenueData(revenuePayload);
      } catch (error) {
        console.error('Revenue data load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Revenue Charts</h1>
              <p className="mt-2 text-slate-600">Live revenue trends from sales, refunds, and payouts.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Real-time</span>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Revenue trend</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(revenueData.reduce((sum, item) => sum + Number(item.value || 0), 0))}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Points shown</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{revenueData.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Latest month</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{loading ? '—' : formatCurrency(revenueData[revenueData.length - 1]?.value)}</p>
          </div>
        </section>

        <LineChart data={revenueData.map((item, index) => ({ label: item.label || `M${index + 1}`, value: Number(item.value || 0) }))} />
      </div>
    </VendorLayout>
  );
}
