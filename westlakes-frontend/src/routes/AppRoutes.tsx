import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoutes from "./ProtectedRoutes";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import Contact from "../pages/public/Contact";
import Careers from "../pages/public/Careers";
import FAQ from "../pages/public/FAQ";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerAccounts from "@/pages/customer/Accounts";
import CustomerTransactions from "@/pages/customer/Transactions";
import CustomerTransfers from "@/pages/customer/Transfers";
import CustomerTickets from "@/pages/customer/Tickets";
import CustomerNotifications from "@/pages/customer/Notifications";
import CustomerProfile from "@/pages/customer/Profile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CustomerManagement from "@/pages/admin/CustomerManagement";
import AccountApprovals from "@/pages/admin/AccountApprovals";
import TransactionMonitoring from "@/pages/admin/TransactionMonitoring";
import TicketManagement from "@/pages/admin/TicketManagement";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="careers" element={<Careers />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoutes role="customer" />}>
          <Route path="customer" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="accounts" element={<CustomerAccounts />} />
            <Route path="transactions" element={<CustomerTransactions />} />
            <Route path="transfers" element={<CustomerTransfers />} />
            <Route path="tickets" element={<CustomerTickets />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes role="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="approvals" element={<AccountApprovals />} />
            <Route path="transactions" element={<TransactionMonitoring />} />
            <Route path="tickets" element={<TicketManagement />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
