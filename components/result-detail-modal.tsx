"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type ResultDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  resultId: string
  testTitle: string
}

type AnswerDetail = {
  question_number: number
  question_text: string
  question_type: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  options?: { a: string; b: string; c: string; d: string }
}

export default function ResultDetailModal({ open, onOpenChange, resultId, testTitle }: ResultDetailModalProps) {
  const [answers, setAnswers] = useState<AnswerDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

// ...existing code...
    useEffect(() => {
    async function fetchAnswerDetails() {
      setIsLoading(true)
      try {
        // 1) Try as a JSON column named "answers"
        let res = await supabase.from("test_results").select("answers").eq("id", resultId).single()

        // If column not found (Postgres 42703) or bad request, try fallback table queries
        if (res.error && (res.error.code === "42703" || /column .* does not exist/i.test(res.error.message || ""))) {
          const candidateTables = [
            "answers",
            "answer",
            "test_answers",
            "test_answer",
            "result_answers",
            "result_answer",
            "answer_details",
            "responses",
            "user_answers",
          ]
          const candidateFkFields = ["test_result_id", "result_id", "test_results_id", "test_id", "parent_id", "result"]

          let found = null
          for (const table of candidateTables) {
            for (const fk of candidateFkFields) {
              // log attempts for debugging
              console.debug(`Trying table=${table} fk=${fk}`)
              const tryRes = await supabase.from(table).select("*").eq(fk, resultId)
              if (tryRes.error) {
                console.debug(`Table ${table} error:`, tryRes.error)
                continue
              }
              if (tryRes.data && tryRes.data.length > 0) {
                found = { table, fk, data: tryRes.data }
                break
              }
            }
            if (found) break
          }

          if (found) {
            console.debug("Found answers in separate table:", found.table, found.fk)
            setAnswers(found.data as AnswerDetail[])
            return
          }

          // Relation-style select (requires FK/relationship in Supabase)
          res = await supabase.from("test_results").select("answers(*)").eq("id", resultId).single()
        }

        // If still error, fallback to fetching the test_results row and inspect its columns
        if (res.error) {
          console.debug("Initial queries failed, fetching full test_results row to inspect columns:", res.error)
          const inspect = await supabase.from("test_results").select("*").eq("id", resultId).single()
          if (inspect.error) {
            console.error("Error fetching test_results row: ", inspect.error)
            throw inspect.error
          }

          // try to discover an answers-like field automatically
          const row = inspect.data || {}
          let payload: any = []
          const candidates = ["answers", "responses", "result", "data", "payload", "answers_json", "user_answers"]
          // prefer explicit candidates
          for (const c of candidates) {
            if (c in row && row[c]) {
              payload = row[c]
              break
            }
          }
          // otherwise take first array-like column
          if (!Array.isArray(payload)) {
            for (const k of Object.keys(row)) {
              if (Array.isArray(row[k])) {
                payload = row[k]
                break
              }
              if (typeof row[k] === "string") {
                try {
                  const parsed = JSON.parse(row[k])
                  if (Array.isArray(parsed)) {
                    payload = parsed
                    break
                  }
                } catch {}
              }
            }
          }

          if (!Array.isArray(payload)) {
            console.warn("No answer-like column found in test_results row", row)
            setAnswers([])
            return
          }

          setAnswers(payload as AnswerDetail[])
          return
        }

        // normalize payload from res
        let payload: any = res.data?.answers ?? res.data
        if (typeof payload === "string") {
          try {
            payload = JSON.parse(payload)
          } catch {
            payload = []
          }
        }
        if (!Array.isArray(payload)) {
          if (payload && Array.isArray(payload.answers)) payload = payload.answers
          else payload = []
        }

        setAnswers(payload as AnswerDetail[])
      } catch (err: any) {
        console.error("Error fetching answer details: ", err ?? {})
        setAnswers([])
      } finally {
        setIsLoading(false)
      }
    }

    if (resultId) fetchAnswerDetails()
  }, [resultId])
// ...existing code...

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testTitle} - Javoblar</DialogTitle>
          <DialogDescription>Barcha savollar va javoblar</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-gray-600">Yuklanyapti...</p>
        ) : answers.length === 0 ? (
          <p className="text-center text-gray-600">Javoblar topilmadi</p>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  answer.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {answer.question_number}. {answer.question_text}
                  </h3>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded ${
                      answer.is_correct ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {answer.is_correct ? "To'g'ri" : "Xato"}
                  </span>
                </div>

                {answer.question_type === "radio" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Sizning javob:</strong> {answer.user_answer}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>To'g'ri javob:</strong> {answer.correct_answer}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Sizning javob:</strong>
                    </p>
                    <p className="text-sm bg-white p-2 rounded text-gray-600">{answer.user_answer}</p>
                    <p className="text-sm text-gray-700">
                      <strong>To'g'ri javob (kalit so'zlar):</strong>
                    </p>
                    <p className="text-sm bg-white p-2 rounded text-gray-600">{answer.correct_answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
