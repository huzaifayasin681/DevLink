# DevLink - Developer Showcase Platform

A modern, full-stack developer showcase platform built with Next.js 14, TypeScript, and Tailwind CSS. Connect, showcase your projects, and inspire the developer community.

![DevLink Screenshot](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop)

## ✨ Features

### Dual-Role System
- 🔐 **Role-Based Authentication** - Separate workflows for Clients and Developers
- 👥 **Client Portal** - Submit service requests, track projects, manage communications
- 💻 **Developer Portal** - Showcase portfolio, accept client work, manage projects
- 🛡️ **Admin Dashboard** - Approve developers, manage users, oversee platform

### Core Platform Features
- 🔐 **Social Authentication** - Google & GitHub OAuth via NextAuth.js
- 👤 **Dynamic Profiles** - Custom `/[username]` pages with SEO optimization
- 📱 **Responsive Design** - Mobile-first approach with dark mode support
- 🎨 **Modern UI** - Glass-morphism design with Radix UI components and animations

### Content Management
- 📝 **Project Showcase** - Full CRUD operations with live demos and GitHub links
- ✍️ **Blog System** - Markdown editor with live preview and syntax highlighting
- 🏷️ **Skills & Tags** - Organized skill taxonomy and technology tagging
- 📊 **Analytics Dashboard** - Profile views, project metrics, and engagement insights

### Developer Features
- 🔗 **GitHub Integration** - Import repositories and sync profile data
- 💼 **Service Offerings** - List services with pricing and availability
- 🤝 **Client Requests** - Accept and manage client service requests
- ⭐ **Reviews & Testimonials** - Build reputation with client feedback
- 🎯 **Endorsements** - Skill endorsements from peers and clients

### Client Features
- 📋 **Service Requests** - Submit detailed project requirements
- 👨‍💻 **Developer Discovery** - Find developers by skills and availability
- 📈 **Request Tracking** - Monitor project status (pending, in-progress, completed)
- 💬 **Direct Messaging** - Communicate with developers
- 📊 **Project Dashboard** - Manage all service requests in one place

### Discovery & Sharing
- 🔍 **Advanced Search** - Filter by skills, location, availability, and more
- 📱 **QR Code Generation** - Easy profile sharing with downloadable QR codes
- 📄 **Resume Export** - Generate professional HTML/PDF resumes from profile
- 🌐 **SEO Optimized** - Dynamic meta tags and structured data
- 👥 **Social Features** - Follow developers, like projects, comment on posts

### User Experience
- ⚡ **Smooth Animations** - Glass-morphism effects and fade-in animations
- 📈 **Animated Counters** - Engaging number animations on stats
- 🎯 **Smart Loading States** - Skeleton screens and loading indicators
- 🛡️ **Error Boundaries** - Graceful error handling and recovery
- 🔔 **Email Notifications** - Stay updated on follows, likes, and comments

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router with Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Select, Tabs, etc.)
- **Animations**: Custom CSS animations + Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Backend & Database
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js v4 (Google + GitHub OAuth)
- **API**: Next.js Server Actions and Route Handlers
- **Middleware**: Role-based access control and route protection
- **Email**: Nodemailer for notifications

### Additional Features
- **Markdown**: ReactMarkdown with remark-gfm for GitHub-flavored markdown
- **QR Codes**: QRCode.js for profile sharing
- **Theme**: Next-themes with system preference detection
- **Image Optimization**: Next.js Image component with remote patterns
- **Performance**: Code splitting, lazy loading, and bundle optimization

## 📁 Project Structure

