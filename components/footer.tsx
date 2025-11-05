"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function Footer() {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simple hardcoded admin credentials
      if (username === "admin" && password === "admin123") {
        // Store admin token in localStorage
        localStorage.setItem("admin_token", "admin_authenticated_" + Date.now())
        setShowAdminModal(false)
        setUsername("")
        setPassword("")
        router.push("/admin")
      } else {
        setError("Username yoki parol noto'g'ri")
      }
    } catch (err) {
      setError("Kirish xatosi yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <footer className="bg-gray-50 border-t mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">© 2025 PIRLS. Barcha huquqlar himoyalangan.</p>
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Paneli</DialogTitle>
            <DialogDescription>Admin akauntiga kirish</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Username kiriting"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Parol</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Parol kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white" disabled={isLoading}>
              {isLoading ? "Kuting..." : "Kirish"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
