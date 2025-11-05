"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Test = {
  id: string
  title: string
  description: string
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        console.log("[v0] Fetching tests with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

        const supabase = createClient()
        const { data, error: supabaseError } = await supabase.from("tests").select("id, title, description")

        if (supabaseError) {
          console.error("[v0] Supabase error:", supabaseError)
          throw supabaseError
        }

        console.log("[v0] Fetched tests:", data)
        setTests(data || [])
        setError(null)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error("[v0] Error fetching tests:", errorMessage)
        setError(`Testlarni yuklashda xato: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTests()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Testlar ro'yxati</h1>

          {isLoading ? (
            <p className="text-gray-600">Testlar yuklanyapti...</p>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          ) : tests.length > 0 ? (
            <div className="grid gap-6">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h2>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  <Link href={`/tests/${test.id}`}>
                    <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">Ko'rish</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Testlar mavjud emas</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
