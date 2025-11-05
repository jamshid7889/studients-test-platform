"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Test = {
  id: string
  title: string
}

export default function AddQuestionsForm() {
  const [tests, setTests] = useState<Test[]>([])
  const [selectedTestId, setSelectedTestId] = useState("")
  const [questions, setQuestions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("tests")
          .select("id, title")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.log("[v0] Fetch error:", fetchError)
          setError("Testlarni yuklashda xato")
          return
        }

        setTests(data || [])
      } catch (err) {
        console.log("[v0] Catch error:", err)
        setError("Xato yuz berdi")
      } finally {
        setIsFetching(false)
      }
    }

    fetchTests()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedTestId) {
      setError("Test tanlanmagan")
      return
    }

    if (!questions.trim()) {
      setError("Savollar kiritilmagan")
      return
    }

    setIsLoading(true)

    try {
      // Parse questions from textarea
      // Format: Har bir savol yangi qatorida
      const questionLines = questions
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0)

      if (questionLines.length === 0) {
        setError("Hech qanday savol kiritilmagan")
        setIsLoading(false)
        return
      }

      // Insert questions
      const questionRecords = questionLines.map((questionText, index) => ({
        test_id: selectedTestId,
        question_text: questionText,
        question_order: index + 1,
      }))

      const { error: insertError } = await supabase.from("test_questions").insert(questionRecords)

      if (insertError) {
        console.log("[v0] Insert error:", insertError)
        setError("Savollarni qo'shishda xato yuz berdi: " + insertError.message)
        return
      }

      setSuccess(`✓ ${questionLines.length} ta savol muvaffaqiyatli qo'shildi!`)
      setQuestions("")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.log("[v0] Catch error:", err)
      setError("Xato yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testga Savolllar Qo'shish</CardTitle>
        <CardDescription>
          Har bir savol yangi qatorida bo'lsin. Raqam qo'shish ixtiyoriy:
          <br className="mt-2" />
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">1. Birinchi savol</code>
          <br />
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">2. Ikkinchi savol</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-select">Test tanlang *</Label>
            <Select value={selectedTestId} onValueChange={setSelectedTestId} disabled={isFetching || isLoading}>
              <SelectTrigger id="test-select">
                <SelectValue
                  placeholder={
                    isFetching ? "Testlar yuklanyapti..." : tests.length === 0 ? "Testlar yo'q" : "Test tanlang"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tests.length === 0 && !isFetching && <p className="text-xs text-orange-600">⚠ Avval test qo'shingiz</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="questions">Savollar *</Label>
            <Textarea
              id="questions"
              placeholder={`Matnga ko'ra kitob nima?\nMatnga ko'ra kitob bizni nimaga olib boravoti?\nKitob bizga nimani beradi?`}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              required
              disabled={isLoading || !selectedTestId}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>💡 Maslahat:</strong> Har bir savol yangi qatorida bo'lsin. Sistem avtomatik raqam beradi.
            </p>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

          <Button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
            disabled={isLoading || !selectedTestId}
          >
            {isLoading ? "Kuting..." : "Savollarni Qo'shish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
