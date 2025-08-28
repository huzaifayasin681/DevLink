import React from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getProfile(username: string) {
  return {
    id: "1",
    name: "Test User",
    username: "test",
    email: "test@example.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c265?w=400&h=400&fit=crop",
    bio: "Test user bio",
    location: "Test Location",
    skills: ["React", "TypeScript"],
    isAvailableForWork: true,
    createdAt: new Date(),
    projects: [],
    posts: []
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfile(params.username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">{profile.name}</h1>
      <p>{profile.bio}</p>
    </div>
  )
}