"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type StudentStat = {
  user_id: string
  user_email: string
  user_name: string
  total_tests_taken: number
  total_correct: number
  total_questions: number
  average_score: number
}

export default function AdminStatsSidebar() {
  const [stats, setStats] = useState<StudentStat[]>([])
  const [filteredStats, setFilteredStats] = useState<StudentStat[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("test_results")
          .select(
            `
            user_id,
            users(email, full_name),
            score,
            total_questions
          `,
          )
          .order("user_id")

        if (error) throw error

        // Group by user and calculate stats
        const userStats = new Map<string, StudentStat>()
        ;(data || []).forEach((result: any) => {
          const userId = result.user_id
          const email = result.users?.email || "Unknown"
          const name = result.users?.full_name || "Noma'lum"

          if (!userStats.has(userId)) {
            userStats.set(userId, {
              user_id: userId,
              user_email: email,
              user_name: name,
              total_tests_taken: 0,
              total_correct: 0,
              total_questions: 0,
              average_score: 0,
            })
          }

          const stat = userStats.get(userId)!
          stat.total_tests_taken += 1
          stat.total_correct += result.score || 0
          stat.total_questions += result.total_questions || 0
          stat.average_score =
            stat.total_questions > 0 ? Math.round((stat.total_correct / stat.total_questions) * 100) : 0
        })

        const statsArray = Array.from(userStats.values())
        setStats(statsArray)
        setFilteredStats(statsArray)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  useEffect(() => {
    const filtered = stats.filter(
      (stat) =>
        stat.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStats(filtered)
  }, [searchTerm, stats])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>O'quvchi Statistikasi</CardTitle>
        <CardDescription>Barcha o'quvchilar va ularning natijalari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Nomi yoki email bo'yicha qidiring..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-600">Yuklanyapti...</p>
          ) : filteredStats.length === 0 ? (
            <p className="text-sm text-gray-600">Hech qanday o'quvchi topilmadi</p>
          ) : (
            filteredStats.map((stat) => (
              <div
                key={stat.user_id}
                className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{stat.user_name}</p>
                    <p className="text-xs text-gray-600">{stat.user_email}</p>
                  </div>
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {stat.average_score}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-600">Testlar</p>
                    <p className="font-bold text-blue-600">{stat.total_tests_taken}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">To'g'ri</p>
                    <p className="font-bold text-green-600">{stat.total_correct}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Jami</p>
                    <p className="font-bold text-gray-600">{stat.total_questions}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${stat.average_score}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
