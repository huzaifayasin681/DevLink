import { LoadingSpinner } from "@/components/loading-spinner"
import { MainLayout } from "@/components/main-layout"

export default function Loading() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[50vh] py-16">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Loading...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we load your content
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}