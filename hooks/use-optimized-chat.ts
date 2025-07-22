"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { PerformanceMonitor, withTimeout } from "@/lib/performance"

interface Message {
  id: number
  text: string
  sender: "me" | "them"
  time: string
  status: "sent" | "delivered" | "read"
}

interface ChatOptions {
  messageTimeoutMs?: number
  typingTimeoutMs?: number
  maxRetries?: number
  batchSize?: number
}

export function useOptimizedChat(userId: number, options: ChatOptions = {}) {
  const { messageTimeoutMs = 2500, typingTimeoutMs = 1000, maxRetries = 3, batchSize = 50 } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monitor = useMemo(() => PerformanceMonitor.getInstance(), [])
  const messageQueue = useRef<Message[]>([])
  const retryCount = useRef(0)

  // Optimized message loading with pagination
  const loadMessages = useCallback(
    async (offset = 0, limit = batchSize) => {
      const timerId = monitor.startTimer("chat-load")
      setIsLoading(true)
      setError(null)

      try {
        // Simulate API call with timeout
        const loadPromise = new Promise<Message[]>((resolve) => {
          setTimeout(
            () => {
              // Mock data - in real app, this would be an API call
              const mockMessages: Message[] = [
                {
                  id: offset + 1,
                  text: "Hey there! How's your React learning going?",
                  sender: "them",
                  time: "10:15 AM",
                  status: "read",
                },
                {
                  id: offset + 2,
                  text: "It's going well! I've been practicing with components and hooks.",
                  sender: "me",
                  time: "10:20 AM",
                  status: "read",
                },
              ]
              resolve(mockMessages.slice(offset, offset + limit))
            },
            Math.random() * 500 + 100,
          ) // Simulate network delay
        })

        const loadedMessages = await withTimeout(loadPromise, messageTimeoutMs)

        if (offset === 0) {
          setMessages(loadedMessages)
        } else {
          setMessages((prev) => [...loadedMessages, ...prev])
        }

        setIsLoading(false)
        const duration = monitor.endTimer(timerId)

        if (duration > 3000) {
          console.warn(`Message loading took ${duration}ms`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages")
        setIsLoading(false)
        monitor.endTimer(timerId)
      }
    },
    [userId, batchSize, messageTimeoutMs, monitor],
  )

  // Optimized message sending with retry logic
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const timerId = monitor.startTimer("chat-send")
      setIsSending(true)
      setError(null)

      const tempMessage: Message = {
        id: Date.now(),
        text: text.trim(),
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      }

      // Optimistically add message to UI
      setMessages((prev) => [...prev, tempMessage])

      try {
        // Simulate API call with timeout
        const sendPromise = new Promise<void>((resolve, reject) => {
          setTimeout(
            () => {
              if (Math.random() > 0.1) {
                // 90% success rate
                resolve()
              } else {
                reject(new Error("Network error"))
              }
            },
            Math.random() * 1000 + 200,
          )
        })

        await withTimeout(sendPromise, messageTimeoutMs)

        // Update message status
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, status: "delivered" as const } : msg)),
        )

        setIsSending(false)
        retryCount.current = 0
        const duration = monitor.endTimer(timerId)

        if (duration > 3000) {
          console.warn(`Message sending took ${duration}ms`)
        }

        // Simulate other user response
        setTimeout(() => {
          setOtherUserTyping(true)
          setTimeout(() => {
            setOtherUserTyping(false)
            const replyMessage: Message = {
              id: Date.now() + 1,
              text: "Thanks for sharing that!",
              sender: "them",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "sent",
            }
            setMessages((prev) => [...prev, replyMessage])
          }, 1500)
        }, 500)
      } catch (err) {
        // Retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current++
          console.log(`Retrying message send (attempt ${retryCount.current})`)
          setTimeout(() => sendMessage(text), 1000 * retryCount.current)
        } else {
          // Mark message as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id ? { ...msg, status: "sent" as const, text: `${msg.text} ❌` } : msg,
            ),
          )
          setError("Failed to send message after multiple attempts")
          retryCount.current = 0
        }

        setIsSending(false)
        monitor.endTimer(timerId)
      }
    },
    [messageTimeoutMs, maxRetries, monitor],
  )

  // Optimized typing indicator
  const handleTyping = useCallback(() => {
    setIsTyping(true)

    // Debounce typing indicator
    const timeoutId = setTimeout(() => {
      setIsTyping(false)
    }, typingTimeoutMs)

    return () => clearTimeout(timeoutId)
  }, [typingTimeoutMs])

  // Load initial messages
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    isLoading,
    isSending,
    isTyping,
    otherUserTyping,
    error,
    sendMessage,
    loadMessages,
    handleTyping,
  } as const
}
