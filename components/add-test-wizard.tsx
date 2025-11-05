"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2, ArrowRight, Check } from "lucide-react"

type Step = "info" | "questions" | "review"
type QuestionType = "radio" | "textarea" | ""

type Question = {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  correctAnswer?: string | number
}

type AddTestWizardProps = {
  onClose: () => void
  onSuccess?: () => void
}

export default function AddTestWizard({ onClose, onSuccess }: AddTestWizardProps) {
  const [step, setStep] = useState<Step>("info")
  const [testName, setTestName] = useState("")
  const [testDescription, setTestDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<QuestionType>("")
  const [radioOptions, setRadioOptions] = useState(["", "", "", ""])
  const [correctRadio, setCorrectRadio] = useState<number | null>(null)
  const [correctTextarea, setCorrectTextarea] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const progress = step === "info" ? 33 : step === "questions" ? 66 : 100

  const addQuestion = () => {
    setError("")

    if (!questionText.trim()) {
      setError("Savol matni kiritilmagan")
      return
    }

    if (!questionType) {
      setError("Savol turi tanlanmagan")
      return
    }

    if (questionType === "radio") {
      if (radioOptions.some((opt) => !opt.trim())) {
        setError("Barcha javob variantlari kiritilmagan")
        return
      }
      if (correctRadio === null) {
        setError("To'g'ri javob tanlanmagan")
        return
      }
    } else if (questionType === "textarea") {
      if (!correctTextarea.trim()) {
        setError("To'g'ri javob kiritilmagan")
        return
      }
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: questionType,
      text: questionText,
      ...(questionType === "radio" && {
        options: radioOptions,
        correctAnswer: correctRadio,
      }),
      ...(questionType === "textarea" && {
        correctAnswer: correctTextarea,
      }),
    }

    setQuestions([...questions, newQuestion])

    setQuestionText("")
    setQuestionType("")
    setRadioOptions(["", "", "", ""])
    setCorrectRadio(null)
    setCorrectTextarea("")
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleNextStep = () => {
    setError("")

    if (step === "info") {
      if (!testName.trim()) {
        setError("Test nomi kiritilmagan")
        return
      }
      setStep("questions")
    } else if (step === "questions") {
      if (questions.length === 0) {
        setError("Kamida 1 ta savol qo'shish kerak")
        return
      }
      setStep("review")
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert([
          {
            title: testName.trim(),
            description: testDescription.trim() || null,
          },
        ])
        .select("id")

      if (testError || !testData) throw testError

      const testId = testData[0].id

      const questionRecords = questions.map((q, idx) => ({
        test_id: testId,
        question_text: q.text,
        question_type: q.type,
        question_order: idx + 1,
        option_a: q.type === "radio" ? q.options?.[0] : null,
        option_b: q.type === "radio" ? q.options?.[1] : null,
        option_c: q.type === "radio" ? q.options?.[2] : null,
        option_d: q.type === "radio" ? q.options?.[3] : null,
        correct_answer: q.type === "radio" ? ["A", "B", "C", "D"][q.correctAnswer as number] : q.correctAnswer,
      }))

      const { error: questionsError } = await supabase.from("test_questions").insert(questionRecords)

      if (questionsError) throw questionsError

      onSuccess?.()
      onClose()
    } catch (err) {
      console.log("[v0] Error:", err)
      setError("Test qo'shishda xato yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Yangi Test Qo'shish</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                {step === "info"
                  ? "1. Test Ma'lumotlari"
                  : step === "questions"
                    ? "2. Savollar Qo'shish"
                    : "3. Tekshirish"}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#4CAF50] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {step === "info" && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-semibold">Test Nomi *</Label>
                <Input
                  placeholder="Masalan: Kitob — bilim manbai"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold">Test Haqida (ixtiyoriy)</Label>
                <Textarea
                  placeholder="Testning qisqacha tavsifi..."
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-800">Savol Qo'shish</h3>

                <div>
                  <Label className="text-gray-700">Savol Matni *</Label>
                  <Textarea
                    placeholder="Savol matni..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-gray-700">Savol Turi *</Label>
                  <Select value={questionType} onValueChange={(val) => setQuestionType(val as QuestionType)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Savol turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radio">Ko'p variantli javob (A, B, C, D)</SelectItem>
                      <SelectItem value="textarea">Ochiq javob (kalit so'zlar solishtiriladi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {questionType === "radio" && (
                  <div className="space-y-3 bg-white p-3 rounded border border-blue-100">
                    <p className="text-sm font-semibold text-gray-700">Javob Variantlari</p>
                    {["A", "B", "C", "D"].map((letter, idx) => (
                      <div key={letter} className="flex items-center gap-2">
                        <span className="w-8 font-semibold text-gray-600">{letter})</span>
                        <Input
                          placeholder={`${letter}-javob variantini kiriting`}
                          value={radioOptions[idx]}
                          onChange={(e) => {
                            const newOptions = [...radioOptions]
                            newOptions[idx] = e.target.value
                            setRadioOptions(newOptions)
                          }}
                          className="flex-1"
                        />
                        <input
                          type="radio"
                          name="correct"
                          checked={correctRadio === idx}
                          onChange={() => setCorrectRadio(idx)}
                          className="w-5 h-5"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {questionType === "textarea" && (
                  <div className="space-y-2 bg-white p-3 rounded border border-green-100">
                    <p className="text-sm font-semibold text-gray-700">To'g'ri Javob (Kalit So'zlar)</p>
                    <Textarea
                      placeholder="To'g'ri javobning kalit so'zlari (vergul bilan ajratilgan)"
                      value={correctTextarea}
                      onChange={(e) => setCorrectTextarea(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 Masalan: 1240-yil, Amir Temur, Samarqand</p>
                  </div>
                )}

                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                <Button
                  onClick={addQuestion}
                  className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Savolni Qo'shish
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">Qo'shilgan Savollar ({questions.length})</p>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {idx + 1}. {q.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tur: {q.type === "radio" ? "Ko'p variantli" : "Ochiq javob"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Test Ma'lumotlari</h3>
                <p className="text-gray-700">
                  <strong>Nomi:</strong> {testName}
                </p>
                {testDescription && (
                  <p className="text-gray-700">
                    <strong>Tavsifi:</strong> {testDescription}
                  </p>
                )}
                <p className="text-gray-700">
                  <strong>Savollar soni:</strong> {questions.length}
                </p>
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>
          )}

          <div className="flex gap-3 justify-between mt-8 pt-6 border-t">
            {step !== "info" && (
              <Button
                onClick={() => setStep(step === "questions" ? "info" : "questions")}
                variant="outline"
                disabled={isLoading}
              >
                Orqaga
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button onClick={onClose} variant="outline" disabled={isLoading}>
                Bekor Qilish
              </Button>
              {step !== "review" ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center gap-2"
                  disabled={isLoading}
                >
                  Keyingi
                  <ArrowRight size={18} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Kuting..."
                  ) : (
                    <>
                      <Check size={18} />
                      Yakunlash
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
