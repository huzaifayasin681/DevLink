"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ThumbsUp, Users } from "lucide-react"
import { giveEndorsement, removeEndorsement } from "@/lib/actions"
import toast from "react-hot-toast"

interface Endorser {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Endorsement {
  id: string
  skill: string
  endorser: Endorser
  createdAt: Date
}

interface EndorsementsSectionProps {
  userId: string
  skills: string[]
  endorsements: Endorsement[]
  currentUserId?: string
  isOwnProfile?: boolean
}

export function EndorsementsSection({
  userId,
  skills,
  endorsements,
  currentUserId,
  isOwnProfile = false,
}: EndorsementsSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  // Group endorsements by skill
  const endorsementsBySkill = endorsements.reduce((acc, endorsement) => {
    if (!acc[endorsement.skill]) {
      acc[endorsement.skill] = []
    }
    acc[endorsement.skill].push(endorsement)
    return acc
  }, {} as Record<string, Endorsement[]>)

  const handleEndorse = async (skill: string) => {
    if (!currentUserId) {
      toast.error("Please log in to endorse skills")
      return
    }

    setIsLoading(true)
    try {
      await giveEndorsement({ userId, skill })
      toast.success(`Endorsed ${skill}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to endorse")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveEndorsement = async (skill: string) => {
    setIsLoading(true)
    try {
      await removeEndorsement({ userId, skill })
      toast.success("Endorsement removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove endorsement")
    } finally {
      setIsLoading(false)
    }
  }

  const isEndorsedByMe = (skill: string) => {
    return endorsementsBySkill[skill]?.some(
      (e) => e.endorser.id === currentUserId
    )
  }

  const getEndorsersForSkill = (skill: string) => {
    return endorsementsBySkill[skill] || []
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Skills & Endorsements</h2>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const endorsers = getEndorsersForSkill(skill)
          const endorsedByMe = isEndorsedByMe(skill)
          const endorsementCount = endorsers.length

          return (
            <Dialog key={skill}>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {skill}
                  {endorsementCount > 0 && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                      {endorsementCount}
                    </span>
                  )}
                </Badge>

                {!isOwnProfile && currentUserId && (
                  <Button
                    size="sm"
                    variant={endorsedByMe ? "default" : "outline"}
                    onClick={() => endorsedByMe ? handleRemoveEndorsement(skill) : handleEndorse(skill)}
                    disabled={isLoading}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                )}

                {endorsementCount > 0 && (
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                )}
              </div>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Endorsements for {skill}</DialogTitle>
                  <DialogDescription>
                    {endorsementCount} {endorsementCount === 1 ? "person has" : "people have"} endorsed this skill
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {endorsers.map((endorsement) => (
                    <div key={endorsement.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={endorsement.endorser.image || undefined} />
                        <AvatarFallback>
                          {endorsement.endorser.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{endorsement.endorser.name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{endorsement.endorser.username}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>

      {skills.length === 0 && (
        <p className="text-muted-foreground">No skills added yet</p>
      )}
    </div>
  )
}
