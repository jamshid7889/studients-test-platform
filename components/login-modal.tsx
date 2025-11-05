"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Login attempt with email:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      console.log("[v0] Login response:", { data, error: signInError })

      if (signInError) {
        console.log("[v0] SignIn error:", signInError.message)
        setError(signInError.message || "Email yoki parol noto'g'ri")
        return
      }

      if (data.user) {
        onOpenChange(false)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.log("[v0] Catch error:", err)
      setError("Kirish xatosi yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Kirish</DialogTitle>
          <DialogDescription>Akauntingizga kirish uchun email va parolni kiriting</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email pochtangizni kiriting</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email pochtangizni kiriting"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parolingizni kiriting</Label>
            <Input
              id="password"
              type="password"
              placeholder="Parolingizni kiriting"
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
  )
}
