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
  hourlyRate: number | null
  availableHours: string[]
  profileViews: number
  createdAt: Date
  updatedAt: Date
  projects: Project[]
  posts: BlogPost[]
  likes: Like[]
  comments: Comment[]
  followers: Follow[]
  following: Follow[]
  endorsementsReceived: Endorsement[]
  endorsementsGiven: Endorsement[]
  testimonialsReceived: Testimonial[]
  testimonialsGiven: Testimonial[]
  services: Service[]
  messagesSent: Message[]
  messagesReceived: Message[]
  collaborationRequestsSent: CollaborationRequest[]
  collaborationRequestsReceived: CollaborationRequest[]
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
  likesCount: number
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
  likes: Like[]
  comments: Comment[]
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
  likesCount: number
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
  likes: Like[]
  comments: Comment[]
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
  hourlyRate?: number
  availableHours?: string[]
  emailNotifications: boolean
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

export interface Like {
  id: string
  userId: string
  projectId?: string
  postId?: string
  createdAt: Date
  user: User
  project?: Project
  post?: BlogPost
}

export interface Comment {
  id: string
  content: string
  userId: string
  projectId?: string
  postId?: string
  createdAt: Date
  updatedAt: Date
  user: User
  project?: Project
  post?: BlogPost
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
  follower: User
  following: User
}

export interface ProfileView {
  id: string
  userId: string
  viewerId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  user: User
  viewer?: User
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  reviewerId: string
  createdAt: Date
  updatedAt: Date
  user: User
  reviewer: User
}

export interface Endorsement {
  id: string
  skill: string
  userId: string
  endorserId: string
  createdAt: Date
  user: User
  endorser: User
}

export interface Testimonial {
  id: string
  content: string
  relationship: string
  companyName: string | null
  position: string | null
  approved: boolean
  userId: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  user: User
  author: User
}

export interface Service {
  id: string
  title: string
  description: string
  category: string
  pricing: string
  minPrice: number | null
  maxPrice: number | null
  duration: string | null
  active: boolean
  userId: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  subject: string | null
  read: boolean
  senderId: string
  receiverId: string
  createdAt: Date
  sender: User
  receiver: User
}

export interface CollaborationRequest {
  id: string
  title: string
  description: string
  projectType: string
  budget: string | null
  timeline: string | null
  status: string
  senderId: string
  receiverId: string
  createdAt: Date
  updatedAt: Date
  sender: User
  receiver: User
}