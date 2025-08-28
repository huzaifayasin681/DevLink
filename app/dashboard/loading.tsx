import { LoadingSpinner } from "@/components/loading-spinner"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-muted rounded mb-2"></div>
            <div className="h-4 w-72 bg-muted rounded"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Projects Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="h-5 w-40 bg-muted rounded mb-2"></div>
                        <div className="h-4 w-64 bg-muted rounded mb-3"></div>
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-muted rounded"></div>
                          <div className="h-5 w-20 bg-muted rounded"></div>
                          <div className="h-5 w-12 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Articles Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-48 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="h-5 w-48 bg-muted rounded mb-2"></div>
                        <div className="h-4 w-full bg-muted rounded mb-3"></div>
                        <div className="flex gap-4 text-xs">
                          <div className="h-3 w-16 bg-muted rounded"></div>
                          <div className="h-3 w-20 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-24 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 w-full bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </aside>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-background border rounded-lg p-3 shadow-lg flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}