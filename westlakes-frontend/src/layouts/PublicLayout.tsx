import { Outlet } from "react-router-dom"
import Footer from "@/components/footer/Footer"
import Navbar from "@/components/navbar/Navbar"

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      <main className="w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
