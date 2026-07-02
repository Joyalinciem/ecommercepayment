import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';

export default function Vendors() {
  const [requests, setRequests] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const [requestsRes, sellersRes] = await Promise.all([
          axios.get('/api/admin/vendor-requests/pending'),
          axios.get('/api/admin/top-sellers'),
        ]);

        setRequests(requestsRes.data?.data || []);
        setTopSellers(sellersRes.data?.data || []);
      } catch (error) {
        console.error('Vendor page load failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  const updateRequest = (requestId, status) => {
    setRequests((prev) => prev.filter((request) => request._id !== requestId));
  };

  const approveRequest = async (requestId) => {
    try {
      await axios.post(`/api/admin/vendor-requests/${requestId}/approve`);
      updateRequest(requestId, 'approved');
    } catch (error) {
      console.error('Approve seller request failed', error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(`/api/admin/vendor-requests/${requestId}/reject`, { reason: 'Review details do not meet compliance standards' });
      updateRequest(requestId, 'rejected');
    } catch (error) {
      console.error('Reject seller request failed', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Vendor Directory</h1>
              <p className="mt-2 text-slate-600">Review seller onboarding requests, approve compliant vendors, and manage top sellers.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">New seller requests</span>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pending approvals</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : requests.length}</p>
            <p className="mt-2 text-slate-300">Seller applications awaiting document verification and review.</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Top sellers</p>
            <p className="mt-4 text-3xl font-semibold">{loading ? '—' : topSellers.length}</p>
            <p className="mt-2 text-slate-300">High-performing vendors by revenue and profitability.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Policy reminder</h2>
            <p className="mt-3 text-slate-700">Verify GST, identity proofs, and business licenses before approving any seller request.</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Pending seller requests</h2>
              <p className="mt-1 text-sm text-slate-600">Approve or reject new vendor registrations with full document visibility.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading seller applications...</p>
            ) : requests.length === 0 ? (
              <p className="text-slate-500">No new seller requests at this time.</p>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Request from {request.email}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{request.companyName}</h3>
                      <p className="mt-2 text-sm text-slate-600">Contact: {request.contactName} · {request.phone || 'No phone provided'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => approveRequest(request._id)} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                        Approve
                      </button>
                      <button onClick={() => rejectRequest(request._id)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">GST Number</p>
                      <p className="mt-2 text-slate-900 font-medium">{request.gstNumber || 'Not provided'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Business license</p>
                      {request.businessLicenseUrl ? (
                        <a href={request.businessLicenseUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">
                          View document
                        </a>
                      ) : (
                        <p className="mt-2 text-slate-700">Missing</p>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Identity proof</p>
                      {request.identityProofUrl ? (
                        <a href={request.identityProofUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">
                          View proof
                        </a>
                      ) : (
                        <p className="mt-2 text-slate-700">Missing</p>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Submitted</p>
                      <p className="mt-2 text-slate-900 font-medium">{new Date(request.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-50 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Top sellers</h2>
          <p className="mt-1 text-sm text-slate-600">Review the most profitable vendors and monitor revenue leadership.</p>
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
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Sales count</p>
                      <p className="mt-2 text-slate-900 font-medium">{seller.salesCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-sm text-slate-500">Estimated platform profit</p>
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
