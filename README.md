# DevLink - Developer Showcase Platform

A modern, full-stack developer showcase platform built with Next.js 14, TypeScript, and Tailwind CSS. Connect, showcase your projects, and inspire the developer community.

![DevLink Screenshot](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop)

## ✨ Features

### Core Platform
- 🔐 **Authentication** - Social login with Google & GitHub via NextAuth.js
- 👤 **Dynamic Profiles** - Custom `/[username]` pages with SEO optimization
- 📱 **Responsive Design** - Mobile-first approach with dark mode support
- 🎨 **Modern UI** - Clean design with Tailwind CSS and Radix UI components

### Content Management
- 📝 **Project Showcase** - Full CRUD operations for project portfolios
- ✍️ **Blog System** - Markdown editor with live preview and syntax highlighting
- 🏷️ **Skills & Tags** - Organized skill taxonomy and tagging system
- 📊 **Analytics Dashboard** - Profile views, project metrics, and insights

### Discovery & Sharing
- 🔍 **Advanced Search** - Filter developers by skills, location, availability
- 📱 **QR Code Generation** - Easy profile sharing with QR codes
- 📄 **Resume Export** - Generate professional PDF resumes
- 🌐 **SEO Optimized** - Dynamic meta tags and structured data

### User Experience
- ⚡ **Smooth Animations** - Intersection Observer-based fade-ins
- 📈 **Animated Counters** - Engaging number animations
- 🎯 **Smart Loading States** - Skeleton screens and loading indicators
- 🛡️ **Error Boundaries** - Graceful error handling and recovery

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animations**: Custom CSS animations + Intersection Observer
- **Icons**: Lucide React

### Backend & Database
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js (Google + GitHub OAuth)
- **API**: Next.js Server Actions and Route Handlers
- **Validation**: React Hook Form with custom validators

### Additional Features
- **Markdown**: ReactMarkdown with remark-gfm
- **QR Codes**: QRCode.js
- **Notifications**: React Hot Toast
- **Theme**: Next-themes with system preference detection

## 📁 Project Structure

```
devlink/
├── app/                        # Next.js 14 App Router
│   ├── [username]/            # Dynamic user profiles
│   ├── dashboard/             # Protected dashboard area
│   ├── explore/               # Developer discovery
│   └── api/                   # API routes and auth
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── animations/            # Custom animation components
│   └── forms/                 # Form components
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client
│   ├── actions.ts            # Server Actions
│   └── utils.ts              # Utility functions
├── prisma/
│   └── schema.prisma         # Database schema
└── types/
    └── index.ts              # TypeScript definitions
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Google & GitHub OAuth applications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devlink.git
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
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # OAuth Providers
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
```

## 🎨 Features in Detail

### Authentication Flow
- Social OAuth with Google and GitHub
- Automatic profile creation with imported data
- Unique username generation and validation
- Session management with NextAuth.js

### Profile Management
- Complete profile editing with real-time validation
- Skills management with autocomplete
- Social links integration
- Work availability status

### Project Showcase
- Rich project creation with markdown content
- Technology tagging and categorization
- Featured project highlighting
- External links to demos and repositories

### Blog System
- Markdown editor with live preview
- Syntax highlighting for code blocks
- Draft and publish workflow
- Tag-based organization
- Reading time calculation

### Search & Discovery
- Multi-criteria search (skills, location, availability)
- Real-time filtering and sorting
- Debounced search input
- Responsive grid layouts

## 📊 Database Schema

The application uses MongoDB with the following main collections:

- **Users** - Profile information, skills, social links
- **Projects** - Project details, technologies, links
- **BlogPosts** - Article content, metadata, tags
- **Accounts** - OAuth provider information
- **Sessions** - User authentication sessions

See `prisma/schema.prisma` for the complete schema definition.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment, especially:
- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secure random string
- OAuth client IDs and secrets

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://radix-ui.com/) - Low-level UI primitives
- [Prisma](https://prisma.io/) - Database toolkit
- [NextAuth.js](https://next-auth.js.org/) - Authentication library

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Built with ❤️ by developers, for developers**