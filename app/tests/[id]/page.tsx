"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

type Test = {
  id: string
  title: string
  description: string
}

type Question = {
  id: string
  question_text: string
  question_order: number
  question_type: "radio" | "textarea"
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: string
}

export default function TestDetailPage() {
  const params = useParams()
  const testId = params.id as string
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const extractKeywords = (text: string): string[] => {
    return text
      .toLowerCase()
      .split(/[,\s]+/)
      .filter((word) => word.length > 0)
  }

  const checkTextareaAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const userKeywords = extractKeywords(userAnswer)
    const correctKeywords = extractKeywords(correctAnswer)
    const matchedKeywords = userKeywords.filter((keyword) => correctKeywords.includes(keyword))
    return matchedKeywords.length > 0
  }

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) {
          router.push("/?showLogin=true")
          return
        }

        const { data: testData, error: testError } = await supabase.from("tests").select("*").eq("id", testId).single()

        if (testError) throw testError
        setTest(testData)

        const { data: questionsData, error: questionsError } = await supabase
          .from("test_questions")
          .select("*")
          .eq("test_id", testId)
          .order("question_order")

        if (questionsError) throw questionsError
        console.log("[v0] Questions loaded:", questionsData)
        setQuestions(questionsData || [])
      } catch (err) {
        console.error("Error fetching test:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestData()
  }, [testId, supabase, router])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.push("/?showLogin=true")
        return
      }

      let score = 0
      questions.forEach((question) => {
        const userAnswer = answers[question.id] || ""
        if (!userAnswer) return

        if (question.question_type === "radio") {
          if (userAnswer === question.correct_answer) score++
        } else if (question.question_type === "textarea") {
          if (checkTextareaAnswer(userAnswer, question.correct_answer || "")) score++
        }
      })

      const { error } = await supabase.from("test_results").insert({
        user_id: authData.user.id,
        test_id: testId,
        total_questions: questions.length,
        score: score,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (err) {
      console.error("Error submitting test:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 px-4">
          <p className="text-gray-600">Test yuklanyapti...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 px-4">
          <p className="text-gray-600">Test topilmadi</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{test.title}</h1>

          <p className="text-gray-700 mb-8 leading-relaxed">{test.description}</p>

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-700 mb-4">
                  {question.question_order}. {question.question_text}
                </h3>

                {question.question_type === "radio" ? (
                  <div className="space-y-3">
                    {[
                      { key: "A", label: question.option_a },
                      { key: "B", label: question.option_b },
                      { key: "C", label: question.option_c },
                      { key: "D", label: question.option_d },
                    ].map(
                      (option) =>
                        option.label && (
                          <label
                            key={option.key}
                            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-green-100"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.key}
                              checked={answers[question.id] === option.key}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [question.id]: e.target.value,
                                })
                              }
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="font-medium text-gray-700">
                              {option.key}) {option.label}
                            </span>
                          </label>
                        ),
                    )}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [question.id]: e.target.value,
                      })
                    }
                    placeholder="Javobingizni kiriting"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    rows={3}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-8 w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-3 text-lg"
          >
            {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
