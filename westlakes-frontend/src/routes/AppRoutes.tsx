import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import Contact from "../pages/public/Contact";
import Careers from "../pages/public/Careers";
import FAQ from "../pages/public/FAQ";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
