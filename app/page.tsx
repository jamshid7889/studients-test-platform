"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LoginModal from "@/components/login-modal"
import RegisterModal from "@/components/register-modal"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const searchParams = useSearchParams()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get("showLogin") === "true") {
      setShowLogin(true)
    }
  }, [searchParams])

  useEffect(() => {
    // determine auth state client-side
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser || null)
      } catch (e) {
        setUser(null)
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null
        setIsAdmin(Boolean(token))
      } catch {
        setIsAdmin(false)
      }
    }
    getUser()
  }, [supabase])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section - show different content based on auth/admin state */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">PIRLS platformasiga xush kelibsiz!</h1>

            <p className="text-lg text-gray-600">Xorazm viloyati pedagogik mahorat markazi</p>

            {!user ? (
              // Logged out: show original hero + login/register
              <>
                <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  Oson va tez ro'yxatdan o'tib, bilimlaringizni sinab ko'ring. Platformamiz orqali turli testlardan
                  o'ting va natijalaringizni ko'ring.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    onClick={() => setShowLogin(true)}
                    className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 py-3 text-lg"
                  >
                    Kirish
                  </Button>
                  <Button
                    onClick={() => setShowRegister(true)}
                    variant="outline"
                    className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white px-8 py-3 text-lg"
                  >
                    Ro'yhatdan o'tish
                  </Button>
                </div>
              </>
            ) : isAdmin ? (
              // Admin: show admin-specific quick links
              <>
                <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">Admin paneliga o'ting yoki testlarni boshqaring.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={() => router.push('/admin')} className="bg-[#0ea5a4] text-white px-8 py-3 text-lg">Admin paneli</Button>
                  <Button onClick={() => router.push('/tests')} variant="outline" className="border-[#0ea5a4] text-[#0ea5a4] px-8 py-3 text-lg">Testlar ro'yxati</Button>
                </div>
              </>
            ) : (
              // Logged-in pupil: show quick links to tests and dashboard
              <>
                <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">Xush kelibsiz! Testlarga o'ting yoki natijalaringizni ko'ring.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={() => router.push('/tests')} className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 py-3 text-lg">Testlar ro'yxati</Button>
                  <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-[#4CAF50] text-[#4CAF50] px-8 py-3 text-lg">Natijalarim</Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <RegisterModal open={showRegister} onOpenChange={setShowRegister} />
    </div>
  )
}
