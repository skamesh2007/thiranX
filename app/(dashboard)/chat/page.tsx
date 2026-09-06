"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send, Sparkles, User as UserIcon } from "lucide-react"
import axios from "axios"

import { askQuestion } from "@/services/aiService"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const user = useAuthStore((state) => state.user)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your ThiranX AI assistant. Ask me anything about your roadmap, career goals, or what to learn next.",
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  const handleSend = async () => {
    const question = input.trim()
    if (!question || sending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setError("")
    setSending(true)

    try {
      const answer = await askQuestion(question)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer },
      ])
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to get a response. Please try again."
        : "Failed to get a response. Please try again."
      setError(message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-6rem)] max-w-3xl flex-col p-4 sm:p-6 md:h-[calc(100svh-4rem)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask about your roadmap, skills, or career direction.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border bg-card p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                message.role === "user"
                  ? "bg-primary/10 text-primary"
                  : "bg-violet-500/10 text-violet-500"
              }`}
            >
              {message.role === "user" ? (
                <UserIcon className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <div className="mt-4 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask something${user?.username ? `, ${user.username}` : ""}…`}
          disabled={sending}
          className="min-h-12 flex-1 resize-none"
          rows={1}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon" className="h-12 w-12 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}