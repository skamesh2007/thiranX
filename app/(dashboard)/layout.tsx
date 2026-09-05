import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Navbar from "@/components/navBar"
import TopNav from "@/components/TopNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <TopNav />
      <div className="pb-24 md:pb-0">{children}</div>
      <Navbar />
    </ProtectedRoute>
  )
}