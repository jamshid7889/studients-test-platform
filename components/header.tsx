"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import ThemeToggle from "./theme-toggle"
import { useState, useEffect } from "react"

type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser || null)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
    // detect admin flag from localStorage (admin login uses localStorage "admin_token")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
      setIsAdmin(Boolean(token))
    } catch (e) {
      setIsAdmin(false)
    }

    // listen for admin token changes (other tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin_token") setIsAdmin(Boolean(e.newValue))
    }
    window.addEventListener("storage", onStorage)

    return () => window.removeEventListener("storage", onStorage)
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 bg-gradient-to-r from-[#10B981] to-[#059669] dark:from-[#0D9488] dark:to-[#0F766E] text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#10B981] font-bold">
            P
          </div>
          <span className="hidden sm:inline">PIRLS</span>
        </Link>

        <nav className="hidden md:flex gap-6 flex-1 ml-8">
          <Link href="/tests" className="hover:opacity-80 transition text-sm lg:text-base">
            Testlar ro'yxati
          </Link>
          {!isAdmin ? (
            <Link href="/dashboard" className="hover:opacity-80 transition text-sm lg:text-base">
              Natijalarim
            </Link>
          ) : (
            <Link href="/admin" className="hover:opacity-80 transition text-sm lg:text-base">
              Admin paneli
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-xs md:text-sm truncate">{user.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-white text-[#10B981] hover:bg-gray-100 text-xs md:text-sm"
                    size="sm"
                  >
                    Chiqish
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => router.push("/?showLogin=true")}
                  variant="outline"
                  className="bg-white text-[#10B981] hover:bg-gray-100 text-xs md:text-sm"
                  size="sm"
                >
                  Kirish
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
