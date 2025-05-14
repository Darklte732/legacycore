'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRole } from "@/hooks/useRole"
import { redirect } from "next/navigation"

export default function AgentCarriersPage() {
  const { role, loading: roleLoading } = useRole()
  
  // Redirect if not an agent (or admin/manager)
  if (!roleLoading && role !== 'agent' && role !== 'admin' && role !== 'manager') {
    redirect('/login')
  }
  
  // Show loading state
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // List of carriers as requested
  const carriers = [
    'Mutual of Omaha',
    'Americo',
    'Aetna',
    'AIG',
    'Gerber'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Carriers</h1>
        <p className="text-muted-foreground">View and access carrier information and products</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {carriers.map((carrier) => (
          <Card key={carrier}>
            <CardHeader>
              <CardTitle>{carrier}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Products: Term Life, Whole Life, Universal Life</p>
                <p className="text-sm">Avg Processing Time: 10-14 days</p>
                <p className="text-sm">Commission Rate: 80-110%</p>
              </div>
              <Button className="w-full mt-4">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 