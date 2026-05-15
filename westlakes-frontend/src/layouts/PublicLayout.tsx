import { Outlet } from "react-router-dom"
import Footer from "@/components/footer/Footer"
import Navbar from "@/components/navbar/Navbar"

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
