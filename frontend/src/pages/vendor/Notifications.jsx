import { useEffect, useState } from 'react';
import axios from 'axios';
import VendorLayout from '../../layouts/VendorLayout';

const DEFAULT_VENDOR_ID = 'vendor-demo';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let eventSource = null;

    const loadNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications/vendor/${DEFAULT_VENDOR_ID}`);
        setNotifications(response.data?.data || []);
      } catch (error) {
        console.error('Notification load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    if (typeof EventSource !== 'undefined') {
      eventSource = new EventSource(`/api/notifications/vendor/${DEFAULT_VENDOR_ID}/stream`);
      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data);
          setNotifications((prev) => [notification, ...prev.filter((item) => item._id !== notification._id)].slice(0, 20));
        } catch (err) {
          console.error('Notifications SSE parse failed', err);
        }
      });
      eventSource.addEventListener('connected', () => console.debug('Notifications SSE connected'));
      eventSource.addEventListener('error', (event) => {
        console.warn('Notifications SSE error', event);
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
        }
      });
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <VendorLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Notifications</h1>
              <p className="mt-2 text-slate-600">Live updates for payments, refunds, orders and vendor alerts.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Live feed</span>
          </div>
        </section>

        <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-slate-500">No notifications yet. Your dashboard will populate once payments and orders are processed.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id || notification.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{notification.title || 'Notification'}</p>
                    <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="mt-2 text-slate-600">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
