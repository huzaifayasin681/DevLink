import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ServicesManager } from "@/components/dashboard/services-manager"

export const metadata = {
  title: "Manage Services | DevLink",
  description: "Manage your services and offerings",
}

async function getUserServices(userId: string) {
  const services = await db.service.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return services
}

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const services = await getUserServices(session.user.id)

  return (
    <div className="container py-8">
      <ServicesManager services={services} />
    </div>
  )
}
