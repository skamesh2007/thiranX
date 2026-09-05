import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Navbar from "@/components/navBar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="pb-24 sm:pb-28">{children}</div>
      <Navbar />
    </ProtectedRoute>
  )
}