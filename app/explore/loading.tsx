import { LoadingSpinner } from "@/components/loading-spinner"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ExploreLoading() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8 text-center">
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
            <div className="h-5 w-96 bg-muted rounded mx-auto"></div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-32 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Header Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="h-5 w-48 bg-muted rounded"></div>
          </div>

          {/* Developer Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="text-center">
                  <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-muted rounded mx-auto"></div>
                    <div className="h-4 w-24 bg-muted rounded mx-auto"></div>
                    <div className="h-5 w-28 bg-muted rounded mx-auto"></div>
                  </div>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div className="h-12 w-full bg-muted rounded"></div>
                  <div className="h-4 w-24 bg-muted rounded mx-auto"></div>
                  
                  <div className="flex flex-wrap justify-center gap-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-5 w-16 bg-muted rounded"></div>
                    ))}
                    <div className="h-5 w-12 bg-muted rounded"></div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="h-3 w-20 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>

                  <div className="h-9 w-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button Skeleton */}
          <div className="text-center mt-12">
            <div className="h-10 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading developers...</span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}