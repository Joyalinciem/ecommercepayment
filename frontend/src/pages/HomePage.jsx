import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-8 py-16 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Multi-Vendor Marketplace</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-100">
          A polished dashboard experience with live revenue charts, review moderation, payment processing, and vendor analytics.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/checkout" className="inline-flex rounded-full bg-white px-6 py-3 text-slate-950 shadow-lg transition hover:-translate-y-0.5">
            Secure Checkout
          </Link>
          <Link to="/dashboard" className="inline-flex rounded-full border border-white px-6 py-3 text-white transition hover:bg-white hover:text-slate-950">
            Vendor Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Vendor insights</h2>
          <p className="mt-2 text-slate-600">Live charts, payout summaries, order status and seller performance in one unified view.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Reviews & moderation</h2>
          <p className="mt-2 text-slate-600">Customers submit verified reviews while admins can flag, approve or reject reports.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="mt-2 text-slate-600">Secure checkout flow with Razorpay-ready payment sessions and refund tracking.</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Seller Profile</p>
          <h2 className="mt-4 text-2xl font-semibold">Premium ecommerce product</h2>
          <p className="mt-2 text-slate-600">A refined store layout with responsive analytics for mobile, tablet and desktop.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total orders</p>
          <p className="mt-4 text-3xl font-semibold">0</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Refunds</p>
          <p className="mt-4 text-3xl font-semibold">0 pending</p>
        </div>
      </section>
    </div>
  );
}
