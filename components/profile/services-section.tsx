"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, DollarSign } from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  category: string
  pricing: string
  minPrice: number | null
  maxPrice: number | null
  duration: string | null
  active: boolean
}

interface ServicesSectionProps {
  services: Service[]
  hourlyRate?: number | null
  availableHours?: string[]
}

export function ServicesSection({
  services,
  hourlyRate,
  availableHours = [],
}: ServicesSectionProps) {
  const activeServices = services.filter((s) => s.active)

  const formatPrice = (min: number | null, max: number | null, pricing: string) => {
    if (pricing === "Hourly" && hourlyRate) {
      return `$${hourlyRate}/hr`
    }
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
    if (min) {
      return `Starting at $${min.toLocaleString()}`
    }
    return pricing
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services Offered</h2>
        {hourlyRate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold">${hourlyRate}/hour</span>
          </div>
        )}
      </div>

      {availableHours.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Available: {availableHours.join(", ")}</span>
        </div>
      )}

      {activeServices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activeServices.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {service.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {formatPrice(service.minPrice, service.maxPrice, service.pricing)}
                    </span>
                  </div>

                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No services listed</p>
        </div>
      )}
    </div>
  )
}
