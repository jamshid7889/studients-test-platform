"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AddTestForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (!title.trim()) {
        setError("Test nomi kiritilmagan")
        setIsLoading(false)
        return
      }

      if (!description.trim()) {
        setError("Test tavsifi kiritilmagan")
        setIsLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from("tests")
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
          },
        ])
        .select()

      if (insertError) {
        console.log("[v0] Insert error:", insertError)
        setError("Test qo'shishda xato yuz berdi: " + insertError.message)
        return
      }

      setSuccess("✓ Test muvaffaqiyatli qo'shildi!")
      setTitle("")
      setDescription("")

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
        <CardTitle>Yangi Test Qo'shish</CardTitle>
        <CardDescription>Test nomi va tavsifrini kiriting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Test nomi *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Masalan: Kitob — bilim manbai"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Test tavsifi *</Label>
            <Textarea
              id="description"
              placeholder="Test haqida qisqacha ma'lumot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

          <Button type="submit" className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white" disabled={isLoading}>
            {isLoading ? "Kuting..." : "Test Qo'shish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
