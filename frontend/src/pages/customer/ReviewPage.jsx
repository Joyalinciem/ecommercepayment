import { useState } from 'react';
import axios from 'axios';
import CustomerLayout from '../../layouts/CustomerLayout';

const productId = 'premium-ecommerce-product';

export default function ReviewPage() {
  const [form, setForm] = useState({ orderId: '', userId: '', rating: 5, title: '', comment: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/reviews', {
        productId,
        orderId: form.orderId,
        userId: form.userId,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
      });
      setStatus({ success: true, message: 'Review submitted successfully.' });
      setForm({ ...form, title: '', comment: '' });
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || err.message });
    }
  };

  return (
    <CustomerLayout>
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Write a genuine review</h1>
        <p className="mt-2 text-slate-600">Only customers with confirmed paid orders can submit product ratings.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-slate-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Order ID
              <input
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Your User ID
              <input
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Rating
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Review title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short, honest headline"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Review comment
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={5}
              placeholder="Share your experience with the product"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
            />
          </label>

          {status ? (
            <div className={`rounded-2xl px-4 py-3 ${status.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {status.message}
            </div>
          ) : null}

          <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            Submit Review
          </button>
        </form>

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-semibold">Review rules</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• You must submit your real order ID and user ID.</li>
            <li>• Reviews are accepted only after payment confirmation.</li>
            <li>• Invalid users and unrelated orders are blocked.</li>
            <li>• Admins can review flagged feedback and approve or reject it.</li>
          </ul>
        </div>
      </div>
    </div>
  </CustomerLayout>
  );
}
