import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { MessagesInbox } from "@/components/messages/messages-inbox"

export const metadata = {
  title: "Messages | DevLink",
  description: "View and manage your messages",
}

async function getMessages(userId: string) {
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return messages
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const messages = await getMessages(session.user.id)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with other developers
        </p>
      </div>

      <MessagesInbox messages={messages} currentUserId={session.user.id} />
    </div>
  )
}
