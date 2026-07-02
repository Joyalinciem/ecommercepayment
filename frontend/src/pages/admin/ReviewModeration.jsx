import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';

export default function ReviewModeration() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let reviewStream = null;

    const loadFlagged = async () => {
      try {
        const response = await axios.get('/api/review-moderation/pending');
        setFlagged(response.data?.data || []);
      } catch (error) {
        console.error('Flagged review load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadFlagged();

    if (typeof EventSource !== 'undefined') {
      reviewStream = new EventSource('/api/review-moderation/stream');
      reviewStream.addEventListener('reviewModerationUpdate', () => loadFlagged());
      reviewStream.addEventListener('connected', () => console.debug('Review moderation SSE connected'));
      reviewStream.addEventListener('error', (event) => {
        console.warn('Review moderation SSE error', event);
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
    } catch (error) {
      console.error('Approve failed', error);
    }
  };

  const rejectFlag = async (id) => {
    try {
      await axios.post(`/api/review-moderation/${id}/reject`);
      setFlagged((prev) => prev.filter((review) => review._id !== id));
    } catch (error) {
      console.error('Reject failed', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Review Moderation</h1>
              <p className="mt-2 text-slate-600">Approve or reject customer reviews flagged by users and maintain marketplace quality.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Moderation feed</span>
          </div>
        </section>

        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          {loading ? (
            <p className="text-slate-500">Loading flagged reviews...</p>
          ) : flagged.length === 0 ? (
            <p className="text-slate-500">No flagged reviews at the moment.</p>
          ) : (
            <div className="space-y-4">
              {flagged.map((review) => (
                <div key={review._id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Order {review.orderId}</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">{review.title || 'Review request'}</h2>
                      <p className="mt-1 text-sm text-slate-700">Rating: {review.rating} / 5</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => approveFlag(review._id)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectFlag(review._id)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-700">{review.comment || review.body || 'No review text available.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
