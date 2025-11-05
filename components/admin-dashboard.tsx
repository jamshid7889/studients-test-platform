"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import TestListView from "./test-list-view"
import AddTestWizard from "./add-test-wizard"
import AdminStatsSidebar from "./admin-stats-sidebar"

type AdminDashboardProps = {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [showWizard, setShowWizard] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    onLogout()
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Paneli
          </h1>
          <p className="text-muted-foreground">
            Testlar va savollarni boshqarish
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
        >
          Chiqish
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with statistics */}
        <div className="lg:col-span-1">
          <AdminStatsSidebar />
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <TestListView
            key={refreshKey}
            onAddNew={() => setShowWizard(true)}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />

          {showWizard && (
            <AddTestWizard
              onClose={() => setShowWizard(false)}
              onSuccess={() => {
                setShowWizard(false)
                setRefreshKey((prev) => prev + 1)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
