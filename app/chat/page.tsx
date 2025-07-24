"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle } from "lucide-react"

// Mock data for conversations
const conversations = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
    },
    lastMessage: {
      text: "I'd be happy to teach you React basics next week!",
      time: "10:30 AM",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
    },
    lastMessage: {
      text: "Thanks for the design tips yesterday!",
      time: "Yesterday",
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
    },
    lastMessage: {
      text: "When are you free for our next marketing session?",
      time: "Yesterday",
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
    },
    lastMessage: {
      text: "I'll send you the photography resources we discussed.",
      time: "Monday",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 5,
    user: {
      id: 5,
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
    },
    lastMessage: {
      text: "¡Hola! ¿Cómo estás? Ready for our Spanish lesson?",
      time: "Sunday",
      isRead: true,
    },
    unreadCount: 0,
  },
]

function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState(conversations)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter((convo) => convo.user.name.toLowerCase().includes(query.toLowerCase()))
      setFilteredConversations(filtered)
    }
  }

  return (
    <div className="container py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="bg-background rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {filteredConversations.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <Link href={`/chat/${conversation.user.id}`} key={conversation.id}>
                  <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={conversation.user.avatar || "/placeholder.svg"}
                          alt={conversation.user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          conversation.user.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.lastMessage.time}</span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          !conversation.lastMessage.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {conversation.lastMessage.text}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs font-medium h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No conversations found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "No conversations match your search." : "Start matching with people to begin chatting!"}
              </p>
              <Link href="/matchmaking">
                <Button>Find Matches</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage