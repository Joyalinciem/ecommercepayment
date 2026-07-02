import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CustomerLayout from './layouts/CustomerLayout';
import Header from './components/common/Header';
import PaymentForm from './components/PaymentForm';
import VendorOverview from './pages/DashboardPage';
import SalesAnalytics from './pages/vendor/SalesAnalytics';
import RevenueCharts from './pages/vendor/RevenueCharts';
import PayoutHistory from './pages/vendor/PayoutHistory';
import VendorReviews from './pages/vendor/Reviews';
import Notifications from './pages/vendor/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminKPIs from './pages/admin/KPIs';
import AdminReports from './pages/admin/Reports';
import AdminVendors from './pages/admin/Vendors';
import ReviewModeration from './pages/admin/ReviewModeration';
import AdminPayments from './pages/admin/Payments';
import ReviewPage from './pages/customer/ReviewPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
      <Route path="/checkout" element={<CustomerLayout><PaymentForm /></CustomerLayout>} />
      <Route path="/dashboard" element={<VendorOverview />} />
      <Route path="/dashboard/sales" element={<SalesAnalytics />} />
      <Route path="/dashboard/revenue" element={<RevenueCharts />} />
      <Route path="/dashboard/payouts" element={<PayoutHistory />} />
      <Route path="/dashboard/reviews" element={<VendorReviews />} />
      <Route path="/dashboard/notifications" element={<Notifications />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/kpis" element={<AdminKPIs />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/vendors" element={<AdminVendors />} />
      <Route path="/admin/reviews" element={<ReviewModeration />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/customer/reviews" element={<ReviewPage />} />
    </Routes>
    </>
  );
}

export default App;