```
devlink/
├── app/                           # Next.js 14 App Router
│   ├── [username]/               # Dynamic user profiles
│   │   ├── blog/[slug]/         # Individual blog posts
│   │   └── projects/[id]/       # Individual projects
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard
│   │   └── dashboard/           # User management and approvals
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   ├── admin/users/         # Admin user management
│   │   ├── blog/                # Blog CRUD operations
│   │   ├── comments/            # Comment system
│   │   ├── follows/             # Follow/unfollow
│   │   ├── github/              # GitHub integration
│   │   ├── likes/               # Like system
│   │   ├── profile/             # Profile updates
│   │   ├── profile-views/       # Analytics tracking
│   │   ├── projects/            # Project CRUD
│   │   ├── reviews/             # Review system
│   │   ├── service-requests/    # Client-developer workflow
│   │   ├── testimonials/        # Testimonial management
│   │   └── users/               # User queries
│   ├── client/                   # Client portal
│   │   ├── dashboard/           # Client dashboard
│   │   ├── profile/             # Client profile management
│   │   └── requests/            # Service request management
│   ├── dashboard/                # Legacy dashboard (redirects by role)
│   │   ├── blog/                # Blog management
│   │   ├── collaborations/      # Collaboration requests
│   │   ├── messages/            # Messaging system
│   │   ├── profile/             # Profile editing
│   │   ├── projects/            # Project management
│   │   ├── services/            # Service offerings
│   │   └── testimonials/        # Testimonial management
│   ├── developer/                # Developer portal
│   │   ├── dashboard/           # Developer dashboard
│   │   ├── import-repos/        # GitHub repo import
│   │   └── requests/            # Client request management
│   ├── explore/                  # Developer discovery
│   ├── login/                    # Authentication page
│   ├── pending-approval/         # Developer approval waiting page
│   ├── privacy/                  # Privacy policy
│   ├── setup/                    # Initial profile setup
│   ├── terms/                    # Terms of service
│   └── test-email/              # Email testing (dev only)
├── components/
│   ├── blog/                     # Blog-related components
│   ├── collaboration/            # Collaboration request components
│   ├── dashboard/                # Dashboard components
│   ├── messages/                 # Messaging components
│   ├── profile/                  # Profile section components
│   ├── ui/                       # Reusable UI components (Radix-based)
│   ├── animated-counter.tsx      # Number animation component
│   ├── animated-text.tsx         # Text animation component
│   ├── auth-provider.tsx         # NextAuth session provider
│   ├── comments-section.tsx      # Comment system
│   ├── dashboard-client.tsx      # Main dashboard component
│   ├── fade-in.tsx              # Intersection observer animations
│   ├── follow-button.tsx         # Follow/unfollow functionality
│   ├── footer.tsx               # Site footer
│   ├── header.tsx               # Site header with navigation
│   ├── like-button.tsx          # Like functionality
│   ├── loading-spinner.tsx      # Loading states
│   ├── login-dialog.tsx         # Authentication modal
│   ├── main-layout.tsx          # Main layout wrapper
│   ├── profile-view-tracker.tsx # Analytics tracking
│   ├── qr-code-generator.tsx    # QR code generation
│   ├── resume-generator.tsx     # Resume export
│   ├── reviews-section.tsx      # Review display
│   ├── theme-provider.tsx       # Dark mode provider
│   └── theme-toggle.tsx         # Theme switcher
├── lib/
│   ├── auth/                     # Authentication utilities
│   ├── db/                       # Database utilities
│   ├── utils/                    # Helper functions
│   ├── actions.ts               # Server Actions
│   ├── auth.ts                  # NextAuth configuration
│   ├── cache.ts                 # Caching utilities
│   ├── db.ts                    # Prisma client
│   ├── email.ts                 # Email templates and sending
│   ├── qr-code.ts               # QR code generation
│   ├── rate-limit.ts            # Rate limiting
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema (MongoDB)
├── public/
│   ├── icons/                   # Static icons
│   └── images/                  # Static images
├── types/
│   ├── index.ts                 # TypeScript type definitions
│   └── next-auth.d.ts           # NextAuth type extensions
├── middleware.ts                # Route protection and role-based access
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Google OAuth application credentials
- GitHub OAuth application credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/huzaifayasin681/devlink.git
   cd devlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/devlink"
   # or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/devlink"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
   
   # OAuth Providers
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up OAuth Applications**

   **GitHub OAuth:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Client Secret to `.env`

   **Google OAuth:**
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env`

5. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database (no migrations)
npm run db:studio       # Open Prisma Studio (database GUI)
```

## 🎨 Key Features in Detail

### Role-Based System

**Clients:**
- Sign up with Google OAuth
- Submit service requests with detailed requirements
- Browse and filter developers by skills
- Track request status (pending, in-progress, completed)
- Communicate with assigned developers
- Leave reviews and testimonials

**Developers:**
- Sign up with GitHub OAuth (requires admin approval)
- Create comprehensive portfolio profiles
- Showcase projects with live demos and source code
- Write technical blog posts
- Accept and manage client service requests
- Import GitHub repositories automatically
- Generate QR codes and resumes
- Track profile views and engagement

**Admins:**
- Approve/reject developer applications
- Manage all users (clients and developers)
- Promote users to admin status
- Monitor platform activity

### Authentication Flow
1. User signs in with Google (becomes Client) or GitHub (becomes Developer)
2. Profile automatically created with imported data
3. Unique username generated and validated
4. GitHub developers require admin approval before accessing platform
5. First GitHub user (huzaifayasin681) auto-approved as admin
6. Role-based middleware protects routes

### Profile Management
- Complete profile editing with real-time validation
- Skills management with autocomplete
- Social links integration (GitHub, LinkedIn, Twitter, Website)
- Work availability status toggle
- Hourly rate and available hours
- Bio and location information
- Profile view tracking and analytics

### Project Showcase
- Rich project creation with markdown content
- Technology tagging and categorization
- Featured project highlighting
- External links to live demos and repositories
- Like and comment system
- Project-specific analytics

### Blog System
- Markdown editor with live preview
- GitHub-flavored markdown support
- Syntax highlighting for code blocks
- Draft and publish workflow
- Tag-based organization
- Reading time calculation
- SEO-optimized slugs

### Search & Discovery
- Multi-criteria search (name, username, bio, skills)
- Real-time filtering by skills, location, availability
- Debounced search input for performance
- Sort by newest, oldest, most projects, alphabetical
- Responsive grid layouts with loading states

### Client-Developer Workflow
1. Client submits service request with requirements
2. Request appears in developer portal
3. Developer reviews and accepts request
4. Status updates: pending → in_progress → completed
5. Client can track progress and communicate
6. Both parties can leave reviews after completion

## 📊 Database Schema

The application uses MongoDB with Prisma ORM. Main collections:

- **Users** - Profile information, role (client/developer), approval status
- **Projects** - Project details, technologies, links, likes count
- **BlogPosts** - Article content, metadata, tags, published status
- **ServiceRequests** - Client requests, assignments, status tracking
- **Accounts** - OAuth provider information (NextAuth)
- **Sessions** - User authentication sessions (NextAuth)
- **Likes** - Like relationships for projects and posts
- **Comments** - Comments on projects and blog posts
- **Follow** - Follow relationships between users
- **ProfileView** - Analytics tracking for profile views
- **Review** - User reviews and ratings
- **Endorsement** - Skill endorsements
- **Testimonial** - Professional testimonials (requires approval)
- **Service** - Developer service offerings
- **Message** - Direct messaging between users
- **CollaborationRequest** - Collaboration proposals

See `prisma/schema.prisma` for the complete schema definition.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Environment Variables for Production**
   Set these in Vercel dashboard:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/devlink
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Update OAuth Callback URLs**
   - GitHub: `https://your-app.vercel.app/api/auth/callback/github`
   - Google: `https://your-app.vercel.app/api/auth/callback/google`

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling (avoid inline styles)
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure code passes ESLint checks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://radix-ui.com/) - Unstyled, accessible UI primitives
- [Prisma](https://prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Lucide React](https://lucide.dev/) - Beautiful icon library
- [React Hook Form](https://react-hook-form.com/) - Performant forms
- [React Hot Toast](https://react-hot-toast.com/) - Toast notifications

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review existing issues and discussions

## 🔒 Security

- All passwords are hashed using NextAuth.js
- OAuth tokens are securely stored
- Role-based access control on all protected routes
- Rate limiting on API endpoints
- Input validation and sanitization
- CSRF protection via NextAuth.js

## 🎯 Roadmap

- [ ] Real-time messaging with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Payment integration for client-developer transactions
- [ ] Mobile app (React Native)
- [ ] AI-powered developer recommendations
- [ ] Video portfolio support
- [ ] Multi-language support (i18n)
- [ ] Advanced search with Elasticsearch

---

**Built with ❤️ by Huzaifa, for developers**

*DevLink - Where developers showcase their work and clients find talent*
