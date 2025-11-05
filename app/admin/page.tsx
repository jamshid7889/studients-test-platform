"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AdminLoginForm from "@/components/admin-login-form"
import AdminDashboard from "@/components/admin-dashboard"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin token exists in localStorage
    const adminToken = localStorage.getItem("admin_token")
    if (adminToken) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Kuting...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <AdminLoginForm onSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
        )}
      </main>
      <Footer />
    </div>
  )
}
