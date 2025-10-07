import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollIndicator } from "@/components/scroll-indicator"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollIndicator />
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  )
}