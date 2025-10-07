import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CollaborationRequests } from "@/components/collaboration/collaboration-requests"

export const metadata = {
  title: "Collaboration Requests | DevLink",
  description: "Manage your collaboration requests",
}

async function getCollaborationRequests(userId: string) {
  const requests = await db.collaborationRequest.findMany({
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

  return requests
}

export default async function CollaborationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const requests = await getCollaborationRequests(session.user.id)

  return (
    <div className="container py-8">
      <CollaborationRequests
        requests={requests}
        currentUserId={session.user.id}
      />
    </div>
  )
}
