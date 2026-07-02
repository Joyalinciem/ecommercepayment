import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../../layouts/VendorLayout';

const PRODUCT_ID = 'premium-ecommerce-product';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await axios.get(`/api/reviews/product/${PRODUCT_ID}`);
        setReviews(response.data?.data || []);
      } catch (error) {
        console.error('Review data load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Reviews</h1>
              <p className="mt-2 text-slate-600">Verified customer feedback for your product.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Live</span>
          </div>
        </section>

        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Customer ratings</h2>
          <p className="mt-2 text-slate-600">Only confirmed paid orders appear here after review submission.</p>
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading customer reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-slate-500">No reviews yet. Ask customers to submit feedback from the review page.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id || review.id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{review.title || 'Customer review'}</p>
                      <p className="text-sm text-slate-500">Rating: {review.rating} / 5</p>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Order {review.orderId}</span>
                  </div>
                  <p className="mt-4 text-slate-600">{review.comment || review.body || 'No comment provided.'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
