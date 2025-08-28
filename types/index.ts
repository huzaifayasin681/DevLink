export interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  location: string | null
  website: string | null
  github: string | null
  twitter: string | null
  linkedin: string | null
  skills: string[]
  isAvailableForWork: boolean
  createdAt: Date
  updatedAt: Date
  projects: Project[]
  posts: BlogPost[]
}

export interface Project {
  id: string
  title: string
  description: string
  content: string
  imageUrl: string | null
  liveUrl: string | null
  githubUrl: string | null
  technologies: string[]
  featured: boolean
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  published: boolean
  tags: string[]
  imageUrl: string | null
  readingTime: number
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface SocialLinks {
  github?: string
  twitter?: string
  linkedin?: string
  website?: string
}

export interface ProfileFormData {
  name: string
  username: string
  bio: string
  location: string
  website: string
  github: string
  twitter: string
  linkedin: string
  skills: string[]
  isAvailableForWork: boolean
}

export interface ProjectFormData {
  title: string
  description: string
  content: string
  imageUrl?: string
  liveUrl?: string
  githubUrl?: string
  technologies: string[]
  featured: boolean
}

export interface BlogPostFormData {
  title: string
  content: string
  excerpt: string
  slug: string
  published: boolean
  tags: string[]
  imageUrl?: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchFilters {
  skills?: string[]
  location?: string
  availableForWork?: boolean
  sortBy?: 'newest' | 'oldest' | 'mostProjects' | 'alphabetical'
}