import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "@/layouts/PublicLayout"
import CustomerDashboardLayout from "@/layouts/CustomerDashboardLayout"
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout"
import ProtectedRoutes from "./ProtectedRoutes"
import Home from "../pages/public/Home"
import About from "../pages/public/About"
import Services from "../pages/public/Services"
import Contact from "../pages/public/Contact"
import Careers from "../pages/public/Careers"
import FAQ from "../pages/public/FAQ"
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import ForgotPassword from "../pages/auth/ForgotPassword"
import CustomerDashboard from "@/pages/customer/Dashboard"
import CustomerAccounts from "@/pages/customer/Accounts"
import CustomerTransactions from "@/pages/customer/Transactions"
import CustomerTransfers from "@/pages/customer/Transfers"
import CustomerTickets from "@/pages/customer/Tickets"
import CustomerMessages from "@/pages/customer/Messages"
import ATMWithdrawal from "@/pages/customer/ATMWithdrawal"
import MyCards from "@/pages/customer/MyCards"
import CustomerNotifications from "@/pages/customer/Notifications"
import CustomerProfile from "@/pages/customer/Profile"
import KYCVerification from "@/pages/customer/KYCVerification"
import CustomerDeposit from "@/pages/customer/Deposit"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminNotifications from "@/pages/admin/Notifications"
import CustomerManagement from "@/pages/admin/CustomerManagement"
import CustomerDetail from "@/pages/admin/CustomerDetail"
import AccountApprovals from "@/pages/admin/AccountApprovals"
import VerificationManagement from "@/pages/admin/VerificationManagement"
import TransactionMonitoring from "@/pages/admin/TransactionMonitoring"
import TicketManagement from "@/pages/admin/TicketManagement"
import ATMCardManagement from "@/pages/admin/ATMCardManagement"
import AdminMessages from "@/pages/admin/Messages"
import Reports from "@/pages/admin/Reports"

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
          <Route path="dashboard" element={<CustomerDashboardLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="accounts" element={<CustomerAccounts />} />
            <Route path="transactions" element={<CustomerTransactions />} />
            <Route path="transfers" element={<CustomerTransfers />} />
            <Route path="tickets" element={<CustomerTickets />} />
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="withdraw" element={<ATMWithdrawal />} />
            <Route path="cards" element={<MyCards />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="verify" element={<KYCVerification />} />
            <Route path="deposit" element={<CustomerDeposit />} />
          </Route>
        </Route>

<Route element={<ProtectedRoutes role="admin" />}>
           <Route path="admin" element={<AdminDashboardLayout />}>
             <Route index element={<AdminDashboard />} />
             <Route path="notifications" element={<AdminNotifications />} />
             <Route path="customers" element={<CustomerManagement />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="verifications" element={<VerificationManagement />} />
            <Route path="account-approvals" element={<AccountApprovals />} />
            <Route path="transactions" element={<TransactionMonitoring />} />
            <Route path="tickets" element={<TicketManagement />} />
            <Route path="atm-cards" element={<ATMCardManagement />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
