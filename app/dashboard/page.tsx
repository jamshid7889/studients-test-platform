"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ResultDetailModal from "@/components/result-detail-modal"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Result = {
  test_excerpt: string
  id: string
  test_id: string
  test_title: string
  answered_at: string
  total_questions: number
  score: number
}

export default function DashboardPage() {
  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) {
          router.push("/?showLogin=true")
          return
        }

        const { data, error } = await supabase
          .from("test_results")
          .select(
            `
            id,
            test_id,
            tests(title),
            answered_at,
            total_questions,
            score
          `,
          )
          .eq("user_id", authData.user.id)
          .order("answered_at", { ascending: false })

        if (error) throw error

        const formattedResults = (data || []).map((result: any) => ({
          id: result.id,
          test_id: result.test_id,
          test_title: result.tests?.title || "Noma'lum test",
          answered_at: result.answered_at,
          total_questions: result.total_questions,
          score: result.score,
        }))

        setResults(formattedResults)
      } catch (err) {
        console.error("Error fetching results:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [supabase, router])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Natijalarim</h1>

          <Link href="/tests" className="mb-6 inline-block">
            <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">Testlarni ko'rish</Button>
          </Link>

          {isLoading ? (
            <p className="text-gray-600">Natijavlar yuklanyapti...</p>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">#</th>
                    <th className="border p-3 text-left">Sarlavha</th>
                    <th className="border p-3 text-left">Sana</th>
                    <th className="border p-3 text-center">To'g'ri javoblar</th>
                    <th className="border p-3 text-center">Xatolarim</th>
                    <th className="border p-3 text-center">Harakat</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="border p-3">{index + 1}</td>
                      <td className="border p-3">{result.test_title}</td>
                      <td className="border p-3">
                        {new Date(result.answered_at).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="border p-3 text-center">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded">{result.score}</span>
                      </td>
                      <td className="border p-3 text-center">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded">
                          {result.total_questions - result.score}
                        </span>
                      </td>
                      <td className="border p-3 text-center">
                        <div className="w-full">
                          <p className="font-medium truncate" title={result.test_title}>
                            {result.test_title}
                          </p>
                          <p
                            className="text-sm text-gray-500 truncate max-w-full"
                            title={result.test_excerpt ?? result.test_title}
                          >
                            {result.test_excerpt ?? result.test_title}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Hali hech qanday natija mavjud emas</p>
              <Link href="/tests">
                <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">Testlarni boshlash</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedResult && (
        <ResultDetailModal
          open={!!selectedResult}
          onOpenChange={(open) => !open && setSelectedResult(null)}
          resultId={selectedResult.id}
          testTitle={selectedResult.test_title}
        />
      )}
    </div>
  )
}
