"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RegisterModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { full_name: name },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        setError("")
        onOpenChange(false)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Ro'yhatdan o'tish xatosi yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Ro'yhatdan o'tish</DialogTitle>
          <DialogDescription>Yangi akount yaratish uchun malumotlarni kiriting</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">To'liq ismingiz</Label>
            <Input
              id="name"
              type="text"
              placeholder="To'liq ismingizni kiriting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

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
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white" disabled={isLoading}>
            {isLoading ? "Kuting..." : "Ro'yhatdan o'tish"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
