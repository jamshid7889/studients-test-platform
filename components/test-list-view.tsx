"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Plus } from "lucide-react"

type Test = {
  id: string
  title: string
  description: string
  created_at: string
  question_count?: number
}

type TestListViewProps = {
  onAddNew: () => void
  onRefresh?: () => void
}

export default function TestListView({ onAddNew, onRefresh }: TestListViewProps) {
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("tests")
        .select("id, title, description, created_at")
        .order("created_at", { ascending: false })

      if (!error) {
        setTests(data || [])
      }
    } catch (err) {
      console.log("[v0] Error fetching tests:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Testni o'chirish haqida ishonchingiz komil?")) {
      try {
        await supabase.from("tests").delete().eq("id", id)
        setTests(tests.filter((t) => t.id !== id))
      } catch (err) {
        console.log("[v0] Error deleting test:", err)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Mavjud Testlar</h2>
          <p className="text-sm text-gray-600">Jami: {tests.length} ta test</p>
        </div>
        <Button onClick={onAddNew} className="bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center gap-2">
          <Plus size={20} />
          Yangi Test Qo'shish
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-600 py-8">Testlar yuklanyapti...</p>
      ) : tests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Hali testlar qo'shilmagan</p>
          <Button onClick={onAddNew} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
            Birinchi Testni Qo'shish
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tests.map((test) => (
            <Card key={test.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-400 text-lg">{test.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(test.created_at).toLocaleDateString("uz-UZ")}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
