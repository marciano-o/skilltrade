"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Clock, Check, CheckCheck, Zap } from "lucide-react"
import { useOptimizedChat } from "@/hooks/use-optimized-chat"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Mock data for users
const users = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    offering: "Web Development",
    lastActive: "Active now",
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    offering: "Graphic Design",
    lastActive: "Last active 2h ago",
  },
  {
    id: 3,
    name: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    offering: "Digital Marketing",
    lastActive: "Active now",
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    offering: "Photography",
    lastActive: "Last active yesterday",
  },
  {
    id: 5,
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    offering: "Spanish Language",
    lastActive: "Active now",
  },
]

function ChatRoom() {
  const router = useRouter()
  const { userId } = useParams()
  const userIdNumber = Number(userId)
  const user = users.find((u) => u.id === userIdNumber)

  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use optimized chat hook
  const { messages, isLoading, isSending, isTyping, otherUserTyping, error, sendMessage, handleTyping } =
    useOptimizedChat(userIdNumber, {
      messageTimeoutMs: 2500,
      typingTimeoutMs: 1000,
      maxRetries: 3,
      batchSize: 50,
    })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return

    await sendMessage(newMessage)
    setNewMessage("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleTyping()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />
      case "delivered":
        return <CheckCheck className="h-3 w-3" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="container py-12 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/chat")}>Back to Messages</Button>
      </div>
    )
  }

  return (
    <div className="container py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto bg-background rounded-lg border shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/chat")} className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              </div>
              <div
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  user.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                {user.status === "online" ? (
                  <span className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                    {user.lastActive}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {user.lastActive}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Voice call">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Video call">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="More options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Performance indicator */}
        {(isLoading || isSending) && (
          <div className="px-4 py-2 bg-muted/20 border-b">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 animate-pulse" />
              <span>{isLoading ? "Loading messages..." : "Sending message..."}</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-b">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {/* Chat messages */}
        <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-muted/10 to-muted/20">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                    message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-background border"
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs">{message.time}</span>
                    {message.sender === "me" && <span className="text-xs">{getMessageStatusIcon(message.status)}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">{user.name} is typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input */}
        <div className="p-4 border-t bg-background">
          {isTyping && <div className="text-xs text-muted-foreground mb-2 px-1">You are typing...</div>}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder={`Message ${user.name}...`}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1"
              maxLength={1000}
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={newMessage.trim() === "" || isSending}
              className="transition-all duration-200"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1 px-1">
            Press Enter to send, Shift+Enter for new line
            {isSending && " • Sending..."}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatRoomWrapper() {
  return (
    <ProtectedRoute feature="chat">
      <ChatRoom />
    </ProtectedRoute>
  )
}
