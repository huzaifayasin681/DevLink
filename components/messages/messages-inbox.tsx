"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, MailOpen, Send, Trash } from "lucide-react"
import { sendMessage, markMessageAsRead, deleteMessage } from "@/lib/actions"
import toast from "react-hot-toast"

interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Message {
  id: string
  content: string
  subject: string | null
  read: boolean
  sender: User
  receiver: User
  createdAt: Date
}

interface MessagesInboxProps {
  messages: Message[]
  currentUserId: string
}

export function MessagesInbox({ messages, currentUserId }: MessagesInboxProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newMessage, setNewMessage] = useState({
    receiverUsername: "",
    subject: "",
    content: "",
  })

  const inbox = messages.filter((m) => m.receiver.id === currentUserId)
  const sent = messages.filter((m) => m.sender.id === currentUserId)
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox")

  const displayMessages = activeTab === "inbox" ? inbox : sent
  const unreadCount = inbox.filter((m) => !m.read).length

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId)
      toast.success("Message marked as read")
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      toast.success("Message deleted")
      setSelectedMessage(null)
    } catch (error) {
      toast.error("Failed to delete message")
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.content) {
      toast.error("Please write a message")
      return
    }

    setIsLoading(true)
    try {
      // In a real app, you'd need to lookup the user ID from username
      // For now, we'll assume receiverUsername is actually the receiverId
      await sendMessage({
        receiverId: newMessage.receiverUsername,
        subject: newMessage.subject || undefined,
        content: newMessage.content,
      })
      toast.success("Message sent!")
      setNewMessage({ receiverUsername: "", subject: "", content: "" })
      setIsNewMessageOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Message List */}
      <div className="md:col-span-1 border rounded-lg flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>Send a message to another user</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to">To (User ID) *</Label>
                    <Input
                      id="to"
                      value={newMessage.receiverUsername}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, receiverUsername: e.target.value })
                      }
                      placeholder="User ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, subject: e.target.value })
                      }
                      placeholder="Message subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={newMessage.content}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, content: e.target.value })
                      }
                      placeholder="Type your message..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === "inbox" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("inbox")}
              className="flex-1"
            >
              Inbox
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "sent" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("sent")}
              className="flex-1"
            >
              Sent
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {displayMessages.length > 0 ? (
              displayMessages.map((message) => {
                const otherUser =
                  activeTab === "inbox" ? message.sender : message.receiver
                const isSelected = selectedMessage?.id === message.id

                return (
                  <button
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (activeTab === "inbox" && !message.read) {
                        handleMarkAsRead(message.id)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser.image || undefined} />
                        <AvatarFallback>
                          {otherUser.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${
                            !message.read && activeTab === "inbox" ? "font-bold" : ""
                          }`}>
                            {otherUser.name}
                          </p>
                          {!message.read && activeTab === "inbox" && (
                            <Mail className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs truncate opacity-80">
                          {message.subject || "No subject"}
                        </p>
                        <p className="text-xs truncate opacity-70 mt-1">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No messages</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message View */}
      <div className="md:col-span-2 border rounded-lg flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        (activeTab === "inbox"
                          ? selectedMessage.sender.image
                          : selectedMessage.receiver.image) || undefined
                      }
                    />
                    <AvatarFallback>
                      {(activeTab === "inbox"
                        ? selectedMessage.sender.name
                        : selectedMessage.receiver.name)?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">
                      {activeTab === "inbox"
                        ? selectedMessage.sender.name
                        : selectedMessage.receiver.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @
                      {activeTab === "inbox"
                        ? selectedMessage.sender.username
                        : selectedMessage.receiver.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === "inbox" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      disabled={selectedMessage.read}
                    >
                      <MailOpen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedMessage.subject && (
                <h3 className="text-xl font-semibold mt-4">
                  {selectedMessage.subject}
                </h3>
              )}
            </div>

            <ScrollArea className="flex-1 p-6">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </ScrollArea>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a message to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
